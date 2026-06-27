import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Aperture,
  Archive,
  Calendar,
  Database,
  DownloadCloud,
  Files,
  FolderInput,
  FolderOutput,
  ImageOff,
  Play,
  Square,
  UploadCloud,
  X
} from 'lucide-react';
import DropZone from './components/DropZone';
import FileCard from './components/FileCard';

interface ProgressState {
  status: string;
  percent: number;
  file: string;
  active: boolean;
}

const initialProgress: ProgressState = {
  status: '待機中...',
  percent: 0,
  file: '',
  active: false
};

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function showErrorToast(message: string): void {
  console.error(message);
  alert(message);
}

export default function App() {
  const [srcPath, setSrcPath] = useState<string>('');
  const [destPath, setDestPath] = useState<string>('');
  const [srcFiles, setSrcFiles] = useState<FileInfo[]>([]);
  const [destFiles, setDestFiles] = useState<FileInfo[]>([]);
  const [currentTab, setCurrentTab] = useState<'src' | 'dest'>('src');
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [scanInfo, setScanInfo] = useState<string>('フォルダを選択してください');
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);

  useEffect(() => {
    window.srcFiles = srcFiles;
    window.destFiles = destFiles;
  }, [srcFiles, destFiles]);

  const updateDirectory = useCallback(async (type: 'src' | 'dest', pathStr: string) => {
    if (type === 'src') {
      setSrcPath(pathStr);
      setScanInfo('コピー元をスキャン中...');
      try {
        const files = await window.api.scanDirectory(pathStr);
        window.srcFiles = files;
        setSrcFiles(files);
        setScanInfo(`スキャン完了 - 元: ${files.length} 件 / 先: ${window.destFiles?.length || 0} 件`);
      } catch (error: any) {
        showErrorToast(`コピー元のスキャンに失敗しました: ${error.message}`);
        window.srcFiles = [];
        setSrcFiles([]);
        setScanInfo(`スキャン完了 - 元: 0 件 / 先: ${window.destFiles?.length || 0} 件`);
      }
      return;
    }

    setDestPath(pathStr);
    setScanInfo('コピー先をスキャン中...');
    try {
      const files = await window.api.scanDirectory(pathStr);
      window.destFiles = files;
      setDestFiles(files);
      setScanInfo(`スキャン完了 - 元: ${window.srcFiles?.length || 0} 件 / 先: ${files.length} 件`);
    } catch (error: any) {
      showErrorToast(`コピー先のスキャンに失敗しました: ${error.message}`);
      window.destFiles = [];
      setDestFiles([]);
      setScanInfo(`スキャン完了 - 元: ${window.srcFiles?.length || 0} 件 / 先: 0 件`);
    }
  }, []);

  useEffect(() => {
    window.updateDirectory = updateDirectory;
  }, [updateDirectory]);

  useEffect(() => {
    const unsubscribeProgress = window.api.onCopyProgress((data) => {
      if (data.status !== 'copying') return;
      const percent = Math.round((data.copiedCount / data.totalFiles) * 100);
      setProgress({
        active: true,
        percent,
        status: `コピー中 (${data.copiedCount}/${data.totalFiles})`,
        file: `コピー中: ${data.currentFile}`
      });
    });
    const unsubscribeError = window.api.onCopyError((data) => {
      showErrorToast(`ファイルコピー失敗: ${data.fileName}\n${data.error}`);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeError();
    };
  }, []);

  useEffect(() => {
    const closeByEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewFile(null);
    };
    document.addEventListener('keydown', closeByEscape);
    return () => document.removeEventListener('keydown', closeByEscape);
  }, []);

  const files = currentTab === 'src' ? srcFiles : destFiles;
  const canStartCopy = srcFiles.length > 0 && destPath !== '' && !isCopying;

  const handleSelectDirectory = async (type: 'src' | 'dest') => {
    if (isCopying) return;
    const currentPath = type === 'src' ? srcPath : destPath;
    const selectedPath = await window.api.selectDirectory(currentPath);
    if (selectedPath) await updateDirectory(type, selectedPath);
  };

  const handleStartCopy = async () => {
    if (!canStartCopy) return;

    setIsCopying(true);
    setProgress({
      active: true,
      status: 'コピー中...',
      percent: 0,
      file: ''
    });

    try {
      const result = await window.api.startCopy(srcFiles, destPath);

      if (result.status === 'completed') {
        setProgress({
          active: true,
          status: 'コピー完了！',
          percent: 100,
          file: `全 ${result.copiedCount} 件のコピーに成功しました。`
        });
      } else if (result.status === 'cancelled') {
        setProgress((current) => ({
          ...current,
          active: true,
          status: 'キャンセルされました',
          file: `${result.copiedCount} 件コピー後に中断しました。`
        }));
      }
    } catch (error: any) {
      setProgress((current) => ({
        ...current,
        active: true,
        status: 'エラーが発生しました',
        file: error.message
      }));
      showErrorToast(`コピーエラー: ${error.message}`);
    } finally {
      setIsCopying(false);
      await updateDirectory('dest', destPath);
    }
  };

  const previewFileUrl = useMemo(() => {
    if (!previewFile) return '';
    return `file://${previewFile.path}`;
  }, [previewFile]);

  return (
    <>
      <div className="title-bar">
        <div className="title-bar-drag"></div>
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
            <button id="btn-start-copy" className="btn btn-primary" disabled={!canStartCopy} onClick={handleStartCopy}>
              <Play /> コピーを開始する
            </button>
            <button id="btn-cancel-copy" className="btn btn-danger" disabled={!isCopying} onClick={() => window.api.cancelCopy()}>
              <Square /> キャンセル
            </button>
          </div>

          <div className={`progress-container${progress.active ? ' active' : ''}`} id="progress-container">
            <div className="progress-header">
              <span id="progress-status">{progress.status}</span>
              <span id="progress-percent">{progress.percent}%</span>
            </div>
            <div className="progress-bar-wrapper">
              <div className="progress-bar" id="progress-bar" style={{ width: `${progress.percent}%` }}></div>
            </div>
            <div className="progress-file" id="progress-file">{progress.file}</div>
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
              {files.length === 0 ? (
                <div className="empty-state">
                  <ImageOff />
                  <p>
                    {currentTab === 'src'
                      ? '表示するファイルがありません。コピー元フォルダを選択してスキャンしてください。'
                      : 'コピー先フォルダに動画や画像がありません。'}
                  </p>
                </div>
              ) : (
                files.map((file) => (
                  <FileCard key={`${file.path}-${file.name}`} file={file} onClick={() => setPreviewFile(file)} />
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      <div className={`modal${previewFile ? ' show' : ''}`} id="preview-modal">
        <div className="modal-backdrop" id="modal-backdrop" onClick={() => setPreviewFile(null)}></div>
        <div className="modal-content">
          <button className="modal-close" id="modal-close" onClick={() => setPreviewFile(null)}>
            <X />
          </button>
          <div className="modal-body" id="modal-body">
            {previewFile && (
              previewFile.type === 'video' ? (
                <video src={previewFileUrl} controls autoPlay />
              ) : (
                <img src={previewFileUrl} alt={previewFile.name} />
              )
            )}
          </div>
          <div className="modal-footer">
            <div className="modal-meta-title" id="modal-meta-title">{previewFile?.name || 'File Name'}</div>
            <div className="modal-meta-details">
              <span id="modal-meta-date">
                <Calendar /> {previewFile
                  ? `撮影・作成日: ${previewFile.creationDate} (${previewFile.dateSource === 'metadata' ? 'メタデータ' : 'ファイルシステム'})`
                  : 'Date'}
              </span>
              <span id="modal-meta-size">
                <Database /> {previewFile ? `サイズ: ${formatBytes(previewFile.size)}` : 'Size'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
