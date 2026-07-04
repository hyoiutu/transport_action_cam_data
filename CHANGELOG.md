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

### [2026-07-04] SOLID原則に基づくsrc/App.tsxのリファクタリング
* **修正の動機・概要**:
  - rules.mdに追加したSOLID原則のうち、SRP（単一責任の原則）とDIP（依存性逆転の原則）に照らすと、`src/App.tsx`はディレクトリスキャン・コピー実行という2つのビジネスロジックと、`window.api`という具象のElectron APIへの直接依存、および描画処理が1つのコンポーネントに混在していた。カスタムhooksへ抽出し、コンポーネントを「hooksの合成＋描画」という単一の責任に絞った。
  - OCP・LSP・ISPについても既存コードを確認したが、`FileCard`のvideo/image分岐（2種類固定）へOCP的な抽象化を導入するのはYAGNIに反すると判断し見送った。ISP・LSPに該当する明確な違反は見つからなかったため対応不要と判断した。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `src/utils/errorHandling.ts`: `getErrorMessage` / `showErrorToast` を`App.tsx`から抽出（新規作成、複数hooksからの重複利用のためDRYの観点でも共通化）。
    - `src/hooks/useDirectoryScan.ts`: `srcPath` / `destPath` / `srcFiles` / `destFiles` / `scanInfo` の状態と `updateDirectory`（`window.api.scanDirectory`のラップ）を抽出（新規作成）。
    - `src/hooks/useCopyOperation.ts`: `isCopying` / `progress` の状態と `startCopy`（`window.api.startCopy`等のラップ）を抽出（新規作成）。
    - `src/App.tsx`: 上記2つのhooksを利用する形に書き換え、状態管理・API呼び出しロジックを大幅に削減（353行→223行）。振る舞い・DOM構造・E2Eテストで参照されるid等は変更していない。
    - `src/tests/module-format.spec.ts`: ESMチェック対象ファイルに新規作成した3ファイルを追加。
  - **README.md**: 変更なし
  - **仕様書**: 変更なし
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`（全6テスト成功、実アプリでのスキャン・コピー・キャンセル動作を確認）で動作確認済み。

### [2026-07-04] コーディング規約にSOLID原則を追加
* **修正の動機・概要**:
  - [参考記事](https://zenn.dev/koki_tech/articles/361bb8f2278764)を参考に、React/TypeScriptにおけるSOLID原則（SRP, OCP, LSP, ISP, DIP）をrules.mdに追加。コード例はプロジェクトの既存規約（`type`使用、`any`不使用等）に合わせて書き換えた。
  - あわせて、既存の「名前重要」セクションのOKコードブロックが閉じタグ（```）を欠いていた記法上の不備を修正した。
* **各ファイルへの影響と変更内容**:
  - **実装**: 変更なし
  - **rules.md**: 「名前重要」セクションの直後に、SRP・OCP・LSP・ISP・DIPの各原則をNG/OK例とともに追記。「名前重要」セクションのコードブロック閉じ忘れを修正。
  - **README.md**: 変更なし
  - **仕様書**: 変更なし

### [2026-07-04] コミット前の型チェックを必須化
* **修正の動機・概要**:
  - `npx tsc -p tsconfig.json --noEmit` によるレンダラー・テストコードの型チェックを、これまでAIエージェントが都度実行するかどうか明言しておらず、実行有無にばらつきがあった。ユーザーからの指摘を受け、テスト・リントと同様にコミット前に必ず実行し、エラーは無視せず解消するルールとして明文化・ツール化した。
  - あわせて、この確認過程で発覚した既存の型エラー2件（`src/main.tsx`の`../style.css`副作用importの型宣言不足、`vite.config.ts`の`test`プロパティ型不一致）を解消した。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `src/vite-env.d.ts`: `/// <reference types="vite/client" />` を追加し、CSSなどのアセットの副作用importを型解決できるようにした（新規作成）。
    - `vite.config.ts`: `defineConfig` の import元を `vite` から `vitest/config` に変更し、Vitestの`test`設定オプションの型が正しく認識されるように修正。
    - `package.json`: `typecheck` スクリプト（`tsc -p tsconfig.json --noEmit`）を追加。
    - `.husky/pre-commit`: `npx lint-staged` に加え `npm run typecheck` を実行するよう追加。あわせて、いずれかのコマンドが失敗した際に後続コマンドの成否に関わらず全体の終了コードが0になってしまう不具合を防ぐため `set -e` を追加。
  - **README.md**: 型チェックの実行方法とpre-commitフックでの自動実行について追記。
  - **仕様書 / commit_rules.md / SKILL.md**: コミット前に実行必須のコマンドを「テスト・リント」から「テスト・リント・型チェック」に拡張し、`commit_rules.md`の検証手順一覧を参照する形に一般化（`specs/auto_commit_skill_specification.md` 2.3節、`commit_rules.md`、`.agents/skills/auto-commit/SKILL.md` 手順3を更新）。
  - `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test:e2e`（全6テスト成功）、および`.husky/pre-commit`を手動実行してlint失敗時に`set -e`により正しく中断されることを確認済み。

