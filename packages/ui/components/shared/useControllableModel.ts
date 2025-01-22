import { computed, nextTick, ref, watch, type Ref } from "vue"

type UseControllableModelOptions<T> = {
  /**
   * `T` can be `null` but not `undefined`
   */
  value: () => T | undefined
  defaultValue: T
  onChange: (value: T) => void
  deep?: boolean | number
}

/**
 * Compared to `defineModel`, this function can create reactive modelValue
 * initialized by prop or attribute, and can emit update event when modelValue's
 * nested properties are changed.
 */
export function useControllableModel<T>({
  value,
  defaultValue,
  onChange,
  deep = false,
}: UseControllableModelOptions<T>): Ref<T> {
  let isUpdating = false
  const prop = value()
  if (prop !== undefined) {
    // When the prop is provided, the modelValue is fully controlled
    // Note that the prop's value can never be `undefined` after then
    return computed({
      get: () => value() as T,
      set: value => onChange(value),
    })
  } else {
    const model = ref(defaultValue) as Ref<T>

    watch(value, value => {
      if (value !== undefined) {
        isUpdating = true
        model.value = value
        nextTick(() => (isUpdating = false))
      }
    })

    watch(
      model,
      value => {
        // updates from value prop should not trigger onChange
        if (!isUpdating) onChange(value)
      },
      { deep },
    )

    return model
  }
}
