export type NewsCategory =
  | "行政・法改正"
  | "ゼネコン・企業"
  | "建設DX"
  | "入札・公共工事"
  | "人材・働き方";

export type RssSource = {
  name: string;
  url: string;
  defaultCategory: NewsCategory;
  includeKeywords?: string[];
};

export const categories: NewsCategory[] = [
  "行政・法改正",
  "ゼネコン・企業",
  "建設DX",
  "入札・公共工事",
  "人材・働き方",
];

export const rssSources: RssSource[] = [
  {
    name: "国土交通省",
    url: "https://www.mlit.go.jp/pressrelease.rdf",
    defaultCategory: "行政・法改正",
  },
  {
    name: "建設ITワールド",
    url: "https://ken-it.world/feed",
    defaultCategory: "建設DX",
  },
  {
    name: "PR TIMES 建設",
    url: "https://prtimes.jp/index.rdf",
    defaultCategory: "ゼネコン・企業",
    includeKeywords: [
      "建設",
      "建築",
      "土木",
      "施工",
      "工事",
      "ゼネコン",
      "BIM",
      "CIM",
      "建材",
      "現場",
    ],
  },
];

export function categorizeArticle(
  title: string,
  description: string,
  fallback: NewsCategory,
): NewsCategory {
  const text = `${title} ${description}`;

  if (/入札|落札|公共工事|公告|調達|発注/.test(text)) {
    return "入札・公共工事";
  }

  if (/DX|BIM|CIM|AI|IoT|ロボット|ドローン|3D|ICT|デジタル/.test(text)) {
    return "建設DX";
  }

  if (/人材|働き方|労働|採用|賃上げ|週休|技能者|担い手/.test(text)) {
    return "人材・働き方";
  }

  if (/法|制度|省令|告示|行政|補助金|国交省|審議会|改正/.test(text)) {
    return "行政・法改正";
  }

  if (/ゼネコン|建設会社|企業|開発|不動産|決算|受注|施工/.test(text)) {
    return "ゼネコン・企業";
  }

  return fallback;
}
