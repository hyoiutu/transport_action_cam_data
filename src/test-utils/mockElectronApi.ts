import { vi } from 'vitest';

export const createMockElectronApi = () => {
  let progressCallback: ((data: CopyProgressData) => void) | null = null;
  let errorCallback: ((data: CopyErrorData) => void) | null = null;

  const api: Window['api'] = {
    selectDirectory: vi.fn(),
    scanDirectory: vi.fn(),
    startCopy: vi.fn(),
    cancelCopy: vi.fn(),
    onCopyProgress: vi.fn((callback: (data: CopyProgressData) => void) => {
      progressCallback = callback;
      return vi.fn();
    }),
    onCopyError: vi.fn((callback: (data: CopyErrorData) => void) => {
      errorCallback = callback;
      return vi.fn();
    })
  };

  return {
    api,
    emitProgress: (data: CopyProgressData) => progressCallback?.(data),
    emitError: (data: CopyErrorData) => errorCallback?.(data)
  };
};
