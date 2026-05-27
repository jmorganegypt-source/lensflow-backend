import { runLensFlowPipeline } from './pipelineManager.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const url = process.argv[2];
    if (!url) {
        console.log("Usage: node test-runner.js <listing-url>");
        process.exit(1);
    }
    await runLensFlowPipeline(url);
}

main().catch(console.error);