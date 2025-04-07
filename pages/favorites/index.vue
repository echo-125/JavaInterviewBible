<!--
 * @description 收藏页面
 * @features
 *   - 显示收藏的题目
 *   - 取消收藏功能
 *   - 跳转到题目详情
 *   - 下拉刷新
 -->
<template>
  <view class="favorites">
    <view class="favorites__header">
      <text class="favorites__count">收藏题目 {{ favorites.length }} 道</text>
    </view>
    
    <scroll-view 
      class="favorites__content"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="favorites.length > 0" class="favorites__list">
        <view 
          v-for="favorite in favorites" 
          :key="favorite.id" 
          class="favorite-item"
          @click="handleQuestionClick(favorite.id, favorite.categoryId)"
          @longpress="handleLongPress(favorite.id)"
        >
          <view class="favorite-info">
            <text class="favorite-title">{{ favorite.title }}</text>
            <text class="favorite-category">{{ getCategoryName(favorite.categoryId) }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text>暂无收藏题目</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCategories } from '../../utils/dataLoader';
import { FavoriteStorage } from '../../utils/storage';
import type { FavoriteRecord, Category } from '../../api/types';

// 页面数据
const favorites = ref<FavoriteRecord[]>([]);
const categories = ref<Category[]>([]);
const isRefreshing = ref(false);

// 加载收藏列表
const loadFavorites = async () => {
  try {
    // 加载收藏记录
    const favoritesData = await FavoriteStorage.getFavorites();
    favorites.value = Object.values(favoritesData).sort((a, b) => b.addTime - a.addTime);
    
    // 加载分类数据
    categories.value = await getCategories();
  } catch (error) {
    console.error('加载收藏失败:', error);
    uni.showToast({
      title: '加载收藏失败',
      icon: 'none'
    });
  }
};

// 获取分类名称
const getCategoryName = (categoryId: number): string => {
  const category = categories.value.find((c: Category) => c.id === categoryId);
  return category ? category.name : '未知分类';
};

// 点击题目
const handleQuestionClick = (questionId: number, categoryId: number) => {
  uni.navigateTo({
    url: `/pages/question-detail/index?questionId=${questionId}&categoryId=${categoryId}`
  });
};

// 取消收藏
const handleUnfavorite = async (questionId: number) => {
  try {
    await FavoriteStorage.removeFavorite(questionId);
    favorites.value = favorites.value.filter((f: FavoriteRecord) => f.id !== questionId);
    
    uni.showToast({
      title: '已取消收藏',
      icon: 'success'
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    uni.showToast({
      title: '取消收藏失败',
      icon: 'none'
    });
  }
};

// 长按处理
const handleLongPress = (questionId: number) => {
  uni.showActionSheet({
    itemList: ['取消收藏'],
    itemColor: '#ff4d4f',
    success: (res) => {
      if (res.tapIndex === 0) {
        handleUnfavorite(questionId);
      }
    }
  });
};

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true;
  await loadFavorites();
  isRefreshing.value = false;
};

// 页面加载
onMounted(() => {
  loadFavorites();
});
</script>

<style lang="scss">
.favorites {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 12px;
  
  &__header {
    text-align: left;
    margin-bottom: 16px;
    padding: 0 4px;
  }
  
  &__count {
    font-size: 16px;
    color: #666666;
    font-weight: 500;
  }
  
  &__content {
    height: calc(100vh - 60px);
  }
  
  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .favorite-item {
    background: #ffffff;
    border-radius: 8px;
    padding: 12px 14px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: relative;
  }
  
  .favorite-info {
    width: 100%;
  }
  
  .favorite-title {
    font-size: 15px;
    color: #333333;
    line-height: 1.4;
    margin-bottom: 4px;
    display: block;
  }
  
  .favorite-category {
    font-size: 12px;
    color: #666666;
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #999999;
  }
}
</style> 