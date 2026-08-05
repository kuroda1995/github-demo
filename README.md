# github-demo

Trello風タスク管理アプリ（プログラミングスクールの学習用課題）。

「未着手」「進行中」「完了」の3つの列にカードを分けて、ドラッグ＆ドロップで管理できるシンプルなタスク管理アプリ。React（＋状態管理・DnD）の基礎学習を目的としたフェーズ1と、自作バックエンド・DBへの置き換えを学ぶフェーズ2の2段階で開発している。

詳細なドキュメントは以下を参照。

- [要件定義書](./要件定義書.md)：何を・誰のために・なぜ作るか、機能仕様、非機能要件
- [設計書](./設計書.md)：ER図、API設計、フェーズ2（バックエンド・DB化）の詳細
- [技術スタック](./技術スタック.md)：フロントエンド／バックエンド／DB／開発ツールの一覧
- [CLAUDE.md](./CLAUDE.md)：このリポジトリでのGit/GitHub運用ルール（ブランチ運用・ポート管理等）

## 開発の背景・目的

実務ツールとしての完成度ではなく、「Reactの基礎」「状態管理」「ドラッグ＆ドロップの実装」「ブラウザへのデータ保存」、さらに「バックエンド・DBの基礎」を、手を動かしながら学ぶことを目的とした個人学習用アプリ。ログイン機能や複数人での共有は対象外。詳しくは[要件定義書 1. 背景・目的](./要件定義書.md#1-背景目的)を参照。

## 開発フェーズ

| フェーズ | 状態 | 内容 |
|----------|------|------|
| フェーズ1 | 完了 | React + Vite + localStorage でフロントエンドのみ実装（`frontend/`） |
| フェーズ2 | 進行中 | Java + Spring Boot + PostgreSQL によるバックエンド・DB化（`backend/`）。データ保存先をlocalStorageからDBに置き換える |

## 主な機能

- 3つの列（未着手／進行中／完了）の表示とカード枚数の表示
- カードの追加・編集・削除
- カードのドラッグ＆ドロップによる列間移動（[@dnd-kit](https://dndkit.com/)を使用）
- カード詳細情報：タイトル（必須）、説明文・優先度（高／中／低、未指定時は「中」）・期限（いずれも任意）
- カードの検索・並び替え（`SearchBar` / `SortControls`）
- データ永続化：フェーズ1はlocalStorage、フェーズ2はバックエンドAPI経由でDB（PostgreSQL）に保存

機能の詳細な仕様（画面仕様・ユースケース・バリデーション等）は[要件定義書 3〜7章](./要件定義書.md#3-できること機能要件)を参照。

## ディレクトリ構成

```
github-demo/
├── frontend/   # React + Vite製のフロントエンド（本体）
├── backend/    # Java + Spring Boot製のバックエンドAPI（フェーズ2）
├── mock/       # Reactを使わない素のHTML/CSS/JSによる画面確認用モック（実装の本体ではない）
├── 要件定義書.md
├── 設計書.md
└── 技術スタック.md
```

## frontend/ の動かし方

必要なもの：Node.js

```bash
cd frontend
npm install
npm run dev
```

表示された `http://localhost:5173` などのURLをブラウザ（Google Chrome推奨）で開く。フェーズ2のバックエンドと接続する場合は、`frontend/.env` の `VITE_API_BASE_URL`（デフォルト: `http://localhost:8080`）がバックエンドのAPIを指すようにする。

その他のコマンド：

```bash
npm run build     # 本番用ビルド
npm run preview   # ビルド結果のプレビュー
npm run lint       # oxlintによる静的解析
```

## backend/ の動かし方

必要なもの：JDK 21、Docker Desktop

```bash
cd backend
docker compose up -d      # PostgreSQLコンテナを起動
./gradlew.bat bootRun     # Spring Bootアプリを起動（Windows）
# ./gradlew bootRun       # Mac/Linuxの場合
```

`http://localhost:8080/api/columns` にアクセスして列一覧（todo/doing/done）がJSONで返ってくれば起動成功。API仕様（エンドポイント一覧）やDB構成（ER図）の詳細は[設計書](./設計書.md)を参照。

> フロントエンド・バックエンドを同時に動かす場合は、ポートを変更しないこと。バックエンドは`8080`固定、フロントエンドは`5173`固定でないとCORSエラーになる（詳細は[CLAUDE.md](./CLAUDE.md#5-開発サーバー起動時のポート管理)参照）。

## mock/ について

`mock/index.html` を直接ブラウザで開くと確認できる、Reactを使わない素のHTML/CSS/JavaScriptによる画面確認用モック。実際のアプリ（`frontend/`）を作る前の見た目・動作確認用に残しているもので、実装の本体ではない。

## 対象外の機能

ログイン・会員登録、複数人での共有、スマホアプリ化、複数ボードの切り替えは今回のスコープ外。詳細は[要件定義書 4. 対象外](./要件定義書.md#4-対象外今回は絶対に作らないもの)を参照。
