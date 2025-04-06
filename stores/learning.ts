/**
 * @description 学习状态管理
 */
import { defineStore } from 'pinia';
import { LearningStorage } from '@/utils/storage';
import type { LearningRecord, Statistics } from '@/api/types';

export const useLearningStore = defineStore('learning', {
  state: () => ({
    learningRecords: {} as Record<number, LearningRecord>,
    statistics: {
      totalLearnCount: 0,
      totalReviewCount: 0
    } as Statistics
  }),

  getters: {
    // 获取题目的学习记录
    getQuestionRecord: (state) => (questionId: number) => {
      return state.learningRecords[questionId];
    },

    // 获取题目的学习状态
    isQuestionLearned: (state) => (questionId: number) => {
      return state.learningRecords[questionId]?.isLearned || false;
    },

    // 获取题目的复习次数
    getQuestionReviewCount: (state) => (questionId: number) => {
      return state.learningRecords[questionId]?.reviewCount || 0;
    },

    // 获取分类的学习进度
    getCategoryProgress: (state) => (categoryId: number, totalCount: number) => {
      const learnedCount = Object.values(state.learningRecords).filter(
        record => record.isLearned
      ).length;
      return {
        learnedCount,
        totalCount,
        progress: totalCount > 0 ? (learnedCount / totalCount) * 100 : 0
      };
    }
  },

  actions: {
    // 初始化状态
    async init() {
      try {
        const [records, stats] = await Promise.all([
          LearningStorage.getRecords(),
          LearningStorage.getStatistics()
        ]);
        this.learningRecords = records;
        this.statistics = stats;
      } catch (error) {
        console.error('初始化学习状态失败:', error);
        throw error;
      }
    },

    // 更新题目学习状态
    async updateQuestionStatus(questionId: number, isLearned: boolean) {
      try {
        const now = Date.now();
        const record = this.learningRecords[questionId] || {
          isLearned: false,
          lastLearnTime: 0,
          reviewCount: 0
        };

        // 更新学习状态
        record.isLearned = isLearned;
        record.lastLearnTime = now;
        record.reviewCount += 1;

        // 更新本地存储
        await LearningStorage.updateRecord(questionId, record);

        // 更新状态
        this.learningRecords[questionId] = record;
        this.statistics.totalLearnCount = Object.values(this.learningRecords)
          .filter(r => r.isLearned).length;
        this.statistics.totalReviewCount = Object.values(this.learningRecords)
          .reduce((sum, r) => sum + r.reviewCount, 0);

        // 更新统计信息
        await LearningStorage.saveStatistics(this.statistics);
      } catch (error) {
        console.error('更新学习状态失败:', error);
        throw error;
      }
    },

    // 清除所有学习记录
    async clearAll() {
      try {
        await LearningStorage.clearAll();
        this.learningRecords = {};
        this.statistics = {
          totalLearnCount: 0,
          totalReviewCount: 0
        };
      } catch (error) {
        console.error('清除学习记录失败:', error);
        throw error;
      }
    }
  }
}); 