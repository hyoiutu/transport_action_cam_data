import fs from 'node:fs';
import path from 'node:path';
import type { DirectoryEntry, FileInfo, FolderInfo } from '../types/domain.js';
import { formatJstDate, resolveCreationDateInfo } from './dateResolution.js';

const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

type FileCategory = 'video' | 'image' | null;

export const resolveFileCategory = (ext: string): FileCategory => {
  if (ALLOWED_VIDEO_EXTENSIONS.includes(ext)) return 'video';
  if (ALLOWED_IMAGE_EXTENSIONS.includes(ext)) return 'image';
  return null;
};

const byNameAscending = (a: { name: string }, b: { name: string }): number => a.name.localeCompare(b.name);

export const scanDirectory = async (dirPath: string): Promise<DirectoryEntry[]> => {
  if (!dirPath || !fs.existsSync(dirPath)) {
    return [];
  }

  const folders: FolderInfo[] = [];
  const files: FileInfo[] = [];

  try {
    const list = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const dirent of list) {
      if (dirent.isDirectory()) {
        folders.push({ name: dirent.name, path: path.join(dirPath, dirent.name), type: 'folder' });
        continue;
      }

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

  // フォルダを先に、ファイルをあとに、それぞれ名前順で表示する（一般的なファイルブラウザの慣習に合わせる）
  return [...folders.sort(byNameAscending), ...files.sort(byNameAscending)];
};
