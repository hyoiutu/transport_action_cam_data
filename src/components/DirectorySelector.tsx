import { Box, Button, Flex } from '@chakra-ui/react';
import type { LucideProps } from 'lucide-react';
import { ArrowUp } from 'lucide-react';
import type { ComponentType } from 'react';
import { iconSizes } from '../theme';
import { DropZone } from './DropZone';

const NOT_SELECTED_LABEL = '選択されていません';

type DirectorySelectorProps = {
  type: 'src' | 'dest';
  labelIcon: ComponentType<LucideProps>;
  labelText: string;
  dropZoneIcon: ComponentType<{ className?: string }>;
  path: string;
  disabled: boolean;
  onSelect: () => void;
  onDrop: (path: string) => void;
  onNavigateUp: () => void;
};

export const DirectorySelector = ({
  type,
  labelIcon: LabelIcon,
  labelText,
  dropZoneIcon,
  path,
  disabled,
  onSelect,
  onDrop,
  onNavigateUp
}: DirectorySelectorProps) => (
  <Flex direction="column" gap="2.5">
    <Flex
      as="label"
      alignItems="center"
      gap="1.5"
      fontSize="xs"
      fontWeight="semibold"
      color="textMuted"
      textTransform="uppercase"
      letterSpacing="wide"
    >
      <LabelIcon size={iconSizes.md} /> {labelText}
    </Flex>
    <DropZone id={`${type}-drop-zone`} icon={dropZoneIcon} disabled={disabled} onClick={onSelect} onDrop={onDrop} />
    <Flex gap="1.5" alignItems="center">
      <Box
        id={`${type}-path-display`}
        title={path}
        flex={1}
        bg="scrimMedium"
        border="sm"
        borderColor="borderDefault"
        borderRadius="lg"
        paddingY="2"
        paddingX="3"
        fontSize="2xs"
        color="textMain"
        wordBreak="break-all"
        fontFamily="monospace"
      >
        {path || NOT_SELECTED_LABEL}
      </Box>
      <Button
        id={`${type}-navigate-up`}
        aria-label="一つ上へ"
        title="一つ上へ"
        disabled={disabled || path === ''}
        onClick={onNavigateUp}
        variant="ghost"
        padding="2"
        color="textMuted"
        border="sm"
        borderColor="borderDefault"
        borderRadius="lg"
      >
        <ArrowUp size={iconSizes.md} />
      </Button>
    </Flex>
  </Flex>
);
