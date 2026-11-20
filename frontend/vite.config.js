import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
// Import Chewy font

const stampServiceWorker = () => ({
  name: 'stamp-service-worker',
  writeBundle(options) {
    const outputDirectory = options.dir ? resolve(options.dir) : resolve(process.cwd(), 'dist')
    const serviceWorkerPath = resolve(outputDirectory, 'sw.js')
    const source = readFileSync(serviceWorkerPath, 'utf8')
    writeFileSync(serviceWorkerPath, source.replace('__MEMORA_BUILD_ID__', Date.now().toString()), 'utf8')
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: './', 
  plugins: [react(), tailwindcss(), stampServiceWorker()]
})
