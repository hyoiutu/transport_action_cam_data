export const createFileInfo = (overrides: Partial<FileInfo> = {}): FileInfo => ({
  name: 'sample.mp4',
  path: '/path/to/sample.mp4',
  size: 1024,
  type: 'video',
  creationDate: '2026-01-01',
  dateSource: 'metadata',
  ...overrides
});

export const createFolderInfo = (overrides: Partial<FolderInfo> = {}): FolderInfo => ({
  name: 'sample-folder',
  path: '/path/to/sample-folder',
  type: 'folder',
  ...overrides
});
