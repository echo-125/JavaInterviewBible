<!--
 * @description 题目详情页面
 * @features
 *   - 题目内容展示
 *   - 答案解析
 *   - 导航控制
 *   - 收藏功能
 *   - 学习状态管理
 -->
<template>
  <view class="question-detail">
    <view class="question-detail__header">
      <view class="question-detail__nav">
        <button 
          class="question-detail__nav-btn"
          :disabled="!hasPrev"
          @click="handlePrev"
        >
          上一题
        </button>
        <text class="question-detail__progress">{{ currentIndex + 1 }}/{{ totalCount }}</text>
        <button 
          class="question-detail__nav-btn"
          :disabled="!hasNext"
          @click="handleNext"
        >
          下一题
        </button>
      </view>
      
      <view class="question-detail__actions">
        <button 
          class="question-detail__favorite-btn"
          :class="{ 'question-detail__favorite-btn--active': isFavorite }"
          @click="handleFavorite"
        >
          {{ isFavorite ? '取消收藏' : '收藏' }}
        </button>
      </view>
    </view>
    
    <scroll-view 
      class="question-detail__content"
      scroll-y
    >
      <view class="question-detail__section">
        <text class="question-detail__title">题目</text>
        <text class="question-detail__text">{{ currentQuestion?.title }}</text>
      </view>
      
      <view class="question-detail__section">
        <text class="question-detail__title">答案</text>
        <text class="question-detail__text">{{ currentQuestion?.answer }}</text>
      </view>
    </scroll-view>
    
    <view class="question-detail__footer">
      <button 
        class="question-detail__learn-btn"
        :class="{ 'question-detail__learn-btn--learned': isLearned }"
        @click="handleLearn"
      >
        {{ isLearned ? '已学习' : '标记为已学习' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getQuestions } from '../../utils/dataLoader';
import { LearningStorage, FavoriteStorage } from '../../utils/storage';

export default {
  data() {
    return {
      categoryId: 0,
      questionId: 0,
      questions: [],
      currentQuestion: null,
      isLearned: false,
      isFavorite: false
    }
  },
  
  computed: {
    currentIndex() {
      return this.questions.findIndex(q => q.id === this.questionId);
    },
    
    totalCount() {
      return this.questions.length;
    },
    
    hasPrev() {
      return this.currentIndex > 0;
    },
    
    hasNext() {
      return this.currentIndex < this.totalCount - 1;
    }
  },
  
  onLoad(options) {
    if (options.categoryId && options.questionId) {
      this.categoryId = Number(options.categoryId);
      this.questionId = Number(options.questionId);
      this.loadQuestions();
    }
  },
  
  methods: {
    // 加载题目列表和详情
    async loadQuestions() {
      try {
        this.questions = await getQuestions(this.categoryId);
        this.currentQuestion = this.questions.find(q => q.id === this.questionId) || null;
        
        if (!this.currentQuestion) {
          uni.showToast({
            title: '题目不存在',
            icon: 'none'
          });
          uni.navigateBack();
          return;
        }
        
        // 更新学习状态
        const records = await LearningStorage.getRecords();
        this.isLearned = records[this.questionId]?.isLearned || false;
        
        // 更新收藏状态
        const favorites = await FavoriteStorage.getFavorites();
        this.isFavorite = !!favorites[this.questionId];
      } catch (error) {
        console.error('加载题目失败:', error);
        uni.showToast({
          title: '加载题目失败',
          icon: 'none'
        });
      }
    },
    
    // 上一题
    handlePrev() {
      if (this.hasPrev) {
        const prevQuestion = this.questions[this.currentIndex - 1];
        uni.redirectTo({
          url: `/pages/question-detail/index?questionId=${prevQuestion.id}&categoryId=${this.categoryId}`
        });
      }
    },
    
    // 下一题
    handleNext() {
      if (this.hasNext) {
        const nextQuestion = this.questions[this.currentIndex + 1];
        uni.redirectTo({
          url: `/pages/question-detail/index?questionId=${nextQuestion.id}&categoryId=${this.categoryId}`
        });
      }
    },
    
    // 收藏/取消收藏
    handleFavorite() {
      if (this.isFavorite) {
        FavoriteStorage.removeFavorite(this.questionId);
      } else {
        FavoriteStorage.addFavorite(this.questionId, {
          id: this.questionId,
          title: this.currentQuestion?.title || '',
          addTime: Date.now(),
          categoryId: this.categoryId
        });
      }
      this.isFavorite = !this.isFavorite;
    },
    
    // 标记学习状态
    handleLearn() {
      if (this.isLearned) {
        LearningStorage.updateRecord(this.questionId, { 
          isLearned: false,
          lastLearnTime: Date.now(),
          reviewCount: 0
        });
      } else {
        LearningStorage.updateRecord(this.questionId, { 
          isLearned: true,
          lastLearnTime: Date.now(),
          reviewCount: 0
        });
      }
      this.isLearned = !this.isLearned;
    }
  }
}
</script>

<style lang="scss">
.question-detail {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  
  &__header {
    background: #ffffff;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  &__nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  &__nav-btn {
    font-size: 14px;
    color: #666666;
    padding: 4px 12px;
    border-radius: 4px;
    background: #f5f5f5;
    border: none;
    
    &:disabled {
      opacity: 0.5;
    }
  }
  
  &__progress {
    font-size: 14px;
    color: #666666;
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
  
  &__content {
    flex: 1;
    padding: 16px;
  }
  
  &__section {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
  }
  
  &__title {
    font-size: 16px;
    font-weight: 500;
    color: #333333;
    margin-bottom: 12px;
    display: block;
  }
  
  &__text {
    font-size: 14px;
    color: #666666;
    line-height: 1.6;
  }
  
  &__footer {
    background: #ffffff;
    padding: 16px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  }
  
  &__learn-btn {
    width: 100%;
    font-size: 16px;
    color: #ffffff;
    padding: 12px;
    border-radius: 8px;
    background: #4CAF50;
    border: none;
    
    &--learned {
      background: #9E9E9E;
    }
  }
}
</style> 