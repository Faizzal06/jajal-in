import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#446900',
        'on-primary': '#ffffff',
        'primary-container': '#a3e635',
        'on-primary-container': '#416400',
        secondary: '#555f6f',
        'on-secondary': '#ffffff',
        'secondary-container': '#d6e0f3',
        background: '#f7fbe8',
        surface: '#f7fbe8',
        'surface-dim': '#d8dcca',
        'on-surface': '#191d12',
        'on-surface-variant': '#424936',
        outline: '#727a64',
        'outline-variant': '#c2cab0',
        error: '#ba1a1a',
        'slate-heavy': '#1f2937',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '4px',
        xl: '12px',
        full: '22px',
        input: '12px',
      },
      fontFamily: {
        'headline-xl': ['var(--font-space-grotesk)', 'sans-serif'],
        'headline-lg': ['var(--font-space-grotesk)', 'sans-serif'],
        'headline-md': ['var(--font-space-grotesk)', 'sans-serif'],
        'body-lg': ['var(--font-inter)', 'sans-serif'],
        'body-md': ['var(--font-inter)', 'sans-serif'],
        'label-md': ['var(--font-inter)', 'sans-serif'],
        'label-sm': ['var(--font-inter)', 'sans-serif'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '48px',
        gutter: '20px',
        'margin-mobile': '20px',
        'margin-desktop': '64px',
      },
    },
  },
  plugins: [],
};

export default config;
