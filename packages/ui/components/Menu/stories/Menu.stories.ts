import type { Meta, StoryObj } from '@storybook/vue3'
import MenuStoryBasic from './MenuStory.Basic.vue'

export default {
  title: 'Base/Menu',
} satisfies Meta

export const Basic: StoryObj = {
  render() {
    return {
      components: { MenuStoryBasic },
      template: '<MenuStoryBasic />',
    }
  },
}
