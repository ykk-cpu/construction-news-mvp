import { getNewsItems } from "@/lib/rss";
import { categories, type NewsCategory } from "@/lib/rssSources";

type HomeProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory = categories.includes(
    resolvedSearchParams?.category as NewsCategory,
  )
    ? (resolvedSearchParams?.category as NewsCategory)
    : "すべて";

  const newsItems = await getNewsItems();
  const visibleItems =
    selectedCategory === "すべて"
      ? newsItems
      : newsItems.filter((item) => item.category === selectedCategory);

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      <header className="border-b border-[#d7ddd4] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#60715c]">
                Daily Construction News
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-normal text-[#1f2933] sm:text-3xl">
                建設業界ニュース
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#52605a]">
              RSSから取得した見出しと短い説明のみを掲載し、本文は転載しません。各記事は元記事リンクから確認できます。
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="カテゴリ">
            <CategoryLink label="すべて" selected={selectedCategory === "すべて"} />
            {categories.map((category) => (
              <CategoryLink
                key={category}
                label={category}
                selected={selectedCategory === category}
              />
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#263238]">
            {selectedCategory}のニュース
          </h2>
          <p className="text-sm text-[#66736b]">{visibleItems.length}件</p>
        </div>

        {visibleItems.length > 0 ? (
          <div className="grid gap-3">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-[#dfe5dc] bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-[#e8f0e4] px-2.5 py-1 text-[#3f6b3a]">
                        {item.category}
                      </span>
                      <span className="text-[#66736b]">{item.source}</span>
                      <span className="text-[#8a958f]">
                        {dateFormatter.format(new Date(item.publishedAt))}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-7 text-[#1f2933]">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#2d6a4f] hover:underline"
                      >
                        {item.title}
                      </a>
                    </h3>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-6 text-[#52605a]">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center rounded-md border border-[#9fb39b] px-3 py-2 text-sm font-semibold text-[#315f34] hover:bg-[#edf4ea]"
                  >
                    元記事へ
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#bbc7b8] bg-white p-8 text-center text-sm text-[#66736b]">
            該当するニュースがありません。別のカテゴリを選択してください。
          </div>
        )}
      </section>
    </main>
  );
}

function CategoryLink({
  label,
  selected,
}: {
  label: NewsCategory | "すべて";
  selected: boolean;
}) {
  const href = label === "すべて" ? "/" : `/?category=${encodeURIComponent(label)}`;

  return (
    <a
      href={href}
      className={[
        "whitespace-nowrap rounded-md border px-3 py-2 text-sm font-semibold transition",
        selected
          ? "border-[#315f34] bg-[#315f34] text-white"
          : "border-[#ccd8c8] bg-white text-[#3f5144] hover:bg-[#edf4ea]",
      ].join(" ")}
    >
      {label}
    </a>
  );
}
