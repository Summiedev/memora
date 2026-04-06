import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// Import Chewy font

// https://vite.dev/config/
export default defineConfig({
  base: './', 
  plugins: [react(), tailwindcss()]
})