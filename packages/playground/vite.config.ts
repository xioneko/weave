import baseConfig from "../../vite.config"
import { visualizer } from "rollup-plugin-visualizer"
import type { UserConfig } from "vite"
import { defineConfig, mergeConfig } from "vite"

export default defineConfig(env => {
  return mergeConfig(baseConfig(env), {
    plugins: [
      {
        apply: "build",
        ...visualizer({ open: true }),
      },
    ],
  } satisfies UserConfig)
})
