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

### [2026-07-05] コピー元・コピー先のフォルダ表示とフォルダ間ナビゲーション機能を追加した
* **修正の動機・概要**:
  - 従来`scanDirectory`はサブディレクトリを無条件でスキップしており、コピー元・コピー先フォルダ直下のファイルしか表示できなかった。コピー後は撮影日ごとのサブフォルダ（`YYYY-MM-DD/`）が自動生成される仕様のため、コピー先を選択しただけでは直下に何も表示されず、コピー結果をアプリ内からすぐに確認できない問題があった。ユーザー要望を受け、(1) ギャラリーにファイルだけでなくフォルダも表示する、(2) フォルダクリックでその中身へ移動する、(3) 移動時にサイドバーのパス表示も更新する、機能を追加した。ナビゲーションはコピー元/コピー先フォルダ（`srcPath`/`destPath`）自体を更新する仕様とし（移動後にコピーを開始すると現在表示中のフォルダが対象になる）、親フォルダへ戻る「一つ上へ」操作もあわせて実装した。
* **各ファイルへの影響と変更内容**:
  - **型定義**: `electron/types/domain.ts` / `src/global.d.ts`に`FolderInfo`・`DirectoryEntry`（`FileInfo | FolderInfo`）を追加。`scanDirectory`・`window.api.scanDirectory`・`window.srcFiles`/`window.destFiles`の型を`DirectoryEntry[]`に変更（既存の`FileInfo`型自体は変更なし）。
  - **`electron/main/fileScanner.ts`**: サブディレクトリを`continue`でスキップする代わりに`FolderInfo`として結果に含めるよう変更（TDD: 先にテストを追加しRedを確認してから実装）。結果は「フォルダを先に、ファイルをあとに、それぞれ名前順」でソートする。
  - **`electron/preload/preload.ts`**: `getParentDirectory`（`node:path`の`dirname`）を追加。IPC往復が不要な純粋関数のため、preloadから直接公開しメインプロセスを介さない。
  - **`src/utils/directoryEntry.ts`**（新規）: `DirectoryEntry`から`FileInfo`を絞り込む型ガード`isMediaFile`を追加。
  - **`src/components/FolderCard.tsx`**（新規）: フォルダアイコン＋名前を表示し、クリックでナビゲーションする専用コンポーネント。
  - **`src/components/GalleryGrid.tsx`**: `entry.type === 'folder'`で`FolderCard`（`onFolderClick`）、それ以外は`FileCard`（`onFileClick`）を描画するよう分岐。
  - **`src/components/DirectorySelector.tsx`**: 「一つ上へ」ボタン（`onNavigateUp`）を追加。パス未選択またはコピー中は無効化する。
  - **`src/App.tsx`**: `srcFiles`/`destFiles`（`DirectoryEntry[]`）から`isMediaFile`で絞り込んだ`FileInfo[]`をコピー処理・件数表示に使用。フォルダクリックとナビゲーションのハンドラを追加し、既存の`updateDirectory`（`useDirectoryScan`）をそのまま再利用することでサイドバーのパス表示も自動的に更新されるようにした。
  - **テスト**: `fileScanner.tests.ts`・`preload.tests.ts`・`GalleryGrid.tests.ts`・`DirectorySelector.tests.tsx`を更新し、`FolderCard.tests.tsx`・`directoryEntry.tests.ts`を新規追加。`e2e.spec.ts`にフォルダ表示・ナビゲーションを検証する新規ケース（4件目）を追加し、`window.srcFiles[0]`への型安全でないアクセスを型ガード付きの絞り込みに修正。`module-format.spec.ts`に新規ファイルを追加。
  - **仕様書**: `specs/system_specification.md`の「2.1 フォルダ選択・パス管理」にフォルダ表示・ナビゲーションの仕様を追記し、「2.2」の対応フォーマット説明にあった「サブディレクトリはスキャン対象外」という記述を、フォルダとして表示・移動できる旨に更新した（コピー対象・件数カウントには含まれない点は維持）。
  - **rules.md**: 新規ルール追加の必要はないため変更なし。
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`（24ファイル・133テスト成功）, `npm run test:e2e`（全7テスト成功、新規のフォルダナビゲーションケース含む）で動作確認済み。実アプリのスクリーンショットで、コピー先フォルダの日付フォルダがフォルダカードとして表示され、クリックでの移動とサイドバーのパス表示更新を目視確認した。

### [2026-07-05] 仕様書に異常系・エッジケースの挙動を追記した
* **修正の動機・概要**:
  - `specs/system_specification.md`には正常系の機能要件のみが記載されており、実装上は明確に存在する異常系・エッジケースの挙動（スキャン結果0件、対応フォーマットの厳密な範囲、コピーキャンセルの詳細、コピー中エラーの扱い等）が書かれていなかった。ユーザーからの指摘を受け、コードを変更せず、実際の実装（`electron/main/fileScanner.ts`, `electron/ipc/startCopyHandler.ts`, `src/hooks/useDirectoryScan.ts`, `src/hooks/useCopyOperation.ts`, `src/utils/errorHandling.ts`, `electron/main/main.ts`）を確認した上で、その挙動を仕様書へ書き起こした。
* **各ファイルへの影響と変更内容**:
  - **`specs/system_specification.md`**:
    - 「2.2 ファイル自動分類・コピー機能」の対応フォーマットにあった「等」という曖昧な表記を廃止し、`.mp4`/`.mov`/`.avi`/`.mkv`（動画）・`.jpg`/`.jpeg`/`.png`（画像）の厳密なリストに変更。拡張子の大文字小文字を区別しないこと、サブディレクトリがスキャン対象外であることを明記。
    - 新設した「2.4 エラー・異常系の挙動」に、(1) スキャン結果0件時の挙動、(2) コピーキャンセルの詳細仕様（ファイル単位でのみ中断判定、実行中のファイルは完了する、既コピー分はロールバックされない、再開機能はなくキャンセル後の再実行は重複コピーになる）、(3) その他のエラー（権限不足・容量不足・コピー先デバイス切断等）の扱い（バッチ開始前は全体中断、実行中の個別ファイルエラーはスキップして処理継続）、(4) コピー中の操作制限（多重実行防止）、(5) アプリ終了時の挙動（コピー中終了を防ぐガードが無い既知の制限）を追記。
  - **実装**: 変更なし（仕様書のみの更新）。
  - **README.md**: 変更なし。
  - コードを変更していないため`npm run test:unit`（22ファイル・120テスト成功、回帰がないことを確認）のみ実行し、記載内容は該当する実装ファイルとの読み合わせで整合性を確認した。

### [2026-07-05] デザイントークンの整備（色・余白・サイズの一元管理）
* **修正の動機・概要**:
  - Chakra UI移行時に、旧`style.css`の値をコンポーネントへそのまま素の`rgba(...)`/`#hex`/pxリテラルとして移植してしまっており、色・余白・サイズが依然としてマジックナンバー化していた。ユーザーからの指摘を受け、(1) 色は意味を持たせた名前のトークンとして管理し、むやみに種類を増やさない、(2) 余白・サイズはChakraのデザイントークンを最優先し、無い場合は4pxルールで丸めて定数化する、(3) パターン化した値は`src/theme.ts`に一元化する、という方針で全コンポーネントを見直した。
  - 既存の見た目を厳密に固定するとパターンが絞れない箇所（例: タイトルバー高さ38px→40px、細かく異なる半透明色の乱立等）は、`specs/system_specification.md`のUI/UXコンセプト（ダーク基調・ガラスモルフィズム・紫グラデーション）を逸脱しない範囲で意図的に統合・丸めを行った。
