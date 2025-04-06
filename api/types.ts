/**
 * 分类数据结构
 * @interface Category
 * @property {number} id - 分类唯一标识
 * @property {string} name - 分类名称
 * @property {number} count - 该分类下的题目数量
 */
export interface Category {
  id: number;
  name: string;
  count: number;
}

/**
 * 题目数据结构
 * @interface Question
 * @property {number} id - 题目唯一标识
 * @property {number} categoryId - 所属分类ID
 * @property {number} sort_order - 在分类中的排序顺序
 * @property {string} title - 题目标题
 * @property {string} answer - 题目答案
 * @property {string} uri - 详情页路径
 */
export interface Question {
  id: number;
  categoryId: number;
  sort_order: number;
  title: string;
  answer: string;
  uri: string;
}

/**
 * 学习记录结构
 * @interface LearningRecord
 * @property {boolean} isLearned - 是否已学习
 * @property {number} lastLearnTime - 最后学习时间戳
 * @property {number} reviewCount - 复习次数
 */
export interface LearningRecord {
  isLearned: boolean;
  lastLearnTime: number;
  reviewCount: number;
}

/**
 * 收藏记录结构
 * @interface FavoriteRecord
 * @property {number} id - 题目ID
 * @property {string} title - 题目标题
 * @property {number} addTime - 收藏时间戳
 * @property {number} categoryId - 所属分类ID
 */
export interface FavoriteRecord {
  id: number;
  title: string;
  addTime: number;
  categoryId: number;
}

/**
 * 学习统计结构
 * @interface Statistics
 * @property {number} totalLearnCount - 总学习题目数
 * @property {number} totalReviewCount - 总复习次数
 */
export interface Statistics {
  totalLearnCount: number;
  totalReviewCount: number;
}

/**
 * 本地存储数据结构
 * @interface LocalStorage
 * @property {Record<number, LearningRecord>} learningRecords - 学习记录，key为题目ID
 * @property {Record<number, FavoriteRecord>} favorites - 收藏记录，key为题目ID
 * @property {Statistics} statistics - 学习统计信息
 */
export interface LocalStorage {
  learningRecords: Record<number, LearningRecord>;
  favorites: Record<number, FavoriteRecord>;
  statistics: Statistics;
}

/**
 * 分类列表响应结构
 * @interface CategoryResponse
 * @property {Category[]} categories - 分类列表
 */
export interface CategoryResponse {
  categories: Category[];
}

/**
 * 题目列表响应结构
 * @interface QuestionResponse
 * @property {Question[]} questions - 题目列表
 */
export interface QuestionResponse {
  questions: Question[];
}

/**
 * 题目详情响应结构
 * @interface QuestionDetailResponse
 * @property {Question} question - 题目详情
 */
export interface QuestionDetailResponse {
  question: Question;
}

/**
 * 学习进度结构
 * @interface LearningProgress
 * @property {number} learnedCount - 已学习题目数
 * @property {number} totalCount - 总题目数
 * @property {number} progress - 学习进度（百分比）
 */
export interface LearningProgress {
  learnedCount: number;
  totalCount: number;
  progress: number;
}

/**
 * 收藏列表项结构
 * @interface FavoriteItem
 * @property {Question} question - 题目信息
 * @property {number} addTime - 收藏时间
 */
export interface FavoriteItem {
  question: Question;
  addTime: number;
} 