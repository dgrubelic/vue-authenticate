import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: 'src/index.js',
      name: 'vue-authenticate-2',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `vue-authenticate.${format}.js`,
    },
  }
})
