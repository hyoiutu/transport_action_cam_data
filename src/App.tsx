import {
  Aperture,
  Archive,
  DownloadCloud,
  Files,
  FolderInput,
  FolderOutput,
  Play,
  Square,
  UploadCloud
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DropZone } from './components/DropZone';
import { GalleryGrid } from './components/GalleryGrid';
import { PreviewModal } from './components/PreviewModal';
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

  useEffect(() => {
    const closeByEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewFile(null);
    };
    document.addEventListener('keydown', closeByEscape);
    return () => document.removeEventListener('keydown', closeByEscape);
  }, []);

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
      <div className="title-bar">
        <div className="title-bar-drag" />
        <div className="title-text">Action Cam Data Transporter</div>
      </div>

      <div className="app-container">
        <aside className="sidebar">
          <div className="brand">
            <div className="logo-icon">
              <Aperture />
            </div>
            <div>
              <h1>Transporter</h1>
              <p>Action Cam Backup Tool</p>
            </div>
          </div>

          <div className="control-group">
            <label>
              <FolderInput /> コピー元フォルダ (Source)
            </label>
            <DropZone
              id="src-drop-zone"
              icon={UploadCloud}
              disabled={isCopying}
              onClick={() => handleSelectDirectory('src')}
              onDrop={(path) => updateDirectory('src', path)}
            />
            <div className="path-display" id="src-path-display" title={srcPath}>
              {srcPath || '選択されていません'}
            </div>
          </div>

          <div className="control-group">
            <label>
              <FolderOutput /> コピー先フォルダ (Destination)
            </label>
            <DropZone
              id="dest-drop-zone"
              icon={DownloadCloud}
              disabled={isCopying}
              onClick={() => handleSelectDirectory('dest')}
              onDrop={(path) => updateDirectory('dest', path)}
            />
            <div className="path-display" id="dest-path-display" title={destPath}>
              {destPath || '選択されていません'}
            </div>
          </div>

          <div className="action-panel">
            <button id="btn-start-copy" className="btn btn-primary" disabled={!canStartCopy} onClick={startCopy}>
              <Play /> コピーを開始する
            </button>
            <button
              id="btn-cancel-copy"
              className="btn btn-danger"
              disabled={!isCopying}
              onClick={() => window.api.cancelCopy()}
            >
              <Square /> キャンセル
            </button>
          </div>

          <div className={`progress-container${progress.active ? ' active' : ''}`} id="progress-container">
            <div className="progress-header">
              <span id="progress-status">{progress.status}</span>
              <span id="progress-percent">{progress.percent}%</span>
            </div>
            <div className="progress-bar-wrapper">
              <div className="progress-bar" id="progress-bar" style={{ width: `${progress.percent}%` }} />
            </div>
            <div className="progress-file" id="progress-file">
              {progress.file}
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="content-header">
            <div className="tabs">
              <button
                className={`tab-btn${currentTab === 'src' ? ' active' : ''}`}
                id="tab-src"
                onClick={() => setCurrentTab('src')}
              >
                <Files /> コピー元ファイル (<span id="count-src">{srcFiles.length}</span>)
              </button>
              <button
                className={`tab-btn${currentTab === 'dest' ? ' active' : ''}`}
                id="tab-dest"
                onClick={() => setCurrentTab('dest')}
              >
                <Archive /> コピー先フォルダ内 (<span id="count-dest">{destFiles.length}</span>)
              </button>
            </div>
            <div className="quick-info">
              <span id="scan-info">{scanInfo}</span>
            </div>
          </header>

          <section className="gallery-container">
            <div className="gallery-grid" id="gallery-grid">
              <GalleryGrid files={files} currentTab={currentTab} onFileClick={setPreviewFile} />
            </div>
          </section>
        </main>
      </div>

      <PreviewModal file={previewFile} onClose={closePreview} />
    </>
  );
};
