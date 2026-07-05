import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithChakra } from '../../test-utils/renderWithChakra';
import { ProgressPanel } from '../ProgressPanel';

describe('ProgressPanelに関するテスト', () => {
  test('ステータス・パーセント・ファイル名が表示される', () => {
    // Arrange & Act
    renderWithChakra(
      <ProgressPanel progress={{ status: 'コピー中...', percent: 42, file: 'コピー中: a.mp4', active: true }} />
    );

    // Assert
    expect(screen.getByText('コピー中...')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('コピー中: a.mp4')).toBeInTheDocument();
  });

  test('進捗バーの幅がpercentに応じて設定される', () => {
    // Arrange & Act
    renderWithChakra(<ProgressPanel progress={{ status: '待機中...', percent: 30, file: '', active: false }} />);

    // Assert
    expect(document.getElementById('progress-bar')).toHaveStyle({ width: '30%' });
  });
});
