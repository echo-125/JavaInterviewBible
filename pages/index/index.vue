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
      isInitialized: false,
      questionCategoryMap: {}, // 缓存问题ID与分类ID的映射关系
      questionsLoaded: false // 标记是否已加载所有问题ID与分类ID的映射
    };
  },
  
  methods: {
    // 获取分类列表
    async loadCategories() {
      try {
        if (this.categories.length === 0) {
          // 只有在分类列表为空时才重新加载
          this.categories = await getCategories();
        }
        
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
    
    // 预加载问题ID与分类ID的映射关系
    async preloadQuestionCategoryMap() {
      try {
        if (this.questionsLoaded) {
          return; // 已加载过，不再重复加载
        }
        
        // 初始化映射对象
        this.questionCategoryMap = {};
        
        // 创建所有分类数据加载的Promise数组
        const loadPromises = this.categories.map(async (category) => {
          try {
            const questions = await getQuestions(category.id);
            // 将每个问题的ID和分类ID加入映射表
            questions.forEach(question => {
              this.questionCategoryMap[question.id] = category.id;
            });
          } catch (error) {
            console.error(`加载分类 ${category.id} 的问题失败:`, error);
          }
        });
        
        // 并行加载所有分类的问题
        await Promise.all(loadPromises);
        
        this.questionsLoaded = true;
      } catch (error) {
        console.error('预加载问题映射关系失败:', error);
      }
    },
    
    // 初始化分类学习数据结构
    initCategoryLearningData() {
      const learningData = {};
      
      // 初始化每个分类的学习数据
      for (const category of this.categories) {
        learningData[category.id] = {
          total: category.count,
          learned: 0
        };
      }
      
      return learningData;
    },
    
    // 加载所有分类的学习进度数据
    async loadLearningData() {
      try {
        // 初始化学习数据结构
        const learningData = this.initCategoryLearningData();
        
        // 获取学习记录
        const records = await LearningStorage.getRecords();
        const learnedQuestionIds = Object.entries(records)
          .filter(([_, record]) => record && record.isLearned)
          .map(([id, _]) => parseInt(id));
        
        // 如果有已学习的问题，且问题映射未加载，则加载映射
        if (learnedQuestionIds.length > 0 && !this.questionsLoaded) {
          await this.preloadQuestionCategoryMap();
        }
        
        // 使用映射表快速统计各分类的已学习数量
        for (const questionId of learnedQuestionIds) {
          const categoryId = this.questionCategoryMap[questionId];
          if (categoryId && learningData[categoryId]) {
            learningData[categoryId].learned += 1;
          }
        }
        
        this.categoryLearningData = learningData;
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
      // 强制刷新映射关系
      this.questionsLoaded = false;
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
