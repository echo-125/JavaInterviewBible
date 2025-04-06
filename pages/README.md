# Pages 目录

## 目录说明
该目录包含应用程序的所有页面文件。

## 页面列表
1. `index/`
   - 首页（分类列表）
   - 展示所有题目分类
   - 支持分类搜索

2. `question-list/`
   - 题目列表页
   - 显示指定分类的题目
   - 支持题目筛选和排序

3. `question-detail/`
   - 题目详情页
   - 显示题目内容和答案
   - 支持上一题/下一题导航

4. `favorites/`
   - 收藏页面
   - 显示已收藏的题目
   - 支持取消收藏

5. `profile/`
   - 个人中心页
   - 显示学习统计
   - 显示版本信息

## 页面规范
1. 文件结构
   ```
   page-name/
   ├── index.vue    # 页面主文件
   ├── types.ts     # 页面相关类型
   └── README.md    # 页面说明
   ```

2. 页面组件
   - 使用组合式 API
   - 实现页面生命周期
   - 处理页面状态

3. 路由配置
   - 在 pages.json 中配置
   - 设置页面标题
   - 配置页面样式

## 使用示例
```vue
<template>
  <view class="page-container">
    <!-- 页面内容 -->
    <uni-category-card
      v-for="category in categories"
      :key="category.id"
      :category="category"
      @click="handleCategoryClick"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLearningStore } from '@/stores/learning'

// 页面逻辑
</script>
```

## 注意事项
1. 遵循页面生命周期
2. 实现错误处理
3. 优化页面性能
4. 保持代码整洁
5. 添加页面注释 