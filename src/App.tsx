import { Box, Flex } from '@chakra-ui/react';
import { Aperture, DownloadCloud, FolderInput, FolderOutput, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { ContentTabs } from './components/ContentTabs';
import { CopyActions } from './components/CopyActions';
import { DirectorySelector } from './components/DirectorySelector';
import { GalleryGrid } from './components/GalleryGrid';
import { PreviewModal } from './components/PreviewModal';
import { ProgressPanel } from './components/ProgressPanel';
import { TitleBar } from './components/TitleBar';
import { useCopyOperation } from './hooks/useCopyOperation';
import { useDirectoryScan } from './hooks/useDirectoryScan';
import { gradients, layout, zIndices } from './theme';

export const App = () => {
  const [currentTab, setCurrentTab] = useState<'src' | 'dest'>('src');
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);

  const { srcPath, destPath, srcFiles, destFiles, scanInfo, updateDirectory } = useDirectoryScan();
  const { isCopying, progress, canStartCopy, startCopy } = useCopyOperation({
    srcFiles,
    destPath,
    onCopyFinished: () => updateDirectory('dest', destPath)
  });

  const files = currentTab === 'src' ? srcFiles : destFiles;

  const handleSelectDirectory = async (type: 'src' | 'dest') => {
    if (isCopying) return;
    const currentPath = type === 'src' ? srcPath : destPath;
    const selectedPath = await window.api.selectDirectory(currentPath);
    if (selectedPath) await updateDirectory(type, selectedPath);
  };

  const closePreview = (): void => setPreviewFile(null);

  return (
    <>
      <TitleBar />

      <Flex flex={1} height={`calc(100vh - ${layout.titleBarHeight})`} position="relative">
        <Box
          as="aside"
          width={layout.sidebarWidth}
          bg="bgSidebar"
          backdropFilter="blur(20px)"
          borderRight="sm"
          borderColor="borderDefault"
          padding="6"
          display="flex"
          flexDirection="column"
          gap="6"
          overflowY="auto"
          zIndex={zIndices.sidebar}
        >
          <Flex alignItems="center" gap="3.5" marginBottom="2.5">
            <Flex
              width="11"
              height="11"
              bg={gradients.primary}
              borderRadius="xl"
              alignItems="center"
              justifyContent="center"
              color="textInverse"
              boxShadow="brandGlow"
            >
              <Aperture />
            </Flex>
            <Box>
              <Box
                as="h1"
                fontSize="xl"
                fontWeight="extrabold"
                letterSpacing="tight"
                bgGradient="to-r"
                gradientFrom="textInverse"
                gradientTo="brandPrimaryHover"
                bgClip="text"
                color="transparent"
              >
                Transporter
              </Box>
              <Box as="p" fontSize="2xs" color="textMuted">
                Action Cam Backup Tool
              </Box>
            </Box>
          </Flex>

          <DirectorySelector
            type="src"
            labelIcon={FolderInput}
            labelText="コピー元フォルダ (Source)"
            dropZoneIcon={UploadCloud}
            path={srcPath}
            disabled={isCopying}
            onSelect={() => handleSelectDirectory('src')}
            onDrop={(path) => updateDirectory('src', path)}
          />

          <DirectorySelector
            type="dest"
            labelIcon={FolderOutput}
            labelText="コピー先フォルダ (Destination)"
            dropZoneIcon={DownloadCloud}
            path={destPath}
            disabled={isCopying}
            onSelect={() => handleSelectDirectory('dest')}
            onDrop={(path) => updateDirectory('dest', path)}
          />

          <CopyActions
            canStartCopy={canStartCopy}
            isCopying={isCopying}
            onStart={startCopy}
            onCancel={() => window.api.cancelCopy()}
          />

          <ProgressPanel progress={progress} />
        </Box>

        <Box as="main" flex={1} display="flex" flexDirection="column" bg="bgMain">
          <ContentTabs
            currentTab={currentTab}
            srcCount={srcFiles.length}
            destCount={destFiles.length}
            scanInfo={scanInfo}
            onTabChange={setCurrentTab}
          />

          <Box as="section" flex={1} padding="6" overflowY="auto">
            <GalleryGrid files={files} currentTab={currentTab} onFileClick={setPreviewFile} />
          </Box>
        </Box>
      </Flex>

      <PreviewModal file={previewFile} onClose={closePreview} />
    </>
  );
};
