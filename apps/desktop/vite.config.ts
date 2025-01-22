import baseConfig from "../../vite.config"
import { resolve } from "path"
import { defineConfig, mergeConfig, type UserConfig } from "vite"

export default defineConfig(env => {
  return mergeConfig(baseConfig(env), {
    server: {
      port: 5273,
      strictPort: true,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
    define: {
      IS_MAC: process.platform === "darwin",
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      minify: false,
    },
  } satisfies UserConfig)
})
