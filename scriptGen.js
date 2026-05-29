import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateScript(listing) {
    console.log("✍️ Generating script...");

    const systemPrompt = `You are a top luxury real estate copywriter. Write a compelling 60-second voiceover script (130-150 words).`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Property: ${listing.address}\n${listing.description || ''}` }
            ],
            temperature: 0.75,
        });

        console.log("✅ Script generated");
        return response.choices[0].message.content.trim();
    } catch (err) {
        console.error("Script generation failed:", err.message);
        throw err;
    }
}
