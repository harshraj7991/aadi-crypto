/**
 * Fails if the documentation names an npm script that does not exist.
 *
 * The design doc told operators to run `npm run deploy` for a week after that
 * script was renamed. Documentation drifts silently because nothing executes
 * it, so this executes the one part that can be checked cheaply.
 */
import { readFileSync } from "node:fs";

const DOCS = ["public/aadicrypto-system-design.html", "README.md"];

const scripts = new Set(Object.keys(JSON.parse(readFileSync("package.json", "utf8")).scripts));
const problems = [];

for (const doc of DOCS) {
  let text;
  try {
    text = readFileSync(doc, "utf8");
  } catch {
    continue; // an optional doc that is not there yet is not a failure
  }
  for (const [, name] of text.matchAll(/npm run ([a-z][a-z0-9:-]*)/g)) {
    if (!scripts.has(name)) problems.push(`${doc} says "npm run ${name}", which does not exist`);
  }
}

if (problems.length > 0) {
  for (const p of new Set(problems)) console.error(`::error::${p}`);
  process.exit(1);
}

console.log(`docs reference only real scripts (${DOCS.length} file(s) checked)`);
