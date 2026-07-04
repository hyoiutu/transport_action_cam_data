import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

test.describe('React integration', () => {
  test('declares React dependencies and uses a React renderer entrypoint', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

    expect(packageJson.dependencies.react).toBeDefined();
    expect(packageJson.dependencies['react-dom']).toBeDefined();
    expect(packageJson.devDependencies.vite).toBeDefined();
    expect(indexHtml).toContain('<div id="root"></div>');
    expect(indexHtml).toContain('/src/main.tsx');
    expect(fs.existsSync(path.join(rootDir, 'src', 'App.tsx'))).toBe(true);
  });

  test('places shared React components under src/components', () => {
    const appSource = fs.readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8');

    expect(fs.existsSync(path.join(rootDir, 'src', 'components', 'DropZone.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'src', 'components', 'FileCard.tsx'))).toBe(true);
    expect(appSource).toContain("import { DropZone } from './components/DropZone';");
    expect(appSource).toContain("import { FileCard } from './components/FileCard';");
    expect(appSource).not.toMatch(/function DropZone/);
    expect(appSource).not.toMatch(/function FileCard/);
  });
});
