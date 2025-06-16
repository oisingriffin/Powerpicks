/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A148C',
        'primary-dark': '#38006B',
        secondary: '#7B1FA2',
        accent: '#9C27B0',
        background: '#FFFFFF',
        foreground: '#1A1A1A',
        'purple-light': '#E1BEE7',
      },
    },
  },
  plugins: [],
} 