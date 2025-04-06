/**
 * 统计工具类
 * 提供学习进度、收藏统计和时间统计功能
 */

import type { LearningProgress, Statistics, LearningRecord } from '@/api/types';
import { LearningStorage, FavoriteStorage } from './storage';

/**
 * 统计工具类
 */
export class StatisticsUtil {
  /**
   * 计算学习进度
   * @param categoryId - 分类ID，如果提供则计算特定分类的进度
   * @returns Promise<LearningProgress>
   */
  static async calculateProgress(categoryId?: number): Promise<LearningProgress> {
    try {
      // 获取学习记录
      const records = await LearningStorage.getRecords();
      
      // 获取所有题目数量
      const totalCount = categoryId 
        ? await this.getCategoryQuestionCount(categoryId)
        : await this.getTotalQuestionCount();
      
      // 计算已学习题目数量
      const learnedCount = Object.values(records).filter(record => record.isLearned).length;
      
      // 计算进度百分比
      const progress = totalCount > 0 ? (learnedCount / totalCount) * 100 : 0;
      
      return {
        learnedCount,
        totalCount,
        progress: Math.round(progress * 100) / 100
      };
    } catch (error) {
      console.error('计算学习进度失败', error);
      return {
        learnedCount: 0,
        totalCount: 0,
        progress: 0
      };
    }
  }

  /**
   * 获取分类题目总数
   * @param categoryId - 分类ID
   * @returns Promise<number>
   */
  static async getCategoryQuestionCount(categoryId: number): Promise<number> {
    try {
      // 这里应该从本地JSON文件或缓存中获取分类题目数量
      // 暂时返回一个模拟值
      return 100;
    } catch (error) {
      console.error(`获取分类题目数量失败: ${categoryId}`, error);
      return 0;
    }
  }

  /**
   * 获取所有题目总数
   * @returns Promise<number>
   */
  static async getTotalQuestionCount(): Promise<number> {
    try {
      // 这里应该从本地JSON文件或缓存中获取所有题目数量
      // 暂时返回一个模拟值
      return 500;
    } catch (error) {
      console.error('获取题目总数失败', error);
      return 0;
    }
  }

  /**
   * 获取收藏统计
   * @returns Promise<{ total: number; byCategory: Record<number, number> }>
   */
  static async getFavoriteStats(): Promise<{ total: number; byCategory: Record<number, number> }> {
    try {
      // 获取收藏记录
      const favorites = await FavoriteStorage.getFavorites();
      
      // 计算总数
      const total = Object.keys(favorites).length;
      
      // 按分类统计
      const byCategory: Record<number, number> = {};
      
      Object.values(favorites).forEach(favorite => {
        const { categoryId } = favorite;
        byCategory[categoryId] = (byCategory[categoryId] || 0) + 1;
      });
      
      return { total, byCategory };
    } catch (error) {
      console.error('获取收藏统计失败', error);
      return { total: 0, byCategory: {} };
    }
  }

  /**
   * 获取学习时间统计
   * @param days - 统计天数，默认7天
   * @returns Promise<{ daily: Record<string, number>; total: number }>
   */
  static async getLearningTimeStats(days: number = 7): Promise<{ daily: Record<string, number>; total: number }> {
    try {
      // 获取学习记录
      const records = await LearningStorage.getRecords();
      
      // 初始化每日学习时间
      const daily: Record<string, number> = {};
      let total = 0;
      
      // 计算最近几天的日期
      const today = new Date();
      const dates: string[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(this.formatDate(date));
      }
      
      // 初始化每日数据
      dates.forEach(date => {
        daily[date] = 0;
      });
      
      // 统计学习时间
      Object.values(records).forEach(record => {
        if (record.isLearned && record.lastLearnTime) {
          const date = this.formatDate(new Date(record.lastLearnTime));
          
          // 只统计最近几天的数据
          if (dates.includes(date)) {
            // 假设每次学习时间为10分钟
            const learnTime = 10;
            daily[date] += learnTime;
            total += learnTime;
          }
        }
      });
      
      return { daily, total };
    } catch (error) {
      console.error('获取学习时间统计失败', error);
      return { daily: {}, total: 0 };
    }
  }

  /**
   * 获取学习频率统计
   * @returns Promise<{ frequency: Record<string, number>; streak: number }>
   */
  static async getLearningFrequencyStats(): Promise<{ frequency: Record<string, number>; streak: number }> {
    try {
      // 获取学习记录
      const records = await LearningStorage.getRecords();
      
      // 初始化学习频率
      const frequency: Record<string, number> = {
        daily: 0,
        weekly: 0,
        monthly: 0
      };
      
      // 计算当前时间
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;
      
      // 统计学习频率
      Object.values(records).forEach(record => {
        if (record.isLearned && record.lastLearnTime) {
          const timeDiff = now - record.lastLearnTime;
          
          if (timeDiff <= oneDay) {
            frequency.daily++;
          }
          
          if (timeDiff <= oneWeek) {
            frequency.weekly++;
          }
          
          if (timeDiff <= oneMonth) {
            frequency.monthly++;
          }
        }
      });
      
      // 计算连续学习天数
      const streak = await this.calculateStreak(records);
      
      return { frequency, streak };
    } catch (error) {
      console.error('获取学习频率统计失败', error);
      return { frequency: { daily: 0, weekly: 0, monthly: 0 }, streak: 0 };
    }
  }

  /**
   * 计算连续学习天数
   * @param records - 学习记录
   * @returns Promise<number>
   */
  static async calculateStreak(records: Record<number, LearningRecord>): Promise<number> {
    try {
      // 获取所有学习日期
      const learnDates = Object.values(records)
        .filter(record => record.isLearned && record.lastLearnTime)
        .map(record => this.formatDate(new Date(record.lastLearnTime)))
        .filter((date, index, self) => self.indexOf(date) === index) // 去重
        .sort();
      
      if (learnDates.length === 0) {
        return 0;
      }
      
      // 计算连续天数
      let streak = 1;
      const today = this.formatDate(new Date());
      
      // 如果今天没有学习，从昨天开始计算
      let currentDate = learnDates.includes(today) ? today : this.formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
      
      for (let i = 1; i < learnDates.length; i++) {
        const prevDate = this.addDays(currentDate, -1);
        
        if (learnDates.includes(prevDate)) {
          streak++;
          currentDate = prevDate;
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('计算连续学习天数失败', error);
      return 0;
    }
  }

  /**
   * 更新学习统计
   * @param questionId - 题目ID
   * @param isReview - 是否为复习
   */
  static async updateLearningStats(questionId: number, isReview: boolean = false): Promise<void> {
    try {
      // 获取当前统计信息
      const stats = await LearningStorage.getStatistics();
      
      // 更新统计信息
      const updatedStats: Statistics = isReview
        ? {
            ...stats,
            totalReviewCount: stats.totalReviewCount + 1
          }
        : {
            ...stats,
            totalLearnCount: stats.totalLearnCount + 1
          };
      
      // 保存更新后的统计信息
      await LearningStorage.saveStatistics(updatedStats);
    } catch (error) {
      console.error('更新学习统计失败', error);
    }
  }

  /**
   * 格式化日期为 YYYY-MM-DD
   * @param date - 日期对象
   * @returns string
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 日期加减天数
   * @param dateStr - 日期字符串 YYYY-MM-DD
   * @param days - 天数，正数为加，负数为减
   * @returns string
   */
  private static addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return this.formatDate(date);
  }
} 