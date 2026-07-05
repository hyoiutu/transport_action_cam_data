import { Box, chakra } from '@chakra-ui/react';
import type { DragEvent } from 'react';
import { useMemo, useState } from 'react';

type DropZoneProps = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  onDrop: (path: string) => void;
  disabled: boolean;
};

export const DropZone = ({ id, icon: Icon, onClick, onDrop, disabled }: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const ChakraIcon = useMemo(() => chakra(Icon), [Icon]);

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (): void => setIsDragOver(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragOver(false);
    if (disabled || event.dataTransfer.files.length === 0) return;
    // Electronのファイルオブジェクトには拡張プロパティとしてpathが存在します
    const file = event.dataTransfer.files[0] as File & { path?: string };
    if (file.path) {
      onDrop(file.path);
    }
  };

  return (
    <Box
      id={id}
      role="group"
      data-dragover={isDragOver}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      border="2px dashed"
      borderColor={isDragOver ? 'accent' : 'borderDefault'}
      borderRadius="14px"
      padding="24px 16px"
      textAlign="center"
      bg={isDragOver ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)'}
      cursor="pointer"
      transform={isDragOver ? 'scale(0.98)' : undefined}
      transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="12px"
      _hover={{ borderColor: 'primaryLight', bg: 'rgba(138, 43, 226, 0.05)' }}
    >
      <ChakraIcon boxSize="32px" color="textMuted" transition="color 0.3s" _groupHover={{ color: 'primaryLight' }} />
      <Box as="span" fontSize="12px" color="textMuted" lineHeight="1.5">
        フォルダをドラッグ＆ドロップ
        <br />
        またはクリックして選択
      </Box>
    </Box>
  );
};
