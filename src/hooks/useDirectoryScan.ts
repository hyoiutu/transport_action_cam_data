import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage, showErrorToast } from '../utils/errorHandling';

const SCAN_INFO_INITIAL = 'フォルダを選択してください';
const SCAN_INFO_SCANNING_SRC = 'コピー元をスキャン中...';
const SCAN_INFO_SCANNING_DEST = 'コピー先をスキャン中...';

const buildScanCompleteMessage = (srcCount: number, destCount: number): string =>
  `スキャン完了 - 元: ${srcCount} 件 / 先: ${destCount} 件`;

export const useDirectoryScan = () => {
  const [srcPath, setSrcPath] = useState('');
  const [destPath, setDestPath] = useState('');
  const [srcFiles, setSrcFiles] = useState<FileInfo[]>([]);
  const [destFiles, setDestFiles] = useState<FileInfo[]>([]);
  const [scanningTarget, setScanningTarget] = useState<'src' | 'dest' | null>(null);

  useEffect(() => {
    window.srcFiles = srcFiles;
    window.destFiles = destFiles;
  }, [srcFiles, destFiles]);

  // scanInfoはsrcFiles/destFilesの件数と現在のスキャン状態から一意に決まる導出値のため、
  // 個別のuseStateではなくuseMemoで算出する（複数stateの手動同期を避ける）
  const scanInfo = useMemo(() => {
    if (scanningTarget === 'src') return SCAN_INFO_SCANNING_SRC;
    if (scanningTarget === 'dest') return SCAN_INFO_SCANNING_DEST;
    if (srcPath === '' && destPath === '') return SCAN_INFO_INITIAL;
    return buildScanCompleteMessage(srcFiles.length, destFiles.length);
  }, [scanningTarget, srcPath, destPath, srcFiles.length, destFiles.length]);

  const updateDirectory = useCallback(async (type: 'src' | 'dest', pathStr: string) => {
    setScanningTarget(type);

    if (type === 'src') {
      setSrcPath(pathStr);
      try {
        const files = await window.api.scanDirectory(pathStr);
        window.srcFiles = files;
        setSrcFiles(files);
      } catch (error: unknown) {
        showErrorToast(`コピー元のスキャンに失敗しました: ${getErrorMessage(error)}`);
        window.srcFiles = [];
        setSrcFiles([]);
      } finally {
        setScanningTarget(null);
      }
      return;
    }

    setDestPath(pathStr);
    try {
      const files = await window.api.scanDirectory(pathStr);
      window.destFiles = files;
      setDestFiles(files);
    } catch (error: unknown) {
      showErrorToast(`コピー先のスキャンに失敗しました: ${getErrorMessage(error)}`);
      window.destFiles = [];
      setDestFiles([]);
    } finally {
      setScanningTarget(null);
    }
  }, []);

  useEffect(() => {
    window.updateDirectory = updateDirectory;
  }, [updateDirectory]);

  return { srcPath, destPath, srcFiles, destFiles, scanInfo, updateDirectory };
};
