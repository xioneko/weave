<script setup lang="ts">
import { watchPostEffect } from 'vue'

watchPostEffect(() => {
  console.log('child post effect')
})
</script>
<template>
  <div></div>
</template>
