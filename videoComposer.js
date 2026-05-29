import fetch from 'node-fetch';

export async function composeVideo(presenterUrl, voiceUrl, listing) {
  console.log('🎬 Composing final video with Shotstack...');

  try {
    const timeline = {
      tracks: [
        {
          clips: [{
            asset: { type: 'video', src: presenterUrl },
            start: 0, length: 28,
            position: 'center'
          }]
        },
        {
          clips: [{
            asset: {
              type: 'title',
              text: listing.title,
              style: 'minimal',
              color: '#ffffff',
              size: 'medium'
            },
            start: 0, length: 4,
            position: 'bottom'
          }]
        },
        {
          clips: [{
            asset: {
              type: 'title',
              text: `${listing.price} · ${listing.address}`,
              style: 'minimal',
              color: '#C99A2E',
              size: 'small'
            },
            start: 4, length: 4,
            position: 'bottom'
          }]
        }
      ]
    };

    const renderRes = await fetch('https://api.shotstack.io/v1/render', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.SHOTSTACK_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timeline,
        output: { format: 'mp4', resolution: 'hd', aspectRatio: '9:16' }
      })
    });

    if (!renderRes.ok) throw new Error(`Shotstack error: ${renderRes.status}`);
    const { response: { id } } = await renderRes.json();

    // Poll for completion
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const pollRes = await fetch(`https://api.shotstack.io/v1/render/${id}`, {
        headers: { 'x-api-key': process.env.SHOTSTACK_API_KEY }
      });
      const data = await pollRes.json();
      if (data.response.status === 'done') {
        console.log('✅ Final video ready:', data.response.url);
        return data.response.url;
      }
      if (data.response.status === 'failed') throw new Error('Shotstack render failed');
      console.log(`⏳ Shotstack status: ${data.response.status} (attempt ${i + 1})`);
    }
    throw new Error('Shotstack timed out');
  } catch (error) {
    console.error('❌ Video composition failed:', error.message);
    return null;
  }
}
