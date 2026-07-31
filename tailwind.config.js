/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#DEDBC8',     // warm cream — primary text & accents
        sic:     '#1428A0',     // Samsung blue — brand accent
        siccyan: '#00A9E0',     // cyan — success / progress
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
      },
    },
  },
  plugins: [],
}
