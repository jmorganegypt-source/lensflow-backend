import fetch from 'node-fetch';

export async function generatePresenter(script, presenter = 'mia') {
  console.log(`🎥 Generating presenter video with HeyGen (${presenter})...`);

  try {
    const createRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: 'c944744f9b614ab8a3fe7cd3f246c245',
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: script,
            voice_id: presenter === 'oliver'
              ? 'en-AU-WilliamNeural'
              : 'en-AU-NatashaNeural'
          }
        }],
        dimension: { width: 1080, height: 1920 }
      })
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`HeyGen create error: ${createRes.status} - ${err}`);
    }

    const { data } = await createRes.json();
    const videoId = data.video_id;
    console.log(`⏳ HeyGen video ID: ${videoId}`);

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const pollRes = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: { 'X-Api-Key': process.env.HEYGEN_API_KEY }
      });
      const pollData = await pollRes.json();
      const status = pollData.data?.status;
      if (status === 'completed') {
        console.log('✅ HeyGen video ready:', pollData.data.video_url);
        return pollData.data.video_url;
      }
      if (status === 'failed') throw new Error('HeyGen render failed');
      console.log(`⏳ HeyGen status: ${status} (attempt ${i + 1})`);
    }
    throw new Error('HeyGen timed out');
  } catch (error) {
    console.error('❌ Presenter generation failed:', error.message);
    return null;
  }
}
