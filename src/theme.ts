import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// 色: 意味を持たせた名前で管理し、むやみに種類を増やさない（メイン/サブ/エラー等の役割ごとに1系統ずつ）
const COLORS = {
  // ブランド・アクション系（メイン）
  brandPrimary: '#8a2be2',
  brandPrimaryHover: '#a052ff',
  brandPrimaryMuted: 'rgba(138, 43, 226, 0.15)',
  brandPrimaryDark: '#4a00e0',

  // エラー・キャンセル系
  danger: '#ff4b5c',
  dangerDark: '#c02425',

  // メディア種別バッジ（サブ）
  mediaVideoAccent: '#00f2fe',
  mediaImageAccent: '#4facfe',

  // テキスト
  textMain: '#f0f0f5',
  textMuted: '#8e8e9f',
  textInverse: '#ffffff',

  // 背景（面）
  bgMain: '#0b0b0f',
  bgChrome: 'rgba(13, 13, 18, 0.9)',
  bgSidebar: 'rgba(18, 18, 26, 0.85)',
  bgSurface: 'rgba(30, 30, 45, 0.6)',
  bgSurfaceHover: 'rgba(42, 42, 64, 0.8)',
  bgSurfaceSolid: '#12121a',
  bgSurfaceDisabled: '#252535',
  bgMedia: '#000000',

  // ボーダー
  borderDefault: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(138, 43, 226, 0.4)',

  // オーバーレイ（白ベース: ホバー等の「浮き上がり」表現。段階を増やしすぎないよう4段階に統一）
  overlaySubtle: 'rgba(255, 255, 255, 0.02)',
  overlayWeak: 'rgba(255, 255, 255, 0.05)',
  overlayMedium: 'rgba(255, 255, 255, 0.15)',
  overlayStrong: 'rgba(255, 255, 255, 0.25)',

  // スクリム（黒ベース: 影・背景の「沈み込み」表現。同様に4段階に統一）
  scrimWeak: 'rgba(0, 0, 0, 0.05)',
  scrimMedium: 'rgba(0, 0, 0, 0.2)',
  scrimStrong: 'rgba(0, 0, 0, 0.6)',
  scrimHeavy: 'rgba(0, 0, 0, 0.8)'
} as const;

// グラデーション（ボタン・ロゴ等で使う組み合わせをパターン化）
export const gradients = {
  primary: `linear-gradient(135deg, ${COLORS.brandPrimary}, ${COLORS.brandPrimaryDark})`,
  accent: `linear-gradient(135deg, ${COLORS.mediaVideoAccent}, ${COLORS.mediaImageAccent})`,
  danger: `linear-gradient(135deg, ${COLORS.danger}, ${COLORS.dangerDark})`
} as const;

// 影のパターン（同じ組み合わせを個別のコンポーネントで書き直さない）
const SHADOWS = {
  brandGlow: '0 4px 15px rgba(138, 43, 226, 0.3)',
  brandGlowStrong: '0 6px 20px rgba(138, 43, 226, 0.5)',
  dangerGlow: '0 4px 15px rgba(255, 75, 92, 0.3)',
  dangerGlowStrong: '0 6px 20px rgba(255, 75, 92, 0.5)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.2)',
  modal: '0 24px 60px rgba(0, 0, 0, 0.8)'
} as const;

// z-index: Chakraの標準トークンはこのアプリの重なり構造と意味が合わないため、独自に少数だけ定義する
export const zIndices = {
  sidebar: 10,
  titleBar: 1000,
  closeButton: 20
} as const;

// アイコンサイズ（lucide-reactのsize propは4pxの倍数に統一したパターンから選ぶ）
export const iconSizes = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 48
} as const;

// Chakraの標準スケールに一致する値が無いアプリ固有の固定寸法（いずれも4pxの倍数）
export const layout = {
  // Chakraのsizeトークン"10"(=40px)と同じ値。calc()内で文字列展開するため、pxの生値としても公開する
  titleBarHeight: '40px',
  sidebarWidth: '340px',
  modalMaxWidth: '800px'
} as const;

const config = defineConfig({
  theme: {
    tokens: {
      colors: Object.fromEntries(Object.entries(COLORS).map(([name, value]) => [name, { value }])),
      fonts: {
        body: { value: "'Outfit', 'Noto Sans JP', sans-serif" },
        heading: { value: "'Outfit', 'Noto Sans JP', sans-serif" }
      },
      shadows: Object.fromEntries(Object.entries(SHADOWS).map(([name, value]) => [name, { value }]))
    }
  },
  globalCss: {
    '*': {
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      userSelect: 'none'
    },
    body: {
      fontFamily: 'body',
      backgroundColor: 'bgMain',
      color: 'textMain',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    '::-webkit-scrollbar': {
      width: '2',
      height: '2'
    },
    '::-webkit-scrollbar-track': {
      background: 'scrimWeak'
    },
    '::-webkit-scrollbar-thumb': {
      background: 'overlayMedium',
      borderRadius: 'sm'
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: 'overlayStrong'
    }
  }
});

export const system = createSystem(defaultConfig, config);
