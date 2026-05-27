import fetch from 'node-fetch';

export async function triggerPresenterVideo(audioUrl) {
    console.log("🎥 Generating presenter video...");

    try {
        const response = await fetch('https://api.heygen.com/v2/video/generate', {
            method: 'POST',
            headers: {
                'X-Api-Key': process.env.HEYGEN_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_setting: { ratio: "9:16", video_quality: "high" },
                dimension: { width: 1080, height: 1920 },
                character: { type: "avatar", avatar_id: "Mia_RealEstate_9_16" },
                audio_url: audioUrl
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "HeyGen failed");

        console.log("✅ Presenter video triggered");
        return data.data.video_id;
    } catch (err) {
        console.error("Presenter generation failed:", err.message);
        throw err;
    }
}