# 使用しない引数は_(アンダースコア)にする

NG
```typescript
const func = (event, args) => {
  console.log(args);
}
```

OK
```typescript
const func = (_, args) => {
  console.log(args);
}
```

# テストケースは日本語で書く

NG
```typescript
describe('API test', () => {
  test('if the API is called, status code is 200.', () => {
    ...
  })
})
```

OK
```typescript
describe('APIに関するテスト', () => {
  test('APIが呼ばれたとき、ステータスコードは200を返す', () => {
    ...
  })
})
```

# TypeScriptの使用

NG
JavaScriptファイル(.js, .jsx)を使用する。

OK
TypeScriptファイル(.ts, .tsx)を使用し、適切な型定義を行う。

# React Hooksの依存配列を無視しない

NG
```typescript
useEffect(() => {
  // ...
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

OK
```typescript
useEffect(() => {
  // ...
}, [state]);
```

# eslint-disableを使用する場合は理由を明記する

NG
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
```

OK
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps -- state更新時の再実行を防ぐため
```

# anyやas（型キャスト）は原則使用しない

NG
```typescript
const data: any = fetchedData;
const user = {} as User;
```

OK
```typescript
const data: User = fetchedData;
const user: User = { id: 1, name: "name" };
```

# ||ではなく??（Null合体演算子）を使用する

NG
```typescript
const result = value1 || value2;
```

OK
```typescript
const result = value1 ?? value2;
```

# 型定義には原則typeを使用する

NG
```typescript
interface User {
  id: number;
  name: string;
}
```

OK
```typescript
type User = {
  id: number;
  name: string;
};
```

# 三項演算子はネストしない

NG
```typescript
const result = x > 0 ? (x % 2 === 0 ? "Even" : "Odd") : "Negative";
```

OK
```typescript
let result;
if (x > 0) {
  result = x % 2 === 0 ? "Even" : "Odd";
} else {
  result = "Negative";
}
```

# 命名規則の遵守

NG
```typescript
const SomeVar = 10;
const cntList = [1, 2, 3];
```

OK
```typescript
const someVar = 10;
const counts = [1, 2, 3];
```

# boolean型の属性値は省略する

NG
```typescript
<Component personal={true} />
```

OK
```typescript
<Component personal />
```

# 型推論が効く場合は型注釈を省略する

NG
```typescript
const name: string = "foo";
const [count, setCount] = useState<number>(0);
```

OK
```typescript
const name = "foo";
const [count, setCount] = useState(0);
```

# マジックナンバーを使用しない

NG

```typescript
if (retryCount > 3) {
  // ...
}
```

OK

```typescript
const MAX_RETRY_COUNT = 3;

if (retryCount > MAX_RETRY_COUNT) {
  // ...
}
```

---

# importは自動ソートする

NG

```typescript
import z from './z';
import a from './a';
import React from 'react';
```

OK

```typescript
import React from 'react';

import a from './a';
import z from './z';
```

---

# exportはdefault exportではなくnamed exportを使用する

NG

```typescript
export default function Button() {
  return <button>OK</button>;
}
```

OK

```typescript
export const Button = () => {
  return <button>OK</button>;
};
```

---

# objectのキー名と変数名が同じ場合は省略記法を使用する

NG

```typescript
const user = {
  name: name,
  age: age,
};
```

OK

```typescript
const user = {
  name,
  age,
};
```

---

# Reactコンポーネントは自己閉じタグを使用する

NG

```tsx
<Loading></Loading>
```

OK

```tsx
<Loading />
```

---

# JSX内に複数行のロジックを書かない

JSX（return文の中）に書いてよいのは関数呼び出しと1行程度の式（単純な三項演算子やテンプレートリテラル等）のみとする。複数行にわたる条件分岐やイベントハンドラの本体はコンポーネント本体側の関数として外に出す。

NG

```tsx
return (
  <div>
    {items.length === 0 ? (
      <p>Emptyです</p>
    ) : (
      items.map((item) => <Item key={item.id} item={item} />)
    )}
    <button
      onClick={() => {
        setCount((current) => current + 1);
        logEvent('increment');
      }}
    >
      +1
    </button>
  </div>
);
```

OK

```tsx
const handleIncrement = () => {
  setCount((current) => current + 1);
  logEvent('increment');
};

return (
  <div>
    <ItemList items={items} />
    <button onClick={handleIncrement}>+1</button>
  </div>
);
```

---

# アロー関数を使用する

NG

```typescript
function add(a: number, b: number) {
  return a + b;
}
```

OK

```typescript
const add = (a: number, b: number) => {
  return a + b;
};
```

---

# 未使用の変数は残さない

NG

```typescript
const result = fetchData();
const unused = 0;

