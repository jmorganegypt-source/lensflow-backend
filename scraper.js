import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

export async function scrapeListing(listingUrl) {
    console.log(`🔍 Scraping: ${listingUrl}`);

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const run = await client.actor("apify/real-estate-scraper").call({
                startUrls: [{ url: listingUrl }],
                maxPagesPerCrawl: 1,
            });

            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (!items || items.length === 0) throw new Error("No data returned");

            console.log("✅ Scraped successfully");
            return items[0];
        } catch (err) {
            console.error(`Scrape attempt ${attempt} failed`);
            if (attempt === 3) throw err;
            await new Promise(r => setTimeout(r, 2000 * attempt));
        }
    }
}