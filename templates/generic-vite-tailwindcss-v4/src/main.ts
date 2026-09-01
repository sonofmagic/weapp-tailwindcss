import './style.css'

document.querySelector<HTMLMainElement>('#app')!.innerHTML = `
  <section class="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
    <div class="mx-auto max-w-3xl space-y-6">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Generic Vite</p>
      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">Tailwind CSS v4 on the Web</h1>
      <p class="max-w-xl text-lg text-slate-300">A CSS-only weapp-tailwindcss integration for a plain Vite project.</p>
      <button class="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">Try the Web profile</button>
    </div>
  </section>
`
