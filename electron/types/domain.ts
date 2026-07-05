export type FileInfo = {
  name: string;
  path: string;
  size: number;
  type: 'video' | 'image';
  creationDate: string;
  dateSource: string;
};

export type FolderInfo = {
  name: string;
  path: string;
  type: 'folder';
};

export type DirectoryEntry = FileInfo | FolderInfo;

export type StartCopyArgs = {
  files: FileInfo[];
  destinationDir: string;
};

export type CopyProgressData = {
  status: 'copying' | 'completed' | 'cancelled';
  copiedCount: number;
  totalFiles: number;
  currentFile: string;
};

export type CopyErrorData = {
  fileName: string;
  error: string;
};
