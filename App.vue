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
@import './static/fonts/iconfont.css';

/* 通用图标样式 */
.iconfont {
  font-size: 20px;
  display: inline-block;
  line-height: 1;
}
</style>
