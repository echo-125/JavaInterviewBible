<!--
 * @description 分类列表页面（首页）
 * @features
 *   - 显示所有分类
 *   - 每个分类显示进度
 *   - 实时更新状态
 -->
<template>
  <view class="index">
    <view class="index__header">
      <!-- <text class="index__title">Java面试宝典</text>
      <text class="index__subtitle">选择分类开始学习</text> -->
    </view>
    
    <view class="index__content">
      <category-card
        v-for="category in categories"
        :key="category.id"
        :id="category.id"
        :name="category.name"
        :count="category.count"
        :progress="getCategoryProgress(category.id)"
        @click="() => handleCategoryClick(category.id)"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CategoryCard from '../../components/category-card/category-card.vue';
import { getCategories } from '../../utils/dataLoader';
import { LearningStorage } from '../../utils/storage';
import { StatisticsUtil } from '../../utils/statistics';
import type { Category } from '../../api/types';

// 分类数据
const categories = ref<Category[]>([]);

// 获取分类列表
const loadCategories = async () => {
  try {
    categories.value = await getCategories();
  } catch (error) {
    console.error('加载分类失败:', error);
    uni.showToast({
      title: '加载分类失败',
      icon: 'none'
    });
  }
};

// 获取分类进度
const getCategoryProgress = (categoryId: number): number => {
  const records = LearningStorage.getRecords();
  const categoryQuestions = categories.value
    .find((c: Category) => c.id === categoryId)
    ?.count || 0;
    
  if (categoryQuestions === 0) return 0;
  
  const learnedCount = Object.values(records)
    .filter(record => record.isLearned)
    .length;
    
  return Math.round((learnedCount / categoryQuestions) * 100);
};

// 点击分类
const handleCategoryClick = (categoryId: number) => {
  uni.navigateTo({
    url: `/pages/question-list/index?categoryId=${categoryId}`
  });
};

// 页面加载
onMounted(() => {
  loadCategories();
});

// 暴露变量和方法给模板使用
defineExpose({
  categories,
  getCategoryProgress,
  handleCategoryClick
});
</script>

<style lang="scss">
.index {
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
    color: #333;
    display: block;
    margin-bottom: 8px;
  }
  
  &__subtitle {
    font-size: 14px;
    color: #666;
    display: block;
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
