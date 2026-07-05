import { Box, chakra, Flex } from '@chakra-ui/react';
import type { LucideProps } from 'lucide-react';
import { Image, Video } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { iconSizes } from '../theme';
import { formatBytes } from '../utils/format';

const ChakraVideo = chakra('video');
const ChakraImg = chakra('img');

// biome-ignore lint/style/noMagicNumbers: 定数名で意味を表しているため、16:10の比率をこれ以上分解する必要はない
const THUMBNAIL_ASPECT_RATIO = 16 / 10;

type MediaTypeConfig = {
  icon: ComponentType<LucideProps>;
  badgeColor: string;
  renderThumbnail: (fileUrl: string, file: FileInfo) => ReactNode;
};

const renderVideoThumbnail = (fileUrl: string): ReactNode => (
  <ChakraVideo
    src={`${fileUrl}#t=0.1`}
    preload="metadata"
    muted
    width="100%"
    height="100%"
    objectFit="cover"
    transition="transform 0.3s"
    _groupHover={{ transform: 'scale(1.05)' }}
  />
);

const renderImageThumbnail = (fileUrl: string, file: FileInfo): ReactNode => (
  <ChakraImg
    src={fileUrl}
    loading="lazy"
    alt={file.name}
    width="100%"
    height="100%"
    objectFit="cover"
    transition="transform 0.3s"
    _groupHover={{ transform: 'scale(1.05)' }}
  />
);

const MEDIA_TYPE_CONFIG: Record<FileInfo['type'], MediaTypeConfig> = {
  video: {
    icon: Video,
    badgeColor: 'mediaVideoAccent',
    renderThumbnail: renderVideoThumbnail
  },
  image: {
    icon: Image,
    badgeColor: 'mediaImageAccent',
    renderThumbnail: renderImageThumbnail
  }
};

type FileCardProps = {
  file: FileInfo;
  onClick: () => void;
};

export const FileCard = ({ file, onClick }: FileCardProps) => {
  const fileUrl = `file://${file.path}`;
  const { icon: Icon, badgeColor, renderThumbnail } = MEDIA_TYPE_CONFIG[file.type];

  return (
    <Box
      // E2Eテスト（src/tests/e2e.spec.ts）が `.file-card` クラスセレクタでこの要素を参照しているため維持する
      className="file-card"
      role="group"
      onClick={onClick}
      bg="bgSurface"
      border="sm"
      borderColor="borderDefault"
      borderRadius="xl"
      overflow="hidden"
      transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      _hover={{
        transform: 'translateY(-4px)',
        bg: 'bgSurfaceHover',
        borderColor: 'borderActive',
        boxShadow: 'cardHover'
      }}
    >
      <Box
        position="relative"
        aspectRatio={THUMBNAIL_ASPECT_RATIO}
        bg="bgMedia"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {renderThumbnail(fileUrl, file)}
        <Flex
          data-media-type={file.type}
          position="absolute"
          top="2"
          right="2"
          bg="scrimStrong"
          padding="1"
          borderRadius="md"
          color={badgeColor}
          alignItems="center"
          justifyContent="center"
          backdropFilter="blur(4px)"
        >
          <Icon size={iconSizes.sm} />
        </Flex>
      </Box>
      <Box padding="3" display="flex" flexDirection="column" gap="1.5">
        <Box
          fontSize="xs"
          fontWeight="semibold"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          title={file.name}
        >
          {file.name}
        </Box>
        <Flex justifyContent="space-between" alignItems="center" fontSize="2xs" color="textMuted">
          <Box as="span" bg="overlayWeak" paddingY="0.5" paddingX="1.5" borderRadius="sm" fontFamily="monospace">
            {file.creationDate}
          </Box>
          <Box as="span">{formatBytes(file.size)}</Box>
        </Flex>
      </Box>
    </Box>
  );
};
