<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as Popper from '..'
import * as styles from './Popper.stories.css'
onMounted(() => {
  window.scrollTo({
    left: window.innerWidth / 2,
    top: window.innerHeight / 2,
  })
})

const open = ref(false)
const handleClick = () => {
  open.value = !open.value
}
const hasCustomArrow = ref(true)
const toggleCustomArrow = () => {
  open.value = false
  hasCustomArrow.value = !hasCustomArrow.value
}
</script>

<template>
  <div :style="{ display: 'grid', placeContent: 'center', height: '200vh', width: '200vw' }">
    <button @click="toggleCustomArrow">
      {{ hasCustomArrow ? 'Use default arrow' : 'Use custom arrow' }}
    </button>
    <br />
    <Popper.Root>
      <Popper.Anchor :class="styles.anchor()" @click="handleClick">open</Popper.Anchor>
      <Popper.Content v-if="open" :class="styles.content()" :side-offset="5">
        <button type="button" @click="handleClick">Close</button>
        <Popper.Arrow :class="styles.arrow()" :width="20" :height="10" :as-child="hasCustomArrow">
          <div
            v-if="hasCustomArrow"
            :style="{
              width: '20px',
              height: '10px',
              borderBottomLeftRadius: '10px',
              borderBottomRightRadius: '10px',
              backgroundColor: 'tomato',
            }"
          />
        </Popper.Arrow>
      </Popper.Content>
    </Popper.Root>
  </div>
</template>
