type FileInfo = {
  name: string;
  path: string;
  size: number;
  type: 'video' | 'image';
  creationDate: string;
  dateSource: string;
};

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
    scanDirectory: (dirPath: string) => Promise<FileInfo[]>;
    startCopy: (files: FileInfo[], destinationDir: string) => Promise<{ status: string; copiedCount: number }>;
    cancelCopy: () => Promise<boolean>;
    onCopyProgress: (callback: (data: CopyProgressData) => void) => () => void;
    onCopyError: (callback: (data: CopyErrorData) => void) => () => void;
  };
  srcFiles: FileInfo[];
  destFiles: FileInfo[];
  updateDirectory: (type: 'src' | 'dest', pathStr: string) => Promise<void>;
}
