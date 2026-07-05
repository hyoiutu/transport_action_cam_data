import { Box, SimpleGrid, VStack } from '@chakra-ui/react';
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
      <VStack gap="16px" padding="80px 20px" color="textMuted" textAlign="center">
        <ImageOff size={48} strokeWidth={1.5} color="rgba(255, 255, 255, 0.1)" />
        <Box as="p" fontSize="14px" maxWidth="320px" lineHeight="1.6">
          {emptyMessage}
        </Box>
      </VStack>
    );
  }

  return (
    <SimpleGrid id="gallery-grid" minChildWidth="180px" gap="20px" alignContent="start">
      {files.map((file) => (
        <FileCard key={buildFileKey(file)} file={file} onClick={() => onFileClick(file)} />
      ))}
    </SimpleGrid>
  );
};
