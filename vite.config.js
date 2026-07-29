import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localApiPlugin } from './scripts/vite-local-api.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
