# Java面试宝典

## 项目介绍
微信小程序，专为Java求职者打造的高频面试题库，助你从海量候选人中脱颖而出，直通心仪Offer。

完全离线运行，无需后端服务。

## 技术栈
- 框架：uni-app
- 语言：TypeScript
- 状态管理：Pinia
- 构建工具：Vite
- 包管理：pnpm

## 功能特点
1. 学习模块
   - 分类列表展示
   - 题目列表浏览
   - 题目详情查看
   - 上一题/下一题导航
   - 学习进度记录
   - 语音播报题目和答案
   
2. 收藏模块
   - 题目收藏/取消
   - 收藏列表管理
   - 收藏时间排序

3. 个人中心
   - 学习统计展示
   - 版本信息展示

## 项目结构
```
InterviewBible/
├── api/          # 数据加载接口
├── components/   # 公共组件
├── pages/        # 页面文件
├── stores/       # 状态管理
├── static/       # 静态资源
├── styles/       # 全局样式
├── utils/        # 工具函数
├── App.vue       # 应用入口
├── main.ts       # 主入口
├── manifest.json # 配置文件
├── pages.json    # 页面配置
└── uni.scss      # 全局样式变量
```

## 开发环境
- Node.js >= 16
- pnpm >= 8
- HBuilderX >= 3.8.0

## 安装依赖
```bash
pnpm install
```

## 开发命令
```bash
# 开发模式
pnpm dev:mp-weixin

# 打包
pnpm build:mp-weixin
```

## 目录说明
- [api/](api/README.md) - 数据加载接口
- [components/](components/README.md) - 公共组件
- [pages/](pages/README.md) - 页面文件
- [stores/](stores/README.md) - 状态管理
- [static/](static/README.md) - 静态资源
- [styles/](styles/README.md) - 全局样式
- [utils/](utils/README.md) - 工具函数

## 注意事项
1. 确保微信开发者工具已安装
2. 配置正确的 AppID
3. 开启微信开发者工具的增强编译
4. 注意代码规范和提交规范
5. 保持依赖版本一致

## 贡献指南
1. Fork 本仓库
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

## 版本信息
- 版本：1.1.0

- 作者：echo-125

## 在线体验

![iagme](.\miniappcode.jpg)
