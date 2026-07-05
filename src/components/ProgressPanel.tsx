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
    bg="rgba(0, 0, 0, 0.2)"
    border="1px solid"
    borderColor="borderDefault"
    borderRadius="12px"
    padding="16px"
    display="flex"
    flexDirection="column"
    gap="8px"
    opacity={progress.active ? ACTIVE_OPACITY : INACTIVE_OPACITY}
    transition="opacity 0.3s"
  >
    <Flex justifyContent="space-between" fontSize="12px" fontWeight={600}>
      <Box as="span" id="progress-status" color="textMain">
        {progress.status}
      </Box>
      <Box as="span" id="progress-percent" color="accent">
        {progress.percent}%
      </Box>
    </Flex>
    <Box bg="rgba(255, 255, 255, 0.05)" height="6px" borderRadius="3px" overflow="hidden" position="relative">
      <Box
        id="progress-bar"
        bg={gradients.accent}
        height="100%"
        borderRadius="3px"
        transition="width 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        width={`${progress.percent}%`}
      />
    </Box>
    <Box
      id="progress-file"
      fontSize="11px"
      color="textMuted"
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
    >
      {progress.file}
    </Box>
  </Box>
);
