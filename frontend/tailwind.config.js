/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'ecuavip-blue': '#0052cc',
        'ecuavip-light': '#e6f0ff',
        'ecuavip-dark': '#003380'
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
