import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import basicSsl from "@vitejs/plugin-basic-ssl"
import vue from "@vitejs/plugin-vue"
import Icons from "unplugin-icons/vite"
import { defineConfig } from "vite"

export default defineConfig(() => {
  return {
    plugins: [basicSsl(), vue(), vanillaExtractPlugin(), Icons()],
    build: {
      target: ["chrome126", "edge127", "firefox128", "safari17.5"],
    },
  }
})
