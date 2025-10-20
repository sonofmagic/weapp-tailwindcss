<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style>
.reset-button {
    padding: 0;
    background-color: transparent;
    font-size: inherit;
    line-height: inherit;
    color: inherit;

    &::after {
        border: none;
    }
}
</style>
