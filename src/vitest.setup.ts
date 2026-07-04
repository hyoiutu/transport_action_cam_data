import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// globals: trueを使用していないため、Testing Libraryの自動クリーンアップが効かない。
// 各テスト後に明示的にDOMをクリーンアップし、レンダリング結果がテスト間で蓄積しないようにする。
afterEach(() => {
  cleanup();
});
