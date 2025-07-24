import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vite.dev/config/
const env=loadEnv('',process.cwd(),'');
const {QYANI_COMPONENTS_PATH}=env
console.log(`QYANI_COMPONENTS_PATH is ${QYANI_COMPONENTS_PATH}`)
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 'qyani-components': "F:/eclipse/worakjava/qyani-components/src/index.ts"
    }
  }
})
