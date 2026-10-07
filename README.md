# 贈りもの帖 — Okurimono Cho

予算と気持ちから探す、日本語のギフトカタログ。楽天市場の実データ・アフィリエイトリンクを使い、6ジャンル最大180件の商品を紹介します。

予定公開先: https://gift.jev.jp/

## 特徴

- お菓子、コーヒー、今治タオル、プリザーブドフラワー、スープ、カタログギフト
- 税込予算・送料込み・価格順／レビュー件数順の絞り込み（取得済み30件の範囲）
- サーバー描画。JavaScriptなしで利用可能。レスポンシブ、キーボード対応
- 6時間ごとにカタログ更新。通常24 APIリクエスト／日。閲覧に伴う商品API・AI呼び出しはゼロ
- 24時間を超えた商品情報では価格を非表示
- 広告表示、運営／プライバシー／選び方ページ、canonical、sitemap、robots、独自favicon
- WebMCP対応ブラウザ向け表示商品読み取りツール（任意の機能検出）

商品の選定・紹介は独自編集であり、商品レビューや最安値の保証ではありません。売上の発生は購入者・成果認定・集客によります。

## 開発

Node.js 22以上推奨。

```sh
npm ci
npm run seed -- --local
npm run dev
npm test
npm run check
npx wrangler deploy --dry-run
```

`seed` には `RAKUTEN_APPLICATION_ID`、`RAKUTEN_ACCESS_KEY`、`RAKUTEN_AFFILIATE_ID` が必要です。ローカル環境の `RAKUTEN_API_KEY` / `RAKUTEN_AFFI` の別名もseedスクリプトで受け付けます。キーの値をコミットしないでください。

## 初回公開

1. `npx wrangler login`（Workers / KV / Routes / Scripts / SSL write、Account / User / Zone read）
2. `npx wrangler kv namespace create CATALOG` で新規KVを作り、`wrangler.jsonc`のIDを設定
3. `node scripts/upload-secrets.mjs` で環境変数からWorker secretを投入
4. `npm run seed -- --remote`
5. `npm run deploy`
6. 本番と `/collections/coffee?budget=5000` の表示、`/sitemap.xml` を確認

`wrangler.jsonc` に Workers Cron（UTC 01:17 / 07:17 / 13:17 / 19:17）を定義しています。日本時間 10:17 / 16:17 / 22:17 / 04:17 に更新します。Cronは初回反映に時間がかかる場合があります。`npm run seed -- --remote` で手動更新できます。

失敗したジャンルのデータは上書きせず保持し、スケジュール実行をエラー終了させてCloudflare上で確認できるようにしています。販売店データや秘密値はログに出しません。API制限回避のためリクエスト間に1.5秒の間隔を設けています。同じ楽天アプリを使う他サイトとはレート枠を共有するため、重なった場合の更新失敗は次の更新で回復します。

## 認証情報

| Secret | 用途 |
|---|---|
| RAKUTEN_APPLICATION_ID | 楽天アプリID |
| RAKUTEN_ACCESS_KEY | 楽天APIアクセスキー |
| RAKUTEN_AFFILIATE_ID | 楽天アフィリエイトID |

楽天アプリの許可サイトが `*.jev.jp` の設定を前提に、参考プロジェクトと同じ `https://www.jev.jp/` のRefererを使用しています。別ドメインに展開する場合はアプリ側の許可設定とコードのヘッダーを合わせてください。

## 集客と収益化

商品リンクは楽天APIの返す `affiliateUrl` のみを使用。報酬率で商品順位を変更しません。初期ページは6つのジャンル別ページとギフトの選び方。検索流入を増やす次の段階は、実際の検索需要・利用状況を確認しながら用途別の独自記事を加えることです。Google Search Consoleへの登録・楽天側の運営サイト登録はこのリポジトリから自動実行されません。

本番反映は手動 `npm run deploy`。GitHubへのpushだけではデプロイされません。

## CI設定

`docs/ci-workflow.yml` にGitHub Actions用チェック定義を保存しています。現在のGitHub認証に `workflow` 権限がないため、自動実行フォルダーには登録していません。必要な権限のある環境で `.github/workflows/ci.yml` へ移動すれば有効になります。ローカルでテスト6件・構文検査・Workerドライランの通過を確認済みです。
