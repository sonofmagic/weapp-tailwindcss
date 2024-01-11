<template>
  <div>
    <rich-text :nodes="nodes"></rich-text>
  </div>
</template>

<script lang="ts" setup>
import { html } from './typography.js'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'

const s = new MagicString(`<article class="prose max-w-none tracking-widest text-justify leading-loose text-xl text-black my-4">${html}</article>`)
let tagName = undefined
let hasClassAttr = false
let tagOpenIndex = undefined
const parser = new Parser({
  onopentagname(name) {
    tagName = name
    hasClassAttr = false
    tagOpenIndex = parser.endIndex
  },
  onattribute(name, value, quote) {
    if (name === 'class') {
      const str = s.slice(parser.startIndex,parser.endIndex)
      console.log(str)
      hasClassAttr = true
      // s.update()
    }
  },
  onclosetag(name, isImplied) {
    tagName = undefined
    if(!hasClassAttr){

    }
  },
})



parser.write(s.original)
parser.end()
const nodes = s.toString()
</script>

<style lang="scss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@config "./tailwind.config.js";

.prose {
  .p {
    color: red;
  }
}
</style>