# 変更履歴 (CHANGELOG)

本プロジェクトにおける「実装」「README.md」「仕様書」の連動修正の履歴を以下に記録します。

## テンプレート
<!--
### [YYYY-MM-DD] 修正タイトル
* **修正の動機・概要**: 〇〇
* **各ファイルへの影響と変更内容**:
  * **実装**: 〇〇
  * **README.md**: 〇〇
  * **仕様書**: 〇〇
-->

## 変更履歴

### [2026-06-20] Vitest対象範囲の `src/` 配下限定
* **修正の動機・概要**:
  - `vitest` が E2E テスト用の `tests/` 配下まで拾わないようにし、単体テストの配置先を `src/**/*.tests.*` に統一。
* **各ファイルへの影響と変更内容**:
  * **実装**:
    * `vite.config.js`: `test.include` を `src/**/*.tests.*` に設定し、Vitest の対象を `src/` 配下に限定。
  * **README.md**: `Vitest` の対象範囲と、`src/` 配下に単体テストを置くルールを追記。
  * **仕様書**: `specs/system_specification.md` に単体テストと E2E テストの配置方針を追記。

### [2026-06-20] Reactコンポーネントの分離
* **修正の動機・概要**:
  - `App.jsx` に定義されていた `DropZone` と `FileCard` を個別コンポーネントとして分離し、Reactコードの見通しを改善。
* **各ファイルへの影響と変更内容**:
  * **実装**:
    * `src/components/DropZone.jsx`: フォルダ選択用ドロップゾーンコンポーネントを追加。
    * `src/components/FileCard.jsx`: ファイルカード表示コンポーネントを追加。
    * `src/App.jsx`: `DropZone` / `FileCard` の内部定義を削除し、`src/components/` からimportする構成に変更。
    * `tests/react-integration.spec.js` / `tests/module-format.spec.js`: コンポーネント分離とESM利用を検証する対象を追加。
  * **README.md**: Reactコンポーネント配置方針として `src/components/` を追記。
  * **仕様書**: 変更なし（技術スタック・機能仕様に変更なし）

### [2026-06-20] React/Viteの導入
* **修正の動機・概要**:
  - レンダラーUIをVanilla JavaScriptからReactコンポーネントへ移行し、Viteでビルドする構成に変更。
  - React導入を検証するPlaywrightテストを追加。
* **各ファイルへの影響と変更内容**:
  * **実装**:
    * `package.json` / `package-lock.json`: `react`、`react-dom`、`lucide-react`、`vite`、`@vitejs/plugin-react` を追加し、`build` とビルド込みの `start` / `test:e2e` スクリプトに変更。
    * `index.html`: Reactのルート要素と `src/main.jsx` のViteエントリに変更。
    * `src/main.jsx` / `src/App.jsx` / `vite.config.js`: ReactレンダラーとVite設定を追加。
    * `renderer.js`: React移行により削除。
    * `main.js`: Electronの読み込み先をViteビルド成果物 `dist/index.html` に変更。
    * `tests/react-integration.spec.js`: React依存とエントリポイントを検証するテストを追加。
  * **README.md**: React/Vite構成、ビルド、起動、テストコマンドの説明を追記。
  * **仕様書**: 技術スタックをReact/Viteおよび `lucide-react` 利用に更新。

### [2026-06-20] CommonJSからESMへの移行
* **修正の動機・概要**:
  - プロジェクト全体のJavaScript実行形式をCommonJSからESMへ統一し、`import` / `export` ベースの実装に変更。
  - ESM利用を検証する静的テストを追加。
* **各ファイルへの影響と変更内容**:
  * **実装**:
    * `package.json` / `package-lock.json`: `type: module` を追加。
    * `main.js` / `preload.mjs` / `playwright.config.js` / `tests/e2e.spec.js`: `require` / `module.exports` をESM構文へ移行。ElectronのESM preloadとして読み込むため、preloadファイルを `.mjs` に変更。
    * `tests/module-format.spec.js`: 主要JavaScriptファイルがESM形式であることを検証するテストを追加。
  * **README.md**: 開発メモにESM利用方針とテストコマンドを追記。
  * **仕様書**: 技術スタックのJavaScript表記を `ESM / ES6+` に更新。

### [2026-06-20] テスト環境（Vitest/Playwright）の導入およびE2Eテストの作成
* **修正の動機・概要**:
  - 技術スタックの変更やリファクタリングの準備として、単体テスト用の `vitest`、UIコンポーネント用の `testing library`、E2Eテスト用の `playwright` を導入。
  - アプリ全体の仕様要件（フォルダ選択・スキャン・動画画像プレビュー・日付分類コピー・重複回避）を満たしているかを検証する Playwright E2E テストスイートを作成。
* **各ファイルへの影響と変更内容**:
  * **実装**:
    * `package.json`: 依存関係に `vitest`、`@testing-library/dom`、`@testing-library/jest-dom`、`@playwright/test` を追加し、テスト実行スクリプトを登録。
    * `renderer.js`: Playwrightのテスト用 evaluate コンテキストから呼び出せるよう、ディレクトリ更新処理 `updateDirectory` をグローバルに露出。
  * **README.md**: 変更なし
  * **仕様書**: 変更なし

### [2026-06-20] .gitignoreの最適化
* **修正の動機・概要**: Electron、Node.js開発、パッケージング時（build/, dist/等）やOS固有の不要なファイルがGitにコミットされないよう、.gitignoreを整理・最適化。
* **各ファイルへの影響と変更内容**:
  * **実装**: 変更なし
  * **README.md**: 変更なし
  * **仕様書**: 変更なし

### [2026-06-20] フォルダ階層のフラット化（YYYY-MM-DD）および動画プレビューの修正
* **修正の動機・概要**:
  - フォルダ階層が深くなってしまう問題を解消するため、従来の `YYYY/MM/DD` 階層から `YYYY-MM-DD` 形式の1つのフォルダに変更。
  - 動画プレビューが正常にロードされない技術的課題を解消するため、カスタムプロトコルを廃止し、Electronの `webSecurity: false` 設定を有効にして `file://` スキームでのネイティブ再生（ストリーミング・Rangeリクエスト）に対応。
* **各ファイルへの影響と変更内容**:
  * **実装**:
    * `main.js`: `webSecurity: false` を設定。カスタムプロトコル `protocol.handle('local-file')` の登録を削除。日付生成形式を `YYYY-MM-DD` に変更。
    * `renderer.js`: `local-file://` を `file://` に変更し、絶対パスをネイティブURLとして処理。
  * **README.md**: 分類先のフォルダ形式の解説を `YYYY/MM/DD/` から `YYYY-MM-DD` に修正。
  * **仕様書**: 仕様書のシステム概要および機能要件にあるフォルダ自動生成形式を `YYYY-MM-DD/` に変更。

### [2026-06-20] README.mdへのインストール方法および使い方の追加
* **修正の動機・概要**: プロジェクトに標準的な「インストール・起動方法」と「詳細な使い方」をREADME.mdに追記し、導入および操作手順を明確化。
* **各ファイルへの影響と変更内容**:
  * **実装**: 変更なし（現在の実装コードに合わせたドキュメント追記のみ）
  * **README.md**: 前提条件、セットアップ手順、操作方法、および仕様詳細の解説セクションを追記
  * **仕様書**: 変更なし（仕様書に定義されている仕様内容を正確に反映）
