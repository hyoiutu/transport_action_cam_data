import { Box, SimpleGrid, VStack } from '@chakra-ui/react';
import { ImageOff } from 'lucide-react';
import { iconSizes } from '../theme';
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
      <VStack gap="4" paddingY="20" paddingX="5" color="textMuted" textAlign="center">
        <ImageOff size={iconSizes.xl} strokeWidth={1.5} color="overlayWeak" />
        <Box as="p" fontSize="sm" maxWidth="80" lineHeight="1.6">
          {emptyMessage}
        </Box>
      </VStack>
    );
  }

  return (
    <SimpleGrid id="gallery-grid" minChildWidth="180px" gap="5" alignContent="start">
      {files.map((file) => (
        <FileCard key={buildFileKey(file)} file={file} onClick={() => onFileClick(file)} />
      ))}
    </SimpleGrid>
  );
};
