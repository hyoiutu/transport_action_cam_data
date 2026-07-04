import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage, showErrorToast } from '../utils/errorHandling';

export const useDirectoryScan = () => {
  const [srcPath, setSrcPath] = useState('');
  const [destPath, setDestPath] = useState('');
  const [srcFiles, setSrcFiles] = useState<FileInfo[]>([]);
  const [destFiles, setDestFiles] = useState<FileInfo[]>([]);
  const [scanInfo, setScanInfo] = useState('フォルダを選択してください');

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
        setScanInfo(`スキャン完了 - 元: ${files.length} 件 / 先: ${window.destFiles?.length ?? 0} 件`);
      } catch (error: unknown) {
        showErrorToast(`コピー元のスキャンに失敗しました: ${getErrorMessage(error)}`);
        window.srcFiles = [];
        setSrcFiles([]);
        setScanInfo(`スキャン完了 - 元: 0 件 / 先: ${window.destFiles?.length ?? 0} 件`);
      }
      return;
    }

    setDestPath(pathStr);
    setScanInfo('コピー先をスキャン中...');
    try {
      const files = await window.api.scanDirectory(pathStr);
      window.destFiles = files;
      setDestFiles(files);
      setScanInfo(`スキャン完了 - 元: ${window.srcFiles?.length ?? 0} 件 / 先: ${files.length} 件`);
    } catch (error: unknown) {
      showErrorToast(`コピー先のスキャンに失敗しました: ${getErrorMessage(error)}`);
      window.destFiles = [];
      setDestFiles([]);
      setScanInfo(`スキャン完了 - 元: ${window.srcFiles?.length ?? 0} 件 / 先: 0 件`);
    }
  }, []);

  useEffect(() => {
    window.updateDirectory = updateDirectory;
  }, [updateDirectory]);

  return { srcPath, destPath, srcFiles, destFiles, scanInfo, updateDirectory };
};
