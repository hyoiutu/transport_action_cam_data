import type { IpcMainInvokeEvent } from 'electron';
import { setCancelling } from './cancellationState.js';

export const cancelCopyHandler = (_event: IpcMainInvokeEvent): boolean => {
  setCancelling(true);
  return true;
};
