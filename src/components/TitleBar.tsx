import { Box } from '@chakra-ui/react';
import type { CSSProperties } from 'react';
import { layout, zIndices } from '../theme';

// Electronのフレームレスウィンドウをドラッグ移動可能にするための非標準プロパティ（csstypeの型定義に含まれないため拡張する）
// biome-ignore lint/style/useNamingConvention: ブラウザのベンダープレフィックス付きCSSプロパティ名に合わせる必要がある
type DragRegionStyle = CSSProperties & { WebkitAppRegion?: 'drag' | 'no-drag' };
// biome-ignore lint/style/useNamingConvention: 上記の型に合わせたプロパティ名のため
const dragRegionStyle: DragRegionStyle = { WebkitAppRegion: 'drag' };

export const TitleBar = () => (
  <Box
    height={layout.titleBarHeight}
    bg="bgChrome"
    display="flex"
    alignItems="center"
    justifyContent="center"
    borderBottom="sm"
    borderColor="borderDefault"
    position="relative"
    zIndex={zIndices.titleBar}
  >
    <Box position="absolute" inset={0} style={dragRegionStyle} />
    <Box fontSize="xs" fontWeight="semibold" color="textMuted" letterSpacing="wide" pointerEvents="none">
      Action Cam Data Transporter
    </Box>
  </Box>
);
