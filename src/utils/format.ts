const BYTES_PER_UNIT = 1024;
const DEFAULT_DECIMALS = 2;

export const formatBytes = (bytes: number, decimals = DEFAULT_DECIMALS): string => {
  if (bytes === 0) return '0 Bytes';

  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_UNIT));

  return `${parseFloat((bytes / Math.pow(BYTES_PER_UNIT, i)).toFixed(dm))} ${sizes[i]}`;
};
