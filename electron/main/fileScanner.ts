import fs from 'node:fs';
import path from 'node:path';
import type { FileInfo } from '../types/domain.js';
import { formatJstDate, resolveCreationDateInfo } from './dateResolution.js';

const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

type FileCategory = 'video' | 'image' | null;

export const resolveFileCategory = (ext: string): FileCategory => {
  if (ALLOWED_VIDEO_EXTENSIONS.includes(ext)) return 'video';
  if (ALLOWED_IMAGE_EXTENSIONS.includes(ext)) return 'image';
  return null;
};

export const scanDirectory = async (dirPath: string): Promise<FileInfo[]> => {
  if (!dirPath || !fs.existsSync(dirPath)) {
    return [];
  }

  const files: FileInfo[] = [];

  try {
    const list = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const dirent of list) {
      if (dirent.isDirectory()) continue; // サブディレクトリはスキャンしない（ミニマム対応）

      const ext = path.extname(dirent.name).toLowerCase();
      const category = resolveFileCategory(ext);
      if (!category) continue;

      const filePath = path.join(dirPath, dirent.name);
      const stats = fs.statSync(filePath);

      const { creationDate, dateSource } = await resolveCreationDateInfo(filePath, category === 'video', stats);

      files.push({
        name: dirent.name,
        path: filePath,
        size: stats.size,
        type: category,
        creationDate: formatJstDate(creationDate),
        dateSource
      });
    }
  } catch (err) {
    console.error(`Error scanning directory ${dirPath}:`, err);
    throw err;
  }

  return files;
};
