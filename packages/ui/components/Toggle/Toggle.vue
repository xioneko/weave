<script lang="ts">
export interface ToggleProps {
  modelValue?: boolean
  defaultValue?: boolean
  disabled?: boolean
}

interface ToggleEmits {
  "update:modelValue": [value: boolean]
}
</script>

<script setup lang="ts">
import { useControllableModel } from "../shared/useControllableModel"
import el from "../shared/polymorphic"

const {
  modelValue: modelValueProp = undefined,
  defaultValue,
  disabled,
} = defineProps<ToggleProps>()

const emit = defineEmits<ToggleEmits>()

const modelValue = useControllableModel({
  value: () => modelValueProp,
  defaultValue,
  onChange: value => emit("update:modelValue", value),
})

const handleClick = () => {
  modelValue.value = !modelValue.value
}
</script>

<template>
  <el.button
    type="button"
    :data-state="modelValue ? 'on' : 'off'"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </el.button>
</template>
