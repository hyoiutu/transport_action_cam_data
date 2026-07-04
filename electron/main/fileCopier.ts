import fs from 'node:fs';
import path from 'node:path';
import type { FileInfo } from '../types/domain.js';

// 重複ファイル名の競合回避処理: 同名ファイルが存在する場合、末尾に連番を付与する
export const resolveCollisionFreeFilePath = (targetDir: string, fileName: string): string => {
  let targetFileName = fileName;
  let targetFilePath = path.join(targetDir, targetFileName);
  let counter = 1;

  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);

  while (fs.existsSync(targetFilePath)) {
    targetFileName = `${baseName}_${counter}${ext}`;
    targetFilePath = path.join(targetDir, targetFileName);
    counter++;
  }

  return targetFilePath;
};

// 撮影日ごとのサブディレクトリ（YYYY-MM-DD）へファイルをコピーし、実際にコピーした先のパスを返す
// 意図的に非同期のfs APIを使用する: コピーのたびにイベントループへ制御を戻すことで、
// 呼び出し側（start-copyハンドラ）のループがcancel-copyのIPC呼び出しを処理できるようにする
export const copyFileToDateDirectory = async (file: FileInfo, destinationDir: string): Promise<string> => {
  const targetSubDir = path.join(destinationDir, file.creationDate);
  if (!fs.existsSync(targetSubDir)) {
    await fs.promises.mkdir(targetSubDir, { recursive: true });
  }

  const targetFilePath = resolveCollisionFreeFilePath(targetSubDir, file.name);
  await fs.promises.copyFile(file.path, targetFilePath);
  return targetFilePath;
};
