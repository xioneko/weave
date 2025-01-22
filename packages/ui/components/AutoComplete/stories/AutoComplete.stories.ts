import { type StoryObj } from '@storybook/vue3'
import AutoCompleteBasic from './AutoComplete.Basic.vue'
import AutoCompleteWithGroup from './AutoComplete.WithGroup.vue'
export default {
  title: 'Base/AutoComplete',
}

export const Basic: StoryObj = {
  render: () => ({
    components: { AutoCompleteBasic },
    template: '<AutoCompleteBasic />',
  }),
}

export const WithGroup: StoryObj = {
  render: () => ({
    components: { AutoCompleteWithGroup },
    template: '<AutoCompleteWithGroup />',
  }),
}
