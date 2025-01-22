<script lang="ts">
export function getViewportElement(root: HTMLElement | null | undefined): HTMLElement {
  return (root?.closest("[data-editor-viewport]") as HTMLElement) ?? document.body
}
</script>

<script setup lang="ts"></script>

<template>
  <div
    data-editor-viewport
    :style="{
      position: 'relative',
      overflow: 'auto',
    }"
  >
    <slot />
  </div>
</template>
