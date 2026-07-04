import { Calendar, Database, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatBytes } from '../utils/format';

const DATE_SOURCE_METADATA = 'metadata';
const DATE_SOURCE_LABEL_METADATA = 'メタデータ';
const DATE_SOURCE_LABEL_FILE_SYSTEM = 'ファイルシステム';

const PREVIEW_RENDERERS: Record<FileInfo['type'], (fileUrl: string, file: FileInfo) => ReactNode> = {
  video: (fileUrl) => <video src={fileUrl} controls autoPlay />,
  image: (fileUrl, file) => <img src={fileUrl} alt={file.name} />
};

const buildDateLabel = (file: FileInfo): string => {
  const sourceLabel =
    file.dateSource === DATE_SOURCE_METADATA ? DATE_SOURCE_LABEL_METADATA : DATE_SOURCE_LABEL_FILE_SYSTEM;
  return `撮影・作成日: ${file.creationDate} (${sourceLabel})`;
};

type PreviewModalProps = {
  file: FileInfo | null;
  onClose: () => void;
};

export const PreviewModal = ({ file, onClose }: PreviewModalProps) => {
  const fileUrl = file ? `file://${file.path}` : '';

  return (
    <div className={`modal${file ? ' show' : ''}`} id="preview-modal">
      <div className="modal-backdrop" id="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <button className="modal-close" id="modal-close" onClick={onClose}>
          <X />
        </button>
        <div className="modal-body" id="modal-body">
          {file && PREVIEW_RENDERERS[file.type](fileUrl, file)}
        </div>
        <div className="modal-footer">
          <div className="modal-meta-title" id="modal-meta-title">
            {file?.name ?? 'File Name'}
          </div>
          <div className="modal-meta-details">
            <span id="modal-meta-date">
              <Calendar /> {file ? buildDateLabel(file) : 'Date'}
            </span>
            <span id="modal-meta-size">
              <Database /> {file ? `サイズ: ${formatBytes(file.size)}` : 'Size'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
