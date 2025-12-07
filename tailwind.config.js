export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 
          500: '#22c55e', 
          600: '#16a34a' 
        },
        dark: {
          50: '#18181b', 
          100: '#27272a', 
          200: '#3f3f46',
          300: '#52525b', 
          500: '#a1a1aa', 
          600: '#d4d4d8', 
          900: '#fafafa',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
