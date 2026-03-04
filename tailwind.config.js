/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          DEFAULT: '#f54900',
          dark:    '#c73b00',
          light:   '#fff3ee',
        },
        // Sidebar / dark surface
        sidebar: {
          bg:      '#0f172b',
          border:  '#1d293d',
          hover:   '#1d293d',
          active:  '#f54900',
          text:    '#cad5e2',
          muted:   '#62748e',
        },
        // Main surface
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f8fafc',
          subtle:  '#f1f5f9',
        },
        // Text
        ink: {
          DEFAULT: '#0f172b',
          secondary: '#314158',
          muted:     '#45556c',
          subtle:    '#62748e',
          ghost:     '#90a1b9',
        },
        // Border
        border: {
          DEFAULT: '#e2e8f0',
          light:   '#f1f5f9',
        },
        // Status colours
        status: {
          blue:       '#1447e6',
          'blue-bg':  '#eff6ff',
          'blue-border': '#dbeafe',
          green:      '#007a55',
          'green-bg': '#ecfdf5',
          'green-border': '#d0fae5',
          orange:     '#ca3500',
          'orange-bg':'#fff7ed',
          red:        '#c10007',
          'red-bg':   '#fef2f2',
          'red-border':'#ffe2e2',
          yellow:     '#fe9a00',
          gray:       '#45556c',
          'gray-bg':  '#f1f5f9',
          'gray-border':'#e2e8f0',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'Arial', 'sans-serif'],
        mono:  ['Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        card:   '0px 1px 3px 0px rgba(0,0,0,0.10), 0px 1px 2px 0px rgba(0,0,0,0.10)',
        'card-hover': '0px 4px 12px 0px rgba(0,0,0,0.12)',
        sidebar:'0px 20px 25px 0px rgba(0,0,0,0.10), 0px 8px 10px 0px rgba(0,0,0,0.10)',
        nav:    '0px 10px 15px 0px rgba(126,42,12,0.20), 0px 4px 6px 0px rgba(126,42,12,0.20)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        card:    '0.875rem',
        btn:     '0.625rem',
        pill:    '9999px',
      },
      width: {
        sidebar: '256px',
      },
      height: {
        header: '61px',
      },
      transitionProperty: {
        width: 'width',
        left: 'left',
      },
    },
  },
  plugins: [],
}