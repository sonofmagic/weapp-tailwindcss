import { getCss } from '../helpers/getTwCss'

describe('Arbitrary groups', () => {
  it('group case 0', async () => {
    const { css } =
      await getCss(`<a href="#" class="group block max-w-xs mx-auto rounded-lg p-6 bg-white ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500">
    <div class="flex items-center space-x-3">
      <svg class="h-6 w-6 stroke-sky-500 group-hover:stroke-white" fill="none" viewBox="0 0 24 24"><!-- ... --></svg>
      <h3 class="text-slate-900 group-hover:text-white text-sm font-semibold">New project</h3>
    </div>
    <p class="text-slate-500 group-hover:text-white text-sm">Create a new project from a variety of starting templates.</p>
  </a>`)
    expect(css).toMatchSnapshot()
  })

  it('group case 1', async () => {
    const { css } = await getCss(`<ul role="list">
      {#each people as person}
        <li class="group/item hover:bg-slate-100 ...">
          <img src="{person.imageUrl}" alt="" />
          <div>
            <a href="{person.url}">{person.name}</a>
            <p>{person.title}</p>
          </div>
          <a class="group/edit invisible hover:bg-slate-200 group-hover/item:visible ..." href="tel:{person.phone}">
            <span class="group-hover/edit:text-gray-700 ...">Call</span>
            <svg class="group-hover/edit:translate-x-0.5 group-hover/edit:text-slate-500 ...">
              <!-- ... -->
            </svg>
          </a>
        </li>
      {/each}
    </ul>`)
    expect(css).toMatchSnapshot()
  })

  it('group case 2', async () => {
    const { css } = await getCss(`<div class="group is-published">
    <div class="hidden group-[.is-published]:block">
      Published
    </div>
  </div>`)
    expect(css).toMatchSnapshot()
  })

  it('group case 3', async () => {
    const { css } = await getCss(`<div class="group">
    <div class="group-[:nth-of-type(3)_&]:block">
      <!-- ... -->
    </div>
  </div>`)
    expect(css).toMatchSnapshot()
  })

  it('peer case 0', async () => {
    const { css } = await getCss(`<form>
    <label class="block">
      <span class="block text-sm font-medium text-slate-700">Email</span>
      <input type="email" class="peer ..."/>
      <p class="mt-2 invisible peer-invalid:visible text-pink-600 text-sm">
        Please provide a valid email address.
      </p>
    </label>
  </form>`)
    expect(css).toMatchSnapshot()
  })

  it('peer case 1', async () => {
    const { css } = await getCss(`<fieldset>
    <legend>Published status</legend>
  
    <input id="draft" class="peer/draft" type="radio" name="status" checked />
    <label for="draft" class="peer-checked/draft:text-sky-500">Draft</label>
  
    <input id="published" class="peer/published" type="radio" name="status" />
    <label for="published" class="peer-checked/published:text-sky-500">Published</label>
  
    <div class="hidden peer-checked/draft:block">Drafts are only visible to administrators.</div>
    <div class="hidden peer-checked/published:block">Your post will be publicly visible on your site.</div>
  </fieldset>`)
    expect(css).toMatchSnapshot()
  })

  it('peer case 2', async () => {
    const { css } = await getCss(`<form>
    <label for="email">Email:</label>
    <input id="email" name="email" type="email" class="is-dirty peer" required />
    <div class="peer-[.is-dirty]:peer-required:block hidden">This field is required.</div>
    <!-- ... -->
  </form>`)
    expect(css).toMatchSnapshot()
  })
})
