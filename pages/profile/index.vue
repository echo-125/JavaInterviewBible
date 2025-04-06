<!--
 * @description 个人中心页面
 * @features
 *   - 显示学习统计
 *   - 显示学习天数
 *   - 显示收藏数量
 *   - 清除数据功能
 -->
<template>
  <view class="profile">
    <view class="profile__header">
      <text class="profile__title">个人中心</text>
    </view>
    
    <view class="profile__content">
      <view class="profile__card">
        <text class="profile__card-title">学习统计</text>
        <view class="profile__stats">
          <view class="profile__stat-item">
            <text class="profile__stat-value">{{ statistics.totalLearnCount }}</text>
            <text class="profile__stat-label">已学习题目</text>
          </view>
          <view class="profile__stat-item">
            <text class="profile__stat-value">{{ statistics.totalReviewCount }}</text>
            <text class="profile__stat-label">复习次数</text>
          </view>
          <view class="profile__stat-item">
            <text class="profile__stat-value">{{ streak }}</text>
            <text class="profile__stat-label">连续学习天数</text>
          </view>
        </view>
      </view>
      
      <view class="profile__card">
        <text class="profile__card-title">收藏统计</text>
        <view class="profile__stats">
          <view class="profile__stat-item">
            <text class="profile__stat-value">{{ favoriteCount }}</text>
            <text class="profile__stat-label">收藏题目</text>
          </view>
        </view>
      </view>
      
      <view class="profile__actions">
        <button class="profile__btn profile__btn--danger" @click="handleClearData">
          清除所有数据
        </button>
      </view>
    </view>
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

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 加载学习统计
    statistics.value = await LearningStorage.getStatistics();
    
    // 计算连续学习天数
    const records = await LearningStorage.getRecords();
    streak.value = await StatisticsUtil.calculateStreak(records);
    
    // 加载收藏数量
    const favorites = await FavoriteStorage.getFavorites();
    favoriteCount.value = Object.keys(favorites).length;
  } catch (error) {
    console.error('加载统计数据失败:', error);
    uni.showToast({
      title: '加载统计数据失败',
      icon: 'none'
    });
  }
};

// 清除所有数据
const handleClearData = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除所有数据吗？此操作不可恢复！',
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
  padding: 20px;
  
  &__header {
    text-align: center;
    margin-bottom: 24px;
  }
  
  &__title {
    font-size: 24px;
    font-weight: bold;
    color: #333333;
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  &__card {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  &__card-title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 16px;
    display: block;
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
  
  &__actions {
    margin-top: 24px;
  }
  
  &__btn {
    width: 100%;
    font-size: 16px;
    padding: 12px;
    border-radius: 8px;
    border: none;
    
    &--danger {
      color: #ffffff;
      background: #ff4d4f;
    }
  }
}
</style> 