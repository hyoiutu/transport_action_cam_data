type FileInfo = {
  name: string;
  path: string;
  size: number;
  type: 'video' | 'image';
  creationDate: string;
  dateSource: string;
};

type FolderInfo = {
  name: string;
  path: string;
  type: 'folder';
};

type DirectoryEntry = FileInfo | FolderInfo;

type CopyProgressData = {
  status: 'copying' | 'completed' | 'cancelled';
  copiedCount: number;
  totalFiles: number;
  currentFile: string;
};

type CopyErrorData = {
  fileName: string;
  error: string;
};

// biome-ignore lint/style/useConsistentTypeDefinitions: windowオブジェクトへのグローバル拡張はinterfaceの宣言マージが必要なためtypeにできない
interface Window {
  api: {
    selectDirectory: (defaultPath?: string) => Promise<string | null>;
    scanDirectory: (dirPath: string) => Promise<DirectoryEntry[]>;
    startCopy: (files: FileInfo[], destinationDir: string) => Promise<{ status: string; copiedCount: number }>;
    cancelCopy: () => Promise<boolean>;
    onCopyProgress: (callback: (data: CopyProgressData) => void) => () => void;
    onCopyError: (callback: (data: CopyErrorData) => void) => () => void;
    getParentDirectory: (currentPath: string) => string;
  };
  srcFiles: DirectoryEntry[];
  destFiles: DirectoryEntry[];
  updateDirectory: (type: 'src' | 'dest', pathStr: string) => Promise<void>;
}
