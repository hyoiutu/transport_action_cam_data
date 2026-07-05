export const getErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export const showErrorToast = (message: string): void => {
  console.error(message);
  alert(message);
};
