import { Box, chakra } from '@chakra-ui/react';
import { Folder } from 'lucide-react';

const ChakraFolderIcon = chakra(Folder);

type FolderCardProps = {
  folder: FolderInfo;
  onClick: () => void;
};

export const FolderCard = ({ folder, onClick }: FolderCardProps) => (
  <Box
    className="folder-card"
    onClick={onClick}
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
    cursor="pointer"
    transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
    _hover={{
      transform: 'translateY(-4px)',
      bg: 'bgSurfaceHover',
      borderColor: 'borderActive',
      boxShadow: 'cardHover'
    }}
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
