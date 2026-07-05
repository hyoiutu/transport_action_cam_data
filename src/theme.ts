import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// 旧style.cssの:rootで定義していたグラデーション値。
// Chakraのトークン体系にはグラデーション専用カテゴリがないため、CSS文字列としてそのまま公開する。
export const gradients = {
  primary: 'linear-gradient(135deg, #8a2be2, #4a00e0)',
  accent: 'linear-gradient(135deg, #00f2fe, #4facfe)',
  danger: 'linear-gradient(135deg, #ff4b5c, #c02425)'
};

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        bgMain: { value: '#0b0b0f' },
        bgSidebar: { value: 'rgba(18, 18, 26, 0.85)' },
        bgCard: { value: 'rgba(30, 30, 45, 0.6)' },
        bgCardHover: { value: 'rgba(42, 42, 64, 0.8)' },
        borderDefault: { value: 'rgba(255, 255, 255, 0.08)' },
        borderActive: { value: 'rgba(138, 43, 226, 0.4)' },
        primary: { value: '#8a2be2' },
        primaryLight: { value: '#a052ff' },
        accent: { value: '#00f2fe' },
        accentBlue: { value: '#4facfe' },
        danger: { value: '#ff4b5c' },
        textMain: { value: '#f0f0f5' },
        textMuted: { value: '#8e8e9f' }
      },
      fonts: {
        body: { value: "'Outfit', 'Noto Sans JP', sans-serif" },
        heading: { value: "'Outfit', 'Noto Sans JP', sans-serif" }
      }
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
      width: '8px',
      height: '8px'
    },
    '::-webkit-scrollbar-track': {
      background: 'rgba(0, 0, 0, 0.05)'
    },
    '::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.15)',
      borderRadius: '4px'
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(255, 255, 255, 0.25)'
    }
  }
});

export const system = createSystem(defaultConfig, config);