* **各ファイルへの影響と変更内容**:
  - **`src/theme.ts`**: 色を「メイン（brand*）」「サブ（media*Accent）」「エラー（danger）」「テキスト」「背景」「ボーダー」「オーバーレイ/スクリム（白/黒ベースをそれぞれ4段階に統一）」という役割ごとの少数のセマンティックトークンに再編。`shadows`（brandGlow等）・`zIndices`・`iconSizes`・`layout`（Chakraのスケールに一致しない4px単位のアプリ固有寸法）をあわせてexportし、複数コンポーネントで共有できるようにした。
  - **各コンポーネント**（`DropZone` / `FileCard` / `GalleryGrid` / `PreviewModal` / `TitleBar` / `DirectorySelector` / `ProgressPanel` / `CopyActions` / `ContentTabs` / `App`）: 素のrgba/hex/pxリテラルを上記トークン参照に置き換えた。Chakraの標準スケール（spacing/sizes/fontSizes/radii/fontWeights/shadows）に一致する値はトークン名（例: `padding="4"`, `fontSize="xs"`, `borderRadius="xl"`）で参照し、一致しない値のみ4pxの倍数に丸めた上で`layout`定数を参照する形に統一した。
  - **rules.md**: 「色は生のカラーコードではなく意味を持たせた名前のトークンとして管理する」「余白・サイズはChakraのデザイントークンを最優先し、無い場合は4pxルールで定数化する」「複数コンポーネントで使う色・余白・サイズのパターンはグローバルなファイルにまとめる」の3ルールを追加。
  - **README.md / 仕様書**: 変更なし（見た目のコンセプト自体は維持しているため）。
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`（22ファイル・120テスト成功）, `npm run test:e2e`（全6テスト成功）で動作確認済み。実アプリのスクリーンショットで、ダーク・紫グラデーション基調の見た目が維持されていることも目視確認した。

### [2026-07-05] UIをChakra UIベースへ移行し、style.cssとApp.tsxの責務を整理した
* **修正の動機・概要**:
  - 従来のUIは`style.css`（684行）に全スタイルが素のCSSクラスとして集約されており保守性・可読性が低く、`App.tsx`もタイトルバー・サイドバー・タブ・ギャラリーの配線を1ファイルで担い責務が多い状態だった。外部UIコンポーネント（Chakra UI）を導入して独自CSSの分量を減らし、スタイルのスコープをコンポーネント単位（style props）に狭め、かつApp.tsxから画面の各セクションをコンポーネントとして切り出すことで責務を分割した。
* **各ファイルへの影響と変更内容**:
  - **依存関係**: `@chakra-ui/react`（v3系）と、そのpeerDependencyである`@emotion/react`を追加。
  - **テーマ**: `src/theme.ts`を新設。`createSystem(defaultConfig, defineConfig({...}))`で、旧`style.css`の`:root`にあったカラートークン・フォントをChakraのtokensに移植し、box-sizing/スクロールバー等のグローバルな指定は`globalCss`にまとめた。
  - **Provider設定**: `src/main.tsx`で`ChakraProvider`により`App`をラップし、`style.css`のimportを削除。
  - **既存コンポーネントのChakra化**: `DropZone.tsx`・`FileCard.tsx`・`GalleryGrid.tsx`をChakraの`Box`/`Flex`/`SimpleGrid`等+style propsに置き換え。`PreviewModal.tsx`はChakraの`Dialog`（Ark UI）に置き換え、フォーカストラップやEscapeキー対応を自前実装から解放した（車輪の再発明防止）。既存のDOM `id`（`#btn-start-copy`等）とE2Eテストが依存する`.file-card`クラスは維持し、E2Eへの影響を最小化した。
  - **App.tsxの責務分割**: `TitleBar.tsx` / `DirectorySelector.tsx`（src・dest共通化によりDRY化も兼ねる） / `ProgressPanel.tsx` / `CopyActions.tsx` / `ContentTabs.tsx`を新設し、`App.tsx`はこれらを組み合わせる薄い配線層に整理した。
  - **style.cssの削除**: 全スタイルの移行が完了したため`style.css`を削除。`biome.json`・`package.json`のlint対象・lint-staged設定からも除去。
  - **既知の副作用**: コピー処理中のキャンセル判定を担う`fileCopier.ts`はこの回の対象外（前回のコミットで修正済み）。
  - **テスト**:
    - `src/test-utils/renderWithChakra.tsx`を新設し、`ChakraProvider`でラップした`render`を提供。既存コンポーネントテストをこれに置き換えた。
    - Chakra移行に伴いクラス名依存のアサーション（`.dragover`、`.media-badge.video`等）が使えなくなったため、`data-dragover` / `data-media-type`等の明示的なdata属性に置き換えた。
    - Chakraの`Dialog`（Ark UI）はクローズ処理や外側クリック検知を内部で非同期に処理するため、一部のテストで`waitFor`が必要になった。backdropクリックについては、Ark UIの外側クリック検知がテスト環境（jsdom）と噛み合わなかったため、`Dialog.Backdrop`に明示的な`onClick`ハンドラを追加して対応した。
    - 新設した5コンポーネント（TitleBar等）にそれぞれテストファイルを追加。
    - `src/tests/module-format.spec.ts`・`react-integration.spec.ts`・`e2e.spec.ts`を新しい構成・DOM仕様（`data-state`属性等）に合わせて更新。
  - **rules.md**: 「UIはChakra UIコンポーネントを優先し、独自CSSクラスを新規作成しない」「style propsが多くなりすぎる場合は専用コンポーネントかtheme recipeに切り出す」の2ルールを追加。
  - **test_rules.md**: Chakra UIコンポーネントのテストは`renderWithChakra`を使うこと、Ark UIの非同期処理に関する注記を追加。
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`（22ファイル・120テスト成功）, `npm run test:e2e`（全6テスト成功）で動作確認済み。実アプリのスクリーンショットで、ダーク・紫グラデーション基調の既存デザインが維持されていることも目視確認した。

### [2026-07-05] specs/system_specification.mdとの乖離解消・コピーキャンセル機能の実装修正
* **修正の動機・概要**:
  - AGENTS.mdの「実装, README.md, specs/以下の仕様書の乖離確認」ルールを、TypeScript移行以降のコミットで実質的に守れていなかった。原因は、`specs/`に`auto_commit_skill_specification.md`だけでなく実際のアプリ仕様書`system_specification.md`（TypeScript移行以前から存在）が既にあったにもかかわらず、以降の作業で`ls specs/`等による再確認を行わず「specs/にはauto-commitスキルの仕様書しかない」という古い認識のまま作業を続けてしまったこと。ユーザーからの指摘で発覚した。
  - 実際に生じていた乖離は2点。(1) `system_specification.md`の「5. 検証方針」がテスト移動前の記載（`tests/`配下、`src/**/*.tests.*`のみ）のままだった。(2) 「2.2」に「コピー処理のキャンセル機能」と明記されているが、実装ではキャンセルが実質機能しない状態だった（`start-copy`のループにawaitがなく、cancel-copyのIPC呼び出しを処理する余地がなかったため）。前回はこれを「既知の制約」として実装ではなくドキュメント・テスト側に注記する対応にしていたが、仕様書との整合を優先し、今回は実装を修正してキャンセルが実際に機能するようにした。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `electron/main/fileCopier.ts`: `copyFileToDateDirectory`を非同期化し、`fs.copyFileSync`/`fs.mkdirSync`を`fs.promises.copyFile`/`fs.promises.mkdir`に変更。これによりコピーのたびにイベントループへ制御が戻り、`cancel-copy`のIPC呼び出しを処理できるようにした。
    - `electron/ipc/startCopyHandler.ts`: `copyFileToDateDirectory`の呼び出しに`await`を追加。「到達不能」としていたコメントを、キャンセルが実際に反映される仕組みの説明に更新。
    - `electron/main/__tests__/fileCopier.tests.ts` / `electron/ipc/__tests__/startCopyHandler.tests.ts`: 非同期化に伴うテスト更新に加え、コピー中にキャンセルされた場合に以降のファイルがコピーされず`cancelled`ステータスを返すことを検証するテストを新規追加。
  - **仕様書**:
    - `specs/system_specification.md`: 「5. 検証方針」を現状（`src/tests/`, `src/**/*.tests.*` + `electron/**/*.tests.*`, Testing Library, test_rules.md参照）に更新。「4. 技術スタック」にBiome/husky+lint-stagedを追記。
  - **README.md**: 変更なし（既にsrc/tests/等の現状を反映済み）
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`（55/55のelectronテスト成功、キャンセル関連の新規テスト含む）, `npm run test:e2e`（既存6テスト成功、非同期化による回帰なし）で動作確認済み。E2Eでのキャンセル操作自体のテストは、実ファイルコピー速度に依存し不安定になりやすいため見送り、決定論的な単体テストで検証した。

