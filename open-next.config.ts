import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every route on this site is prerendered and nothing revalidates, which is
// exactly the case the static-assets cache is for: prerendered pages are
// served from Workers static assets, with no R2 bucket or KV to create.
// If a page ever needs ISR/revalidation, switch to the R2 incremental cache
// (https://opennext.js.org/cloudflare/caching).
export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
	enableCacheInterception: true,
});
