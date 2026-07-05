import { Box, chakra, Dialog, Flex, Portal } from '@chakra-ui/react';
import { Calendar, Database, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { iconSizes, layout, zIndices } from '../theme';
import { formatBytes } from '../utils/format';

const ChakraVideo = chakra('video');
const ChakraImg = chakra('img');

// biome-ignore lint/style/noMagicNumbers: 定数名で意味を表しているため、16:9の比率をこれ以上分解する必要はない
const PREVIEW_ASPECT_RATIO = 16 / 9;

const DATE_SOURCE_METADATA = 'metadata';
const DATE_SOURCE_LABEL_METADATA = 'メタデータ';
const DATE_SOURCE_LABEL_FILE_SYSTEM = 'ファイルシステム';

const PREVIEW_RENDERERS: Record<FileInfo['type'], (fileUrl: string, file: FileInfo) => ReactNode> = {
  // autoPlayは付与しない: 高解像度・高ビットレートの動画をモーダル表示と同時にフルデコードするとカクつきの原因になるため、再生開始はユーザー操作に委ねる
  video: (fileUrl) => <ChakraVideo src={fileUrl} controls width="100%" height="100%" objectFit="contain" />,
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
        <Dialog.Backdrop id="modal-backdrop" onClick={onClose} bg="scrimHeavy" backdropFilter="blur(20px)" />
        <Dialog.Positioner>
          <Dialog.Content
            id="preview-modal"
            bg="bgSurfaceSolid"
            border="sm"
            borderColor="borderDefault"
            borderRadius="3xl"
            width="90%"
            maxWidth={layout.modalMaxWidth}
            maxHeight="80vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            boxShadow="modal"
            position="relative"
          >
            <Dialog.CloseTrigger
              id="modal-close"
              position="absolute"
              top="4"
              right="4"
              bg="overlayWeak"
              borderRadius="50%"
              width="9"
              height="9"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="textInverse"
              zIndex={zIndices.closeButton}
              _hover={{ bg: 'overlayMedium', transform: 'scale(1.05)' }}
            >
              <X size={iconSizes.lg} />
            </Dialog.CloseTrigger>
            <Box
              id="modal-body"
              flex={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg="bgMedia"
              aspectRatio={PREVIEW_ASPECT_RATIO}
              overflow="hidden"
            >
              {file && PREVIEW_RENDERERS[file.type](fileUrl, file)}
            </Box>
            <Box
              padding="5"
              bg="overlaySubtle"
              borderTop="sm"
              borderColor="borderDefault"
              display="flex"
              flexDirection="column"
              gap="2"
            >
              <Box id="modal-meta-title" fontSize="md" fontWeight="semibold">
                {file?.name ?? 'File Name'}
              </Box>
              <Flex gap="4" fontSize="xs" color="textMuted">
                <Flex id="modal-meta-date" alignItems="center" gap="1">
                  <Calendar size={iconSizes.md} /> {file ? buildDateLabel(file) : 'Date'}
                </Flex>
                <Flex id="modal-meta-size" alignItems="center" gap="1">
                  <Database size={iconSizes.md} /> {file ? `サイズ: ${formatBytes(file.size)}` : 'Size'}
                </Flex>
              </Flex>
            </Box>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
