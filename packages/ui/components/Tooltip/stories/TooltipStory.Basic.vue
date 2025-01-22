<script setup lang="ts">
import { useTooltip } from ".."
import { onMounted, useTemplateRef } from "vue"

const { vTooltip: vTooltipA, toggle: toggleTooltipA } = useTooltip({
  showDelay: 150,
  hideDelay: 50,
  sideOffset: 3,
  showArrow: true,
  onEnter(el) {
    el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
    })
  },
  onLeave(el, done) {
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 200,
    }).onfinish = done
  },
})

const htmlContent = /* html */ `
<div>
  <h3>Cool stuff</h3>
  <ul>
    <li>This is cool</li>
    <li>This too</li>
  </ul>
</div>
`
const { vTooltip: vTooltipB } = useTooltip({
  className: "v-tooltip v-tooltip-b",
  setTransformOrigin: true,
  onEnter(el) {
    el.animate(
      [
        { opacity: 0, transform: "scale(0.9)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      {
        duration: 200,
        easing: "ease-out",
      },
    )
  },
  onLeave(el, done) {
    el.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.9)" },
      ],
      {
        duration: 200,
        easing: "ease-out",
      },
    ).onfinish = done
  },
})

const buttonRef = useTemplateRef("buttonKey")

onMounted(() => {
  window.scrollTo({
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
  })
})

const handleClick = () => {
  toggleTooltipA(buttonRef.value, {
    content: "Clicked!",
    side: "top",
  })
}
</script>

<template>
  <div
    :style="{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '200vw',
      height: '200vh',
      gap: '20px',
    }"
  >
    <button v-tooltip-a="`Tooltip 1`">Default<br /><sub>Tooltip a</sub></button>
    <div
      :style="{
        display: 'flex',
        gap: '20px',
        flexDirection: 'column',
      }"
    >
      <!-- @vue-expect-error: https://github.com/vuejs/core/pull/12605 -->
      <button v-tooltip-a.top="`Tooltip 2`">Top<br /><sub>Tooltip a</sub></button>
      <!-- @vue-expect-error: https://github.com/vuejs/core/pull/12605 -->
      <button v-tooltip-a.bottom="`Tooltip 3`">Bottom<br /><sub>Tooltip a</sub></button>
      <!-- @vue-expect-error: https://github.com/vuejs/core/pull/12605 -->
      <button v-tooltip-a.left="`Tooltip 4`">Left<br /><sub>Tooltip a</sub></button>
      <!-- @vue-expect-error: https://github.com/vuejs/core/pull/12605 -->
      <button v-tooltip-a.right="`Tooltip 5`">Right<br /><sub>Tooltip a</sub></button>
    </div>
    <button ref="buttonKey" @click="handleClick">Click me<br /><sub>Tooltip a</sub></button>
    <button v-tooltip-b="htmlContent">HTML<br /><sub>Tooltip b</sub></button>
  </div>
</template>

<style lang="css" scoped>
sub {
  color: #666;
  font-size: 12px;
}

button {
  padding: 4px 16px;
  width: 100px;
  height: 56px;
}
</style>

<style lang="css">
.v-tooltip {
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: #333;
  padding: 8px;
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
}

.v-tooltip-b {
  .v-tooltip-text {
    padding-inline: 20px;

    li {
      list-style-type: square;
    }
  }
}

.v-tooltip-arrow {
  z-index: 999;
  background-color: #333;
}
</style>
