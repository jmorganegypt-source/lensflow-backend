import { scrapeListing } from './scraper.js';
import { generateVideoScript } from './scriptGen.js';
import { generateSpeechFromScript } from './voiceGen.js';
import { triggerPresenterVideo } from './presenterGen.js';
import { renderFinalReel } from './videoComposer.js';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = 3;

async function withRetry(fn, name) {
    for (let i = 1; i <= MAX_RETRIES; i++) {
        try {
            console.log(`🔄 ${name} - Attempt ${i}/${MAX_RETRIES}`);
            return await fn();
        } catch (err) {
            console.error(`❌ ${name} failed (attempt ${i}):`, err.message);
            if (i === MAX_RETRIES) throw err;
            await new Promise(r => setTimeout(r, 1500 * i));
        }
    }
}

export async function runLensFlowPipeline(listingUrl) {
    console.log(`\n🚀 LensFlow Pipeline Started: ${listingUrl}`);

    try {
        const rawData = await withRetry(() => scrapeListing(listingUrl), "Scrape");
        const script = await withRetry(() => generateVideoScript(rawData), "Script");
        const audioUrl = await withRetry(() => generateSpeechFromScript(script), "Voiceover");
        const presenterUrl = await withRetry(() => triggerPresenterVideo(audioUrl), "Presenter");
        const finalVideoUrl = await withRetry(() => renderFinalReel(rawData.images || [], presenterUrl, audioUrl), "Final Render");

        console.log(`\n🎉 SUCCESS! Video Ready`);
        return { success: true, videoUrl: finalVideoUrl };
    } catch (error) {
        console.error(`💥 Pipeline Failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

if (process.argv[2]) {
    runLensFlowPipeline(process.argv[2]);
}