### [2026-07-04] Electronメインプロセス関連ファイルをelectron/ディレクトリへ移動
* **修正の動機・概要**:
  - `main.ts` / `preload.ts` がリポジトリ直下（`src/`の外）に置かれ、レンダラー（`src/`）とプロセスの境界が分かりにくかったため、`electron/main/` / `electron/preload/` に分離した。`src/`配下（レンダラー）はそのままとした。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `main.ts` → `electron/main/main.ts`、`preload.ts` → `electron/preload/preload.ts` に移動（`git mv`）。
    - `electron/main/main.ts`: preloadスクリプトと`index.html`への相対パス参照を新しいディレクトリ構成に合わせて修正（`../preload/preload.js`, `../index.html`）。
    - `electron/preload/preload.ts`: 型importのパスを `./main.js` → `../main/main.js` に修正。
    - `tsconfig.main.json`: `include`を新パスに更新し、出力構造を`dist/main/main.js` / `dist/preload/preload.js`にするため`rootDir: "electron"`を追加。
    - `package.json`: `main`フィールドを`dist/main/main.js`に更新。`lint-staged`の対象を`preload.ts`から`electron/preload/**/*.ts`に更新。
    - `biome.json`: lint対象を`preload.ts`から`electron/preload/**`に変更（`electron/main/**`は引き続き対象外）。
    - `tests/module-format.spec.ts`: ESMチェック対象のファイルパスを新パスに更新。
    - `tests/e2e.spec.ts`: Electron起動時のエントリポイントパスを`dist/main/main.js`に更新。
  - **README.md**: 開発メモにElectronプロセス関連ファイルの配置（`electron/main/`, `electron/preload/`）とBiome対象範囲の変更を追記。
  - **仕様書**: 変更なし
  - `npm run build`でのdist出力構造、`npm run lint`でのスコープ、`npm run test:e2e`（実アプリ起動含む）で動作確認済み。

### [2026-07-04] テストディレクトリの統合とlint対象範囲の是正
* **修正の動機・概要**:
  - `tests/`（Playwright）がリポジトリ直下にあり`src/`と分かれていたため、`src/tests/`に統合。あわせて`electron/main/`がlint対象から漏れていたため対象に含め、重複していた`tsconfig.json`/`biome.json`/`lint-staged`のスコープ定義を整理した。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `tests/` → `src/tests/` に移動（`git mv`）。`e2e.spec.ts` / `module-format.spec.ts` の相対パス（`__dirname`基準）をディレクトリが1階層深くなった分修正。
    - `playwright.config.ts`: `testDir`を`./src/tests`に変更。
    - `tsconfig.json`: `include`から冗長になった`"tests"`を削除（`"src"`に包含されるため）。
    - `biome.json`: lint対象を`["src/**", "electron/**", "style.css"]`に変更（`tests/**`は`src/**`に統合、`electron/main/**`を新たに対象化）。
    - `package.json`: `lint-staged`の対象を`["src/**/*.{ts,tsx}", "electron/**/*.ts", "style.css"]`に整理。
    - `electron/main/main.ts`: `electron/main/**`がlint対象になったことで検出された指摘を解消（import順・フォーマット、`function`式→アロー関数、マジックナンバー3箇所を`JST_OFFSET_HOURS`/`MINUTES_PER_HOUR`/`SECONDS_PER_MINUTE`/`MILLISECONDS_PER_SECOND`定数に抽出）。外部ライブラリの実プロパティ名に合わせるため意図的に残す`creation_time`（snake_case）と、意図的な`||`使用（空文字列・0のフォールバック）には理由を明記した`biome-ignore`コメントを付与。
  - **README.md**: `src/tests/`への統合とBiome対象範囲の変更を反映。
  - **仕様書**: 変更なし
  - `npm run build`, `npm run lint`（指摘0件）, `npx tsc -p tsconfig.json --noEmit`（既存の無関係なエラー2件のみ）, `npm run test:e2e`（全6テスト成功）で動作確認済み。

