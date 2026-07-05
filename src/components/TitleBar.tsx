import { Box } from '@chakra-ui/react';
import type { CSSProperties } from 'react';

// Electronのフレームレスウィンドウをドラッグ移動可能にするための非標準プロパティ（csstypeの型定義に含まれないため拡張する）
// biome-ignore lint/style/useNamingConvention: ブラウザのベンダープレフィックス付きCSSプロパティ名に合わせる必要がある
type DragRegionStyle = CSSProperties & { WebkitAppRegion?: 'drag' | 'no-drag' };
// biome-ignore lint/style/useNamingConvention: 上記の型に合わせたプロパティ名のため
const dragRegionStyle: DragRegionStyle = { WebkitAppRegion: 'drag' };

export const TitleBar = () => (
  <Box
    height="38px"
    bg="rgba(11, 11, 15, 0.95)"
    display="flex"
    alignItems="center"
    justifyContent="center"
    borderBottom="1px solid"
    borderColor="borderDefault"
    position="relative"
    zIndex={1000}
  >
    <Box position="absolute" inset={0} style={dragRegionStyle} />
    <Box fontSize="13px" fontWeight={600} color="textMuted" letterSpacing="0.5px" pointerEvents="none">
      Action Cam Data Transporter
    </Box>
  </Box>
);
