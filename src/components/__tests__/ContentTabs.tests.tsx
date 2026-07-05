import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { renderWithChakra } from '../../test-utils/renderWithChakra';
import { ContentTabs } from '../ContentTabs';

describe('ContentTabsに関するテスト', () => {
  test('srcCount・destCount・scanInfoが表示される', () => {
    // Arrange & Act
    renderWithChakra(
      <ContentTabs currentTab="src" srcCount={3} destCount={5} scanInfo="5件見つかりました" onTabChange={vi.fn()} />
    );

    // Assert
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('5件見つかりました')).toBeInTheDocument();
  });

  test('コピー先タブをクリックするとonTabChangeがdestで呼ばれる', () => {
    // Arrange
    const onTabChange = vi.fn();
    renderWithChakra(<ContentTabs currentTab="src" srcCount={0} destCount={0} scanInfo="" onTabChange={onTabChange} />);

    // Act
    fireEvent.click(document.getElementById('tab-dest') as HTMLElement);

    // Assert
    expect(onTabChange).toHaveBeenCalledWith('dest');
  });

  test('コピー元タブをクリックするとonTabChangeがsrcで呼ばれる', () => {
    // Arrange
    const onTabChange = vi.fn();
    renderWithChakra(
      <ContentTabs currentTab="dest" srcCount={0} destCount={0} scanInfo="" onTabChange={onTabChange} />
    );

    // Act
    fireEvent.click(document.getElementById('tab-src') as HTMLElement);

    // Assert
    expect(onTabChange).toHaveBeenCalledWith('src');
  });
});
