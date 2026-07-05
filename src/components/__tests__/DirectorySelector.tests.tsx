import { fireEvent, screen } from '@testing-library/react';
import { FolderInput, UploadCloud } from 'lucide-react';
import { describe, expect, test, vi } from 'vitest';
import { renderWithChakra } from '../../test-utils/renderWithChakra';
import { DirectorySelector } from '../DirectorySelector';

describe('DirectorySelectorに関するテスト', () => {
  test('ラベルテキストが表示される', () => {
    // Arrange & Act
    renderWithChakra(
      <DirectorySelector
        type="src"
        labelIcon={FolderInput}
        labelText="コピー元フォルダ (Source)"
        dropZoneIcon={UploadCloud}
        path=""
        disabled={false}
        onSelect={vi.fn()}
        onDrop={vi.fn()}
        onNavigateUp={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByText('コピー元フォルダ (Source)')).toBeInTheDocument();
  });

  test('pathが空のとき「選択されていません」と表示される', () => {
    // Arrange & Act
    renderWithChakra(
      <DirectorySelector
        type="src"
        labelIcon={FolderInput}
        labelText="Label"
        dropZoneIcon={UploadCloud}
        path=""
        disabled={false}
        onSelect={vi.fn()}
        onDrop={vi.fn()}
        onNavigateUp={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByText('選択されていません')).toBeInTheDocument();
  });

  test('pathが指定されているとき、そのパスが表示される', () => {
    // Arrange & Act
    renderWithChakra(
      <DirectorySelector
        type="src"
        labelIcon={FolderInput}
        labelText="Label"
        dropZoneIcon={UploadCloud}
        path="/foo/bar"
        disabled={false}
        onSelect={vi.fn()}
        onDrop={vi.fn()}
        onNavigateUp={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByText('/foo/bar')).toBeInTheDocument();
  });

  test('DropZoneをクリックするとonSelectが呼ばれる', () => {
    // Arrange
    const onSelect = vi.fn();
    renderWithChakra(
      <DirectorySelector
        type="src"
        labelIcon={FolderInput}
        labelText="Label"
        dropZoneIcon={UploadCloud}
        path=""
        disabled={false}
        onSelect={onSelect}
        onDrop={vi.fn()}
        onNavigateUp={vi.fn()}
      />
    );

    // Act
    fireEvent.click(document.getElementById('src-drop-zone') as HTMLElement);

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test('pathが空のとき、一つ上へボタンは無効化される', () => {
    // Arrange & Act
    renderWithChakra(
      <DirectorySelector
        type="src"
        labelIcon={FolderInput}
        labelText="Label"
        dropZoneIcon={UploadCloud}
        path=""
        disabled={false}
        onSelect={vi.fn()}
        onDrop={vi.fn()}
        onNavigateUp={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByRole('button', { name: /一つ上へ/ })).toBeDisabled();
  });

  test('disabledがtrueのとき、一つ上へボタンは無効化される', () => {
    // Arrange & Act
    renderWithChakra(
      <DirectorySelector
        type="src"
        labelIcon={FolderInput}
        labelText="Label"
        dropZoneIcon={UploadCloud}
        path="/foo/bar"
        disabled={true}
        onSelect={vi.fn()}
        onDrop={vi.fn()}
        onNavigateUp={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByRole('button', { name: /一つ上へ/ })).toBeDisabled();
  });

  test('pathが指定されているとき、一つ上へボタンをクリックするとonNavigateUpが呼ばれる', () => {
    // Arrange
    const onNavigateUp = vi.fn();
    renderWithChakra(
      <DirectorySelector
        type="src"
        labelIcon={FolderInput}
        labelText="Label"
        dropZoneIcon={UploadCloud}
        path="/foo/bar"
        disabled={false}
        onSelect={vi.fn()}
        onDrop={vi.fn()}
        onNavigateUp={onNavigateUp}
      />
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: /一つ上へ/ }));

    // Assert
    expect(onNavigateUp).toHaveBeenCalledTimes(1);
  });
});