### [2026-07-05] IPCハンドラの分離・型定義の再配置・Biome検出限界の明文化
* **修正の動機・概要**:
  - 前回のelectron/リファクタリングに対する指摘を受け、(1) IPCハンドラをelectron/ipc/以下へハンドラ毎に分離、(2) start-copyハンドラに残っていたファイルコピー実行ロジックの関数分離、(3) select-directoryの if/else を三項演算子に簡略化、(4) BrowserWindowのwidth/height（マジックナンバー）の定数化、(5) 型定義ファイル（domain.ts, exif-parser.d.ts）のelectron/types/への分離、を行った。
  - 3・4番目はrules.mdのKISS原則・マジックナンバー回避ルールに反していたが見落としていた。原因を調査したところ、Biomeの`noMagicNumbers`が比較・算術式の数値は検出してもオブジェクトリテラルのプロパティ値（`width: 1200`等）は検出せず、KISS原則（if-elseの簡略化）はそもそも自動検出の対象外であることが判明した。ルール自体の不足ではなく、Biomeで検出できない範囲を人手で確認する仕組みが欠けていたことが原因のため、rules.md冒頭にその旨の注記を追加した。
  - テスト再構成の過程で、`vi.restoreAllMocks()`は`vi.spyOn`で作成したモックにしか効かず、`vi.mock()`ファクトリで作成した`vi.fn()`の呼び出し履歴・実装は次のテストへ持ち越されることが判明し、実際に誤ったテスト結果（前のテストのモック呼び出しを誤検知）が発生した。該当箇所を`vi.resetAllMocks()`に修正し、test_rules.mdに注記を追加した。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `electron/types/domain.ts`（旧`electron/main/types.ts`）, `electron/types/exif-parser.d.ts`（旧`electron/main/exif-parser.d.ts`）: `electron/types/`へ移動。
    - `electron/ipc/selectDirectoryHandler.ts` / `scanDirectoryHandler.ts` / `cancelCopyHandler.ts` / `startCopyHandler.ts` / `cancellationState.ts`: 新規作成。各IPCハンドラを1ファイルずつに分離。
    - `electron/main/windowState.ts`: 新規作成。`mainWindow`の共有状態を`getMainWindow`/`setMainWindow`として分離。
    - `electron/main/fileCopier.ts`: `copyFileToDateDirectory`関数を追加し、start-copyハンドラに残っていたコピー実行ロジック（対象ディレクトリ作成・衝突回避・コピー実行）を移設。
    - `electron/main/main.ts`: IPCハンドラ登録とウィンドウ生命管理のみを担当する薄い層に整理。`DEFAULT_WINDOW_WIDTH`/`DEFAULT_WINDOW_HEIGHT`定数を追加。
    - `tsconfig.main.json`: `include`を新しいファイル構成に合わせて更新。
    - テストファイルをディレクトリ移動に合わせて再構成（`electron/ipc/__tests__/*`を新規作成、`electron/main/__tests__/main.tests.ts`を配線層のみのテストに縮小、`fileCopier.tests.ts`に`copyFileToDateDirectory`のテストを追加）。
    - `electron/main/__tests__/fileCopier.tests.ts` / `electron/ipc/__tests__/cancelCopyHandler.tests.ts` / `scanDirectoryHandler.tests.ts` / `electron/main/__tests__/fileScanner.tests.ts` / `dateResolution.tests.ts`: `vi.restoreAllMocks()`を`vi.resetAllMocks()`に修正。
    - `src/tests/module-format.spec.ts`: ESMチェック対象を新しいファイル構成に更新。
  - **rules.md**: 冒頭に「Biomeの自動チェックがカバーしない範囲について」の注記を追加。
  - **test_rules.md**: `vi.restoreAllMocks()`の対象範囲に関する注記を追加。
  - **README.md / 仕様書**: 変更なし
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`（17ファイル・105テスト全て成功）, `npm run test:e2e`（全6テスト成功、実アプリでのフォルダ選択・スキャン・コピー・重複回避を確認）で動作確認済み。

### [2026-07-05] electron/配下の単体テスト追加とSRPリファクタリング
* **修正の動機・概要**:
  - `electron/`配下（`main.ts`, `preload.ts`）だけがこれまでのリファクタリング・テスト整備の対象から漏れていた。原因を調査した結果、(1) `vite.config.ts`のVitest `include`が`src/**/*.tests.*`のみで`electron/`に届いていなかったこと、(2) `test_rules.md`のルール6が`src/components`等のみを列挙し`electron/`に触れていなかったこと、(3) `main.ts`のIPCハンドラが`ipcMain.handle()`に匿名関数として登録されexportされておらずテストしにくい構造だったこと、の3点が原因と判明した。(1)(2)を修正した上で、テスト→リファクタリングの順で対応した（Red-Green-Refactor）。
  - テスト作成の過程で、`start-copy`のコピー処理ループにawaitが存在せず同期的に完走するため、`cancel-copy`によるキャンセルが実行中のコピーには実質反映されない（`if (isCancelling)`分岐が到達不能）ことが判明した。ユーザーと協議の上、今回は修正せず既知の制約として現状仕様のままテスト・コードコメントに残すことで合意した。
  - `exif-parser`（型定義のないCJSパッケージ）が`createRequire`経由で読み込まれておりVitestの`vi.mock`が効かないことが判明したため、通常の`import`文＋独自の型宣言ファイルに変更した（実行時の動作は変更なし、ビルド・E2Eで確認済み）。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `vite.config.ts`: Vitestの`test.include`に`electron/**/*.tests.*`を追加。
    - `electron/main/exif-parser.d.ts`: `exif-parser`用の型宣言を新規作成（`create`/`parse`/`DateTimeOriginal`のみを最小限に型付け）。
    - `electron/main/main.ts`: `createRequire`経由の読み込みを通常の`import exifParser from 'exif-parser'`に変更。`scan-directory`のロジックを`fileScanner.ts`（内部で`dateResolution.ts`を利用）へ、ファイル名衝突回避ロジックを`fileCopier.ts`へ委譲し、IPCハンドラの登録・ウィンドウ管理・コピー進捗イベント送出・キャンセルフラグ管理のみを担当する薄いオーケストレーション層に整理（SRP対応）。型定義は`electron/main/types.ts`へ移動し、`main.ts`から再exportして`preload.ts`側のimportパスは変更不要にした。
    - `electron/main/types.ts` / `dateResolution.ts` / `fileScanner.ts` / `fileCopier.ts`: 新規作成。
    - `tsconfig.main.json`: `include`に新規ファイルを追加。
    - `electron/main/__tests__/main.tests.ts`: `fileScanner`/`fileCopier`をモック化した、IPCハンドラの配線（select-directory, scan-directoryへの委譲, cancel-copy, start-copyの進捗・エラー処理）に関するテストに再構成。
    - `electron/main/__tests__/dateResolution.tests.ts` / `fileScanner.tests.ts` / `fileCopier.tests.ts`: 新規作成。日時解決・ディレクトリスキャン・ファイル名衝突回避それぞれの全分岐を網羅。
    - `electron/preload/__tests__/preload.tests.ts`: 新規作成。`window.api`として公開される各メソッドとイベント購読・解除を検証。
    - `src/tests/module-format.spec.ts`: ESMチェック対象に新規ファイルを追加。
  - **test_rules.md**: ルール6に`electron/main/` / `electron/preload/`を追記し、未列挙のディレクトリを追加した場合はルール自体を更新する旨を明記。
  - **README.md / 仕様書**: 変更なし
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`（13ファイル・96テスト全て成功）, `npm run test:e2e`（全6テスト成功、実アプリでのスキャン・コピー・重複回避を確認）で動作確認済み。

