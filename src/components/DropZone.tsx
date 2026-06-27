import { useState, DragEvent } from 'react';

interface DropZoneProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  onDrop: (path: string) => void;
  disabled: boolean;
}

export default function DropZone({ id, icon: Icon, onClick, onDrop, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  return (
    <div
      className={`drop-zone${isDragOver ? ' dragover' : ''}`}
      id={id}
      onClick={onClick}
      onDragOver={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        if (disabled || event.dataTransfer.files.length === 0) return;
        // Electronのファイルオブジェクトには拡張プロパティとしてpathが存在します
        const file = event.dataTransfer.files[0] as File & { path?: string };
        if (file.path) {
          onDrop(file.path);
        }
      }}
    >
      <Icon className="drop-icon" />
      <span className="drop-text">フォルダをドラッグ＆ドロップ<br />またはクリックして選択</span>
    </div>
  );
}
