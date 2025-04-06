<!--
 * @description 题目卡片组件
 * @props
 *   - id: 题目ID
 *   - title: 题目标题
 *   - isLearned: 是否已学习
 *   - isFavorite: 是否已收藏
 * @events
 *   - click: 点击卡片事件
 *   - favorite: 收藏/取消收藏事件
 -->
<template>
  <view class="question-card" @click="handleClick">
    <view class="question-card__content">
      <text class="question-card__title">{{ title }}</text>
      <view class="question-card__status">
        <text 
          class="question-card__status-item"
          :class="{ 'question-card__status-item--learned': isLearned }"
        >
          {{ isLearned ? '已学习' : '未学习' }}
        </text>
      </view>
    </view>
    <view class="question-card__actions">
      <button 
        class="question-card__favorite-btn"
        :class="{ 'question-card__favorite-btn--active': isFavorite }"
        @click.stop="handleFavorite"
      >
        {{ isFavorite ? '取消收藏' : '收藏' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

interface Props {
  id: number;
  title: string;
  isLearned: boolean;
  isFavorite: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'click', id: number): void;
  (e: 'favorite', id: number): void;
}>();

const handleClick = () => {
  emit('click', props.id);
};

const handleFavorite = () => {
  emit('favorite', props.id);
};
</script>

<style lang="scss">
.question-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &__content {
    margin-bottom: 12px;
  }
  
  &__title {
    font-size: 16px;
    font-weight: 500;
    color: #333333;
    margin-bottom: 8px;
  }
  
  &__status {
    display: flex;
    gap: 8px;
  }
  
  &__status-item {
    font-size: 12px;
    color: #999999;
    padding: 2px 8px;
    border-radius: 4px;
    background: #f5f5f5;
    
    &--learned {
      color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
    }
  }
  
  &__actions {
    display: flex;
    justify-content: flex-end;
  }
  
  &__favorite-btn {
    font-size: 14px;
    color: #666666;
    padding: 4px 12px;
    border-radius: 4px;
    background: #f5f5f5;
    border: none;
    
    &--active {
      color: #FF9800;
      background: rgba(255, 152, 0, 0.1);
    }
  }
}
</style> 