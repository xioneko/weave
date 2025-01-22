<script setup lang="ts">
import { useComposerContext } from "#components"
import { usePluginsHostContext } from "#components/PluginsHost.vue"
import SlashMenu, { SlashMenuPluginApi } from "#plugins/SlashMenu"
import { $getBlockElementNodeAtPoint, $tryInsertBlock } from "#shared/selection.ts"
import { DROP_PASTE_FILE_COMMAND } from "../RichText/registerRichText"
import { $createImageBlockNode } from "./ImageBlockNode"
import { mergeRegister } from "@lexical/utils"
import { Image } from "@weave/ui/icons"
import { $isParagraphNode, COMMAND_PRIORITY_EDITOR } from "lexical"
import { onUnmounted } from "vue"

const { editor } = useComposerContext()
const { registerPluginMountedHook } = usePluginsHostContext()

let cleanup: (() => void) | undefined
onUnmounted(
  mergeRegister(
    registerPluginMountedHook<SlashMenuPluginApi>(SlashMenu.id, plugin => {
      cleanup = plugin.registerItems({
        id: "image",
        title: "Image",
        icon: Image,
        action(editor, selection) {
          const fileInput = document.createElement("input")
          fileInput.type = "file"
          fileInput.accept = "image/*"
          fileInput.onchange = () => {
            const file = fileInput.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = () => {
                const url = reader.result as string
                editor.update(() => {
                  const imageBlock = $createImageBlockNode(url)
                  const block = $getBlockElementNodeAtPoint(selection.anchor)
                  if (block) {
                    if (block.isEmpty() && $isParagraphNode(block)) {
                      block.replace(imageBlock)
                    } else {
                      block.insertAfter(imageBlock)
                    }
                    imageBlock.selectStart()
                  }
                })
              }
              reader.readAsDataURL(file)
            }
          }
          fileInput.click()
        },
      })
    }),
    editor.registerCommand(
      DROP_PASTE_FILE_COMMAND,
      files => {
        for (let i = 0; i < files.length; ++i) {
          const file = files[i]
          if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file)
            const image = $createImageBlockNode(url)
            $tryInsertBlock(image)
            image.selectStart()
          }
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    () => cleanup?.(),
  ),
)
</script>

<template></template>
