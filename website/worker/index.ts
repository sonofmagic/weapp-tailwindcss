export default {
  async fetch(request, env) {
    const file = await env.ASSETS.fetch(request)
    return file
  },
} satisfies ExportedHandler<CloudflareBindings>
