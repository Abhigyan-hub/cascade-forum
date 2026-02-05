/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cascade Forum Brand Colors
        background: '#0B0B0E',
        primary: {
          DEFAULT: '#7B2CBF',
          light: '#9D4EDD',
        },
        accent: {
          DEFAULT: '#F5C542',
          error: '#B11226',
        },
        text: {
          primary: '#F1F1F1',
          muted: '#A1A1AA',
        },
        border: '#2A2A2E',
        // Status colors
        status: {
          pending: '#F5C542',
          accepted: '#9D4EDD',
          rejected: '#B11226',
        },
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #7B2CBF 0%, #9D4EDD 100%)',
      },
    },
  },
  plugins: [],
}