### [2026-07-04] Biomeによるフォーマット・Lintの自動化
* **修正の動機・概要**:
  - rules.mdのコーディング規約をツールで機械的に担保するため、Biomeを導入。あわせてファイル保存時のフォーマット（VSCode）とコミット時のLint（husky + lint-staged）を自動化した。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `biome.json`: rules.mdの規約のうちBiomeで表現できるもの（default export禁止、アロー関数使用、interface→type、any禁止、||→??、型推論できる注釈の省略、マジックナンバー検知、ネスト三項演算子禁止、自己閉じタグ、命名規則、未使用変数・引数検知、Hooks依存配列、importソート）を設定。対象は`src/**`, `tests/**`, `preload.ts`, `style.css`（`main.ts`は対象外）。`src/global.d.ts`の`Window`インターフェースはグローバル宣言マージのため`useConsistentTypeDefinitions`を`biome-ignore`コメント付きで除外。
      - 検証の過程で、当初設定していた`noImplicitBoolean`がrules.mdの意図（boolean属性値の省略を推奨）と逆方向（明示的な`={true}`を強制）のルールだったことが判明したため設定から除外した。
    - `package.json`: `lint` / `lint:fix` スクリプトを追加。`husky` / `lint-staged` を devDependencies に追加し、`prepare`スクリプトと`lint-staged`設定（対象範囲はbiome.jsonと同一）を追加。
    - `.husky/pre-commit`: `npx lint-staged` を実行するフックを追加。
    - `.vscode/settings.json` / `.vscode/extensions.json`: Biome拡張機能によるファイル保存時フォーマットとimport整理を有効化。
  - **README.md**: 「開発メモ」にBiomeによるLint/Formatの運用方法（手動実行・保存時フォーマット・コミット時Lint）を追記。
  - **仕様書**: 変更なし

### [2026-07-04] rules.mdの規約とプロダクトコードの乖離解消
* **修正の動機・概要**:
  - コーディング規約（rules.md）の更新後、プロダクトコード側が追従できていなかったため、既存の規約に合わせてリファクタリングを実施。Red-Green-Refactoringに則り、既存の単体・E2Eテストが通ることを確認しながら修正した。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `main.ts`: `createWindow` を関数宣言からアロー関数に変更。`FileInfo` / `StartCopyArgs` を `interface` から `type` に変更し、`CopyProgressData` / `CopyErrorData` を新設してexport。`as any` を廃止し、music-metadataの型を拡張した最小限の `as` キャストに置き換え。`catch (err: any)` を `catch (err: unknown)` とし、共通の `getErrorMessage` でメッセージを安全に取得するよう修正。
    - `preload.ts`: 各APIの `any` 引数を `main.ts` からimportした `FileInfo` / `CopyProgressData` / `CopyErrorData` 型に置き換え。
    - `src/global.d.ts`: `FileInfo` / `CopyProgressData` / `CopyErrorData` を `type` に変更（`Window` はグローバル宣言マージが必要なため `interface` を維持）。
    - `src/App.tsx`, `src/components/DropZone.tsx`, `src/components/FileCard.tsx`: `export default function` を `export const ... = () => {}` （named export・アロー関数）に変更。`interface` を `type` に変更。`catch (error: any)` を `catch (error: unknown)` + `getErrorMessage` に変更。型推論が効く `useState` の冗長なジェネリクスを削除。`?.length || 0` を `?.length ?? 0` に変更（意味が変わらない箇所のみ）。
    - `src/main.tsx`: `App` のimportをdefault importからnamed importに変更。
  - **README.md**: 変更なし
  - **仕様書**: 変更なし（rules.md自体は今回変更していないため）
  - **テスト**: `tests/react-integration.spec.ts` のassertionをnamed import形式に更新。

### [2026-07-04] auto-commitスキルのClaude Code対応
* **修正の動機・概要**:
  - `auto-commit` スキルは元々 Google Antigravity 環境向けに設計されていたが、SKILL.md のフロントマター形式が Claude Code のスキル仕様とも互換性があったため、Claude Code からも `/auto-commit` として呼び出せるように対応した。実体は1箇所のみとし、二重管理を避けるためシンボリックリンクで対応。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `.claude/skills/auto-commit/SKILL.md`: `.agents/skills/auto-commit/SKILL.md` を指すシンボリックリンクを新規作成。
  - **README.md**:
    - 自動コミットスキルの配置場所の説明に、`.claude/skills/` へのシンボリックリンクにより Claude Code からも呼び出せる旨を追記。
  - **仕様書**:
    - `specs/auto_commit_skill_specification.md`: ファイル構造図に `.claude/skills/auto-commit/SKILL.md`（シンボリックリンク）を追加し、「3.1. Claude Code との互換性」セクションを新設。

