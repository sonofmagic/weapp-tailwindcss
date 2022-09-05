<template>
  <view>
    <div class="child:ring-white">
      <p>I have a white ring.</p>
    </div>

    <div class="child-p:ring-white hover:child-p:border">
      <p>I have a white ring, and a border on hover.</p>
      <b>I am ignored!</b>
    </div>

    <div class="heir-p:ring-white hover:descendant-p:shadow">
      <div>
        <p>I have a white ring...</p>
      </div>
      <div>
        <p>And a shadow on hover!</p>
        <b>I am not a `p`, so am ignored.</b>
      </div>
    </div>

    <div>
      <p class="twin:ring-white hover:twin:shadow">
        I have a white ring & shadow on hover
      </p>
      <p>I am his twin, so have the same!</p>
    </div>

    <div class="child:shadow">
      <p>Shadow</p>
      <p class="drop-shadow-none">No Shadow</p>
    </div>

    <div class="child:shadow">
      <p>Shadow</p>
      <p class="not-child">No Shadow</p>
    </div>

    <div class="child-['.child']:shadow">
      <p class="child">Shadow</p>
      <p>No Shadow</p>
    </div>

    <div class="child-p:shadow">
      <p>Shadow</p>
      <a>No Shadow</a>
    </div>
  </view>
</template>

<script setup lang="ts">

</script>

<style scoped>
</style>