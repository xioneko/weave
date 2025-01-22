<script setup lang="ts">
import * as Menu from ".."
import * as styles from "./Menu.stories.css"

const { heading = "Submenu", disabled } = defineProps<{
  heading?: string
  disabled?: boolean
}>()
const open = defineModel<boolean>("open", {
  default: false,
})
</script>

<template>
  <Menu.Sub v-model:open="open">
    <Menu.SubTrigger :class="styles.subTrigger" :disabled> {{ heading }} → </Menu.SubTrigger>
    <Teleport to="body">
      <Menu.Transition @enter="Menu.fadeScaleIn" @leave="Menu.fadeScaleOut">
        <Menu.SubContent :class="styles.content" set-transform-origin-css-var>
          <slot />
        </Menu.SubContent>
      </Menu.Transition>
    </Teleport>
  </Menu.Sub>
</template>
