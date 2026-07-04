import { ImageOff } from 'lucide-react';
import { FileCard } from './FileCard';

const EMPTY_MESSAGE_SRC = '表示するファイルがありません。コピー元フォルダを選択してスキャンしてください。';
const EMPTY_MESSAGE_DEST = 'コピー先フォルダに動画や画像がありません。';

const buildFileKey = (file: FileInfo): string => `${file.path}-${file.name}`;

type GalleryGridProps = {
  files: FileInfo[];
  currentTab: 'src' | 'dest';
  onFileClick: (file: FileInfo) => void;
};

export const GalleryGrid = ({ files, currentTab, onFileClick }: GalleryGridProps) => {
  if (files.length === 0) {
    const emptyMessage = currentTab === 'src' ? EMPTY_MESSAGE_SRC : EMPTY_MESSAGE_DEST;
    return (
      <div className="empty-state">
        <ImageOff />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {files.map((file) => (
        <FileCard key={buildFileKey(file)} file={file} onClick={() => onFileClick(file)} />
      ))}
    </>
  );
};
