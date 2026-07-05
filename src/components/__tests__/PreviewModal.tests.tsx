import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { createFileInfo } from '../../test-utils/fixtures';
import { renderWithChakra } from '../../test-utils/renderWithChakra';
import { PreviewModal } from '../PreviewModal';

describe('PreviewModalに関するテスト', () => {
  test('fileがnullのとき、プレビュー内容は表示されない', () => {
    // Arrange & Act
    renderWithChakra(<PreviewModal file={null} onClose={vi.fn()} />);

    // Assert
    expect(screen.queryByText('File Name')).not.toBeInTheDocument();
  });

  test('fileが渡されたとき、ファイル名が表示される', () => {
    // Arrange
    const file = createFileInfo({ name: 'clip.mp4' });

    // Act
    renderWithChakra(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    expect(screen.getByText('clip.mp4')).toBeInTheDocument();
  });

  test('動画ファイルの場合、video要素が表示される', () => {
    // Arrange
    const file = createFileInfo({ type: 'video' });

    // Act
    renderWithChakra(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    // video要素にはaccessible roleが存在しないため、DOM構造の確認にはquerySelectorを用いる
    expect(document.querySelector('video')).not.toBeNull();
  });

  test('動画ファイルの場合、autoPlayは付与されない（重い動画再生によるカクつきを避けるためユーザー操作で再生開始する）', () => {
    // Arrange
    const file = createFileInfo({ type: 'video' });

    // Act
    renderWithChakra(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    const video = document.querySelector('video') as HTMLVideoElement;
    expect(video.autoplay).toBe(false);
  });

  test('画像ファイルの場合、img要素が表示される', () => {
    // Arrange
    const file = createFileInfo({ type: 'image', name: 'photo.jpg' });

    // Act
    renderWithChakra(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    expect(screen.getByRole('img', { name: 'photo.jpg' })).toBeInTheDocument();
  });

  test('dateSourceがmetadataのとき、「メタデータ」と表示される', () => {
    // Arrange
    const file = createFileInfo({ dateSource: 'metadata', creationDate: '2026-01-02' });

    // Act
    renderWithChakra(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    expect(screen.getByText(/メタデータ/)).toBeInTheDocument();
  });

  test('dateSourceがmetadata以外のとき、「ファイルシステム」と表示される', () => {
    // Arrange
    const file = createFileInfo({ dateSource: 'file_system', creationDate: '2026-01-02' });

    // Act
    renderWithChakra(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    expect(screen.getByText(/ファイルシステム/)).toBeInTheDocument();
  });

  test('閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
    // Arrange
    const onClose = vi.fn();
    const file = createFileInfo();
    renderWithChakra(<PreviewModal file={file} onClose={onClose} />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    // Ark UI（Dialogの内部実装）の状態遷移が非同期に処理されるため、waitForで反映を待つ
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test('背景をクリックするとonCloseが呼ばれる', () => {
    // Arrange
    const onClose = vi.fn();
    const file = createFileInfo();
    renderWithChakra(<PreviewModal file={file} onClose={onClose} />);

    // Act
    fireEvent.click(document.querySelector('#modal-backdrop') as HTMLElement);

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
