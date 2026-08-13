/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#f6f0e6', 50: '#fbf7f0', 100: '#f6f0e6', 200: '#eadfcb' },
        ink: {
          50: '#f4f1ec', 100: '#e4ddd2', 200: '#cbbfae', 300: '#aa9a84',
          400: '#7f6f5c', 500: '#5d5143', 600: '#43392f', 700: '#2f2822',
          800: '#1f1a16', 900: '#161310', 950: '#0d0b09',
        },
        moss: {
          50: '#eef4ee', 100: '#d5e4d5', 200: '#adc9ad', 400: '#5a8a5a',
          500: '#3d5a3d', 600: '#2d452d', 700: '#223422', 800: '#182518',
        },
        clay: { 400: '#d47a4a', 500: '#c45c26', 600: '#a3481b', 700: '#7d3616' },
      },
      fontFamily: {
        sans: ['"Figtree"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,19,16,0.05), 0 12px 32px rgba(22,19,16,0.06)',
      },
    },
  },
  plugins: [],
};
