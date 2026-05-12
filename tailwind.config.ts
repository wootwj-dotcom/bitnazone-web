import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#FF69B4',
          light: '#FFB6D9',
          dark: '#E91E8C',
        },
        purple: {
          DEFAULT: '#9B59B6',
          light: '#D7A8F0',
          dark: '#6C3483',
        },
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFF3A0',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
