/**
 * Pure helpers for turning WordPress's HTML into the shape the site renders.
 *
 * Kept free of fetching, caching and config on purpose: this is the part most
 * likely to be wrong, because it parses HTML that a dozen different people
 * hand-write, so it needs to be testable on its own.
 */

export function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function decodeTitle(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&quot;/g, '"')
    .trim();
}

export type SplitArticle = { subtitle: string; summary: string[]; body: string };

/**
 * The masthead introducing our own notice.
 *
 * This is the part reported speech cannot have. A story quoting someone
 * else's disclaimer can repeat any number of the stock phrases below -- "the
 * filing says 'does not constitute' and 'professional advice' are misleading"
 * repeats two of them -- but it will not introduce the notice as ours.
 *
 * Spelled loosely because the CMS writes "Aadi Crypto" and the site writes
 * "AadiCrypto".
 */
const DISCLAIMER_ANCHOR = /\bAadi\s*Crypto\s+provides\s+this\s+information\b/i;

/**
 * The stock phrases the pasted notice is built from.
 *
 * Every copy in the CMS is the same block of boilerplate, down to two wordings
 * that differ only by a stray space before the colon, so the test can afford
 * to be specific.
 */
const DISCLAIMER_PHRASES = [
  /\bpurposes only\b/i,
  /\bdoes not constitute\b/i,
  /\bprofessional advice\b/i,
  /\bdo your own research\b/i,
];

/**
 * Is this our notice itself, rather than a paragraph reporting on one?
 *
 * All three conditions are needed. Opening with "Disclaimer" is how the paste
 * always starts but says nothing on its own; the stock phrases say it reads
 * like the notice; and the masthead says the notice is ours rather than one
 * the story is quoting.
 *
 * Erring strict is deliberate. A copy that slips through shows the panel
 * twice, which is untidy but plain to see. A paragraph wrongly matched is
 * published work deleted with nothing on screen to show for it.
 */
function isBoilerplateDisclaimer(text: string): boolean {
  if (!/^disclaimer\b/i.test(text)) return false;
  if (!DISCLAIMER_ANCHOR.test(text)) return false;
  return DISCLAIMER_PHRASES.filter((re) => re.test(text)).length >= 2;
}

/**
 * A real `<p>` tag, and nothing that merely starts with one.
 *
 * `<p[^>]*>` reads as "a paragraph with optional attributes" but is not:
 * `[^>]*` happily eats the rest of a tag name, so it also matches `<pre>`,
 * `<picture>`, `<param>` and `<progress>`. Insisting on whitespace or the
 * closing bracket straight after the p keeps it to paragraphs.
 *
 * This is not cosmetic. With the loose version, a `<pre>` before the
 * disclaimer stopped it being stripped, and a `<picture>` before it was
 * deleted along with it -- the picture vanished from the published story.
 */
const PARAGRAPH = String.raw`<p(?:\s[^>]*)?>([\s\S]*?)<\/p\s*>`;
const BLANK_PARAGRAPH = String.raw`<p(?:\s[^>]*)?>(?:\s|&nbsp;|<br\s*\/?>)*<\/p\s*>`;

const BLANK_TAIL = new RegExp(`(?:\\s*${BLANK_PARAGRAPH})+\\s*$`, "i");

/**
 * Drop the boilerplate disclaimer writers paste at the foot of a story.
 *
 * The article page prints its own disclaimer panel on every story, because
 * financial content needs one whether or not the writer remembered. When a
 * writer pastes one in as well the reader gets it twice: once as plain body
 * text, once in the styled box.
 *
 * Only the final paragraph is ever considered. Every pasted copy in the CMS
 * sits at the very foot of the story, and the asymmetry matters: showing the
 * panel twice is untidy but visible, whereas deleting a paragraph from the
 * middle of a piece loses published work and nobody notices.
 */
