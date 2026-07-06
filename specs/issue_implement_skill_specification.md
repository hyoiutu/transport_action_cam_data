# 仕様書: Issue実装スキル (issue-implement)

本仕様書は、GitHub Issueの内容をもとにAIエージェントが実装・修正を進めるカスタムスキル`issue-implement`の要件および設計仕様を定義します。（関連: [Issue #10](https://github.com/hyoiutu/transport_action_cam_data/issues/10)）

---

## 1. システム概要
- **名称**: issue-implement
- **目的**: GitHub Issueの内容を人間が都度読んでプロンプトで指示するのではなく、AIエージェントがGitHub MCPサーバー経由でIssueを直接読み取り、対象Issue・ブランチ名・派生元ブランチをユーザーに確認したうえで、「1 Issue = 1 Branch」の原則に従い専用ブランチを作成し、既存のプロジェクトルール（TDD、README.md/仕様書との同期、CHANGELOG.mdへの記録等）に沿って実装を進める。
- **動作対象**: GitHub MCPサーバーが導入済みのClaude Code環境。

---

## 2. 主要機能要件

### 2.1. 起動条件
- ユーザーから「Issue #<番号>を実装して」「GitHub Issueを対応して」等、GitHub Issueに基づく実装・修正を指示された場合、または本スキルが明示的に呼び出された場合に起動する。

### 2.2. Issue一覧・詳細の取得
- GitHub MCPサーバー（`list_issues`等）を用いて、対象リポジトリのIssue一覧（特にOPEN状態のもの）を取得する。
- ユーザーが対象Issue番号を明示している場合も、内容確認のため該当Issueの詳細を取得する。

### 2.3. ユーザーへの確認と決定権の委譲
- 実装（および後述のブランチ作成）を開始する前に、必ず`AskUserQuestion`等を用いて以下の3点をユーザーに確認しなければならない。
  1. **対象Issue**: どのGitHub Issue（番号）を対象に実装を進めるか。
  2. **ブランチ名**: ユーザーの希望があればそれを採用し、希望がなければ`branch_rules.md`の命名規則（`<type>/issue-<Issue番号>-<内容>`）に従いAIが提案する。
  3. **派生元ブランチ**: デフォルトは現在のブランチ。ユーザーが別ブランチを希望すればそちらを採用する。
- この確認を省略して実装やブランチ作成を進めてはならない。

### 2.4. 1 Issue = 1 Branch の原則
- 対象Issueに対応する専用ブランチが存在しない場合は新規作成し、既に存在する場合はそのブランチを再利用する。
- 複数のIssueを同一ブランチで同時に扱ってはならない。
- ブランチの命名規則・派生元・作成コマンドの詳細は`branch_rules.md`に従う。

### 2.5. 実装の実施（既存プロジェクトルールの遵守）
- ブランチ作成後、対象Issueの内容に基づき実装を行う。
- 実装にあたっては、AGENTS.md / rules.md / test_rules.md に定義された既存ルールをすべて遵守する。
  - TDD（Red-Green-Refactor）に従って実装する。
  - 実装・README.md・specs/以下の仕様書のいずれかに修正が生じた場合、3者間の乖離がないか確認し、乖離があれば連動して修正する。
  - 上記の連動修正が発生した場合、CHANGELOG.mdに変更内容（何が変わり、実装・README.md・仕様書がそれぞれどう修正されたか）を記録する。
  - コード規約はrules.mdに従う。
  - 単体テスト・E2Eテストの作成・実行はtest_rules.mdに従う。

### 2.6. コミットとプッシュ
- 実装完了後のコミットは、必ずauto-commitスキル（`commit_rules.md`）の手順を経由して行う。本スキルおよびAIエージェントが直接`git commit`を実行してはならない。
- **絶対ルール**: 本スキルおよびAIエージェントのプロセス経由で`git push`を実行することは絶対に禁止する。

---

## 3. ファイル構造と配置場所

プロジェクト内の以下の構造でカスタムスキルおよび関連ファイルを作成する。

```text
./ (プロジェクトルート)
├── .agents/
│   └── skills/
│       └── issue-implement/
│           └── SKILL.md            # スキルのインストラクションファイル（実体）
├── .claude/
│   └── skills/
│       └── issue-implement/
│           └── SKILL.md            # .agents/skills/issue-implement/SKILL.md へのシンボリックリンク
├── branch_rules.md                 # ユーザーが編集可能なブランチ運用の細則ルールファイル
└── specs/
    └── issue_implement_skill_specification.md  # 本仕様書
```

### 3.1. Claude Codeとの互換性
本スキルは`auto-commit`スキルと同様に、SKILL.mdのYAMLフロントマター形式（`name` / `description`）がClaude Codeのスキル仕様と互換性があるため、`.claude/skills/issue-implement/SKILL.md`にシンボリックリンクを配置することでClaude Codeからも`/issue-implement`として呼び出せるようにする。実体は`.agents/skills/issue-implement/SKILL.md`の一箇所のみとし、二重管理を避ける。

---

## 4. 各ファイルの定義

### 4.1. `branch_rules.md`（プロジェクトルート）
ユーザーがブランチ運用の細則を定義するマークダウンファイル。以下のルールを記載する。
1. 1 Issue = 1 Branchの原則（既存ブランチの再利用を含む）。
2. `git push`の絶対禁止。
3. ブランチ作成前のユーザー確認（対象Issue・ブランチ名・派生元ブランチ）。
4. ブランチ名の自動命名規則（`<type>/issue-<Issue番号>-<内容>`）。
5. 派生元ブランチの決定方法（デフォルトは現在のブランチ）。
6. ブランチ作成コマンド。
7. 実装後のコミットはauto-commitスキル経由とすること。

### 4.2. `.agents/skills/issue-implement/SKILL.md`
AIエージェントが本スキルをどのように解釈し、実行するかを規定した指示書。YAMLフロントマターを含める。