return result;
```

OK

```typescript
const result = fetchData();

return result;
```

---

# default exportは禁止する

NG

```typescript
export default App;
```

OK

```typescript
export const App = () => {
  // ...
};
```

---

# import文はソートする

NG

```typescript
import z from "./z";
import React from "react";
import a from "./a";
```

OK

```typescript
import React from "react";

import a from "./a";
import z from "./z";
```

---

# マジックナンバーは定数化する

NG

```typescript
if (count > 10) {
  // ...
}
```

OK

```typescript
const MAX_COUNT = 10;

if (count > MAX_COUNT) {
  // ...
}
```

---

# 文字列のマジックナンバー（マジックストリング）も定数化する

比較や分岐に使う文字列リテラルも、数値のマジックナンバーと同様に定数化する。ただしUnion型で表現され型チェッカーが誤り（typo）を検出できる値（例: `'video' | 'image'`のような限定されたリテラル型同士の比較）は対象外とする。

NG

```typescript
if (file.dateSource === 'metadata') {
  // ...
}
```

OK

```typescript
const DATE_SOURCE_METADATA = 'metadata';

if (file.dateSource === DATE_SOURCE_METADATA) {
  // ...
}
```

---

# DRY（Don't Repeat Yourself）: 重複を避ける

NG

```typescript
const user1Greeting = "Hello, Alice!";
const user2Greeting = "Hello, Bob!";
```

OK

```typescript
const greetUser = (name: string) => `Hello, ${name}!`;
const user1Greeting = greetUser("Alice");
const user2Greeting = greetUser("Bob");
```

---

# KISS（Keep It Simple, Stupid）: シンプルに保つ

NG

```typescript
const calculateArea = (shape: 'rectangle' | 'circle', dimensions: number[]) => {
  if (shape === 'rectangle') {
    return dimensions[0] * dimensions[1];
  } else if (shape === 'circle') {
    return Math.PI * (dimensions[0] ** 2);
  }
};
```

OK

```typescript
const calculateRectangleArea = (width: number, height: number) => width * height;
const calculateCircleArea = (radius: number) => Math.PI * (radius ** 2);
```

---

# YAGNI（You Aren't Gonna Need It）: 今必要なことだけやる

NG

```typescript
type User = {
  name: string;
  role: 'admin' | 'user';
  permissions: string[];
};

const createUser = (name: string, role: 'admin' | 'user'): User => {
  // 将来使うかもしれないと見越して権限分岐をあらかじめ実装するが、実際には現状全員同じ権限
  const permissions = role === 'admin' ? ['read', 'write', 'delete'] : ['read'];
  return { name, role, permissions };
};
```

OK

```typescript
type User = {
  name: string;
  permissions: string[];
};

const createUser = (name: string): User => {
  return { name, permissions: ['read', 'write'] };
};
```

---

# 車輪の再発明を避ける: 既存ライブラリやAPIを優先する

NG

```typescript
// 自作のパス結合ユーティリティ
const joinPaths = (dir: string, file: string) => {
  return dir.endsWith('/') ? `${dir}${file}` : `${dir}/${file}`;
};
```

OK

```typescript
import path from 'node:path';

const filePath = path.join(dir, file);
```

---

# 割れ窓の法則を避ける: 小さな問題（エラーや警告）を放置しない

NG

```typescript
// eslint-disable-next-line -- TODO: 後で any と警告を修正する
const data: any = fetchedData;
```

OK

```typescript
const data: UserInfo = fetchedData;
```

---

# 名前重要: 意図の伝わる適切な命名を行う

NG

```typescript
const c = 10;
const calculateTotalAmountOfAllScannedFilesIncludingTaxes = (files: any[]) => {
  // ...
};
```

OK

```typescript
const fileCount = 10;
const calculateTotalSize = (files: FileInfo[]) => {
  // ...
};
```

---

# SRP（単一責任の原則）: モジュールを変更する理由は1つにする

NG

```typescript
const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetch('/api/todos')
      .then((res) => res.json())
      .then(setTodos)
      .finally(() => setIsFetching(false));
  }, []);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
};
```

OK

```typescript
const useFetchTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetch('/api/todos')
      .then((res) => res.json())
      .then(setTodos)
      .finally(() => setIsFetching(false));
  }, []);

  return { todos, isFetching };
};

