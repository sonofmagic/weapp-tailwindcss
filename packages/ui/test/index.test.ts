import { mount } from '@vue/test-utils'
import HelloWorld from '../lib/HelloWorld.vue'

it('displays message', () => {
  const wrapper = mount(HelloWorld, {
    props: {
      msg: 'Hello world',
    },
  })

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain('Hello world')
})
