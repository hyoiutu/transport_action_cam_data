declare module 'exif-parser' {
  type ExifTags = {
    // biome-ignore lint/style/useNamingConvention: exif-parserが実際に返すタグ名（PascalCase）に合わせる必要がある
    DateTimeOriginal?: number;
    [key: string]: unknown;
  };

  type ExifParserInstance = {
    parse: () => { tags: ExifTags };
  };

  const exifParser: {
    create: (buffer: Buffer) => ExifParserInstance;
  };

  // biome-ignore lint/style/noDefaultExport: exif-parser（CJS）の実際のmodule.exports形状に合わせた型宣言のため
  export default exifParser;
}
