<script setup lang="ts">
import Windows from "./WindowControls/Windows.vue"
import * as css from "./WindowTitleBar.css"

const Controls = IS_MAC ? null : Windows
</script>

<template>
  <div data-tauri-drag-region :class="css.titleBar">
    <Controls />
  </div>
</template>
