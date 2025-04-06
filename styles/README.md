# Styles 目录

## 目录说明
该目录包含应用程序的全局样式文件。

## 文件结构
1. `variables.scss`
   - 颜色变量
   - 尺寸变量
   - 字体变量
   - 间距变量

2. `common.scss`
   - 公共样式
   - 布局样式
   - 动画样式
   - 工具类

## 样式规范
1. 变量命名
   ```scss
   // 颜色
   $primary-color: #018EFF;
   $text-color: #333333;
   $background-color: #F8F8F8;
   
   // 尺寸
   $font-size-small: 24rpx;
   $font-size-normal: 28rpx;
   $font-size-large: 32rpx;
   
   // 间距
   $spacing-mini: 4rpx;
   $spacing-small: 8rpx;
   $spacing-normal: 16rpx;
   $spacing-large: 24rpx;
   ```

2. 公共样式
   ```scss
   // 布局
   .flex-center {
     display: flex;
     align-items: center;
     justify-content: center;
   }
   
   // 文本
   .text-ellipsis {
     overflow: hidden;
     text-overflow: ellipsis;
     white-space: nowrap;
   }
   
   // 动画
   .fade-enter-active,
   .fade-leave-active {
     transition: opacity 0.3s ease;
   }
   ```

## 使用示例
```vue
<template>
  <view class="container">
    <text class="title">标题</text>
    <view class="content flex-center">
      <text class="text-ellipsis">内容</text>
    </view>
  </view>
</template>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/common.scss';

.container {
  padding: $spacing-normal;
  background-color: $background-color;
  
  .title {
    font-size: $font-size-large;
    color: $text-color;
  }
}
</style>
```

## 注意事项
1. 使用 SCSS 预处理器
2. 遵循 BEM 命名规范
3. 避免样式冲突
4. 保持样式复用
5. 注意性能优化 