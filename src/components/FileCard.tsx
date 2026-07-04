import { Image, Video } from 'lucide-react';
import { ComponentType, ReactNode } from 'react';
import { formatBytes } from '../utils/format';

type MediaTypeConfig = {
  icon: ComponentType<{ className?: string }>;
  renderThumbnail: (fileUrl: string, file: FileInfo) => ReactNode;
};

const renderVideoThumbnail = (fileUrl: string): ReactNode => (
  <video className="thumb-image" src={`${fileUrl}#t=0.1`} preload="metadata" muted />
);

const renderImageThumbnail = (fileUrl: string, file: FileInfo): ReactNode => (
  <img className="thumb-image" src={fileUrl} loading="lazy" alt={file.name} />
);

const MEDIA_TYPE_CONFIG: Record<FileInfo['type'], MediaTypeConfig> = {
  video: {
    icon: Video,
    renderThumbnail: renderVideoThumbnail
  },
  image: {
    icon: Image,
    renderThumbnail: renderImageThumbnail
  }
};

type FileCardProps = {
  file: FileInfo;
  onClick: () => void;
};

export const FileCard = ({ file, onClick }: FileCardProps) => {
  const fileUrl = `file://${file.path}`;
  const { icon: Icon, renderThumbnail } = MEDIA_TYPE_CONFIG[file.type];

  return (
    <div className="file-card" onClick={onClick}>
      <div className="thumb-area">
        {renderThumbnail(fileUrl, file)}
        <div className={`media-badge ${file.type}`}>
          <Icon />
        </div>
      </div>
      <div className="card-info">
        <div className="file-name" title={file.name}>
          {file.name}
        </div>
        <div className="file-meta-row">
          <span className="date-badge">{file.creationDate}</span>
          <span>{formatBytes(file.size)}</span>
        </div>
      </div>
    </div>
  );
};
