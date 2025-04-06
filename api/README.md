# API 目录

## 目录说明
该目录包含应用程序的数据加载接口和类型定义。

## 文件结构
- `types.ts`: 定义应用程序使用的所有 TypeScript 接口和类型
- `index.ts`: 实现数据加载和处理的核心方法

## 主要功能
1. 数据加载
   - 读取本地 JSON 文件
   - 解析题目数据
   - 处理分类信息

2. 类型定义
   - 题目数据结构
   - 分类数据结构
   - 学习记录类型
   - 收藏记录类型

## 使用示例
```typescript
// 加载分类列表
const categories = await loadCategories();

// 加载指定分类的题目
const questions = await loadQuestionsByCategory(categoryId);

// 获取题目详情
const question = await getQuestionDetail(questionId);
```

## 注意事项
1. 所有数据操作都是异步的
2. 确保 JSON 文件格式正确
3. 处理文件读取错误
4. 实现数据缓存机制 