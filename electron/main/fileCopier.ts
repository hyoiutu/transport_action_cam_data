import fs from 'node:fs';
import path from 'node:path';

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
