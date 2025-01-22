import type { Meta, StoryObj } from '@storybook/vue3'
import TooltipStoryBasic from './TooltipStory.Basic.vue'

export default {
  title: 'Base/Tooltip',
} satisfies Meta

export const Basic: StoryObj = {
  render() {
    return {
      components: { TooltipStoryBasic },
      template: '<TooltipStoryBasic />',
    }
  },
}
