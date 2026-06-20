import { useState } from 'react';

export default function DropZone({ id, icon: Icon, onClick, onDrop, disabled }) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`drop-zone${isDragOver ? ' dragover' : ''}`}
      id={id}
      onClick={onClick}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        if (disabled || event.dataTransfer.files.length === 0) return;
        onDrop(event.dataTransfer.files[0].path);
      }}
    >
      <Icon className="drop-icon" />
      <span className="drop-text">フォルダをドラッグ＆ドロップ<br />またはクリックして選択</span>
    </div>
  );
}
