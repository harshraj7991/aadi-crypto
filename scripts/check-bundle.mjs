/**
 * Fails the build if anything server-only reached the browser.
 *
 * Scans the compiled JS and CSS rather than everything under public/: static
 * files put there by hand are content, and the design doc legitimately mentions
 * the key's *name* while documenting how to set it. A real leak lands in the
 * bundle, not in prose.
 *
 * Also looks for live credential values anywhere in the output, since those
 * must never appear even in a hand-written file.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const BUNDLE_DIR = ".output/public";
const CODE = /\.(js|mjs|cjs|css|map)$/;

/** Identifiers that should only ever exist on the server. */
const SERVER_ONLY = [
  "api.coingecko.com",
  "COINGECKO_API_KEY",
  "ETHERSCAN_API_KEY",
  "x-cg-demo-api-key",
  "cms.aadicrypto.com",
  "alternative.me",
];

/** Shapes of real credentials, which must not appear in any output file. */
const SECRET_SHAPES = [
  { name: "CoinGecko key", re: /\bCG-[A-Za-z0-9]{16,}\b/ },
  { name: "WordPress application password", re: /\b(?:[A-Za-z0-9]{4}\s){5}[A-Za-z0-9]{4}\b/ },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

const files = walk(BUNDLE_DIR);
const problems = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");

  if (CODE.test(file)) {
    for (const needle of SERVER_ONLY) {
      if (text.includes(needle)) problems.push(`${needle} found in ${file}`);
    }
  }

  for (const { name, re } of SECRET_SHAPES) {
    if (re.test(text)) problems.push(`looks like a ${name} in ${file}`);
  }
}

if (problems.length > 0) {
  for (const p of problems) console.error(`::error::${p}`);
  console.error(`\n${problems.length} problem(s) — server-only data reached the client bundle.`);
  process.exit(1);
}

const scanned = files.filter((f) => CODE.test(f)).length;
console.log(
  `client bundle clean: ${scanned} code files scanned, ${files.length} files checked for secrets`,
);
