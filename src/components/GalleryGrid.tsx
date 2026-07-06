import { Box, SimpleGrid, VStack } from '@chakra-ui/react';
import { ImageOff } from 'lucide-react';
import { iconSizes } from '../theme';
import { isMediaFile } from '../utils/directoryEntry';
import { FileCard } from './FileCard';
import { FolderCard } from './FolderCard';

const EMPTY_MESSAGE_SRC = '表示するファイルがありません。コピー元フォルダを選択してスキャンしてください。';
const EMPTY_MESSAGE_DEST = 'コピー先フォルダに動画や画像がありません。';

const buildEntryKey = (entry: DirectoryEntry): string => `${entry.path}-${entry.name}`;

type GalleryGridProps = {
  files: DirectoryEntry[];
  currentTab: 'src' | 'dest';
  disabled: boolean;
  onFileClick: (file: FileInfo) => void;
  onFolderClick: (folder: FolderInfo) => void;
};

export const GalleryGrid = ({ files, currentTab, disabled, onFileClick, onFolderClick }: GalleryGridProps) => {
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
      {files.map((entry) =>
        isMediaFile(entry) ? (
          <FileCard key={buildEntryKey(entry)} file={entry} onClick={() => onFileClick(entry)} />
        ) : (
          <FolderCard
            key={buildEntryKey(entry)}
            folder={entry}
            disabled={disabled}
            onClick={() => onFolderClick(entry)}
          />
        )
      )}
    </SimpleGrid>
  );
};
