import { Box, chakra } from '@chakra-ui/react';
import { Folder } from 'lucide-react';

const ChakraFolderIcon = chakra(Folder);

type FolderCardProps = {
  folder: FolderInfo;
  onClick: () => void;
  disabled: boolean;
};

export const FolderCard = ({ folder, onClick, disabled }: FolderCardProps) => (
  <Box
    className="folder-card"
    onClick={onClick}
    aria-disabled={disabled}
    bg="bgSurface"
    border="sm"
    borderColor="borderDefault"
    borderRadius="xl"
    padding="4"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    gap="1.5"
    cursor={disabled ? 'not-allowed' : 'pointer'}
    transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
    _hover={
      disabled
        ? undefined
        : {
            transform: 'translateY(-4px)',
            bg: 'bgSurfaceHover',
            borderColor: 'borderActive',
            boxShadow: 'cardHover'
          }
    }
  >
    <ChakraFolderIcon boxSize="12" color="brandPrimaryHover" />
    <Box
      fontSize="xs"
      fontWeight="semibold"
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      maxWidth="100%"
      title={folder.name}
    >
      {folder.name}
    </Box>
  </Box>
);
