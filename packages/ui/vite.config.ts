import type { UserConfig } from "vite"
import baseConfig from "../../vite.config"
import { defineConfig, mergeConfig } from "vite"

export default defineConfig(env => {
  return mergeConfig(baseConfig(env), {
  } satisfies UserConfig)
})