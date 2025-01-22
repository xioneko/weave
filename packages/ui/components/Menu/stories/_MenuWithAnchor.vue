<script setup lang="ts">
import * as Menu from ".."
import * as styles from "./Menu.stories.css"
</script>

<template>
  <Menu.Root open>
    <Menu.Anchor style="display: inline-block" />
    <Teleport to="body">
      <Menu.Content :class="styles.content" align="start">
        <slot />
      </Menu.Content>
    </Teleport>
  </Menu.Root>
</template>
