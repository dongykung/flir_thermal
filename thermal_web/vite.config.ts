import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Android assets/ 나 file:// 로 로드해도 번들 경로가 깨지지 않도록 상대 경로로 출력
  base: './',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    // 실기기 브라우저/WebView에서 개발 서버에 붙을 수 있도록 LAN 바인딩
    host: true,
    port: Number(process.env.PORT) || 5173,
  },

  build: {
    outDir: 'dist',
    // WebView 디버깅 시 원본 추적용
    sourcemap: true,
    target: 'es2022',
  },
})
