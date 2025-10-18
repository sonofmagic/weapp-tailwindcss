<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  // @ts-ignore
  mpType: "app",
  onLaunch() {
    console.log("App Launch");
  },
  onShow() {
    console.log("App Show");
  },
  onHide() {
    console.log("App Hide");
  },
});
</script>

<style lang="scss">
/*每个页面公共css */
@import "tailwindcss/base";
@import 'tailwindcss/components';
@import "tailwindcss/utilities";
@import "uview-ui/index.scss";
</style>