export function stripDisclaimer(html: string): string {
  // WordPress leaves blank paragraphs at the foot. They come off first, or
  // they would hide the real last paragraph from the check below.
  const trimmed = html.replace(BLANK_TAIL, "").trimEnd();

  const paragraphs = [...trimmed.matchAll(new RegExp(PARAGRAPH, "gi"))];
  const last = paragraphs[paragraphs.length - 1];
  if (!last || last.index === undefined) return trimmed.trim();

  // Footer only.
  if (last.index + last[0].length !== trimmed.length) return trimmed.trim();
  if (!isBoilerplateDisclaimer(stripTags(last[1] ?? ""))) return trimmed.trim();

  return trimmed.slice(0, last.index).replace(BLANK_TAIL, "").trim();
}

/**
 * Recover the editors' structure from WordPress's flat HTML.
 *
 * Every story is meant to be: a standfirst, a "Quick News Summary" heading,
 * the summary, then the body. In practice the summary arrives in several
 * shapes depending on who wrote it and which block they used — one `<ul>`,
 * bullets split across two `<ul>` blocks, paragraphs each starting with a
 * bullet character, or plain prose. All are handled, because asking a dozen
 * writers to mark up identically is a losing battle.
 *
 * The heading is the anchor: what is above it is the intro, what is
 * immediately below it is the summary. That beats looking for italics, which
 * only some writers use.
 *
 * Nothing is ever discarded. Anything above the heading that is not the
 * standfirst — a second paragraph, an image, an embed — is put back at the
 * top of the body, and anything unrecognised below it stays in the body too.
 */
export function splitArticle(raw: string): SplitArticle {
  // The writers' own disclaimer comes off before anything is measured, so it
  // cannot end up in the summary box or the body.
  const html = stripDisclaimer(raw);

  const heading = html.match(
    /<h[1-6][^>]*>\s*(?:<strong>)?\s*Quick\s+News\s+Summary:?\s*(?:<\/strong>)?\s*<\/h[1-6]>/i,
  );
  if (!heading || heading.index === undefined) {
    return { subtitle: "", summary: [], body: html.trim() };
  }

  const before = html.slice(0, heading.index);
  let cursor = heading.index + heading[0].length;

  // The standfirst is the first paragraph above the heading. Whatever else is
  // up there belongs to the reader, so it is carried into the body rather than
  // thrown away.
  const firstPara = new RegExp(PARAGRAPH, "i").exec(before);
  const subtitle = firstPara?.[1] ? stripTags(firstPara[1]) : "";
  const intro = firstPara
    ? before.slice(0, firstPara.index) + before.slice(firstPara.index + firstPara[0].length)
    : before;

  const summary: string[] = [];

  // Shape one: list blocks. Plural, because the bullets are sometimes split
  // across two <ul> blocks, and taking only the first loses half the summary
  // while stranding the rest in the body.
  for (;;) {
    const list = /^\s*<ul[^>]*>([\s\S]*?)<\/ul>/i.exec(html.slice(cursor));
    if (!list || !list[1]) break;
    for (const item of list[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
      const text = stripTags(item[1] ?? "");
      if (text) summary.push(text);
    }
    cursor += list[0].length;
  }

  if (summary.length === 0) {
    const paragraph = new RegExp(`^\\s*${PARAGRAPH}`, "i");

    // Shape two: paragraphs that each begin with a bullet character.
    for (;;) {
      const m = paragraph.exec(html.slice(cursor));
      if (!m || !m[1]) break;
      const text = stripTags(m[1]);
      if (!text.startsWith("•")) break;
      // Writers sometimes run two bullets into one paragraph.
      for (const part of text.split("•")) {
        const point = part.trim();
        if (point) summary.push(point);
      }
      cursor += m[0].length;
    }

    // Shape three: one plain paragraph standing in for the summary. Taken only
    // when nothing bulleted was found, and only ever one paragraph, so the
    // worst case is a lead paragraph moving into the box rather than the body
    // losing it.
    if (summary.length === 0) {
      const m = paragraph.exec(html.slice(cursor));
      const text = m?.[1] ? stripTags(m[1]) : "";
      if (text && m) {
        summary.push(text);
        cursor += m[0].length;
      }
    }
  }

  if (summary.length === 0) {
    // Heading but nothing usable under it — leave the body exactly as written.
    return { subtitle: "", summary: [], body: html.trim() };
  }

  return { subtitle, summary, body: (intro + html.slice(cursor)).trim() };
}
