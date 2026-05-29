# 建設業界ニュース MVP

建設業界のニュースを毎日チェックしやすくするための、Next.js + TypeScript + Tailwind CSS 製のMVPサイトです。

## 機能

- トップページにニュース一覧を表示
- タイトル、媒体名、公開日、カテゴリ、短い説明、元記事リンクを表示
- カテゴリ絞り込み
  - 行政・法改正
  - ゼネコン・企業
  - 建設DX
  - 入札・公共工事
  - 人材・働き方
- RSSから記事を取得
- 本文転載はせず、タイトルと短い説明とリンクのみ表示
- スマホでも見やすいレスポンシブUI

## 初期RSS取得元

- 国土交通省
- 建設ITワールド
- PR TIMES 建設

RSS取得元は `lib/rssSources.ts` の `rssSources` に追加できます。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

Windows PowerShellで `npm` が実行ポリシーにより止まる場合は、以下のように `npm.cmd` を使ってください。

```bash
npm.cmd install
npm.cmd run dev
```

## 著作権対応

記事本文は転載せず、RSSから取得したタイトル、短い説明、媒体名、公開日、カテゴリ、元記事リンクのみを表示します。詳細は必ず元記事で確認する設計です。
