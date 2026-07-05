import { Box, chakra, Dialog, Flex, Portal } from '@chakra-ui/react';
import { Calendar, Database, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatBytes } from '../utils/format';

const ChakraVideo = chakra('video');
const ChakraImg = chakra('img');

// biome-ignore lint/style/noMagicNumbers: 定数名で意味を表しているため、16:9の比率をこれ以上分解する必要はない
const PREVIEW_ASPECT_RATIO = 16 / 9;

const DATE_SOURCE_METADATA = 'metadata';
const DATE_SOURCE_LABEL_METADATA = 'メタデータ';
const DATE_SOURCE_LABEL_FILE_SYSTEM = 'ファイルシステム';

const PREVIEW_RENDERERS: Record<FileInfo['type'], (fileUrl: string, file: FileInfo) => ReactNode> = {
  video: (fileUrl) => <ChakraVideo src={fileUrl} controls autoPlay width="100%" height="100%" objectFit="contain" />,
  image: (fileUrl, file) => (
    <ChakraImg src={fileUrl} alt={file.name} maxWidth="100%" maxHeight="100%" objectFit="contain" />
  )
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
    <Dialog.Root open={file !== null} onOpenChange={(details) => !details.open && onClose()}>
      <Portal>
        <Dialog.Backdrop id="modal-backdrop" onClick={onClose} bg="rgba(5, 5, 8, 0.85)" backdropFilter="blur(20px)" />
        <Dialog.Positioner>
          <Dialog.Content
            id="preview-modal"
            bg="#12121a"
            border="1px solid"
            borderColor="borderDefault"
            borderRadius="20px"
            width="90%"
            maxWidth="800px"
            maxHeight="80vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            boxShadow="0 24px 60px rgba(0, 0, 0, 0.8)"
            position="relative"
          >
            <Dialog.CloseTrigger
              id="modal-close"
              position="absolute"
              top="16px"
              right="16px"
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="50%"
              width="36px"
              height="36px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="#fff"
              zIndex={20}
              _hover={{ bg: 'rgba(255, 255, 255, 0.15)', transform: 'scale(1.05)' }}
            >
              <X size={18} />
            </Dialog.CloseTrigger>
            <Box
              id="modal-body"
              flex={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg="#000"
              aspectRatio={PREVIEW_ASPECT_RATIO}
              overflow="hidden"
            >
              {file && PREVIEW_RENDERERS[file.type](fileUrl, file)}
            </Box>
            <Box
              padding="20px"
              bg="rgba(255, 255, 255, 0.02)"
              borderTop="1px solid"
              borderColor="borderDefault"
              display="flex"
              flexDirection="column"
              gap="8px"
            >
              <Box id="modal-meta-title" fontSize="15px" fontWeight={600}>
                {file?.name ?? 'File Name'}
              </Box>
              <Flex gap="16px" fontSize="12px" color="textMuted">
                <Flex id="modal-meta-date" alignItems="center" gap="4px">
                  <Calendar size={14} /> {file ? buildDateLabel(file) : 'Date'}
                </Flex>
                <Flex id="modal-meta-size" alignItems="center" gap="4px">
                  <Database size={14} /> {file ? `サイズ: ${formatBytes(file.size)}` : 'Size'}
                </Flex>
              </Flex>
            </Box>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
