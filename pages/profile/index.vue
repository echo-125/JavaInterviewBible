<!--
 * @description 个人中心页面
 * @features
 *   - 显示基本信息和头像
 *   - 显示学习统计数据
 *   - 显示功能选项
 *   - 清除数据功能
 -->
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
        <button
          class="profile__menu-item profile__contact-btn"
          open-type="contact"
          @contact="onContact"
        >
          <text class="profile__menu-text">建议/意见反馈</text>
          <text class="profile__menu-arrow">›</text>
        </button>
        <view class="profile__menu-item profile__menu-item--danger" @click="handleClearData">
          <text class="profile__menu-text">清除所有数据</text>
          <text class="profile__menu-arrow">›</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { LearningStorage, FavoriteStorage } from '@/utils/storage';
import { StatisticsUtil } from '@/utils/statistics';
import type { Statistics } from '@/api/types';

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
    
    // 加载题目总数
    /* try {
      totalQuestionCount.value = await StatisticsUtil.getTotalQuestionCount();
    } catch (error) {
      console.error('加载题目总数失败:', error);
      // 保持默认值505
    } */
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
const onContact = (e: any) => {
  // 不需要记录日志
};

// 关于我
const handleAboutMe = () => {
  uni.showModal({
    title: '为什么叫面经通途？',
    content: '本来是叫Java八股精选，但一直不能通过审核，而且客服告知标题和简介不能有英文。希望能帮助你快速通过面试。',
    showCancel: false
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
  
  &__menu-text {
    font-size: 16px;
    color: #333333;
  }
  
  &__menu-arrow {
    font-size: 18px;
    color: #999999;
  }
  
  &__contact-btn {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    font-size: 16px;
    text-align: left;
    background-color: transparent;
    border-radius: 0;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
    
    &::after {
      border: none;
    }
    
    &:active {
      background-color: #f5f5f5;
    }
  }
}
</style> 