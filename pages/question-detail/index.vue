<!--
 * @description 题目详情页面
 * @features
 *   - 题目内容展示
 *   - 答案解析
 *   - 导航控制
 *   - 收藏功能
 *   - 学习状态管理
 *   - 支持HTML内容
 -->
<template>
  <view class="question-detail">
    <view class="question-detail__header">
      <view class="question-detail__title-bar">
        <text class="question-detail__category">{{ categoryName }}</text>
        <text class="question-detail__progress">{{ currentIndex + 1 }}/{{ totalCount }}</text>
      </view>
    </view>
    
    <scroll-view 
      class="question-detail__content"
      scroll-y
    >
      <view class="question-detail__wrapper">
        <view class="question-detail__section">
          <view class="question-detail__section-header">
            <text class="question-detail__section-title">题目</text>
            <view class="question-detail__learn-tag" @click="handleLearn">
              <text v-if="isLearned" class="question-detail__tag question-detail__tag--learned">
                已学习 {{ formatDate(learningRecord.lastLearnTime) }}
              </text>
              <text v-else class="question-detail__tag question-detail__tag--unlearned">未学习</text>
            </view>
          </view>
          <text class="question-detail__text">{{ currentQuestion?.title }}</text>
        </view>
        
        <view class="question-detail__section">
          <text class="question-detail__section-title">答案</text>
          <rich-text class="question-detail__rich-text" :nodes="processedAnswer"></rich-text>
        </view>
        
        <!-- 底部占位，确保内容不被底部按钮遮挡 -->
        <view style="height: 80px;"></view>
      </view>
    </scroll-view>
    
    <view class="question-detail__fixed-buttons">
      <view 
        class="question-detail__action-btn question-detail__prev-btn"
        :class="{ 'question-detail__action-btn--disabled': !hasPrev }"
        @click="hasPrev && handlePrev()"
      >
        <text class="btn-icon">&#9664;</text>
        <text class="btn-text">上一题</text>
      </view>
      
      <view 
        class="question-detail__action-btn question-detail__favorite-btn"
        :class="{ 'question-detail__favorite-btn--active': isFavorite }"
        @click="handleFavorite"
      >
        <text class="btn-icon">&#10084;</text>
        <text class="btn-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
      </view>
      
      <view 
        class="question-detail__action-btn question-detail__next-btn"
        :class="{ 'question-detail__action-btn--disabled': !hasNext }"
        @click="hasNext && handleNext()"
      >
        <text class="btn-icon">&#9654;</text>
        <text class="btn-text">下一题</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getQuestions, getCategoryDetail } from '../../utils/dataLoader';
import { LearningStorage, FavoriteStorage } from '../../utils/storage';

export default {
  data() {
    return {
      categoryId: 0,
      questionId: 0,
      categoryName: '',
      questions: [],
      currentQuestion: null,
      isLearned: false,
      isFavorite: false,
      learningRecord: {
        lastLearnTime: 0,
        reviewCount: 0
      }
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
    },
    
    // 处理HTML答案
    processedAnswer() {
      if (!this.currentQuestion?.answer) return '';
      
      // 确保内容可以正确显示HTML
      let content = this.currentQuestion.answer;
      
      // 处理代码块和其他格式化
      content = content.replace(/\n/g, '<br>');
      
      return content;
    }
  },
  
  onLoad(options) {
    if (options.categoryId && options.questionId) {
      this.categoryId = Number(options.categoryId);
      this.questionId = Number(options.questionId);
      this.loadQuestions();
      this.loadCategoryName();
    }
  },
  
  methods: {
    // 加载分类名称
    async loadCategoryName() {
      try {
        const category = await getCategoryDetail(this.categoryId);
        this.categoryName = category.name || '未知分类';
      } catch (error) {
        console.error('加载分类名称失败:', error);
      }
    },
    
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
        const record = records[this.questionId];
        this.isLearned = record?.isLearned || false;
        this.learningRecord = record || { lastLearnTime: 0, reviewCount: 0 };
        
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
    
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      return `${month}/${day}`;
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
      const now = Date.now();
      const newRecord = {
        isLearned: !this.isLearned,
        lastLearnTime: now,
        reviewCount: this.learningRecord.reviewCount + (this.isLearned ? 0 : 1)
      };
      
      LearningStorage.updateRecord(this.questionId, newRecord);
      this.isLearned = newRecord.isLearned;
      this.learningRecord = newRecord;
    }
  }
}
</script>

<style lang="scss">
/* 使用Unicode符号替代图标字体 */
.question-detail {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  
  &__header {
    background: #ffffff;
    padding: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  }
  
  &__title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__category {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
  }
  
  &__progress {
    font-size: 14px;
    color: #666666;
  }
  
  &__content {
    flex: 1;
    width: 100%;
    box-sizing: border-box;
  }
  
  &__wrapper {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  &__section {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    width: 100%;
    box-sizing: border-box;
  }
  
  &__section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  &__section-title {
    font-size: 16px;
    font-weight: 500;
    color: #333333;
  }
  
  &__learn-tag {
    
  }
  
  &__tag {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    
    &--learned {
      color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
    }
    
    &--unlearned {
      color: #9E9E9E;
      background: rgba(158, 158, 158, 0.1);
    }
  }
  
  &__text {
    font-size: 15px;
    color: #333333;
    line-height: 1.6;
  }
  
  &__rich-text {
    font-size: 15px;
    color: #333333;
    line-height: 1.6;
  }
  
  &__fixed-buttons {
    position: fixed;
    bottom: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
  }
  
  &__action-btn {
    min-width: 80px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
    gap: 4px;
    transition: all 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    
    .btn-icon {
      font-size: 15px;
    }
    
    .btn-text {
      font-size: 13px;
    }
    
    &:active {
      transform: scale(0.95);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    &--disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }
  
  &__prev-btn, &__next-btn {
    min-width: 70px;
    background: linear-gradient(to right, #4dabf7, #3a8ee6);
    
    .btn-icon, .btn-text {
      color: white;
    }
  }
  
  &__favorite-btn {
    background: linear-gradient(to right, #fd7e14, #f76707);
    
    .btn-icon, .btn-text {
      color: white;
    }
    
    &--active {
      background: linear-gradient(to right, #ff922b, #fd7e14);
      
      .btn-icon, .btn-text {
        color: white;
      }
    }
  }
}
</style> 