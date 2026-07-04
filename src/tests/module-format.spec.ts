import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../..');

test.describe('TS/JSのモジュールに関するテスト', () => {
  test('アプリケーション及びテストコードにはESMが使われている', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

    expect(packageJson.type).toBe('module');

    const files = [
      'electron/main/main.ts',
      'electron/preload/preload.ts',
      'vite.config.ts',
      'src/main.tsx',
      'src/App.tsx',
      'src/components/DropZone.tsx',
      'src/components/FileCard.tsx',
      'src/hooks/useDirectoryScan.ts',
      'src/hooks/useCopyOperation.ts',
      'src/utils/errorHandling.ts',
      'playwright.config.ts',
      'src/tests/e2e.spec.ts'
    ];

    for (const file of files) {
      const source = fs.readFileSync(path.join(rootDir, file), 'utf8');

      expect(source, `${file} should not use require()`).not.toMatch(/\brequire\s*\(/);
      expect(source, `${file} should not use module.exports`).not.toMatch(/\bmodule\.exports\b/);
    }
  });
});
