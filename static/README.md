# Static 目录

## 目录说明
该目录包含应用程序的静态资源文件。

## 目录结构
1. `json/`
   - 题库数据文件
   - 分类数据文件
   - 配置文件

2. `images/`
   - 界面图标
   - 背景图片
   - 其他图片资源

## 文件规范
1. JSON 文件
   - 使用 UTF-8 编码
   - 保持格式统一
   - 添加必要注释

2. 图片资源
   - 使用 PNG 格式
   - 优化图片大小
   - 使用合适的尺寸

## 数据格式
1. 分类数据 (categories.json)
   ```json
   [
     {
       "id": 1,
       "name": "Java基础",
       "count": 100
     }
   ]
   ```

2. 题目数据 (questions/1.json)
   ```json
   [
     {
       "id": 1,
       "categoryId": 1,
       "sort_order": 1,
       "title": "什么是Java?",
       "answer": "Java是一种广泛使用的计算机编程语言...",
       "uri": "/pages/question-detail/index?id=1"
     }
   ]
   ```

## 注意事项
1. 保持文件结构清晰
2. 定期更新题库数据
3. 优化资源加载
4. 控制资源大小
5. 做好版本管理 