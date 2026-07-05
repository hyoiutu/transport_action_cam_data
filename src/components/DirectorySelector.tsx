import { Box, Flex } from '@chakra-ui/react';
import type { LucideProps } from 'lucide-react';
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
};

export const DirectorySelector = ({
  type,
  labelIcon: LabelIcon,
  labelText,
  dropZoneIcon,
  path,
  disabled,
  onSelect,
  onDrop
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
    <Box
      id={`${type}-path-display`}
      title={path}
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
  </Flex>
);
