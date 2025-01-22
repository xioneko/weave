import type { Meta, StoryObj } from '@storybook/vue3'
import PopperStoryBasic from './PopperStory.Basic.vue'

export default {
  title: 'Base/Popper',
} satisfies Meta

export const Basic: StoryObj = {
  render() {
    return {
      components: { PopperStoryBasic },
      template: '<PopperStoryBasic />',
    }
  },
}
