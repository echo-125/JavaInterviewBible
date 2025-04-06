<!--
 * @description 分类列表页面（首页）
 * @features
 *   - 显示所有分类
 *   - 每个分类显示进度
 *   - 实时更新状态
 *   - 支持下拉刷新
 -->
<template>
  <view class="index">
    <scroll-view 
      class="index__scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="index__content">
        <category-card
          v-for="category in categories"
          :key="category.id"
          :id="category.id"
          :name="category.name"
          :count="category.count"
          :progress="getCategoryProgress(category.id)"
          :progress-text="getProgressText(category.id)"
          @click="() => handleCategoryClick(category.id)"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CategoryCard from '../../components/category-card/category-card.vue';
import { getCategories, getQuestions } from '../../utils/dataLoader';
import { LearningStorage } from '../../utils/storage';
import { StatisticsUtil } from '../../utils/statistics';
import type { Category } from '../../api/types';

// 分类数据
const categories = ref<Category[]>([]);
// 下拉刷新状态
const isRefreshing = ref(false);
// 记录每个分类的学习数据
const categoryLearningData = ref<Record<number, { total: number, learned: number }>>({});

// 获取分类列表
const loadCategories = async () => {
  try {
    categories.value = await getCategories();
    // 加载学习进度数据
    await loadLearningData();
  } catch (error) {
    console.error('加载分类失败:', error);
    uni.showToast({
      title: '加载分类失败',
      icon: 'none'
    });
  }
};

// 加载所有分类的学习进度数据
const loadLearningData = async () => {
  try {
    const records = await LearningStorage.getRecords();
    const learningData: Record<number, { total: number, learned: number }> = {};
    
    // 初始化每个分类的学习数据
    for (const category of categories.value) {
      learningData[category.id] = {
        total: category.count,
        learned: 0
      };
    }
    
    // 计算每个分类已学习的题目数量
    for (const [questionId, record] of Object.entries(records)) {
      if (record && record.isLearned) {
        const question = { id: parseInt(questionId), categoryId: 0 };
        // 查找该题目属于哪个分类
        for (const categoryId in learningData) {
          // 此处简化处理，实际应从题目数据中获取categoryId
          const questions = await getQuestions(parseInt(categoryId));
          const found = questions.find(q => q.id === question.id);
          if (found) {
            question.categoryId = found.categoryId;
            break;
          }
        }
        
        if (question.categoryId > 0 && learningData[question.categoryId]) {
          learningData[question.categoryId].learned += 1;
        }
      }
    }
    
    categoryLearningData.value = learningData;
  } catch (error) {
    console.error('加载学习进度数据失败:', error);
  }
};

// 获取分类进度
const getCategoryProgress = (categoryId: number): number => {
  const data = categoryLearningData.value[categoryId];
  if (!data || data.total === 0) return 0;
  
  return Math.round((data.learned / data.total) * 100);
};

// 获取进度文本 (例: 5/30)
const getProgressText = (categoryId: number): string => {
  const data = categoryLearningData.value[categoryId];
  if (!data) return '0/0';
  
  return `${data.learned}/${data.total}`;
};

// 点击分类
const handleCategoryClick = (categoryId: number) => {
  uni.navigateTo({
    url: `/pages/question-list/index?categoryId=${categoryId}`
  });
};

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true;
  await loadCategories();
  isRefreshing.value = false;
};

// 页面加载
onMounted(() => {
  loadCategories();
});

// 页面显示时重新加载数据（从其他页面返回时）
const onShow = () => {
  loadLearningData();
};

// 暴露变量和方法给模板使用
defineExpose({
  categories,
  getCategoryProgress,
  getProgressText,
  handleCategoryClick,
  onRefresh,
  onShow
});
</script>

<style lang="scss">
.index {
  min-height: 100vh;
  background: #f5f5f5;
  height: 100vh;
  
  &__scroll {
    height: 100%;
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    padding-bottom: 30px;
  }
}
</style>
