# 使用しない引数は_(アンダースコア)にする

NG
``` typescript
const func = (event, args) => {
  console.log(args);
}
```

OK
``` typescript
const func = (_, args) => {
  console.log(args);
}
```