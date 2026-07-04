import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { DropZone } from '../DropZone';

const MockIcon = ({ className }: { className?: string }) => <svg data-testid="mock-icon" className={className} />;

const createFileWithPath = (path: string): File => {
  const file = new File(['dummy'], 'dummy.txt');
  Object.defineProperty(file, 'path', { value: path });
  return file;
};

type DropZoneOverrides = Partial<{
  id: string;
  onClick: () => void;
  onDrop: (path: string) => void;
  disabled: boolean;
}>;

const renderDropZone = (overrides: DropZoneOverrides = {}) => {
  const onClick = vi.fn();
  const onDrop = vi.fn();
  const utils = render(
    <DropZone id="test-drop-zone" icon={MockIcon} onClick={onClick} onDrop={onDrop} disabled={false} {...overrides} />
  );
  const rootElement = utils.container.firstChild as HTMLElement;
  return { ...utils, onClick, onDrop, rootElement };
};

describe('DropZoneに関するテスト', () => {
  test('アイコンと案内テキストが描画される', () => {
    // Arrange & Act
    renderDropZone();

    // Assert
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    expect(screen.getByText(/フォルダをドラッグ＆ドロップ/)).toBeInTheDocument();
  });

  test('クリックするとonClickが呼ばれる', () => {
    // Arrange
    const { rootElement, onClick } = renderDropZone();

    // Act
    fireEvent.click(rootElement);

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled=falseのときdragoverでdragoverクラスが付与される', () => {
    // Arrange
    const { rootElement } = renderDropZone({ disabled: false });

    // Act
    fireEvent.dragOver(rootElement);

    // Assert
    expect(rootElement.className).toContain('dragover');
  });

  test('disabled=trueのときdragoverが発生してもdragoverクラスは付与されない', () => {
    // Arrange
    const { rootElement } = renderDropZone({ disabled: true });

    // Act
    fireEvent.dragOver(rootElement);

    // Assert
    expect(rootElement.className).not.toContain('dragover');
  });

  test('dragleaveでdragoverクラスが解除される', () => {
    // Arrange
    const { rootElement } = renderDropZone({ disabled: false });
    fireEvent.dragOver(rootElement);

    // Act
    fireEvent.dragLeave(rootElement);

    // Assert
    expect(rootElement.className).not.toContain('dragover');
  });

  test('disabled=trueのときdropしてもonDropは呼ばれない', () => {
    // Arrange
    const { rootElement, onDrop } = renderDropZone({ disabled: true });
    const file = createFileWithPath('/path/to/folder');

    // Act
    fireEvent.drop(rootElement, { dataTransfer: { files: [file] } });

    // Assert
    expect(onDrop).not.toHaveBeenCalled();
  });

  test('ファイルが含まれないdropの場合、onDropは呼ばれない', () => {
    // Arrange
    const { rootElement, onDrop } = renderDropZone({ disabled: false });

    // Act
    fireEvent.drop(rootElement, { dataTransfer: { files: [] } });

    // Assert
    expect(onDrop).not.toHaveBeenCalled();
  });

  test('pathプロパティを持たないファイルがdropされた場合、onDropは呼ばれない', () => {
    // Arrange
    const { rootElement, onDrop } = renderDropZone({ disabled: false });
    const fileWithoutPath = new File(['dummy'], 'dummy.txt');

    // Act
    fireEvent.drop(rootElement, { dataTransfer: { files: [fileWithoutPath] } });

    // Assert
    expect(onDrop).not.toHaveBeenCalled();
  });

  test('pathプロパティを持つファイルがdropされた場合、onDropがそのpathで呼ばれる', () => {
    // Arrange
    const { rootElement, onDrop } = renderDropZone({ disabled: false });
    const file = createFileWithPath('/path/to/folder');

    // Act
    fireEvent.drop(rootElement, { dataTransfer: { files: [file] } });

    // Assert
    expect(onDrop).toHaveBeenCalledWith('/path/to/folder');
  });
});
