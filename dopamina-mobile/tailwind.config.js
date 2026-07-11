/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#09090b',
        neon: '#7c3aed',
        'neon-light': '#8b5cf6',
        purple: '#ccff00',
        'purple-light': '#d9ff33',
        cyan: '#06b6d4',
        'neon-green': '#10b981',
        pop: '#f59e0b',
        surface: '#f4f4f5',
        'surface-light': '#e4e4e7',
        'surface-lighter': '#d4d4d8',
        card: '#ffffff',
        'card-hover': '#fafafa',
        border: 'rgba(0, 0, 0, 0.1)',
        muted: 'rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
