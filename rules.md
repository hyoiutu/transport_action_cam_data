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