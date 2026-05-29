import { categorizeArticle, rssSources, type NewsCategory } from "./rssSources";

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: NewsCategory;
  link: string;
  description: string;
};

type ParsedFeedItem = {
  title: string;
  link: string;
  publishedAt: string;
  description: string;
};

const MAX_DESCRIPTION_LENGTH = 120;

export async function getNewsItems(): Promise<NewsItem[]> {
  const settled = await Promise.allSettled(
    rssSources.map(async (source) => {
      const response = await fetch(source.url, {
        next: { revalidate: 60 * 30 },
        headers: {
          "User-Agent": "construction-news-mvp/0.1",
        },
      });

      if (!response.ok) {
        throw new Error(`${source.name} RSS fetch failed: ${response.status}`);
      }

      const xml = decodeFeedText(await response.arrayBuffer(), response);
      return parseFeed(xml)
        .filter((item) => matchesSourceKeywords(item, source.includeKeywords))
        .map((item) => ({
          id: `${source.name}-${item.link || item.title}`,
          title: item.title,
          source: source.name,
          publishedAt: item.publishedAt,
          category: categorizeArticle(
            item.title,
            item.description,
            source.defaultCategory,
          ),
          link: item.link,
          description: trimText(stripHtml(item.description), MAX_DESCRIPTION_LENGTH),
        }));
    }),
  );

  return settled
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((item) => item.title && item.link)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 60);
}

function decodeFeedText(buffer: ArrayBuffer, response: Response): string {
  const bytes = new Uint8Array(buffer);
  const utf8Preview = new TextDecoder("utf-8").decode(bytes.slice(0, 200));
  const contentType = response.headers.get("content-type") ?? "";
  const declaredEncoding =
    contentType.match(/charset=([^;]+)/i)?.[1] ??
    utf8Preview.match(/encoding=["']([^"']+)["']/i)?.[1] ??
    "utf-8";

  const encoding = /shift[_-]?jis|sjis/i.test(declaredEncoding)
    ? "shift_jis"
    : "utf-8";

  return new TextDecoder(encoding).decode(bytes);
}

function matchesSourceKeywords(
  item: ParsedFeedItem,
  includeKeywords?: string[],
): boolean {
  if (!includeKeywords || includeKeywords.length === 0) {
    return true;
  }

  const text = `${item.title} ${stripHtml(item.description)}`.toLowerCase();
  return includeKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function parseFeed(xml: string): ParsedFeedItem[] {
  const itemBlocks = matchBlocks(xml, "item");
  const entryBlocks = matchBlocks(xml, "entry");
  const blocks = itemBlocks.length > 0 ? itemBlocks : entryBlocks;

  return blocks.map((block) => {
    const title = decodeXml(getTag(block, "title"));
    const description = decodeXml(
      getTag(block, "description") ||
        getTag(block, "summary") ||
        getTag(block, "content:encoded"),
    );
    const link =
      decodeXml(getTag(block, "link")) ||
      decodeXml(getAtomLink(block)) ||
      decodeXml(getTag(block, "guid"));
    const publishedAt =
      decodeXml(
        getTag(block, "pubDate") ||
          getTag(block, "dc:date") ||
          getTag(block, "published") ||
          getTag(block, "updated"),
      ) || new Date().toISOString();

    return {
      title,
      link,
      publishedAt: normalizeDate(publishedAt),
      description,
    };
  });
}

function matchBlocks(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  return Array.from(xml.matchAll(regex), (match) => match[1] ?? "");
}

function getTag(block: string, tag: string): string {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<${escapedTag}\\b[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${escapedTag}>`,
    "i",
  );
  return block.match(regex)?.[1]?.trim() ?? "";
}

function getAtomLink(block: string): string {
  const alternateLink =
    block.match(/<link\b(?=[^>]*rel=["']alternate["'])([^>]*)\/?>/i)?.[1] ??
    block.match(/<link\b([^>]*)\/?>/i)?.[1] ??
    "";
  return alternateLink.match(/href=["']([^"']+)["']/i)?.[1] ?? "";
}

function decodeXml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .trim();
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function trimText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function normalizeDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
