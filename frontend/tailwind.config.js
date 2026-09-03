/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006948',
          emerald: '#059669',
          light: '#10b981',
          container: '#00855d',
          'on-container': '#f5fff7',
          fixed: '#85f8c4',
          'fixed-dim': '#68dba9',
        },
        secondary: {
          DEFAULT: '#2b6954',
          container: '#adedd3',
          'on-container': '#306d58',
          'fixed': '#b0f0d6',
          'fixed-dim': '#95d3ba',
        },
        tertiary: {
          DEFAULT: '#006194',
          container: '#007bb9',
          'on-container': '#fdfcff',
          'fixed': '#cce5ff',
          'fixed-dim': '#93ccff',
        },
        surface: {
          DEFAULT: '#faf8ff',
          dim: '#d2d9f4',
          bright: '#faf8ff',
          'container-lowest': '#ffffff',
          'container-low': '#f2f3ff',
          container: '#eaedff',
          'container-high': '#e2e7ff',
          'container-highest': '#dae2fd',
        },
        'on-surface': '#131b2e',
        'on-surface-variant': '#3d4a42',
        background: '#faf8ff',
        'on-background': '#131b2e',
        outline: '#6d7a72',
        'outline-variant': '#bccac0',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 105, 72, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
