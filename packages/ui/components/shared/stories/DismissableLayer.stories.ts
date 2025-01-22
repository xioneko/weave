import type { Meta, StoryObj } from '@storybook/vue3'
import DismissableLayerStoryNested from './DismissableLayerStory.Nested.vue'
import DismissableLayerStoryBasic from './DismissableLayerStory.Basic.vue'

export default {
  title: 'Utilities/DismissableLayer',
} satisfies Meta

export const Basic: StoryObj = {
  render() {
    return {
      components: { DismissableLayerStoryBasic },
      template: `<DismissableLayerStoryBasic />`,
    }
  },
}

export const Nested: StoryObj = {
  render() {
    return {
      components: { DismissableLayerStoryNested },
      template: `<DismissableLayerStoryNested />`,
    }
  },
}
