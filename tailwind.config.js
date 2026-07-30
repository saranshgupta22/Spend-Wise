/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        'cyber-blue': '#00F0FF',
        'emerald-green': '#00FF66',
        glass: 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        hero: ['Inter-Black'],
        thin: ['Inter-Thin'],
      }
    },
  },
  plugins: [],
}
