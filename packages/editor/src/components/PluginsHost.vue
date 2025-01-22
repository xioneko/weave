<script lang="ts">
type CleanupFn = () => void
type PluginHook<T> = (plugin: T) => CleanupFn | void
type CreatePluginHook = <T = unknown>(pluginId: PluginId, hook: PluginHook<T>) => CleanupFn
type PluginHooksMap = Map<PluginId, Map<PluginHook<any>, CleanupFn | void>>

interface PluginsHostContextValue {
  registerPluginMountedHook: CreatePluginHook
}

const PluginsHostContext = Symbol("PluginsHostContext") as InjectionKey<PluginsHostContextValue>

export const usePluginsHostContext = () => {
  const context = inject(PluginsHostContext)
  if (!context) {
    throw new Error("usePluginsHostContext must be used within a EditorPlugin Component")
  }
  return context
}
</script>

<script setup lang="ts">
import { EditorPlugin, type PluginId } from "#core/types.ts"
import { getOrPut } from "#shared/utils.ts"
import { FunctionalComponent, InjectionKey, h, inject, nextTick, provide } from "vue"

const { plugins } = defineProps<{ plugins: EditorPlugin[] }>()
defineOptions({
  inheritAttrs: false,
})

const pluginInstances = new Map<PluginId, any>()
const mountedHooks: PluginHooksMap = new Map()

const registerPluginMountedHook: CreatePluginHook = <T = unknown,>(
  pluginId: string,
  hook: PluginHook<T>,
): CleanupFn => {
  // console.log("registerPluginMountedHook", pluginId)
  const hooks = getOrPut(mountedHooks, pluginId, () => new Map())

  const instance = pluginInstances.get(pluginId)
  if (instance) {
    // When hmr, the `setup` function will be called before the `unmounted` hook.
    // There may be some side effects to be cleaned up before re-registering the hook.
    nextTick(() => {
      const cleanup = hook(instance)
      hooks.set(hook, cleanup)
    })
  } else {
    hooks.set(hook, undefined)
  }

  return () => {
    hooks.delete(hook)
  }
}

function triggerHooks(hooksMap: PluginHooksMap, pluginId: PluginId, instance: any) {
  const hooks = hooksMap.get(pluginId)
  if (hooks) {
    hooks.forEach((_, hook) => {
      const cleanup = hook(instance)
      hooks.set(hook, cleanup)
    })
  }
}

function cleanupHooks(hooksMap: PluginHooksMap, pluginId: PluginId) {
  const hooks = hooksMap.get(pluginId)
  if (hooks) {
    hooks.forEach((cleanup, hook) => {
      cleanup?.()
      hooks.set(hook, undefined)
    })
  }
}

const PluginInstance: FunctionalComponent<{ plugin: EditorPlugin }> = ({ plugin }) => {
  return h(plugin.component, {
    ref: (instance: unknown) => {
      pluginInstances.set(plugin.id, instance)
      if (instance) {
        // If not using nextTick, and the hook modifies the plugin instance's state,
        // the ref function will be called unexpectedly with the same argument when hmr.
        nextTick(() => {
          // console.log("Load plugin", plugin.id)
          triggerHooks(mountedHooks, plugin.id, instance)
        })
      } else {
        // console.log("Unload plugin", plugin.id)
        cleanupHooks(mountedHooks, plugin.id)
      }
    },
  })
}

provide(PluginsHostContext, { registerPluginMountedHook })
</script>

<template>
  <PluginInstance v-for="plugin of plugins" :plugin :key="plugin.id" />
</template>
