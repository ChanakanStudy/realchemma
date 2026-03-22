/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px) translateY(-5px)' },
          '50%': { transform: 'translateX(10px) translateY(5px)' },
          '75%': { transform: 'translateX(-10px) translateY(5px)' },
        },
        shakeVertical: {
          '0%, 100%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-15px)' },
          '50%': { transform: 'translateY(15px)' },
          '75%': { transform: 'translateY(-15px)' },
        },
        nukeShake: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(-20px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(20px, 20px) scale(0.95)' },
          '75%': { transform: 'translate(-20px, 20px) scale(1.05)' },
        },
        throwHand: {
          '0%': { transform: 'translate(30%, 30%) rotate(20deg)', opacity: '0' },
          '20%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'translate(-10%, -10%) rotate(-10deg)', opacity: '1' },
          '100%': { transform: 'translate(30%, 30%) rotate(20deg)', opacity: '0' },
        },
        potionFly: {
          '0%': { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: '1' },
          '40%': { transform: 'translate(-15vw, -15vh) scale(1.2) rotate(180deg)' },
          '80%': { transform: 'translate(-30vw, -25vh) scale(0.6) rotate(360deg)', opacity: '1' },
          '100%': { transform: 'translate(-30vw, -25vh) scale(2)', opacity: '0' },
        },
        explosion: {
          '0%': { transform: 'scale(0.5)', opacity: '1' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        zoomFade: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '20%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        iceShatter: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
          '100%': { opacity: '0', transform: 'scale(1.5)' },
        },
        fireRise: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-50%)' },
        },
        pulseText: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1', textShadow: '0 0 20px #d4af37' },
        },
      },
      animation: {
        shake: 'shake 0.2s ease-in-out infinite',
        shakeVertical: 'shakeVertical 0.1s ease-in-out infinite',
        nukeShake: 'nukeShake 0.1s ease-in-out infinite',
        throwHand: 'throwHand 0.6s ease-out forwards',
        potionFly: 'potionFly 0.6s ease-in forwards',
        explosion: 'explosion 0.3s ease-out forwards',
        zoomFade: 'zoomFade 1s ease-out forwards',
        iceShatter: 'iceShatter 1.5s ease-out forwards',
        fireRise: 'fireRise 2s ease-in forwards',
        pulseText: 'pulseText 2.5s infinite',
      },
    },
  },
  plugins: [],
};
