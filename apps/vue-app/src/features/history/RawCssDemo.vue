<script setup lang="ts">
const highlights = ['零构建，直接引入 reset + site.css', 'BEM 命名靠约定减少覆盖链', 'hover/状态写死，改一处全局生效']
</script>

<template>
  <div class="raw-card card card--elevated">
    <div class="card__header">
      <div>
        <p class="card__eyebrow">Raw CSS · BEM</p>
        <h3 class="card__title">全局命名 + 约定</h3>
        <p class="card__desc">不依赖构建，类名即语义；风险是全局污染与覆盖链。</p>
      </div>
      <span class="pill pill--warn">无作用域</span>
    </div>
    <div class="card__body">
      <button class="btn btn--primary">Primary</button>
      <button class="btn btn--ghost">Ghost</button>
    </div>
    <ul class="card__list">
      <li v-for="item in highlights" :key="item" class="card__item">{{ item }}</li>
    </ul>
  </div>
</template>

<style>
/* 故意不使用 scoped，模拟全局 BEM 命名 */
.card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 160ms ease, transform 160ms ease;
}
.card--elevated {
  box-shadow: 0 12px 36px rgba(17, 24, 39, 0.08);
}
.card:hover {
  box-shadow: 0 16px 40px rgba(17, 24, 39, 0.12);
  transform: translateY(-2px);
}
.card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.card__eyebrow {
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #6b7280;
  margin: 0 0 6px;
  text-transform: uppercase;
}
.card__title {
  font-size: 18px;
  margin: 0;
}
.card__desc {
  margin: 6px 0 0;
  color: #4b5563;
}
.card__body {
  display: flex;
  gap: 10px;
}
.btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #111827;
  background: #111827;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 120ms ease, background 140ms ease;
}
.btn:hover {
  transform: translateY(-1px);
}
.btn--primary:hover {
  background: #0f172a;
}
.btn--ghost {
  background: #fff;
  color: #111827;
}
.card__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}
.card__item {
  color: #4b5563;
  font-size: 14px;
  position: relative;
  padding-left: 16px;
}
.card__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #111827;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.pill--warn {
  color: #92400e;
  background: rgba(248, 180, 0, 0.16);
}
</style>
