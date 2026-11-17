import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import aitDevtools from "@apps-in-toss/devtools/unplugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [aitDevtools.vite(), react(), tailwindcss()],
  // .env.local 의 NEXT_PUBLIC_* 값도 클라이언트에 노출 (접두사 없는 비밀 값은 노출되지 않음)
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
