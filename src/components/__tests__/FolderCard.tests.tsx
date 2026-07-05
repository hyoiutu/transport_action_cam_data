import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { createFolderInfo } from '../../test-utils/fixtures';
import { renderWithChakra } from '../../test-utils/renderWithChakra';
import { FolderCard } from '../FolderCard';

describe('FolderCardに関するテスト', () => {
  test('フォルダ名が表示される', () => {
    // Arrange
    const folder = createFolderInfo({ name: 'DCIM' });

    // Act
    renderWithChakra(<FolderCard folder={folder} onClick={vi.fn()} />);

    // Assert
    expect(screen.getByText('DCIM')).toBeInTheDocument();
  });

  test('クリックするとonClickが呼ばれる', () => {
    // Arrange
    const onClick = vi.fn();
    const folder = createFolderInfo({ name: 'DCIM' });

    // Act
    renderWithChakra(<FolderCard folder={folder} onClick={onClick} />);
    fireEvent.click(screen.getByText('DCIM'));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
