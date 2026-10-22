/**
 * Nitro writes .output/server/wrangler.json on every build and does not set
 * workers_dev, so without this the preview URL is turned off on each deploy —
 * which is the only way to check a build that is not on the live domain.
 *
 * Also stamps the worker name so dev and prod land on separate workers.
 *
 * Usage: node scripts/prepare-deploy.mjs <worker-name>
 */
import { readFileSync, writeFileSync } from "node:fs";

const config = ".output/server/wrangler.json";
const name = process.argv[2];

if (!name) {
  console.error("usage: node scripts/prepare-deploy.mjs <worker-name>");
  process.exit(1);
}

const wrangler = JSON.parse(readFileSync(config, "utf8"));
wrangler.name = name;
wrangler.workers_dev = true;
wrangler.preview_urls = true;
writeFileSync(config, `${JSON.stringify(wrangler, null, 2)}\n`);

console.log(`prepared ${config} for "${name}"`);
