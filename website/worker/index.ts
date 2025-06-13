export default {
  fetch() {
    return new Response('Hello World!')
  },
} satisfies ExportedHandler<unknown>
