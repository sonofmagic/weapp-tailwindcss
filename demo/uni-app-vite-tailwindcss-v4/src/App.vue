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
/* @import 'tailwindcss'; */
.reset-button {
  display: block;
}

page {
  --test-issue-978-color: #102938;
  --color-issue-978: #006241;
  --font-issue-978: "Issue 978", sans-serif;
}
</style>
