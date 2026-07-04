import { afterEach, describe, expect, test, vi } from 'vitest';

const mockExifParser = { create: vi.fn() };

vi.mock('exif-parser', () => ({ default: mockExifParser }));
vi.mock('music-metadata', () => ({
  parseFile: vi.fn()
}));
vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn()
  }
}));

const fs = (await import('node:fs')).default;
const musicMetadata = await import('music-metadata');
const exifParser = mockExifParser;
const { resolveCreationDateInfo, formatJstDate, DATE_SOURCE_METADATA, DATE_SOURCE_FILE_SYSTEM_FALLBACK } = await import(
  '../dateResolution.js'
);

const createStats = (birthtimeMs: number, mtimeMs: number) =>
  ({ birthtimeMs, mtimeMs }) as unknown as import('node:fs').Stats;

describe('resolveCreationDateInfoに関するテスト', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('動画でメタデータからcreation_timeが取得できたとき、metadataソースの日時を返す', async () => {
    // Arrange
    vi.mocked(musicMetadata.parseFile).mockResolvedValue({
      // biome-ignore lint/style/useNamingConvention: music-metadataが実際に返すプロパティ名（snake_case）に合わせる必要がある
      common: { creation_time: '2026-01-02T00:00:00.000Z' }
    } as unknown as Awaited<ReturnType<typeof musicMetadata.parseFile>>);

    // Act
    const result = await resolveCreationDateInfo('/dir/clip.mp4', true, createStats(0, 0));

    // Assert
    expect(result.dateSource).toBe(DATE_SOURCE_METADATA);
    expect(result.creationDate.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  test('動画でメタデータ解析に失敗したとき、ファイルシステム情報にフォールバックする', async () => {
    // Arrange
    vi.mocked(musicMetadata.parseFile).mockRejectedValue(new Error('parse failed'));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mtimeMs = Date.parse('2026-01-03T00:00:00.000Z');

    // Act
    const result = await resolveCreationDateInfo('/dir/clip.mp4', true, createStats(0, mtimeMs));

    // Assert
    expect(result.dateSource).toBe(DATE_SOURCE_FILE_SYSTEM_FALLBACK);
    expect(result.creationDate.getTime()).toBe(mtimeMs);
  });

  test('動画でcreation_timeが存在しないとき、ファイルシステム情報にフォールバックする', async () => {
    // Arrange
    vi.mocked(musicMetadata.parseFile).mockResolvedValue({ common: {} } as unknown as Awaited<
      ReturnType<typeof musicMetadata.parseFile>
    >);
    const mtimeMs = Date.parse('2026-01-04T00:00:00.000Z');

    // Act
    const result = await resolveCreationDateInfo('/dir/clip.mp4', true, createStats(0, mtimeMs));

    // Assert
    expect(result.dateSource).toBe(DATE_SOURCE_FILE_SYSTEM_FALLBACK);
    expect(result.creationDate.getTime()).toBe(mtimeMs);
  });

  test('画像でEXIFからDateTimeOriginalが取得できたとき、metadataソースの日時を返す', async () => {
    // Arrange
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from([]));
    const epochSeconds = Date.parse('2026-01-05T00:00:00.000Z') / 1000;
    vi.mocked(exifParser.create).mockReturnValue({
      // biome-ignore lint/style/useNamingConvention: exif-parserが実際に返すタグ名（PascalCase）に合わせる必要がある
      parse: () => ({ tags: { DateTimeOriginal: epochSeconds } })
    } as unknown as ReturnType<typeof exifParser.create>);

    // Act
    const result = await resolveCreationDateInfo('/dir/photo.jpg', false, createStats(0, 0));

    // Assert
    expect(result.dateSource).toBe(DATE_SOURCE_METADATA);
    expect(result.creationDate.getTime()).toBe(epochSeconds * 1000);
  });

  test('画像でEXIF解析に失敗したとき、ファイルシステム情報にフォールバックする', async () => {
    // Arrange
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from([]));
    vi.mocked(exifParser.create).mockImplementation(() => {
      throw new Error('exif parse failed');
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mtimeMs = Date.parse('2026-01-06T00:00:00.000Z');

    // Act
    const result = await resolveCreationDateInfo('/dir/photo.jpg', false, createStats(0, mtimeMs));

    // Assert
    expect(result.dateSource).toBe(DATE_SOURCE_FILE_SYSTEM_FALLBACK);
    expect(result.creationDate.getTime()).toBe(mtimeMs);
  });

  test('画像でDateTimeOriginalタグが存在しないとき、ファイルシステム情報にフォールバックする', async () => {
    // Arrange
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from([]));
    vi.mocked(exifParser.create).mockReturnValue({
      parse: () => ({ tags: {} })
    } as unknown as ReturnType<typeof exifParser.create>);
    const mtimeMs = Date.parse('2026-01-07T00:00:00.000Z');

    // Act
    const result = await resolveCreationDateInfo('/dir/photo.jpg', false, createStats(0, mtimeMs));

    // Assert
    expect(result.dateSource).toBe(DATE_SOURCE_FILE_SYSTEM_FALLBACK);
    expect(result.creationDate.getTime()).toBe(mtimeMs);
  });

  test('フォールバック時、birthtimeMsが有効ならmtimeMsとの小さい方が採用される', async () => {
    // Arrange
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from([]));
    vi.mocked(exifParser.create).mockReturnValue({
      parse: () => ({ tags: {} })
    } as unknown as ReturnType<typeof exifParser.create>);
    const birthtimeMs = Date.parse('2026-01-01T00:00:00.000Z');
    const mtimeMs = Date.parse('2026-01-10T00:00:00.000Z');

    // Act
    const result = await resolveCreationDateInfo('/dir/photo.jpg', false, createStats(birthtimeMs, mtimeMs));

    // Assert
    expect(result.creationDate.getTime()).toBe(birthtimeMs);
  });

  test('フォールバック時、birthtimeMsが0（未サポート環境）ならmtimeMsが採用される', async () => {
    // Arrange
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from([]));
    vi.mocked(exifParser.create).mockReturnValue({
      parse: () => ({ tags: {} })
    } as unknown as ReturnType<typeof exifParser.create>);
    const mtimeMs = Date.parse('2026-01-10T00:00:00.000Z');

    // Act
    const result = await resolveCreationDateInfo('/dir/photo.jpg', false, createStats(0, mtimeMs));

    // Assert
    expect(result.creationDate.getTime()).toBe(mtimeMs);
  });
});

describe('formatJstDateに関するテスト', () => {
  test('UTC日時をJST基準のYYYY-MM-DD形式に変換する', () => {
    // Arrange
    // UTC 2026-01-01T15:00:00Z はJST（+9時間）で2026-01-02T00:00:00
    const date = new Date('2026-01-01T15:00:00.000Z');

    // Act
    const result = formatJstDate(date);

    // Assert
    expect(result).toBe('2026-01-02');
  });

  test('JSTへの変換で日付が変わらない場合はそのままの日付を返す', () => {
    // Arrange
    const date = new Date('2026-01-01T00:00:00.000Z');

    // Act
    const result = formatJstDate(date);

    // Assert
    expect(result).toBe('2026-01-01');
  });
});
