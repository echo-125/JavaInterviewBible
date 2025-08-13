<template>
  <view class="profile">
    <!-- 添加下拉刷新 -->
    <scroll-view
        class="profile__scroll"
        scroll-y
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
    >
      <!-- 个人信息区域 -->
      <view class="profile__user-info">
        <image class="profile__avatar" src="/static/logo.png" mode="aspectFill"></image>
        <view class="profile__user-stats">
          <text class="profile__streak">已连续学习 {{ streak }} 天</text>
        </view>
      </view>

      <!-- 统计数据卡片 -->
      <view class="profile__card">
        <view class="profile__stats">
          <view class="profile__stat-item">
            <text class="profile__stat-value">{{ totalQuestionCount }}</text>
            <text class="profile__stat-label">总题数</text>
          </view>
          <view class="profile__stat-item">
            <text class="profile__stat-value">{{ learnedCount }}</text>
            <text class="profile__stat-label">已学习</text>
          </view>
          <view class="profile__stat-item">
            <text class="profile__stat-value">{{ favoriteCount }}</text>
            <text class="profile__stat-label">已收藏</text>
          </view>
        </view>
      </view>

      <!-- 功能选项列表 -->
      <view class="profile__menu">
        <view class="profile__menu-item" @click="handleAboutMe">
          <text class="profile__menu-text">关于本工具</text>
          <text class="profile__menu-arrow">›</text>
        </view>
        <view class="profile__menu-item" @click="showMiniProgramCode">
          <text class="profile__menu-text">分享给朋友</text>
          <text class="profile__menu-arrow">›</text>
        </view>
        <button class="profile__menu-item profile__contact-button" open-type="contact">
          <text class="profile__menu-text">建议/意见反馈</text>
          <text class="profile__menu-arrow">›</text>
        </button>
        <view class="profile__menu-item">
          <text class="profile__menu-text">当前版本</text>
          <text class="profile__menu-text profile__version">v{{ version }}</text>
        </view>
        <view class="profile__menu-item profile__menu-item--danger" @click="handleClearData">
          <text class="profile__menu-text">清除所有数据</text>
          <text class="profile__menu-arrow">›</text>
        </view>
      </view>
    </scroll-view>

    <!-- 自定义模态框 -->
    <view v-if="modalVisible" class="modal-mask" @click="hideModal">
      <view class="modal-container" @click.stop>
        <view class="modal-title">分享小程序码</view>
        <image :src="modalImage" class="modal-image" mode="aspectFit"></image>
        <view class="modal-tip">
          由于小程序未完成认证，分享功能暂时无法使用。<br/>
          您可以通过小程序码方式分享。
        </view>
        <view class="modal-footer">
          <button class="btn-save" @click="saveImage">保存到相册</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {LearningStorage, FavoriteStorage} from '@/utils/storage';
import {StatisticsUtil} from '@/utils/statistics';
import type {Statistics} from '@/api/types';

// 页面数据
const statistics = ref<Statistics>({
  totalLearnCount: 0,
  totalReviewCount: 0
});
const streak = ref(0);
const favoriteCount = ref(0);
const totalQuestionCount = ref(505); // 题目总数
const learnedCount = ref(0); // 已学习题目数
const isRefreshing = ref(false); // 下拉刷新状态
const version = ref('1.1.2'); // 当前版本号

// 模态框相关
const modalVisible = ref(false);
const modalImage = ref('/static/images/小程序码.jpg');

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 加载学习统计
    try {
      statistics.value = await LearningStorage.getStatistics();
    } catch (error) {
      console.error('加载学习统计失败:', error);
      statistics.value = {
        totalLearnCount: 0,
        totalReviewCount: 0
      };
    }

    // 计算连续学习天数
    try {
      const records = await LearningStorage.getRecords();
      streak.value = await StatisticsUtil.calculateStreak(records);

      // 计算已学习题目数量
      learnedCount.value = Object.values(records).filter(record => record.isLearned).length;
    } catch (error) {
      console.error('计算连续学习天数失败:', error);
      streak.value = 0;
      learnedCount.value = 0;
    }

    // 加载收藏数量
    try {
      const favorites = await FavoriteStorage.getFavorites();
      favoriteCount.value = Object.keys(favorites).length;
    } catch (error) {
      console.error('加载收藏数量失败:', error);
      favoriteCount.value = 0;
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
    uni.showToast({
      title: '加载统计数据失败',
      icon: 'none'
    });
  }
};

