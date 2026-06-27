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
