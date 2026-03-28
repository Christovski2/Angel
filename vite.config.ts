import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Настройка для GitHub Pages
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/Angel/', // Это самое важное, чтобы ссылки на картинки и стили работали
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
