<!--
 * @description 题目列表页面
 * @features
 *   - 显示分类下所有题目
 *   - 题目标题展示
 *   - 学习状态标识
 *   - 收藏状态显示
 *   - 下拉刷新功能
 -->
<template>
  <view class="question-list">
    <view class="question-list__header">
      <text class="question-list__title">{{ categoryName }}</text>
      <text class="question-list__count">共 {{ questions.length }} 题</text>
    </view>
    
    <scroll-view 
      class="question-list__content"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="questions.length > 0">
        <view 
          v-for="question in questions" 
          :key="question.id" 
          class="question-item"
          @click="handleQuestionClick(question.id)"
        >
          <view class="question-info">
            <text class="question-title">{{ question.title }}</text>
          </view>
          <view class="question-status">
            <text v-if="question.isLearned" class="status-tag status-tag--learned">已学习</text>
            <text v-if="question.isFavorite" class="status-tag status-tag--favorite">已收藏</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text>暂无题目</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref } from 'vue';
import { getQuestions, getCategoryDetail } from '../../utils/dataLoader';
import { LearningStorage, FavoriteStorage } from '../../utils/storage';

export default {
  data() {
    return {
      categoryId: 0,
      questions: [],
      categoryName: '',
      isRefreshing: false
    }
  },
  
  onLoad(options) {
    if (options.categoryId) {
      this.categoryId = Number(options.categoryId);
      this.loadQuestions();
    }
  },
  
  methods: {
    // 加载题目列表
    async loadQuestions() {
      try {
        const data = await getQuestions(this.categoryId);
        this.questions = data;
        
        // 获取分类名称
        const category = await getCategoryDetail(this.categoryId);
        this.categoryName = category.name || '未知分类';
        
        // 加载学习状态和收藏状态
        await this.loadQuestionStatuses();
      } catch (error) {
        console.error('加载题目失败:', error);
        uni.showToast({
          title: '加载题目失败',
          icon: 'none'
        });
      }
    },
    
    // 加载题目状态
    async loadQuestionStatuses() {
      try {
        const records = await LearningStorage.getRecords();
        const favorites = await FavoriteStorage.getFavorites();
        
        this.questions = this.questions.map((question) => ({
          ...question,
          isLearned: records[question.id]?.isLearned || false,
          isFavorite: !!favorites[question.id]
        }));
      } catch (error) {
        console.error('加载题目状态失败:', error);
      }
    },
    
    // 点击题目
    handleQuestionClick(questionId) {
      uni.navigateTo({
        url: `/pages/question-detail/index?questionId=${questionId}&categoryId=${this.categoryId}`
      });
    },
    
    // 下拉刷新
    async onRefresh() {
      this.isRefreshing = true;
      await this.loadQuestions();
      this.isRefreshing = false;
    }
  }
}
</script>

<style lang="scss">
.question-list {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  
  &__header {
    text-align: center;
    margin-bottom: 24px;
  }
  
  &__title {
    font-size: 20px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 8px;
  }
  
  &__count {
    font-size: 14px;
    color: #666666;
  }
  
  &__content {
    height: calc(100vh - 100px);
  }
  
  .question-item {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .question-info {
      margin-bottom: 12px;
    }
    
    .question-title {
      font-size: 16px;
      color: #333333;
      line-height: 1.5;
    }
    
    .question-status {
      display: flex;
      gap: 8px;
    }
    
    .status-tag {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      
      &--learned {
        color: #4CAF50;
        background: rgba(76, 175, 80, 0.1);
      }
      
      &--favorite {
        color: #FF9800;
        background: rgba(255, 152, 0, 0.1);
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #999999;
  }
}
</style> 