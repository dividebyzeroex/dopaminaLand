/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#05010d',
        surface: '#0f0817',
        'surface-light': '#1b0f27',
        'surface-lighter': '#261536',
        neon: '#ccff00',
        'neon-light': '#d9ff33',
        purple: '#a64aff',
        'neon-green': '#00ff66',
        pop: '#ff3366',
        muted: '#8b8496',
        border: '#2a1b3d',
        foreground: '#f8f9fa',
        card: '#120a1c',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
