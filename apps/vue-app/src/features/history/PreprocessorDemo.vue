<script setup lang="ts">
const modifiers = ['@use tokens', 'mixin 复用阴影/圆角', '嵌套 BEM，仍是全局']
</script>

<template>
  <div class="pre-card">
    <div class="pre-card__header">
      <div>
        <p class="pre-card__eyebrow">Sass / Less</p>
        <h3 class="pre-card__title">预处理器：变量 + 混入</h3>
        <p class="pre-card__desc">编译期复用、快速主题切换，但依旧是全局作用域。</p>
      </div>
      <span class="pre-card__badge">modifyVars / @use</span>
    </div>
    <div class="pre-card__body">
      <div class="pre-card__pill">多主题</div>
      <div class="pre-card__pill pre-card__pill--success">混入复用</div>
    </div>
    <ul class="pre-card__list">
      <li v-for="item in modifiers" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use './styles/tokens' as *;

.pre-card {
  @include surface();
  background: linear-gradient(135deg, #ffffff, #f8fafc 40%, #ecfeff);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  &__eyebrow {
    @include eyebrow;
    margin: 0 0 8px;
  }

  &__title {
    margin: 0;
    font-size: 18px;
  }

  &__desc {
    margin: 6px 0 0;
    color: $muted;
  }

  &__body {
    display: flex;
    gap: 8px;
  }

  &__pill {
    @include badge('primary');
    box-shadow: 0 12px 30px $primary-glow;

    &--success {
      @include badge('success');
      box-shadow: 0 10px 24px rgba(16, 185, 129, 0.18);
    }
  }

  &__list {
    margin: 0;
    padding: 0;
    display: grid;
    gap: 6px;
    list-style: none;

    li {
      color: $muted;
      font-size: 14px;
      padding-left: 16px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 8px;
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: $primary;
      }
    }
  }
}
</style>