// 下拉刷新处理
const onRefresh = async () => {
  isRefreshing.value = true;
  await loadStatistics();
  isRefreshing.value = false;
};

// 客服联系回调
// 已通过button的open-type="contact"实现，无需额外处理

// 关于我
const handleAboutMe = () => {
  uni.showModal({
    title: '为什么叫面经通途？',
    content: '本来是叫Java八股精选，但一直不能通过审核，而且客服告知标题和简介不能有英文。希望能帮助你快速通过面试。',
    showCancel: true,
    cancelText: '知道了',
    confirmText: '关于我',
    success: (res) => {
      if (res.confirm) {
        // 将链接复制到剪贴板
        uni.setClipboardData({
          data: 'https://www.he2000.top/about/',
          success: () => {
            uni.showToast({
              title: '链接已复制，请在浏览器中打开',
              icon: 'none',
              duration: 2000
            });
          },
          fail: () => {
            uni.showToast({
              title: '复制失败',
              icon: 'none'
            });
          }
        });
      }
    }
  });
};

// 清除所有数据
const handleClearData = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除所有学习进度和收藏吗？此操作不可恢复！',
    success: async (res) => {
      if (res.confirm) {
        try {
          await Promise.all([
            LearningStorage.clearAll(),
            FavoriteStorage.clearAll()
          ]);

          // 重置数据
          statistics.value = {
            totalLearnCount: 0,
            totalReviewCount: 0
          };
          streak.value = 0;
          favoriteCount.value = 0;
          learnedCount.value = 0;

          uni.showToast({
            title: '数据已清除',
            icon: 'success'
          });
        } catch (error) {
          console.error('清除数据失败:', error);
          uni.showToast({
            title: '清除数据失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 显示小程序码
const showMiniProgramCode = () => {
  modalVisible.value = true;
};

// 隐藏模态框
const hideModal = () => {
  modalVisible.value = false;
};

// 保存图片到相册
const saveImage = async () => {

  // 保存到相册
  await uni.saveImageToPhotosAlbum({
    filePath: '/static/images/小程序码.jpg',
    success: () => {
      uni.showToast({
        title: '已保存到相册',
        icon: 'success'
      });
    },
    fail: () => {
      uni.showToast({
        title: '保存失败，请检查权限',
        icon: 'none'
      });
    }
  });

}


// 页面加载
onMounted(() => {
  loadStatistics();
});
</script>

<style lang="scss">
.profile {
  min-height: 100vh;
  background: #f5f5f5;

  &__scroll {
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
  }

  &__user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
  }

  &__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 10px;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__user-stats {
    text-align: center;
  }

  &__streak {
    font-size: 14px;
    color: #666666;
    background: rgba(45, 183, 245, 0.1);
    padding: 4px 12px;
    border-radius: 16px;
  }

  &__card {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
  }

  &__stats {
    display: flex;
    justify-content: space-around;
  }

  &__stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #1890ff;
    margin-bottom: 4px;
  }

  &__stat-label {
    font-size: 12px;
    color: #666666;
  }

  &__menu {
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  &__menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: #f5f5f5;
    }

    &--danger {
      .profile__menu-text {
        color: #ff4d4f;
      }
    }
  }

  // 联系客服按钮样式
  &__contact-button {
    background: none;
    border: none;
    outline: none;
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background-color: transparent;
    font-size: inherit;
    line-height: inherit;
    margin: 0;

    &::after {
      display: none;
    }

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: #f5f5f5;
    }
  }

  &__menu-text {
    font-size: 16px;
    color: #333333;

    &.profile__version {
      color: #666666;
    }
  }

  &__menu-arrow {
    font-size: 18px;
    color: #999999;
  }

  // 自定义模态框样式
  .modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-container {
    background: white;
    border-radius: 12px;
    width: 80%;
    max-width: 300px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .modal-title {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 16px;
    color: #333;
  }

  .modal-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .modal-tip {
    font-size: 12px;
    color: #666;
    text-align: center;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
  }

  .btn-cancel,
  .btn-save {
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    border: none;
    cursor: pointer;
  }

  .btn-cancel {
    background: #f5f5f5;
    color: #666;
  }

  .btn-save {
    background: #a0d8ff; // 更换为更浅的蓝色
    color: white;
    width: 100%;
    margin: 0 auto;
    padding: 6px 20px; // 进一步减小内边距以降低高度
    font-size: 12px; // 调整字体大小以匹配新高度
  }
}
</style>