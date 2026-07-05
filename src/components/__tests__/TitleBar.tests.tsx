import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderWithChakra } from '../../test-utils/renderWithChakra';
import { TitleBar } from '../TitleBar';

describe('TitleBarに関するテスト', () => {
  test('アプリ名がタイトルとして表示される', () => {
    // Arrange & Act
    renderWithChakra(<TitleBar />);

    // Assert
    expect(screen.getByText('Action Cam Data Transporter')).toBeInTheDocument();
  });
});
