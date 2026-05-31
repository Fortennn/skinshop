/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#05070a',
          900: '#0b0f15',
          800: '#121822',
          700: '#1b2330',
          600: '#263143',
          500: '#384860',
        },
        accent: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#8a2be2',
          pink: '#ff007f',
          gold: '#f39c12',
          covert: '#eb4b4b',
          classified: '#d32ce6',
          restricted: '#8847ff',
          milspec: '#4b69ff',
          industrial: '#5e98d9',
          consumer: '#b0c3d9',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'glow-slow': 'glowPulse 4s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'rotate-glow': 'rotateGlow 8s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { opacity: 0.3, filter: 'drop-shadow(0 0 5px rgba(0, 242, 254, 0.2))' },
          '100%': { opacity: 0.8, filter: 'drop-shadow(0 0 20px rgba(0, 242, 254, 0.6))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        rotateGlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
