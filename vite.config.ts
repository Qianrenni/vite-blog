import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const { QYANI_COMPONENTS_PATH } = env;
  console.log(`QYANI_COMPONENTS_PATH=${QYANI_COMPONENTS_PATH}`);
  return {
    plugins: [vue()],
    server: {
      port: 8080,
      host: "0.0.0.0",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        ...(QYANI_COMPONENTS_PATH && {
          "qyani-components": path.resolve(__dirname, QYANI_COMPONENTS_PATH),
        }),
      },
    },
  };
});
