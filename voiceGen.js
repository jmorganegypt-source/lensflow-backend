import fetch from 'node-fetch';

const VOICES = {
  mia: 'XrExE9yKIg1WjnnlVkGX',   // Ember — Energetic, Confident
  oliver: 'Nhs8rqFRMVMRnzPDV8Hj' // Ollie — Natural & Relaxed British
};

export async function generateVoiceover(script, presenter = 'mia') {
  console.log(`🎤 Generating voiceover with ${presenter}...`);
  const voiceId = VOICES[presenter] || VOICES.mia;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      }
    );

    if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');
    // Return as data URI — swap this for cloud storage upload later
    return `data:audio/mpeg;base64,${base64}`;
  } catch (error) {
    console.error('❌ Voiceover failed:', error.message);
    return null;
  }
}
