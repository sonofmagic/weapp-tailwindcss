<template>
    <div :class="[{ popup: !maxFull }, className, { 'rounded-t-lg !w-full': type == 'bottom' && !className }]">
        issue134
    </div>
</template>

<script>
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/134
export default {
    data() {
        return {
            className: '',
            maxFull: false,
            type: 'bottom'
        }
    }
}
</script>

<style lang="scss" scoped>

</style>