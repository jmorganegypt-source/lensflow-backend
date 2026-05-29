import fetch from 'node-fetch';

const AVATARS = {
  mia: 'amy-jcu7tUBGFg',    // D-ID female presenter
  oliver: 'josh-jcu7tUBGFg' // D-ID male presenter
};

export async function generatePresenter(script, presenter = 'mia') {
  console.log(`🎥 Generating presenter video with D-ID (${presenter})...`);
  const avatarId = AVATARS[presenter] || AVATARS.mia;
  const auth = Buffer.from(`${process.env.DID_API_KEY}:`).toString('base64');

  try {
    // Create the talk
    const createRes = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script: { type: 'text', input: script, provider: { type: 'microsoft', voice_id: 'en-AU-NatashaNeural' } },
        source_url: `https://create-images-results.d-id.com/DefaultPresenters/${avatarId}/image.jpeg`
      })
    });

    if (!createRes.ok) throw new Error(`D-ID create error: ${createRes.status}`);
    const { id } = await createRes.json();

    // Poll for completion
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const pollRes = await fetch(`https://api.d-id.com/talks/${id}`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      const data = await pollRes.json();
      if (data.status === 'done') {
        console.log('✅ Presenter video ready:', data.result_url);
        return data.result_url;
      }
      if (data.status === 'error') throw new Error('D-ID rendering failed');
      console.log(`⏳ D-ID status: ${data.status} (attempt ${i + 1})`);
    }
    throw new Error('D-ID timed out');
  } catch (error) {
    console.error('❌ Presenter generation failed:', error.message);
    return null;
  }
}
