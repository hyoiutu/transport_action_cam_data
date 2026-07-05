import fs from 'node:fs';
import exifParser from 'exif-parser';
import * as musicMetadata from 'music-metadata';

const JST_OFFSET_HOURS = 9;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;

export const DATE_SOURCE_METADATA = 'metadata';
export const DATE_SOURCE_FILE_SYSTEM_FALLBACK = 'file_system_fallback';

type DateResolution = {
  creationDate: Date;
  dateSource: string;
};

const extractVideoCreationDate = async (filePath: string): Promise<Date | null> => {
  try {
    const metadata = await musicMetadata.parseFile(filePath);
    // music-metadataの型定義にはcreation_timeが含まれないが、
    // 一部のコンテナ形式では実際に付与されるため拡張型でキャストする
    // biome-ignore lint/style/useNamingConvention: music-metadataが実際に返すプロパティ名（snake_case）に合わせる必要がある
    const common = metadata.common as typeof metadata.common & { creation_time?: string };
    if (common.creation_time) {
      return new Date(common.creation_time);
    }
  } catch (e) {
    console.warn(`Failed to parse video metadata for ${filePath}:`, e);
  }
  return null;
};

const extractImageCreationDate = (filePath: string): Date | null => {
  try {
    const buffer = fs.readFileSync(filePath);
    const parser = exifParser.create(buffer);
    const result = parser.parse();
    if (result.tags?.DateTimeOriginal) {
      // DateTimeOriginalは秒単位のエポックタイムスタンプの場合がある
      return new Date(result.tags.DateTimeOriginal * MILLISECONDS_PER_SECOND);
    }
  } catch (e) {
    console.warn(`Failed to parse image EXIF for ${filePath}:`, e);
  }
  return null;
};

const resolveFallbackDate = (stats: fs.Stats): Date => {
  // mtime と birthtime のうち、古い方を採用するなどの安全策
  // birthtimeMsが0（未サポート環境）の場合もフォールバックしたいため??ではなく||を使用する
  const fileTime = Math.min(stats.birthtimeMs || stats.mtimeMs, stats.mtimeMs);
  return new Date(fileTime);
};

export const resolveCreationDateInfo = async (
  filePath: string,
  isVideo: boolean,
  stats: fs.Stats
): Promise<DateResolution> => {
  const metadataDate = isVideo ? await extractVideoCreationDate(filePath) : extractImageCreationDate(filePath);

  if (metadataDate && !Number.isNaN(metadataDate.getTime())) {
    return { creationDate: metadataDate, dateSource: DATE_SOURCE_METADATA };
  }

  return { creationDate: resolveFallbackDate(stats), dateSource: DATE_SOURCE_FILE_SYSTEM_FALLBACK };
};

// 日本時間（JST）基準で YYYY-MM-DD の日付文字列を作成する
export const formatJstDate = (date: Date): string => {
  const jstOffset = JST_OFFSET_HOURS * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
  const jstDate = new Date(date.getTime() + jstOffset);
  const year = jstDate.getUTCFullYear();
  const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jstDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
