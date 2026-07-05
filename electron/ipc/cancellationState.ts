let cancelling = false;

export const isCancelling = (): boolean => cancelling;

export const setCancelling = (value: boolean): void => {
  cancelling = value;
};
