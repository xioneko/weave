<script setup lang="ts">
import { type vDismissableValue, vDismissable } from "../vDismissable"
import { vFocus } from "../vFocus"
import { computed, ref, useTemplateRef } from "vue"

const open = ref(false)
const buttonRef = useTemplateRef("button")
const dismissOnEscape = ref(false)
const dismissOnClickOutside = ref(false)
const dismissOnFocusOutside = ref(false)
const dismissOnBlur = ref(false)
const disabledOutsidePointerEvents = ref(false)

const handleDismiss = computed<vDismissableValue>(() => ({
  disableOutsidePointerEvents: disabledOutsidePointerEvents.value,
  onEscapeKeyDown() {
    if (dismissOnEscape.value) {
      open.value = false
    }
  },
  onPointerDownOutside(element, target) {
    if (!buttonRef.value?.contains(target) && dismissOnClickOutside.value) {
      open.value = false
    }
  },
  onFocusOutside(_, target) {
    if (dismissOnFocusOutside.value) {
      open.value = false
    }
  },
  onBlur() {
    if (dismissOnBlur.value) {
      open.value = false
    }
  },
}))

const handleClick = () => {
  open.value = !open.value
}

const alert = (message: string) => {
  window.alert(message)
}

const focus = (el: HTMLElement) => {
  el.focus()
}
</script>

<template>
  <div style="text-align: center">
    <div :style="{ display: 'inline-block', textAlign: 'left', marginBottom: '20px' }">
      <label :style="{ display: 'block' }">
        <input type="checkbox" v-model="dismissOnEscape" />
        Dismiss on escape?
      </label>

      <label :style="{ display: 'block' }">
        <input type="checkbox" v-model="dismissOnClickOutside" />
        Dismiss on pointer down outside?
      </label>

      <label :style="{ display: 'block' }">
        <input type="checkbox" v-model="dismissOnFocusOutside" />
        Dismiss on focus outside?
      </label>

      <label :style="{ display: 'block' }">
        <input type="checkbox" v-model="dismissOnBlur" />
        Dismiss on blur?
      </label>

      <hr />

      <label :style="{ display: 'block' }">
        <input type="checkbox" v-model="disabledOutsidePointerEvents" />
        Disable outside pointer events?
      </label>
    </div>

    <div style="margin-bottom: 20px">
      <button ref="button" type="button" @click="handleClick">
        {{ open ? "Close" : "Open" }} layer
      </button>
    </div>

    <div
      v-if="open"
      v-dismissable="handleDismiss"
      :style="{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'middle',
        width: 400 + 'px',
        height: 300 + 'px',
        backgroundColor: 'black',
        borderRadius: 10 + 'px',
        marginBottom: 20 + 'px',
      }"
    >
      <input type="text" v-focus="dismissOnBlur" />
    </div>

    <div :style="{ marginBottom: 20 + 'px' }">
      <input
        type="text"
        defaultValue="Use tab key to focus me"
        :style="{ marginRight: 20 + 'px' }"
      />
      <button type="button" @mousedown="alert('Hey')">hey!</button>
    </div>

    <div :style="{ marginBottom: 20 + 'px' }">
      <button type="button" @mouseenter="focus($event.target as HTMLElement)">
        Hover me to focus me
      </button>
    </div>
  </div>
</template>
