# Components 目录

## 目录说明
该目录包含应用程序的所有可复用组件。

## 组件列表
1. `category-card/`
   - 分类卡片组件
   - 显示分类名称和题目数量
   - 支持点击跳转

2. `question-card/`
   - 题目卡片组件
   - 显示题目标题和状态
   - 支持收藏标记

3. `progress-bar/`
   - 进度条组件
   - 显示学习进度
   - 支持动画效果

4. `stats-panel/`
   - 统计面板组件
   - 显示学习统计数据
   - 支持数据更新

## 组件规范
1. 命名规范
   - 使用 kebab-case
   - 组件名以 `uni-` 开头

2. 文件结构
   ```
   component-name/
   ├── index.vue    # 组件主文件
   ├── types.ts     # 类型定义
   └── README.md    # 组件说明
   ```

3. 组件属性
   - 使用 TypeScript 类型
   - 提供默认值
   - 添加属性说明

## 使用示例
```vue
<template>
  <uni-category-card
    :category="category"
    @click="handleClick"
  />
  
  <uni-question-card
    :question="question"
    :is-favorite="isFavorite"
    @favorite="handleFavorite"
  />
  
  <uni-progress-bar
    :progress="progress"
    :total="total"
  />
  
  <uni-stats-panel
    :stats="statistics"
  />
</template>
```

## 注意事项
1. 组件应该是纯展示型的
2. 避免组件间的直接依赖
3. 使用 Props 和 Events 通信
4. 保持组件的可复用性
5. 添加必要的注释和文档 