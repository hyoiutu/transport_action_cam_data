import { Box, Flex } from '@chakra-ui/react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
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
  <Flex direction="column" gap="10px">
    <Flex
      as="label"
      alignItems="center"
      gap="6px"
      fontSize="12px"
      fontWeight={600}
      color="textMuted"
      textTransform="uppercase"
      letterSpacing="0.5px"
    >
      <LabelIcon size={14} /> {labelText}
    </Flex>
    <DropZone id={`${type}-drop-zone`} icon={dropZoneIcon} disabled={disabled} onClick={onSelect} onDrop={onDrop} />
    <Box
      id={`${type}-path-display`}
      title={path}
      bg="rgba(0, 0, 0, 0.2)"
      border="1px solid"
      borderColor="borderDefault"
      borderRadius="8px"
      padding="8px 12px"
      fontSize="11px"
      color="textMain"
      wordBreak="break-all"
      fontFamily="monospace"
    >
      {path || NOT_SELECTED_LABEL}
    </Box>
  </Flex>
);
