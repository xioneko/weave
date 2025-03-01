import baseConfig from "../../vite.config"
import fs from "node:fs"
import { visualizer } from "rollup-plugin-visualizer"
import type { UserConfig } from "vite"
import { defineConfig, mergeConfig } from "vite"

export default defineConfig(env => {
  const DEV = env.mode === "development"

  if (!DEV) {
    const introPath = "./src/assets/introduction.json"
    const intro = fs.readFileSync(introPath, "utf-8")
    // Minify the introduction JSON
    fs.writeFileSync(introPath, JSON.stringify(JSON.parse(intro)))
  }

  return mergeConfig(baseConfig(env), {
    plugins: [
      {
        apply: "build",
        ...visualizer({ open: true }),
      },
    ],
    base: DEV ? "/" : "/weave/",
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (/@codemirror\/(view|state)/.test(id)) {
              return "codemirror"
            } else if (id.includes("@codemirror/language")) {
              return "codemirror-language"
            } else if (id.includes("@codemirror/commands")) {
              return "codemirror-commands"
            } else if (id.includes("@codemirror/autocomplete")) {
              return "codemirror-autocomplete"
            } else if (id.includes("markdown-it")) {
              return "markdown-it"
            } else if (id.includes("lexical")) {
              return "lexical"
            } else if (id.includes("@vue")) {
              return "vue"
            } else {
              const plugin = id.match(/editor\/plugins\/([^/]+)/)
              if (plugin) {
                return `editor-plugin-${plugin[1]}`
              }
            }
          },
        },
      },
    },
  } satisfies UserConfig)
})
