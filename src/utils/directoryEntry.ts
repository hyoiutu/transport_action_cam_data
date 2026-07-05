export const isMediaFile = (entry: DirectoryEntry): entry is FileInfo => entry.type !== 'folder';
