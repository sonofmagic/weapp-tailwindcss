<script setup lang="ts">
const items = [
  { title: '哈希隔离', desc: 'className 编译期哈希，不担心全局冲突' },
  { title: '变量复用', desc: 'shared variables + modules 组合' },
  { title: 'SSR 友好', desc: '静态 CSS，无运行时注入' },
]
</script>

<template>
  <div :class="$style.card">
    <div :class="$style.header">
      <div>
        <p :class="$style.eyebrow">CSS Modules</p>
        <h3 :class="$style.title">编译期作用域隔离</h3>
        <p :class="$style.desc">类名哈希化，适合组件库；主题切换通过 tokens 管线。</p>
      </div>
      <span :class="$style.badge">[name]__[local]___[hash]</span>
    </div>
    <div :class="$style.grid">
      <div v-for="item in items" :key="item.title" :class="$style.tile">
        <p :class="$style.tileTitle">{{ item.title }}</p>
        <p :class="$style.tileDesc">{{ item.desc }}</p>
      </div>
    </div>
  </div>
</template>

<style module>
.card {
  border: 1px solid color-mix(in srgb, var(--card) 75%, #111827 8%);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--card) 90%, #0ea5e9 4%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 12px 34px color-mix(in srgb, var(--ring) 15%, transparent);
}
.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.eyebrow {
  font-size: 12px;
  letter-spacing: 0.14em;
  color: var(--muted-foreground);
  text-transform: uppercase;
  margin: 0 0 8px;
}
.title {
  margin: 0;
  font-size: 18px;
}
.desc {
  margin: 6px 0 0;
  color: var(--muted-foreground);
}
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: color-mix(in srgb, var(--muted) 92%, #111827 6%);
  color: var(--foreground);
  border: 1px dashed color-mix(in srgb, var(--foreground) 18%, transparent);
}
.grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
.tile {
  background: color-mix(in srgb, var(--card) 96%, #111827 3%);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--border) 80%, var(--foreground) 8%);
}
.tileTitle {
  margin: 0 0 4px;
  font-weight: 600;
}
.tileDesc {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 14px;
}
</style>
