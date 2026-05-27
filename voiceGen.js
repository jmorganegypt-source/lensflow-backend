import fetch from 'node-fetch';

export async function generateSpeechFromScript(scriptText) {
    console.log("🎙️ Generating voiceover...");

    const voiceId = "21m00Tcm4TlvDq8ikWAM";

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: scriptText,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: { stability: 0.75, similarity_boost: 0.85 }
                }),
            });

            if (!response.ok) throw new Error("ElevenLabs failed");

            console.log("✅ Voiceover generated");
            return await response.buffer();
        } catch (err) {
            console.error(`Voice attempt ${attempt} failed`);
            if (attempt === 3) throw err;
            await new Promise(r => setTimeout(r, 1500 * attempt));
        }
    }
}