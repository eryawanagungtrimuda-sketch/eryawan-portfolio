import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-display)', 'Belleza', 'Inter', 'ui-sans-serif', 'system-ui'],
        signature: ['var(--font-signature)', 'Great Vibes', 'cursive'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        ink: '#111827',
        sand: '#f4efe7',
        clay: '#b86f52',
        gold: '#ffc400',
        night: '#080807',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(17, 24, 39, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
