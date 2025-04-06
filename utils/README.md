# Utils 目录

## 目录说明
该目录包含应用程序的工具函数文件。

## 文件结构
1. `storage.ts`
   - 本地存储操作
   - 数据持久化
   - 缓存管理

2. `format.ts`
   - 日期格式化
   - 数字格式化
   - 文本格式化

3. `statistics.ts`
   - 学习统计
   - 进度计算
   - 数据分析

## 工具函数
1. 存储工具
   ```typescript
   // 保存数据
   export const saveData = (key: string, data: any): void => {
     uni.setStorageSync(key, JSON.stringify(data))
   }
   
   // 获取数据
   export const getData = <T>(key: string): T | null => {
     const data = uni.getStorageSync(key)
     return data ? JSON.parse(data) : null
   }
   ```

2. 格式化工具
   ```typescript
   // 日期格式化
   export const formatDate = (date: Date): string => {
     return date.toLocaleDateString()
   }
   
   // 数字格式化
   export const formatNumber = (num: number): string => {
     return num.toLocaleString()
   }
   ```

3. 统计工具
   ```typescript
   // 计算学习进度
   export const calculateProgress = (
     learned: number,
     total: number
   ): number => {
     return (learned / total) * 100
   }
   ```

## 使用示例
```typescript
import { saveData, getData } from '@/utils/storage'
import { formatDate } from '@/utils/format'
import { calculateProgress } from '@/utils/statistics'

// 保存学习记录
saveData('learning_records', {
  questionId: 1,
  timestamp: Date.now()
})

// 获取学习记录
const records = getData('learning_records')

// 格式化日期
const date = formatDate(new Date())

// 计算进度
const progress = calculateProgress(50, 100)
```

## 注意事项
1. 函数应该是纯函数
2. 添加类型声明
3. 处理异常情况
4. 添加函数注释
5. 保持代码简洁 