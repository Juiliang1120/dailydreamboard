import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // 🌟 核心修正：手動加上空的 plugins 陣列，讓 Wrangler 可以順利識別並注入設定
    plugins: [], 
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
