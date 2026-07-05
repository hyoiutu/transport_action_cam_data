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

      <Flex flex={1} height="calc(100vh - 38px)" position="relative">
        <Box
          as="aside"
          width="340px"
          bg="bgSidebar"
          backdropFilter="blur(20px)"
          borderRight="1px solid"
          borderColor="borderDefault"
          padding="24px"
          display="flex"
          flexDirection="column"
          gap="24px"
          overflowY="auto"
          zIndex={10}
        >
          <Flex alignItems="center" gap="14px" marginBottom="10px">
            <Flex
              width="44px"
              height="44px"
              bg="linear-gradient(135deg, #8a2be2, #4a00e0)"
              borderRadius="12px"
              alignItems="center"
              justifyContent="center"
              color="#fff"
              boxShadow="0 4px 15px rgba(138, 43, 226, 0.4)"
            >
              <Aperture />
            </Flex>
            <Box>
              <Box
                as="h1"
                fontSize="20px"
                fontWeight={800}
                letterSpacing="-0.5px"
                bgGradient="to-r"
                gradientFrom="#fff"
                gradientTo="#b983ff"
                bgClip="text"
                color="transparent"
              >
                Transporter
              </Box>
              <Box as="p" fontSize="11px" color="textMuted">
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

          <Box as="section" flex={1} padding="24px" overflowY="auto">
            <GalleryGrid files={files} currentTab={currentTab} onFileClick={setPreviewFile} />
          </Box>
        </Box>
      </Flex>

      <PreviewModal file={previewFile} onClose={closePreview} />
    </>
  );
};
