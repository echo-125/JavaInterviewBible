<!--
 * @description 分类卡片组件
 * @features
 *   - 显示分类名称
 *   - 显示题目数量
 *   - 显示学习进度
 *   - 点击跳转
 -->
<template>
  <view class="category-card" @click="$emit('click')">
    <view class="category-card__header">
      <text class="category-card__name">{{ name }}</text>
      <text class="category-card__count">{{ progressText }}</text>
    </view>
    
    <view class="category-card__progress">
      <view class="category-card__progress-bar">
        <view 
          class="category-card__progress-inner" 
          :style="{ width: `${progress}%` }"
        ></view>
      </view>
      <text class="category-card__percent">{{ progress }}%</text>
    </view>
  </view>
</template>

<script setup lang="ts">
// 定义属性
defineProps({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  progressText: {
    type: String,
    default: '0/0'
  }
});

// 定义事件
defineEmits(['click']);
</script>

<script lang="ts">
export default {
  name: 'CategoryCard'
}
</script>

<style lang="scss">
.category-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 0;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  &__name {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    flex: 1;
  }
  
  &__count {
    font-size: 14px;
    color: #666666;
  }
  
  &__progress {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  &__progress-bar {
    flex: 1;
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
  }
  
  &__progress-inner {
    height: 100%;
    background: #1890ff;
    border-radius: 3px;
    transition: width 0.3s ease;
  }
  
  &__percent {
    font-size: 12px;
    color: #1890ff;
    min-width: 36px;
    text-align: right;
  }
}
</style> 