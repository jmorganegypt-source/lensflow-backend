import { scrapeListing } from './scraper.js';
import { generateScript } from './scriptGen.js';
import { generateVoiceover } from './voiceGen.js';
import { generatePresenter } from './presenterGen.js';
import { composeVideo } from './videoComposer.js';
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
        const listing = await withRetry(() => scrapeListing(listingUrl), "Scrape");
        const script = await withRetry(() => generateScript(listing), "Script");
        const audioUrl = await withRetry(() => generateVoiceover(script), "Voiceover");
        const presenterUrl = await withRetry(() => generatePresenter(script), "Presenter");
        const finalVideoUrl = await withRetry(() => composeVideo(presenterUrl, audioUrl, listing), "Final Render");
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
