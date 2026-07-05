import { describe, expect, test } from 'vitest';
import { createFileInfo, createFolderInfo } from '../../test-utils/fixtures';
import { isMediaFile } from '../directoryEntry';

describe('isMediaFileに関するテスト', () => {
  test('動画ファイルの場合、trueを返す', () => {
    expect(isMediaFile(createFileInfo({ type: 'video' }))).toBe(true);
  });

  test('画像ファイルの場合、trueを返す', () => {
    expect(isMediaFile(createFileInfo({ type: 'image' }))).toBe(true);
  });

  test('フォルダの場合、falseを返す', () => {
    expect(isMediaFile(createFolderInfo())).toBe(false);
  });
});
