import baseConfig from "../../vite.config"
import { visualizer } from "rollup-plugin-visualizer"
import type { UserConfig } from "vite"
import { defineConfig, mergeConfig } from "vite"

export default defineConfig(env => {
  const DEV = env.mode === "development"
  return mergeConfig(baseConfig(env), {
    plugins: [
      {
        apply: "build",
        ...visualizer({ open: true }),
      },
    ],
    base: DEV ? "/" : "/weave/",
  } satisfies UserConfig)
})
