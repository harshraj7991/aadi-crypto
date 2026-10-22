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
 * Drop the boilerplate disclaimer writers paste at the foot of a story.
 *
 * The article page prints its own disclaimer panel on every story, because
 * financial content needs one whether or not the writer remembered. When a
 * writer pastes one in as well the reader gets it twice: once as plain body
 * text, once in the styled box.
 *
 * Only the boilerplate goes. A paragraph has to both open with "Disclaimer"
 * and read like the standard notice, so a story that genuinely reports on
 * someone else's disclaimer keeps its paragraph.
 */
export function stripDisclaimer(html: string): string {
  return (
    html
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, inner: string) => {
        const text = stripTags(inner);
        if (!/^disclaimer\b/i.test(text)) return match;
        return /\b(advice|educational|informational)\b/i.test(text) ? "" : match;
      })
      // Writers tend to leave a blank paragraph behind where it sat.
      .replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
      .trim()
  );
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
  const firstPara = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(before);
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
    const paragraph = /^\s*<p[^>]*>([\s\S]*?)<\/p>/i;

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
