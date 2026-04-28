import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: '#111827',
        sand: '#f4efe7',
        clay: '#b86f52',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(17, 24, 39, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
