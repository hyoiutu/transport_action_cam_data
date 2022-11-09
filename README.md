# transport_action_cam_data
- アクションカムのデータを外付けHDDに移すスクリプト
  - 撮影日を取得して自動的にコピー先に撮影日毎にディレクトリを作って振り分ける

## 動作環境
dateコマンドがMacとLinuxで仕様が違うのでMac以外だと動かない

## 必要なセットアップ
pvコマンド使っているのでインストールする

## 動かし方
```shell
./transport_action_cam_data.sh test # テストの場合
./transport_action_cam_data.sh prod # 本番の場合

```

```shell
brew install pv
```