### [2026-07-05] 残りのユニットへの単体テスト追加
* **修正の動機・概要**:
  - 前回セットアップした単体テスト環境を用いて、残りの対象（`useDirectoryScan`, `useCopyOperation`, `FileCard`, `GalleryGrid`, `PreviewModal`, `errorHandling`）にtest_rules.mdのルール（AAAパターン・全分岐網羅・疎結合）に沿ったテストを追加した。
  - 実装の過程で、本プロジェクトが`test.globals: true`を使用していないためTesting Libraryの自動クリーンアップが効かず、複数テストのレンダリング結果がDOMに蓄積して`getByText`等が「複数要素が見つかる」エラーを起こす問題を発見し、`src/vitest.setup.ts`に明示的な`afterEach(cleanup)`を追加して解消した。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `src/test-utils/fixtures.ts`: テスト間で共有する`FileInfo`ダミーデータ生成関数`createFileInfo`を新規作成。
    - `src/test-utils/mockElectronApi.ts`: `window.api`のスタブと`onCopyProgress`/`onCopyError`のコールバックを疑似発火させる`emitProgress`/`emitError`ヘルパーを新規作成。
    - `src/utils/__tests__/errorHandling.tests.ts`: `getErrorMessage`（Errorインスタンス/非Errorインスタンス）と`showErrorToast`（console.error・alert呼び出し）のテストを新規作成。
    - `src/hooks/__tests__/useDirectoryScan.tests.ts`: スキャン成功/失敗（コピー元・コピー先それぞれ）、スキャン中の案内メッセージ、`window.srcFiles`/`window.updateDirectory`のグローバル同期を検証するテストを新規作成。
    - `src/hooks/__tests__/useCopyOperation.tests.ts`: `canStartCopy`の各分岐、コピー完了/キャンセル/エラー、進捗・エラーイベント購読を検証するテストを新規作成。
    - `src/components/__tests__/FileCard.tests.tsx` / `GalleryGrid.tests.tsx` / `PreviewModal.tests.tsx`: Testing Libraryでレンダリング結果を検証するテストを新規作成（動画/画像分岐、空状態、クリックハンドラ、dateSourceの表示分岐等）。
    - `src/vitest.setup.ts`: `@testing-library/react`の`cleanup`を`afterEach`で明示的に実行するよう修正。
  - **test_rules.md**: 「開発プロジェクト固有の設定」に、自動クリーンアップが効かない理由と対応、および`src/test-utils/`の位置づけ（`*.tests.*`命名を使わない共有モック・フィクスチャの置き場）を追記。
  - **README.md / 仕様書**: 変更なし
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`（8ファイル・51テスト全て成功）, `npm run test:e2e`（全6テスト成功）で動作確認済み。

### [2026-07-04] 単体テストのルール策定とテスト環境のセットアップ
* **修正の動機・概要**:
  - 単体テストを整備するにあたり、[参考記事1](https://qiita.com/mokio/items/95e962c59a142978bcb2)・[参考記事2](https://zenn.dev/toms74209200/articles/first-step-unit-testing)およびユーザー独自の観点（疎結合、全分岐網羅、specs優先、AAAパターン、ファイル配置・命名規則、Testing Library利用）をもとに、`rules.md`とは別のテスト専用ルール文書`test_rules.md`を新設した。
  - 参考記事の「UIへの過度なテスト投資は避ける」という指針とユーザーの「全コンポーネントを網羅する」という指示は方向性が異なっていたため、事前に確認し、後者を採用した（コンポーネントも含め全ユニットを対象とする）。
  - テスト実行にはTesting Libraryとjsdom環境が必要だが未導入だったため、あわせてセットアップし、実際にunit/componentレベルのテストが動作することをサンプルテストで検証した。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `test_rules.md`: 単体テスト・E2Eテストで遵守すべきルール（AAAパターン、全分岐網羅、specs優先、疎結合、ファイル配置・命名規則`__tests__/*.tests.{ts|tsx}`、1ユニット1ファイル、Testing Libraryでのレンダリング結果検証）と参考記事由来の観点（4種類の入出力、テストダブルの分類、DAMP優先、カバレッジ率の位置づけ）を新規作成。
    - `package.json`: `@testing-library/react`, `jsdom` を devDependencies に追加。
    - `vite.config.ts`: Vitestの`test.environment`を`jsdom`に設定し、`test.setupFiles`に`src/vitest.setup.ts`を追加。
    - `src/vitest.setup.ts`: `@testing-library/jest-dom/vitest`を読み込むセットアップファイルを新規作成。
    - `src/utils/__tests__/format.tests.ts`: `formatBytes`の分岐（`bytes===0`、`decimals<0`）を網羅するサンプルテストを新規作成（動作検証用）。
    - `src/components/__tests__/DropZone.tests.tsx`: `DropZone`のクリック・ドラッグ&ドロップの全分岐（disabled有無、ファイル有無、pathプロパティ有無）を網羅するサンプルテストをTesting Libraryで新規作成（動作検証用）。
    - `src/tests/module-format.spec.ts`: ESMチェック対象に`src/vitest.setup.ts`を追加。
  - **AGENTS.md**: 「単体テスト・E2Eテストを作成または実行する場合はtest_rules.mdに従う」ルールを追加。
  - **README.md**: 単体テストの配置規則・実行環境・test_rules.mdへの参照を追記。
  - **commit_rules.md**: テストコマンドの説明にtest_rules.mdへの参照を追記。
  - **仕様書**: 変更なし
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`（新規13テスト成功）, `npm run test:e2e`（全6テスト成功）で動作確認済み。

### [2026-07-04] 追加のコード品質改善（OCP対応・共通化・JSX整理・マジックストリング定数化・状態の導出値化）
* **修正の動機・概要**:
  - 前回のSOLIDリファクタリングで一旦YAGNIを理由に見送っていた`FileCard`のOCP違反、`formatBytes`の重複、JSX内の複数行ロジック、文字列のマジックナンバー、連動するuseStateについて、人間からの指摘を受けて対応した。あわせてrules.mdに未記載だった「JSX内のロジック制限」「文字列のマジックナンバー定数化」の2ルールを追記した。
* **各ファイルへの影響と変更内容**:
  - **実装**:
    - `src/utils/format.ts`: `App.tsx`と`FileCard.tsx`に重複していた`formatBytes`を共通化（新規作成）。
    - `src/components/FileCard.tsx`: `file.type`による分岐を`MEDIA_TYPE_CONFIG`（type毎の設定を持つRecord）に変更。新しいファイル種別を追加する際に既存の分岐を修正不要にした（OCP対応）。
    - `src/components/GalleryGrid.tsx` / `src/components/PreviewModal.tsx`: `App.tsx`のJSX内にあった「ギャラリーの空状態/一覧表示」「プレビューモーダルのメディア種別分岐」をそれぞれ独立コンポーネントとして抽出（新規作成）。`App.tsx`のJSXは関数呼び出しと1行程度の式のみになるよう整理。
    - `src/components/DropZone.tsx`: `onDragOver` / `onDragLeave` / `onDrop`のJSX内に直書きされていた複数行のイベントハンドラを、コンポーネント本体側の名前付き関数に外出し。
    - `src/hooks/useDirectoryScan.ts`: `scanInfo`は実質`srcFiles`/`destFiles`の件数とスキャン中フラグから導出できる値だったため、独立した`useState`をやめ`useMemo`による導出値に変更。あわせて`window.srcFiles`/`window.destFiles`のグローバル読み取りに依存していたメッセージ組み立てロジックを、リアクティブなstateを直接参照する形に整理。
    - `src/components/PreviewModal.tsx`: `previewFile.dateSource === 'metadata'`という文字列比較を`DATE_SOURCE_METADATA`定数に置き換え。
    - `electron/main/main.ts`: `dateSource`に代入していた`'metadata'` / `'file_system'` / `'file_system_fallback'`をそれぞれ定数化（`file.type`の`'video'`/`'image'`は`FileInfo['type']`のUnion型で型チェッカーがtypoを検出できるため対象外とした）。
  - **rules.md**: 「JSX内に複数行のロジックを書かない」「文字列のマジックナンバー（マジックストリング）も定数化する」の2ルールをNG/OK例つきで追加。
  - **README.md**: 変更なし
  - **仕様書**: 変更なし
  - **テスト**: `src/tests/react-integration.spec.ts`（`FileCard`が`GalleryGrid`経由で利用される構成に追従）、`src/tests/module-format.spec.ts`（新規ファイルをESMチェック対象に追加）を更新。
  - `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`（全6テスト成功）で動作確認済み。

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
