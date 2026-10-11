import { defineConfig } from 'vite';
export default defineConfig({ base: process.env.PAGES_BASE_PATH || '/', server: { host: '127.0.0.1', port: 4187, strictPort: true }, build: { chunkSizeWarningLimit: 1200, rollupOptions: { output: { manualChunks: { three: ['three'], charts: ['echarts'] } } } } });
