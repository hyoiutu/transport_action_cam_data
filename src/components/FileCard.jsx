import { Image, Video } from 'lucide-react';

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function FileCard({ file, onClick }) {
  const fileUrl = `file://${file.path}`;
  const Icon = file.type === 'video' ? Video : Image;

  return (
    <div className="file-card" onClick={onClick}>
      <div className="thumb-area">
        {file.type === 'video' ? (
          <video className="thumb-image" src={`${fileUrl}#t=0.1`} preload="metadata" muted />
        ) : (
          <img className="thumb-image" src={fileUrl} loading="lazy" alt={file.name} />
        )}
        <div className={`media-badge ${file.type === 'video' ? 'video' : 'image'}`}>
          <Icon />
        </div>
      </div>
      <div className="card-info">
        <div className="file-name" title={file.name}>{file.name}</div>
        <div className="file-meta-row">
          <span className="date-badge">{file.creationDate}</span>
          <span>{formatBytes(file.size)}</span>
        </div>
      </div>
    </div>
  );
}
