import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { createFileInfo, createFolderInfo } from '../../test-utils/fixtures';
import { renderWithChakra } from '../../test-utils/renderWithChakra';
import { GalleryGrid } from '../GalleryGrid';

describe('GalleryGridに関するテスト', () => {
  test('filesが空でcurrentTabがsrcのとき、コピー元向けの空状態メッセージが表示される', () => {
    // Arrange & Act
    renderWithChakra(<GalleryGrid files={[]} currentTab="src" onFileClick={vi.fn()} onFolderClick={vi.fn()} />);

    // Assert
    expect(screen.getByText(/コピー元フォルダを選択してスキャンしてください/)).toBeInTheDocument();
  });

  test('filesが空でcurrentTabがdestのとき、コピー先向けの空状態メッセージが表示される', () => {
    // Arrange & Act
    renderWithChakra(<GalleryGrid files={[]} currentTab="dest" onFileClick={vi.fn()} onFolderClick={vi.fn()} />);

    // Assert
    expect(screen.getByText(/コピー先フォルダに動画や画像がありません/)).toBeInTheDocument();
  });

  test('filesが1件以上のとき、ファイルカードが表示される', () => {
    // Arrange
    const file = createFileInfo({ name: 'clip.mp4' });

    // Act
    renderWithChakra(<GalleryGrid files={[file]} currentTab="src" onFileClick={vi.fn()} onFolderClick={vi.fn()} />);

    // Assert
    expect(screen.getByText('clip.mp4')).toBeInTheDocument();
  });

  test('ファイルカードをクリックするとonFileClickが対象ファイルとともに呼ばれる', () => {
    // Arrange
    const file = createFileInfo({ name: 'clip.mp4' });
    const onFileClick = vi.fn();
    renderWithChakra(<GalleryGrid files={[file]} currentTab="src" onFileClick={onFileClick} onFolderClick={vi.fn()} />);

    // Act
    fireEvent.click(screen.getByText('clip.mp4'));

    // Assert
    expect(onFileClick).toHaveBeenCalledWith(file);
  });

  test('フォルダが含まれる場合、フォルダカードが表示される', () => {
    // Arrange
    const folder = createFolderInfo({ name: 'DCIM' });

    // Act
    renderWithChakra(<GalleryGrid files={[folder]} currentTab="src" onFileClick={vi.fn()} onFolderClick={vi.fn()} />);

    // Assert
    expect(screen.getByText('DCIM')).toBeInTheDocument();
  });

  test('フォルダカードをクリックするとonFolderClickが対象フォルダとともに呼ばれ、onFileClickは呼ばれない', () => {
    // Arrange
    const folder = createFolderInfo({ name: 'DCIM' });
    const onFileClick = vi.fn();
    const onFolderClick = vi.fn();
    renderWithChakra(
      <GalleryGrid files={[folder]} currentTab="src" onFileClick={onFileClick} onFolderClick={onFolderClick} />
    );

    // Act
    fireEvent.click(screen.getByText('DCIM'));

    // Assert
    expect(onFolderClick).toHaveBeenCalledWith(folder);
    expect(onFileClick).not.toHaveBeenCalled();
  });

  test('フォルダとファイルが両方含まれる場合、両方のカードが表示される', () => {
    // Arrange
    const folder = createFolderInfo({ name: 'DCIM' });
    const file = createFileInfo({ name: 'clip.mp4' });

    // Act
    renderWithChakra(
      <GalleryGrid files={[folder, file]} currentTab="src" onFileClick={vi.fn()} onFolderClick={vi.fn()} />
    );

    // Assert
    expect(screen.getByText('DCIM')).toBeInTheDocument();
    expect(screen.getByText('clip.mp4')).toBeInTheDocument();
  });
});
