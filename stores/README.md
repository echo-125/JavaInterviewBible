# Stores 目录

## 目录说明
该目录包含应用程序的状态管理文件，使用 Pinia 进行状态管理。

## 状态模块
1. `learning.ts`
   - 学习进度状态
   - 记录学习历史
   - 统计学习数据

2. `favorite.ts`
   - 收藏状态管理
   - 收藏列表维护
   - 收藏操作处理

## 状态设计
1. 学习状态
   ```typescript
   interface LearningState {
     records: {
       [questionId: number]: {
         isLearned: boolean;
         lastLearnTime: number;
         reviewCount: number;
       }
     };
     statistics: {
       totalLearnCount: number;
       totalReviewCount: number;
     };
   }
   ```

2. 收藏状态
   ```typescript
   interface FavoriteState {
     favorites: {
       [questionId: number]: {
         addTime: number;
         categoryId: number;
       }
     };
   }
   ```

## 使用示例
```typescript
// 使用学习状态
const learningStore = useLearningStore()

// 记录学习进度
learningStore.recordLearning(questionId)

// 获取学习统计
const stats = learningStore.getStatistics()

// 使用收藏状态
const favoriteStore = useFavoriteStore()

// 添加收藏
favoriteStore.addFavorite(questionId, categoryId)

// 获取收藏列表
const favorites = favoriteStore.getFavorites()
```

## 注意事项
1. 状态应该是响应式的
2. 实现状态持久化
3. 处理状态更新
4. 保持状态一致性
5. 添加状态注释 