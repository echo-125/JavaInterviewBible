<!--
 * @description 题目列表页面
 * @features
 *   - 显示分类下所有题目
 *   - 题目标题展示
 *   - 学习状态标识
 *   - 收藏状态显示
 *   - 下拉刷新功能
 *   - 已学习题目排序在后
 *   - 均衡卡片高度
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
      :scroll-top="scrollTop"
      @scroll="onScroll"
    >
      <view v-if="questions.length > 0" class="question-list__items">
        <view 
          v-for="question in sortedQuestions" 
          :key="question.id" 
          class="question-item"
          :class="{'question-item--learned': question.isLearned}"
          @click="handleQuestionClick(question.id)"
        >
          <view class="question-info">
            <text class="question-order">{{ question.sort_order }}.</text>
            <view class="question-content">
              <text class="question-title">{{ question.title }}</text>
              <view class="question-status">
                <text v-if="question.isLearned" class="status-tag status-tag--learned">已学习</text>
                <text v-if="question.isFavorite" class="status-tag status-tag--favorite">已收藏</text>
              </view>
            </view>
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
import { getQuestions, getCategoryDetail } from '../../utils/dataLoader';
import { LearningStorage, FavoriteStorage } from '../../utils/storage';

export default {
  data() {
    return {
      categoryId: 0,
      questions: [],
      categoryName: '',
      isRefreshing: false,
      scrollTop: 0,
      currentScrollTop: 0
    }
  },
  
  computed: {
    // 按学习状态排序题目：未学习的在前，已学习的在后
    sortedQuestions() {
      return [...this.questions].sort((a, b) => {
        // 首先按学习状态排序
        if (a.isLearned && !b.isLearned) return 1;
        if (!a.isLearned && b.isLearned) return -1;
        // 其次按序号排序
        return a.sort_order - b.sort_order;
      });
    }
  },
  
  onLoad(options) {
    if (options.categoryId) {
      this.categoryId = Number(options.categoryId);
      this.loadQuestions();
    }
  },
  
  // 页面显示时
  onShow() {
    if (this.categoryId) {
      this.loadQuestionStatuses();
      
      // 恢复滚动位置
      setTimeout(() => {
        try {
          const savedPosition = uni.getStorageSync('questionListScrollPosition');
          if (savedPosition !== '' && savedPosition !== undefined) {
            this.scrollTop = savedPosition;
          }
        } catch (e) {
          console.error('恢复滚动位置失败:', e);
        }
      }, 100);
    }
  },
  
  methods: {
    // 监听滚动事件
    onScroll(e) {
      this.currentScrollTop = e.detail.scrollTop;
    },
    
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
      // 保存滚动位置
      uni.setStorageSync('questionListScrollPosition', this.currentScrollTop);
      
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
    margin-bottom: 20px;
  }
  
  &__title {
    font-size: 20px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 6px;
  }
  
  &__count {
    font-size: 14px;
    color: #666666;
  }
  
  &__content {
    height: calc(100vh - 100px);
  }
  
  &__items {
    display: grid;
    grid-gap: 12px;
  }
  
  .question-item {
    background: #ffffff;
    border-radius: 10px;
    padding: 12px 14px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    min-height: 60px;
    display: flex;
    align-items: center;
    transition: transform 0.1s, box-shadow 0.2s;
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
    }
    
    &--learned {
      opacity: 0.85;
      border-left: 4px solid #4CAF50;
    }
    
    .question-info {
      display: flex;
      width: 100%;
    }
    
    .question-order {
      font-size: 15px;
      color: #666666;
      margin-right: 6px;
      min-width: 22px;
      padding-top: 1px;
    }
    
    .question-content {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .question-title {
      font-size: 15px;
      color: #333333;
      line-height: 1.4;
      margin-right: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .question-status {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-top: 2px;
    }
    
    .status-tag {
      font-size: 11px;
      padding: 1px 6px;
      border-radius: 3px;
      white-space: nowrap;
      line-height: 1.5;
      display: inline-block;
      
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