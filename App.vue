<script setup lang="ts">
import {onLaunch, onShow, onHide} from "@dcloudio/uni-app";

// 检查小程序更新
const checkUpdate = () => {
  // 检查是否支持版本更新功能
  if (uni.canIUse('getUpdateManager')) {
    const updateManager = uni.getUpdateManager();
    
    // 检查新版本
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('检测到新版本');
      }
    });
    
    // 新版本下载完成
    updateManager.onUpdateReady(() => {
      uni.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            // 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    });
    
    // 新版本下载失败
    updateManager.onUpdateFailed(() => {
      uni.showToast({
        title: '更新失败',
        icon: 'none'
      });
    });
  }
};

onLaunch(() => {
  // 应用启动时执行
  checkUpdate();
});

onShow(() => {
  // 应用显示时执行
});

onHide(() => {
  // 应用隐藏时执行
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