import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every route on this site is prerendered and nothing revalidates, which is
// exactly the case the static-assets cache is for: prerendered pages are
// served from Workers static assets, with no R2 bucket or KV to create.
// If a page ever needs ISR/revalidation, switch to the R2 incremental cache
// (https://opennext.js.org/cloudflare/caching).
const config = {
  ...defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    enableCacheInterception: true,
  }),
  // `npm run build` is the full Cloudflare build (package.json), so OpenNext
  // must build Next itself with a different script — calling `npm run build`
  // here would recurse. This is what lets the Cloudflare dashboard's default
  // "npm run build" + "npx wrangler deploy" work unchanged.
  buildCommand: "npm run build:next",
};

export default config;
