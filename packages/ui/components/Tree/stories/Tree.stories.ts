import type { Meta, StoryObj } from '@storybook/vue3'
import TreeStoryBasic from './TreeStory.Basic.vue'
import TreeStoryDND from './TreeStory.DND.vue'

export default {
  title: 'Base/Tree',
} satisfies Meta

export const Basic: StoryObj = {
  render() {
    return {
      components: { TreeStoryBasic },
      template: '<TreeStoryBasic />',
    }
  },
}

export const DragAndDrop: StoryObj = {
  render() {
    return {
      components: { TreeStoryDND },
      template: '<TreeStoryDND />',
    }
  },
}
