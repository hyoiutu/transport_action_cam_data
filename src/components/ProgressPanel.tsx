import { Box, Flex } from '@chakra-ui/react';
import type { ProgressState } from '../hooks/useCopyOperation';
import { gradients } from '../theme';

const ACTIVE_OPACITY = 1;
const INACTIVE_OPACITY = 0.5;

type ProgressPanelProps = {
  progress: ProgressState;
};

export const ProgressPanel = ({ progress }: ProgressPanelProps) => (
  <Box
    id="progress-container"
    bg="scrimMedium"
    border="sm"
    borderColor="borderDefault"
    borderRadius="xl"
    padding="4"
    display="flex"
    flexDirection="column"
    gap="2"
    opacity={progress.active ? ACTIVE_OPACITY : INACTIVE_OPACITY}
    transition="opacity 0.3s"
  >
    <Flex justifyContent="space-between" fontSize="xs" fontWeight="semibold">
      <Box as="span" id="progress-status" color="textMain">
        {progress.status}
      </Box>
      <Box as="span" id="progress-percent" color="mediaVideoAccent">
        {progress.percent}%
      </Box>
    </Flex>
    <Box bg="overlayWeak" height="1.5" borderRadius="sm" overflow="hidden" position="relative">
      <Box
        id="progress-bar"
        bg={gradients.accent}
        height="100%"
        borderRadius="sm"
        transition="width 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        width={`${progress.percent}%`}
      />
    </Box>
    <Box
      id="progress-file"
      fontSize="2xs"
      color="textMuted"
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
    >
      {progress.file}
    </Box>
  </Box>
);
