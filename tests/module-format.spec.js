import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');

test.describe('JSのモジュールに関するテスト', () => {
  test('アプリケーション及びテストコードにはESMが使われている', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
    );

    expect(packageJson.type).toBe('module');

    const files = [
      'main.js',
      'preload.mjs',
      'vite.config.js',
      'src/main.jsx',
      'src/App.jsx',
      'playwright.config.js',
      'tests/e2e.spec.js'
    ];

    for (const file of files) {
      const source = fs.readFileSync(path.join(rootDir, file), 'utf8');

      expect(source, `${file} should not use require()`).not.toMatch(/\brequire\s*\(/);
      expect(source, `${file} should not use module.exports`).not.toMatch(/\bmodule\.exports\b/);
    }
  });
});
