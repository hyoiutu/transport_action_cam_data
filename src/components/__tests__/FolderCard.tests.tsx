import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { createFolderInfo } from '../../test-utils/fixtures';
import { renderWithChakra } from '../../test-utils/renderWithChakra';
import { FolderCard } from '../FolderCard';

type FolderCardOverrides = Partial<{
  onClick: () => void;
  disabled: boolean;
}>;

const renderFolderCard = (overrides: FolderCardOverrides = {}) => {
  const folder = createFolderInfo({ name: 'DCIM' });
  const onClick = vi.fn();
  const utils = renderWithChakra(<FolderCard folder={folder} onClick={onClick} disabled={false} {...overrides} />);
  const rootElement = utils.container.firstChild as HTMLElement;
  return { ...utils, onClick, rootElement };
};

describe('FolderCardに関するテスト', () => {
  test('フォルダ名が表示される', () => {
    // Arrange & Act
    renderFolderCard();

    // Assert
    expect(screen.getByText('DCIM')).toBeInTheDocument();
  });

  test('クリックするとonClickが呼ばれる', () => {
    // Arrange
    const { onClick } = renderFolderCard();

    // Act
    fireEvent.click(screen.getByText('DCIM'));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled=falseのとき、aria-disabled属性はfalseになる', () => {
    // Arrange & Act
    const { rootElement } = renderFolderCard({ disabled: false });

    // Assert
    expect(rootElement).toHaveAttribute('aria-disabled', 'false');
  });

  test('disabled=trueのとき、aria-disabled属性はtrueになる', () => {
    // Arrange & Act
    const { rootElement } = renderFolderCard({ disabled: true });

    // Assert
    expect(rootElement).toHaveAttribute('aria-disabled', 'true');
  });

  test('disabled=falseのとき、カーソルはpointerになる', () => {
    // Arrange & Act
    const { rootElement } = renderFolderCard({ disabled: false });

    // Assert
    expect(rootElement).toHaveStyle({ cursor: 'pointer' });
  });

  test('disabled=trueのとき、カーソルはnot-allowedになる', () => {
    // Arrange & Act
    const { rootElement } = renderFolderCard({ disabled: true });

    // Assert
    expect(rootElement).toHaveStyle({ cursor: 'not-allowed' });
  });
});