### [2026-07-04] AI自動コミットスキルの作成
* **修正の動機・概要**:
  - AIエージェントがコードの変更を行った際に、自動的かつ安全にコミット処理を行うためのカスタムスキルとコミットルールを導入。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `.agents/skills/auto-commit/SKILL.md`: 自動コミットの起動条件、手順（差分確認、規約読込、テスト、コミットメッセージ生成、確認、コミット実行、プッシュ禁止）を記述したAIスキルファイルを新規作成。
    - `commit_rules.md`: プッシュ絶対禁止、テスト・リント無視禁止、コミットメッセージ要約、ユーザー確認などを定めたコミット規約ファイルを新規作成。
  - **README.md**:
    - AI向けカスタムスキル (`auto-commit`) についての説明と、 `commit_rules.md` に従った運用ルールの説明セクションを追記。
  - **仕様書**:
    - `specs/auto_commit_skill_specification.md`: 本スキルのシステム要件、ファイル構造、各ファイル（`SKILL.md` / `commit_rules.md`）の役割を定義した仕様書を新規作成。

### [2026-07-04] プログラミングの原理原則ルールの追加
* **修正の動機・概要**:
  - コードの品質、保守性、および理解しやすさを向上させるための基本的なプログラミング原理原則をコーディング規約に反映。
* **各ファイルへの影響と変更内容**:
  * **実装**: 変更なし（現在の実装がこれらの原則に適合していることをテスト等で確認）
  * **rules.md**: DRY、KISS、YAGNI、車輪の再発明の防止、割れ窓の法則の防止、名前重要の各原則を NG/OK の対比形式で追記。
  * **README.md**: 変更なし
  * **仕様書**: 変更なし

### [2026-06-27] JavaScriptからTypeScriptへの移行
* **修正の動機・概要**:
  - コードベースの型安全性の向上、開発効率化、バグの早期発見を目的に、プロジェクト全体を JavaScript から TypeScript へ移行。
* **各ファイルへの影響と変更内容**:
  * **実装**:
    - `package.json`: `typescript` および `@types/*` 関連パッケージを devDependencies に追加。メインプロセスのエントリポイントを `dist/main.js` に変更し、ビルドスクリプト `build:renderer` (`vite build`), `build:main` (`tsc -p tsconfig.main.json`), `build` (両方の実行) を追加。
    - `tsconfig.json`, `tsconfig.main.json`: レンダラープロセスおよびメインプロセス用の型チェックとコンパイル設定ファイルを新規作成。
    - `main.ts` (旧 `main.js`), `preload.ts` (旧 `preload.mjs`): メインプロセスとプリロードの TypeScript 移行。型注釈の追加に加え、`rules.md` に従い使用しない引数を `_` に変更。`exif-parser` 等の型定義のないライブラリを `createRequire` 等で安全に利用するよう修正。
    - `src/main.tsx` (旧 `src/main.jsx`), `src/App.tsx` (旧 `src/App.jsx`), `src/components/DropZone.tsx` (旧 `src/components/DropZone.jsx`), `src/components/FileCard.tsx` (旧 `src/components/FileCard.jsx`): レンダラー側コンポーネントの TypeScript 化と、ファイルインポート時の拡張子省略への移行。
    - `src/global.d.ts`: `window` オブジェクトや Electron API、ファイル情報用の共通型定義を記述。
    - `playwright.config.ts` (旧 `playwright.config.js`), `tests/*.spec.ts` (旧 `tests/*.spec.js`): テスト設定およびテストコード一式を TypeScript に移行。E2Eテスト内の非同期呼び出しの `await` 抜けなどのバグ修正もあわせて実施。
    - `rules.md`: TypeScript の使用ルールを追加。
  * **README.md**:
    - レンダラーUIの技術構成を `React + Vite + TypeScript` に修正。ビルドスクリプトとコンパイルフローの変更内容を反映。
  * **仕様書**:
    - `specs/system_specification.md`: 技術スタック欄を `JavaScript (ESM / ES6+)` から `TypeScript (ESM)` に修正。コンパイルツールとして `tsc` を追記。

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