const TodoList = () => {
  const { todos } = useFetchTodos();

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
};
```

データ取得（フェッチ）と描画（表示）という2つの責任が1つのコンポーネントに混在すると、どちらかの都合で変更するたびにもう一方まで壊れるリスクが生まれる。カスタムhooksに分離することで、コンポーネントは「描画」だけに責任を持てる。

---

# OCP（オープン・クローズドの原則）: 拡張に対して開き、修正に対して閉じる

NG

```typescript
type TitleProps = {
  title: string;
  variant: 'default' | 'withLinkButton';
  href?: string;
};

const Title = ({ title, variant, href }: TitleProps) => {
  return (
    <div>
      <h1>{title}</h1>
      {variant === 'withLinkButton' && <a href={href}>詳細</a>}
    </div>
  );
};
```

OK

```typescript
const Title = ({ title, children }: { title: string; children?: ReactNode }) => {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
};

const TitleWithLink = ({ title, href }: { title: string; href: string }) => (
  <Title title={title}>
    <a href={href}>詳細</a>
  </Title>
);
```

NG例では新しいバリエーションを追加するたびに`Title`本体を修正し`variant`の分岐を増やす必要がある。OK例ではComposition（`children`によるコンポーネント合成）で拡張し、`Title`自体には変更を加えない。

---

# LSP（リスコフの置換原則）: 期待される契約を満たす実装だけを渡す

NG

```typescript
type FileStorage = {
  save: (path: string, data: string) => void;
};

const createReadOnlyStorage = (): FileStorage => ({
  save: () => {
    throw new Error('read-only storageではsaveはサポートされません');
  }
});
```

OK

```typescript
type ReadableStorage = {
  load: (path: string) => string;
};

type WritableStorage = ReadableStorage & {
  save: (path: string, data: string) => void;
};

const createReadOnlyStorage = (): ReadableStorage => ({
  load: (path) => fs.readFileSync(path, 'utf8')
});
```

NG例は`FileStorage`型を満たすと期待して呼び出した側が`save()`を呼ぶと必ず例外になり、契約に違反する。OK例は「読み取り専用」と「書き込み可能」を型で分離し、`ReadableStorage`を期待する呼び出し側はどんな実装を渡されても契約通りに動作する。

---

# ISP（インターフェース分離の原則）: 使わないプロパティへの依存を強制しない

NG

```typescript
type Post = {
  title: string;
  author: { name: string; age: number };
  createdAt: Date;
};

const PostTitle = ({ post }: { post: Post }) => <h1>{post.title}</h1>;
const PostDate = ({ post }: { post: Post }) => <time>{post.createdAt.toISOString()}</time>;
```

OK

```typescript
const PostTitle = ({ title }: { title: string }) => <h1>{title}</h1>;
const PostDate = ({ date }: { date: Date }) => <time>{date.toISOString()}</time>;
```

NG例は`title`しか使わないコンポーネントが`author`や`createdAt`を含む`Post`全体に依存しており、無関係な変更の影響を受けやすい。OK例は必要なプロパティのみを受け取ることで依存範囲を最小化する。

---

# DIP（依存性逆転の原則）: 抽象に依存し、具象ライブラリに直接依存しない

NG

```typescript
import useSWR from 'swr';

const useTodos = () => {
  const { data } = useSWR<Todo[]>('/api/todos', fetcher);
  return data;
};
```

OK

```typescript
type FetchResult<T> = {
  data: T | undefined;
  isLoading: boolean;
};

const useFetch = <T,>(key: string, fetcher: () => Promise<T>): FetchResult<T> => {
  const { data, isValidating } = useSWR<T>(key, fetcher);
  return { data, isLoading: isValidating };
};

const useTodos = () => useFetch<Todo[]>('/api/todos', fetchTodos);
```

NG例はコンポーネント側が`swr`という具体的なライブラリに直接依存しており、ライブラリを差し替えると呼び出し側すべてに影響する。OK例は`useFetch`という抽象インターフェースの裏に具象実装を隠すことで、将来ライブラリを差し替えてもコンポーネント側の変更が不要になる。

参考: https://zenn.dev/koki_tech/articles/361bb8f2278764

---

# コミットメッセージにはプレフィックスを付与する

NG
```git
git commit -m "自動コミットスキルを追加"
```

OK
```git
git commit -m "feat: 自動コミットスキルを追加"
```

コミットする変更の性質に応じて、以下のプレフィックスを必ず付与すること：
- `feat:` (新機能やスキルの追加)
- `fix:` (バグ修正)
- `docs:` (ドキュメントや規約、コメントのみの修正)
- `style:` (コードの意味に影響しないフォーマットなどの修正)
- `refactor:` (機能追加やバグ修正を含まないリファクタリング)
- `test:` (テストの追加や修正)
- `chore:` (ビルド構成や雑多な設定の修正)

```

