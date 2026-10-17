/**
 * Tests for the article parser.
 *
 * Run with: npx tsx src/server/wp-content.test.ts
 *
 * There is no test runner in this project yet, so this is a plain script with
 * no dependencies. The parser earns tests because it reads HTML that a dozen
 * different people hand-write, and its worst failure — quietly dropping a
 * paragraph — looks fine on screen.
 *
 * The cases below are taken from real posts in the CMS, plus the shapes that
 * no current post happens to use. That gap is how a content-dropping bug got
 * through review: measuring word counts against live posts only ever proves
 * the parser handles the data that exists today.
 */

import { splitArticle, stripTags } from "./wp-content";

let failures = 0;

function check(name: string, actual: unknown, expected: unknown): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ok    ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name}\n          expected ${e}\n          actual   ${a}`);
  }
}

function contains(name: string, haystack: string, needle: string): void {
  if (haystack.includes(needle)) {
    console.log(`  ok    ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name}\n          missing: ${needle}`);
  }
}

const H = '<h3 class="wp-block-heading"><strong>Quick News Summary</strong></h3>';

console.log("\nsplitArticle\n");

// --- the shapes real posts use -------------------------------------------

check("no heading leaves the body untouched", splitArticle("<p>Just a story.</p>"), {
  subtitle: "",
  summary: [],
  body: "<p>Just a story.</p>",
});

{
  const r = splitArticle(
    `<p><em>Stand first.</em></p>${H}<ul><li>One.</li><li>Two.</li></ul><p>Body.</p>`,
  );
  check("italic standfirst is read", r.subtitle, "Stand first.");
  check("list bullets become the summary", r.summary, ["One.", "Two."]);
  check("body is what follows", r.body, "<p>Body.</p>");
}

check(
  "standfirst without italics still works",
  splitArticle(`<p>Plain lead.</p>${H}<ul><li>One.</li></ul><p>Body.</p>`).subtitle,
  "Plain lead.",
);

check(
  "bullets split across two lists are all collected",
  splitArticle(`<p>Lead.</p>${H}<ul><li>One.</li></ul><ul><li>Two.</li></ul><p>Body.</p>`).summary,
  ["One.", "Two."],
);

check(
  "bullet paragraphs become the summary",
  splitArticle(`<p>Lead.</p>${H}<p><strong>•</strong> One.</p><p>• Two.</p><p>Body.</p>`).summary,
  ["One.", "Two."],
);

check(
  "two bullets run into one paragraph are split",
  splitArticle(`<p>Lead.</p>${H}<p>• One.• Two.</p><p>Body.</p>`).summary,
  ["One.", "Two."],
);

check(
  "a prose summary is kept as a single point",
  splitArticle(`<p>Lead.</p>${H}<p>All of it in one go.</p><p>Body.</p>`).summary,
  ["All of it in one go."],
);

// --- the case that reached production ------------------------------------
// An image and a second paragraph above the heading used to vanish: only the
// first paragraph was read as the standfirst and the rest of the intro was
// never put back into the body.

{
  const r = splitArticle(
    `<p><em>Lead.</em></p>` +
      `<figure><img src="/a.png"></figure>` +
      `<p>Second intro paragraph.</p>` +
      `${H}<ul><li>One.</li></ul><p>Body.</p>`,
  );
  check("standfirst is still the first paragraph", r.subtitle, "Lead.");
  contains("an image above the heading survives", r.body, '<img src="/a.png">');
  contains("a second intro paragraph survives", r.body, "Second intro paragraph.");
  contains("the body itself survives", r.body, "<p>Body.</p>");
  check("the standfirst is not duplicated into the body", r.body.includes("<em>Lead."), false);
}

check(
  "an intro with no paragraph at all is kept",
  splitArticle(`<figure><img src="/a.png"></figure>${H}<ul><li>One.</li></ul><p>Body.</p>`).body,
  '<figure><img src="/a.png"></figure><p>Body.</p>',
);

check(
  "a heading with nothing usable under it changes nothing",
  splitArticle(`<p>Lead.</p>${H}`).body,
  `<p>Lead.</p>${H}`,
);

// --- no-content-loss invariant -------------------------------------------
// The property that actually matters: every word in goes somewhere.

{
  const samples = [
    `<p><em>Lead.</em></p>${H}<ul><li>One.</li><li>Two.</li></ul><p>Alpha.</p><p>Beta.</p>`,
    `<p>Lead.</p><figure><img src="/a.png"></figure><p>Extra.</p>${H}<p>• One.</p><p>Gamma.</p>`,
    `<p>Lead.</p>${H}<p>Prose summary.</p><p>Delta.</p>`,
    `<p>No heading here.</p><p>Epsilon.</p>`,
  ];
  samples.forEach((html, i) => {
    const r = splitArticle(html);
    // The heading text is meant to disappear — the component prints its own
    // "Quick News Summary" title — and so is the bullet character, which the
    // box draws in CSS. Neither is content.
    const source = html.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, " ").replace(/\u2022/g, " ");
    const before = stripTags(source).split(/\s+/).filter(Boolean).sort();
    const after = stripTags(`${r.subtitle} ${r.summary.join(" ")} ${r.body}`)
      .split(/\s+/)
      .filter(Boolean)
      .sort();
    const lost = before.filter((w, idx) => after[idx] !== w).length;
    check(
      `sample ${i + 1}: no words lost`,
      { words: before.length, mismatches: lost > 0 },
      {
        words: before.length,
        mismatches: false,
      },
    );
  });
}

console.log(`\n${failures === 0 ? "all passed" : `${failures} FAILED`}\n`);
if (failures > 0) process.exit(1);
