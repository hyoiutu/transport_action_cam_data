import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage, showErrorToast } from '../utils/errorHandling';

type ProgressState = {
  status: string;
  percent: number;
  file: string;
  active: boolean;
};

const initialProgress: ProgressState = {
  status: '待機中...',
  percent: 0,
  file: '',
  active: false
};

const PERCENTAGE_MULTIPLIER = 100;

type UseCopyOperationParams = {
  srcFiles: FileInfo[];
  destPath: string;
  onCopyFinished: () => void | Promise<void>;
};

export const useCopyOperation = ({ srcFiles, destPath, onCopyFinished }: UseCopyOperationParams) => {
  const [isCopying, setIsCopying] = useState(false);
  const [progress, setProgress] = useState(initialProgress);

  useEffect(() => {
    const unsubscribeProgress = window.api.onCopyProgress((data) => {
      if (data.status !== 'copying') return;
      const percent = Math.round((data.copiedCount / data.totalFiles) * PERCENTAGE_MULTIPLIER);
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

  const canStartCopy = srcFiles.length > 0 && destPath !== '' && !isCopying;

  const startCopy = useCallback(async () => {
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      setProgress((current) => ({
        ...current,
        active: true,
        status: 'エラーが発生しました',
        file: errorMessage
      }));
      showErrorToast(`コピーエラー: ${errorMessage}`);
    } finally {
      setIsCopying(false);
      await onCopyFinished();
    }
  }, [canStartCopy, srcFiles, destPath, onCopyFinished]);

  return { isCopying, progress, canStartCopy, startCopy };
};
