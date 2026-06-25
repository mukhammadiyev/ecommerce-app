import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind plaginini shu yerga qo'shdik
  ],
  resolve: {
    alias: {
      // 🔥 Bu qator xohlagan joyingizdan @images ishlatishga ruxsat beradi
      '@images': path.resolve(__dirname, './src/assets/images'), 
      // Bonus: Agar butun src papkani ham qisqartirmoqchi bo'lsangiz:
      '@': path.resolve(__dirname, './src'), 
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // <-- Backend aynan shu yerga yo'naltiriladi
        changeOrigin: true,
        secure: false,
      }
    }
  }
})