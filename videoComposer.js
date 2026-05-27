import fetch from 'node-fetch';

export async function renderFinalReel(images, presenterUrl, audioUrl) {
    console.log("🎬 Assembling final video...");

    try {
        const response = await fetch('https://api.shotstack.io/v1/render', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.SHOTSTACK_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timeline: {
                    background: "#000000",
                    tracks: [
                        { clips: [{ asset: { type: "video", src: presenterUrl }, start: 0, length: 60 }] },
                        { clips: images.slice(0, 8).map((url, i) => ({
                            asset: { type: "image", src: url },
                            start: i * 6,
                            length: 6
                        })) }
                    ]
                },
                output: { format: "mp4", resolution: "hd" }
            }),
        });

        const data = await response.json();
        console.log("✅ Final video render started");
        return data.response.id;
    } catch (err) {
        console.error("Final render failed:", err.message);
        throw err;
    }
}