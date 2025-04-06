/**
 * @description 数据加载工具
 * @features
 *   - 加载分类数据
 *   - 加载题目数据
 *   - 错误处理
 */
import type { Category, Question } from '../api/types';
import categoryJson from '../static/json/category.json';

// 特定JSON文件中的问题类型（与Question类型略有不同）
interface JsonQuestion {
  id: number;
  uri: string;
  title: string;
  categoryId: number;
  sortOrder: number; // JSON文件中使用sortOrder而不是sort_order
  answer: string;
}

/**
 * 将JSON格式的问题转换为应用格式
 */
function convertJsonQuestion(jsonQuestion: JsonQuestion): Question {
  return {
    id: jsonQuestion.id,
    uri: jsonQuestion.uri,
    title: jsonQuestion.title,
    categoryId: jsonQuestion.categoryId,
    sort_order: jsonQuestion.sortOrder, // 转换属性名
    answer: jsonQuestion.answer
  };
}

/**
 * 获取分类列表
 * @returns Promise<Category[]>
 * @example
 * ```typescript
 * const categories = await getCategories();
 * console.log(categories);
 * ```
 */
export async function getCategories(): Promise<Category[]> {
  try {
    console.log('开始读取分类列表...');
    console.log('分类列表读取成功:', categoryJson);
    return categoryJson as Category[];
  } catch (error) {
    console.error('获取分类列表失败:', error);
    throw error;
  }
}

/**
 * 根据分类ID动态导入题目数据
 */
async function importQuestionsByCategory(categoryId: number): Promise<JsonQuestion[]> {
  try {
    // 动态导入对应分类的JSON文件
    const module = await import(`../static/json/questions/${categoryId}.json`);
    return module.default || [];
  } catch (error) {
    console.warn(`导入分类 ${categoryId} 的题目数据失败:`, error);
    return [];
  }
}

/**
 * 获取题目列表
 * @param categoryId 分类ID
 * @returns Promise<Question[]>
 * @example
 * ```typescript
 * const questions = await getQuestions(1);
 * console.log(questions);
 * ```
 */
export async function getQuestions(categoryId: number): Promise<Question[]> {
  try {
    console.log(`开始读取分类 ${categoryId} 的题目列表...`);
    
    // 动态导入对应分类的题目数据
    const jsonQuestions = await importQuestionsByCategory(categoryId);
    
    // 转换为应用格式
    const data = jsonQuestions.map(convertJsonQuestion);
    
    console.log(`分类 ${categoryId} 的题目列表读取成功:`, data);
    return data;
  } catch (error) {
    console.error(`获取分类 ${categoryId} 的题目列表失败:`, error);
    throw error;
  }
}

/**
 * 获取题目详情
 * @param questionId 题目ID
 * @param categoryId 分类ID
 * @returns Promise<Question>
 * @example
 * ```typescript
 * const question = await getQuestionDetail(1, 1);
 * console.log(question);
 * ```
 */
export async function getQuestionDetail(questionId: number, categoryId: number): Promise<Question> {
  try {
    console.log(`开始获取题目 ${questionId} 的详情...`);
    const questions = await getQuestions(categoryId);
    const question = questions.find(q => q.id === questionId);
    
    if (!question) {
      throw new Error(`题目 ${questionId} 不存在`);
    }
    
    console.log(`题目 ${questionId} 的详情获取成功:`, question);
    return question;
  } catch (error) {
    console.error(`获取题目 ${questionId} 详情失败:`, error);
    throw error;
  }
}

/**
 * 获取分类详情
 * @param categoryId 分类ID
 * @returns Promise<Category>
 * @example
 * ```typescript
 * const category = await getCategoryDetail(1);
 * console.log(category);
 * ```
 */
export async function getCategoryDetail(categoryId: number): Promise<Category> {
  try {
    console.log(`开始获取分类 ${categoryId} 的详情...`);
    const categories = await getCategories();
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) {
      throw new Error(`分类 ${categoryId} 不存在`);
    }
    
    console.log(`分类 ${categoryId} 的详情获取成功:`, category);
    return category;
  } catch (error) {
    console.error(`获取分类 ${categoryId} 详情失败:`, error);
    throw error;
  }
} 