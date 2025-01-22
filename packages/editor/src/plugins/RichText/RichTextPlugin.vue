<script setup lang="ts">
import { useComposerContext } from "#components"
import { usePluginsHostContext } from "#components/PluginsHost.vue"
import InputRule, { type InputRulePluginApi } from "#plugins/InputRule"
import SlashMenu, { type SlashMenuPluginApi } from "#plugins/SlashMenu"
import { inputRules } from "./inputRules"
import { registerRichText } from "./registerRichText"
import { slashMenuItems } from "./slashMenuItems"
import { mergeRegister } from "@lexical/utils"
import { onUnmounted } from "vue"

const { editor } = useComposerContext()
const { registerPluginMountedHook } = usePluginsHostContext()
const cleanupFns: (() => void)[] = []

onUnmounted(
  mergeRegister(
    registerRichText(editor),
    registerPluginMountedHook<SlashMenuPluginApi>(SlashMenu.id, plugin => {
      cleanupFns.push(plugin.registerItems(...slashMenuItems))
    }),
    registerPluginMountedHook<InputRulePluginApi>(InputRule.id, plugin => {
      cleanupFns.push(plugin.registerInputRules(...inputRules))
    }),
    () => cleanupFns.forEach(fn => fn()),
  ),
)
</script>

<template />
