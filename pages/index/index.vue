<!--
 * @description 分类列表页面（首页）
 * @features
 *   - 显示所有分类
 *   - 每个分类显示进度
 *   - 实时更新状态
 *   - 支持下拉刷新
 *   - 记忆滚动位置
 -->
<template>
  <view class="index">
    <scroll-view 
      class="index__scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      :scroll-top="scrollTop"
      @scroll="onScroll"
      scroll-with-animation
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

<script>
import CategoryCard from '../../components/category-card/category-card.vue';
import { getCategories, getQuestions } from '../../utils/dataLoader';
import { LearningStorage } from '../../utils/storage';
import { StatisticsUtil } from '../../utils/statistics';

export default {
  components: {
    CategoryCard
  },
  
  data() {
    return {
      categories: [],
      isRefreshing: false,
      categoryLearningData: {},
      scrollTop: 0,
      currentScrollTop: 0,
      isInitialized: false
    };
  },
  
  methods: {
    // 获取分类列表
    async loadCategories() {
      try {
        this.categories = await getCategories();
        // 加载学习进度数据
        await this.loadLearningData();
        this.isInitialized = true;
      } catch (error) {
        console.error('加载分类失败:', error);
        uni.showToast({
          title: '加载分类失败',
          icon: 'none'
        });
      }
    },
    
    // 加载所有分类的学习进度数据
    async loadLearningData() {
      try {
        const records = await LearningStorage.getRecords();
        const learningData = {};
        
        // 初始化每个分类的学习数据
        for (const category of this.categories) {
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
        
        this.categoryLearningData = learningData;
        console.log('学习进度数据已更新:', this.categoryLearningData);
      } catch (error) {
        console.error('加载学习进度数据失败:', error);
      }
    },
    
    // 获取分类进度
    getCategoryProgress(categoryId) {
      const data = this.categoryLearningData[categoryId];
      if (!data || data.total === 0) return 0;
      
      return Math.round((data.learned / data.total) * 100);
    },
    
    // 获取进度文本 (例: 5/30)
    getProgressText(categoryId) {
      const data = this.categoryLearningData[categoryId];
      if (!data) return '0/0';
      
      return `${data.learned}/${data.total}`;
    },
    
    // 点击分类
    handleCategoryClick(categoryId) {
      // 保存当前滚动位置到本地存储
      uni.setStorageSync('indexScrollPosition', this.currentScrollTop);
      
      uni.navigateTo({
        url: `/pages/question-list/index?categoryId=${categoryId}`
      });
    },
    
    // 监听滚动事件
    onScroll(e) {
      this.currentScrollTop = e.detail.scrollTop;
    },
    
    // 下拉刷新
    async onRefresh() {
      this.isRefreshing = true;
      await this.loadCategories();
      this.isRefreshing = false;
    },
    
    // 恢复滚动位置
    restoreScrollPosition() {
      if (this.isInitialized) {
        setTimeout(() => {
          try {
            const savedPosition = uni.getStorageSync('indexScrollPosition');
            if (savedPosition !== '' && savedPosition !== undefined) {
              this.scrollTop = savedPosition;
            }
          } catch (e) {
            console.error('恢复滚动位置失败:', e);
          }
        }, 100);
      }
    }
  },
  
  // 页面加载时
  onLoad() {
    this.loadCategories();
  },
  
  // 页面显示时更新数据
  onShow() {
    console.log('页面显示，更新学习数据');
    // 每次从其他页面返回时更新学习进度
    this.loadLearningData();
    // 恢复滚动位置
    this.restoreScrollPosition();
  }
}
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
