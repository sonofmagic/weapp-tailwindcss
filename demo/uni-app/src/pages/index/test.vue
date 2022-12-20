<template>
    <div :class="className">
        className
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        className: [String]
    }
})
</script>

<style lang="scss" scoped>

</style>