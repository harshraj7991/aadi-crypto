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

import { splitArticle, stripDisclaimer, stripTags } from "./wp-content";

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

// --- the disclaimer writers paste in themselves ----------------------------
// The page prints its own disclaimer panel, so a pasted one is a duplicate.

console.log("\nstripDisclaimer\n");

{
  const DISC =
    "Disclaimer: Aadi Crypto provides this information for educational and informational purposes " +
    "only. It does not constitute financial, investment, trading, or other professional advice.";

  check(
    "a pasted disclaimer is removed",
    stripDisclaimer(`<p>Body.</p><p>${DISC}</p>`),
    "<p>Body.</p>",
  );

  check(
    "an italic one is removed",
    stripDisclaimer(`<p>Body.</p><p class="wp-block-paragraph"><em>${DISC}</em></p>`),
    "<p>Body.</p>",
  );

  check(
    "a bolded label is removed",
    stripDisclaimer(`<p>Body.</p><p><strong>Disclaimer:</strong> ${DISC.slice(12)}</p>`),
    "<p>Body.</p>",
  );

  check(
    "the empty paragraph left behind goes too",
    stripDisclaimer(`<p>Body.</p><p>${DISC}</p><p class="wp-block-paragraph"></p>`),
    "<p>Body.</p>",
  );

  check(
    "blank paragraphs around it come off as well",
    stripDisclaimer(`<p>Body.</p><p></p><p>${DISC}</p><p>&nbsp;</p>`),
    "<p>Body.</p>",
  );

  check(
    "it is stripped through splitArticle as well",
    splitArticle(`<p>Lead.</p>${H}<ul><li>One.</li></ul><p>Body.</p><p>${DISC}</p>`).body,
    "<p>Body.</p>",
  );

  // Both wordings in the CMS, which differ only by a stray space.
  check(
    "the spaced-colon wording is removed too",
    stripDisclaimer(`<p>Body.</p><p>${DISC.replace("Disclaimer:", "Disclaimer :")}</p>`),
    "<p>Body.</p>",
  );

  // --- what must survive ------------------------------------------------
  // Opening with "Disclaimer" is not enough. Deleting a real paragraph is a
  // silent loss of published work, so the predicate has to be specific and
  // the search has to stay at the foot of the story.

  check(
    "a story reporting on someone else's notice keeps its paragraph",
    stripDisclaimer(
      "<p>Disclaimer: the regulator said its educational investment-advice " +
        "guidance applies to all firms.</p>",
    ),
    "<p>Disclaimer: the regulator said its educational investment-advice " +
      "guidance applies to all firms.</p>",
  );

  check(
    "a story about a disclaimer keeps its paragraph",
    stripDisclaimer("<p>Disclaimer wording in the filing drew regulator attention.</p>"),
    "<p>Disclaimer wording in the filing drew regulator attention.</p>",
  );

  check(
    "boilerplate mid-story is left alone, duplicate panel and all",
    stripDisclaimer(`<p>Lead.</p><p>${DISC}</p><p>The story continues.</p>`),
    `<p>Lead.</p><p>${DISC}</p><p>The story continues.</p>`,
  );

  check(
    "only one stock phrase is not enough",
    stripDisclaimer("<p>Body.</p><p>Disclaimer: for educational purposes only.</p>"),
    "<p>Body.</p><p>Disclaimer: for educational purposes only.</p>",
  );

  // Reported speech can quote the stock phrases. Only our own masthead says
  // the notice is ours rather than one the story is writing about.
  {
    const quoting =
      "<p>Body.</p><p>Disclaimer: the filing says \u201Cdoes not constitute\u201D and " +
      "\u201Cprofessional advice\u201D are misleading.</p>";
    check("a paragraph quoting two stock phrases is kept", stripDisclaimer(quoting), quoting);

    const reporting =
      "<p>Body.</p><p>Disclaimer: the exchange told users the page does not constitute " +
      "professional advice and that they should do your own research.</p>";
    check("a story reporting a rival's notice is kept", stripDisclaimer(reporting), reporting);
  }

  check(
    "the site spelling of the masthead is matched too",
    stripDisclaimer(`<p>Body.</p><p>${DISC.replace("Aadi Crypto", "AadiCrypto")}</p>`),
    "<p>Body.</p>",
  );

  check(
    "a paragraph merely mentioning advice is untouched",
    stripDisclaimer("<p>The firm gave investment advice for educational reasons.</p>"),
    "<p>The firm gave investment advice for educational reasons.</p>",
  );

  check("a story with no disclaimer is unchanged", stripDisclaimer("<p>Body.</p>"), "<p>Body.</p>");

  // --- tags that only look like paragraphs -------------------------------
  // `<p[^>]*>` also matches <pre>, <picture>, <param> and <progress>. With
  // that looser pattern a <pre> before the notice stopped it being stripped,
  // and a <picture> before it was deleted along with it.

  check(
    "a <pre> block before it does not block the strip",
    stripDisclaimer(`<p>Body.</p><pre>const x = 1;</pre><p>${DISC}</p>`),
    "<p>Body.</p><pre>const x = 1;</pre>",
  );

  check(
    "a <picture> before it is not swallowed",
    stripDisclaimer(`<p>Body.</p><picture><img src="/chart.png"></picture><p>${DISC}</p>`),
    '<p>Body.</p><picture><img src="/chart.png"></picture>',
  );

  check(
    "a <progress> before it survives too",
    stripDisclaimer(`<p>Body.</p><progress value="70" max="100"></progress><p>${DISC}</p>`),
    '<p>Body.</p><progress value="70" max="100"></progress>',
  );

  check(
    "a space in the closing tag is still a paragraph",
    stripDisclaimer(`<p>Body.</p><p>${DISC}</p >`),
    "<p>Body.</p>",
  );
}

// A <picture> ahead of the standfirst must not be read as the standfirst.
check(
  "a <picture> in the intro is not mistaken for the standfirst",
  splitArticle(
    `<picture><img src="/a.png"></picture><p>Lead.</p>${H}<ul><li>One.</li></ul><p>Body.</p>`,
  ).subtitle,
  "Lead.",
);

contains(
  "and it stays in the body",
  splitArticle(
    `<picture><img src="/a.png"></picture><p>Lead.</p>${H}<ul><li>One.</li></ul><p>Body.</p>`,
  ).body,
  '<picture><img src="/a.png"></picture>',
);

console.log("\ninvariant\n");

// --- no-content-loss invariant -------------------------------------------
// The property that actually matters: every word in goes somewhere.

{
  const samples = [
    `<p><em>Lead.</em></p>${H}<ul><li>One.</li><li>Two.</li></ul><p>Alpha.</p><p>Beta.</p>`,
    `<p>Lead.</p><figure><img src="/a.png"></figure><p>Extra.</p>${H}<p>• One.</p><p>Gamma.</p>`,
    `<p>Lead.</p>${H}<p>Prose summary.</p><p>Delta.</p>`,
    `<p>No heading here.</p><p>Epsilon.</p>`,
    `<p>Lead.</p>${H}<ul><li>One.</li></ul><p>Zeta.</p>` +
      `<p><em>Disclaimer: Aadi Crypto provides this for educational purposes only.</em></p>`,
  ];
  samples.forEach((html, i) => {
    const r = splitArticle(html);
    // The heading text is meant to disappear — the component prints its own
    // "Quick News Summary" title — and so is the bullet character, which the
    // box draws in CSS. Neither is content.
    const source = stripDisclaimer(html)
      .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, " ")
      .replace(/\u2022/g, " ");
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
