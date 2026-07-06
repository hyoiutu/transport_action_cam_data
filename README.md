# transport_action_cam_data

アクションカメラ（Sony、DJI等）で撮影された動画および画像データを、撮影日時に基づいて自動的に整理し、外付けHDDなどの指定フォルダにコピーするElectron製デスクトップアプリケーションです。

---

## 🚀 インストールと起動方法

### 前提条件
- [Node.js](https://nodejs.org/) がインストールされていること

### セットアップ手順
1. **リポジトリのクローン**:
   ```bash
   git clone https://github.com/hyoiutu/transport_action_cam_data.git
   cd transport_action_cam_data
   ```

2. **依存関係のインストール**:
   ```bash
   npm install
   ```

3. **アプリケーションの起動**:
   ```bash
   npm start
   ```
   `npm start` はViteでレンダラーをビルドしてからElectronを起動します。

---

## 📖 使い方

### 1. フォルダの選択
* **コピー元 (Source)**
  * アクションカメラのSDカード、またはPCローカルにある動画・画像が保存されているフォルダを選択します。
  * 「コピー元フォルダ」エリアをクリックしてダイアログから選択するか、フォルダを直接ドラッグ＆ドロップして指定します。
* **コピー先 (Destination)**
  * バックアップ先となる外付けHDDやローカルフォルダを選択します。
  * 同様にクリックによるダイアログ選択、またはドラッグ＆ドロップで指定します。

### 2. ファイルのプレビュー
* フォルダ選択後、自動的に中のファイルがスキャンされ、画面右側のギャラリーにサムネイルとして一覧表示されます。
* 画面上部のタブ（**コピー元ファイル** / **コピー先フォルダ内**）を切り替えて、それぞれのフォルダ内のファイルを閲覧できます。
* サムネイルをクリックすると拡大モーダルが表示され、画像を表示したり、動画をその場で再生したりできます。

### 3. コピー（バックアップ）の実行
* コピー元とコピー先の選択が完了すると、「**コピーを開始する**」ボタンが有効化されます。
* ボタンをクリックすると、ファイルが撮影日に基づき、コピー先へ `YYYY-MM-DD` 形式のフォルダで自動分類されてコピーされます。
* コピー中は、進行状況（進捗パーセント、プログレスバー、処理中のファイル名）が画面下部にリアルタイムで表示されます。
* 途中で処理を止めたい場合は、「**キャンセル**」ボタンをクリックして中断できます。

---

## 🔧 仕様について
* **重複ファイルの保護**: コピー先に同じ名前のファイルが既に存在する場合、上書きを防ぐため、自動的にファイル名の末尾に連番を付与します（例: `filename_1.mp4`）。
* **撮影日時の判定**:
  * 動画はメタデータ（`creation_time`）、画像はEXIF（`DateTimeOriginal`）を解析して撮影日時を判定します。
  * メタデータが含まれない場合は、ファイルの更新日時（`mtime`）または作成日時を撮影日時としてフォールバック処理します。
* **安全設計**: コピー処理のみを行い、コピー元のファイルは削除せずに残します。

---

## 主要機能一覧
- **動画・画像コピー機能**: 撮影日時に基づく `YYYY-MM-DD` フォルダへの自動分類・コピー
- **重複防止リネーム**: コピー先同名ファイルに対する自動連番付与
- **進捗表示・キャンセル**: コピー進捗率の視覚化およびコピー処理の中断
- **プレビュー機能**: スキャンした動画・画像のインライン再生・表示

## 開発メモ
- レンダラーUIは React + Vite + TypeScript で構成し、エントリポイントは `src/main.tsx`、画面本体は `src/App.tsx`、再利用コンポーネントは `src/components/` に配置します。
- Electronのメインプロセス・プリロードスクリプトは `electron/` 配下に配置します（`electron/main/main.ts`, `electron/preload/preload.ts`）。
- TypeScript (ESM, `type: module`) として実行します。新規ファイルでは `import` / `export` を使用してください。
- `npm run build` でレンダラーのビルド (`vite build`) およびメインプロセス等のコンパイル (`tsc -p tsconfig.main.json`) を行い、`npm run test:e2e` でビルド後にPlaywrightを実行します。
- **単体テスト ([Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/))**: 対象は `src/**/*.tests.*` に限定します。テスト対象ファイルと同じディレクトリ内の `__tests__/` ディレクトリに `<対象ファイル名>.tests.ts`（コンポーネントは `.tests.tsx`）として配置してください（例: `src/utils/format.ts` → `src/utils/__tests__/format.tests.ts`）。
  - 実行環境はjsdom、セットアップファイルは `src/vitest.setup.ts`（`@testing-library/jest-dom/vitest` を読み込み）。
  - `npm run test:unit` で実行します。
  - 単体テスト作成・実行時に必ず守るルール・観点は [test_rules.md](./test_rules.md) に記載しています（AAAパターン、分岐網羅、specs優先、疎結合、ファイル配置等）。
- `src/tests/` 配下は Playwright の E2E テスト用です（`playwright.config.ts` の `testDir`）。E2Eテストにも `test_rules.md` のルールが適用されます。
- **Lint / Format ([Biome](https://biomejs.dev/))**: `rules.md` のコーディング規約に基づき `biome.json` を設定しています。対象は `src/**`, `electron/**`, `style.css`。
  - `npm run lint` / `npm run lint:fix` で手動実行できます。
  - VSCodeでは `.vscode/settings.json` によりBiome拡張機能でのファイル保存時フォーマットが有効になります（要 `biomejs.biome` 拡張機能）。
  - `git commit` 時には husky + lint-staged により、ステージされた対象ファイルに対して自動的に `biome lint` が実行され、エラーがあるとコミットがブロックされます。
- **型チェック**: `npm run typecheck`（`tsc -p tsconfig.json --noEmit`）でレンダラー・テストコードの型チェックを行います。メインプロセス・プリロードは`npm run build`内の`tsc -p tsconfig.main.json`で担保されます。`git commit`時にはpre-commitフック（`.husky/pre-commit`）で自動実行され、エラーがあるとコミットがブロックされます。

---

## 🤖 AI向けカスタムスキル (Agent Skills)

### 自動コミットスキル (`auto-commit`)
AIエージェントが作業中にローカルファイルに変更を加えた際、自動的にコミット処理を行うためのカスタムスキルです。

* **配置場所**: `.agents/skills/auto-commit/`（実体）。`.claude/skills/auto-commit/` はこのファイルへのシンボリックリンクで、Claude Code からも `/auto-commit` として呼び出せます。
* **動作ルール**: AIエージェントはローカルファイルの変更を検知すると、自動的に本スキルを起動します。
* **コミット規約 ([commit_rules.md](./commit_rules.md))**: プロジェクトルートにある `commit_rules.md` に従って、テストの実行、コミットメッセージの要約（1行程度）、コミット前のユーザー承認 (Y/N) などを実施します。
* **注意**: このスキルを通じて `git push` が自動で実行されることは絶対にありません。

### Issue実装スキル (`issue-implement`)
GitHub Issueの内容をもとに、AIエージェントが人間の都度の指示を介さずに実装・修正を進めるためのカスタムスキルです。

#### 前提: GitHub MCP Serverのセットアップ
本スキルはAIエージェントがGitHub Issueを直接読み取れるよう、GitHub公式のリモートMCPサーバー（`https://api.githubcopilot.com/mcp/`）を利用します（Dockerでローカルにホストする方式は本プロジェクトでは使用していません）。サーバー定義はリポジトリ直下の [`.mcp.json`](./.mcp.json) にプロジェクトスコープとしてコミット済みのため、`claude mcp add` によるセットアップは不要です。

1. GitHubでPersonal Access Token（Fine-grained tokenまたはClassic token）を発行します。Issueの読み書きを行うため、対象リポジトリに対して最低限 `repo`（プライベートリポジトリの場合）または `public_repo`（パブリックリポジトリの場合）相当のスコープ・権限を付与してください。
2. 発行したトークンを、環境変数 `GITHUB_PERSONAL_ACCESS_TOKEN` として自分のシェル環境（`~/.zshrc` など）に設定します。`.mcp.json` はこの環境変数を `${GITHUB_PERSONAL_ACCESS_TOKEN}` として参照するのみで、トークン自体は含まれていません。**トークンを直接 `.mcp.json` やその他リポジトリ内のファイルに書き込まないでください。**
3. 本リポジトリをClaude Codeで開くと、初回のみ `.mcp.json` に定義されたプロジェクトスコープのMCPサーバーを使用するかどうかの承認を求められるので、承認します。
4. `claude mcp list` を実行し、`github: https://api.githubcopilot.com/mcp/ (HTTP) - ✔ Connected` と表示されれば設定完了です。

* **配置場所**: `.agents/skills/issue-implement/`（実体）。`.claude/skills/issue-implement/` はこのファイルへのシンボリックリンクで、Claude Code からも `/issue-implement` として呼び出せます。
* **動作ルール**: 起動時に必ず「対象のGitHub Issue番号」「ブランチ名（希望がなければAIが命名）」「派生元ブランチ（デフォルトは現在のブランチ）」をユーザーに確認したうえで実装を開始します。
* **ブランチ運用規約 ([branch_rules.md](./branch_rules.md))**: 1つのIssueにつき必ず1つの専用ブランチを作成する「1 Issue = 1 Branch」の原則、およびブランチ命名規則（`<type>/issue-<Issue番号>-<内容>`）に従います。
* **実装ルールの遵守**: 実装時はTDD・コード規約・README/仕様書の同期・CHANGELOG記録など、本プロジェクトの既存ルールをすべて遵守します。
* **注意**: このスキルを通じて `git push` が自動で実行されることは絶対にありません。コミットは必ず `auto-commit` スキル経由で行います。

