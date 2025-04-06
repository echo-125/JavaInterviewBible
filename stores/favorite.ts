/**
 * @description 收藏状态管理
 */
import { defineStore } from 'pinia';
import { FavoriteStorage } from '@/utils/storage';
import type { FavoriteRecord } from '@/api/types';

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    favorites: {} as Record<number, FavoriteRecord>
  }),

  getters: {
    // 获取题目的收藏记录
    getFavoriteRecord: (state) => (questionId: number) => {
      return state.favorites[questionId];
    },

    // 检查题目是否已收藏
    isQuestionFavorited: (state) => (questionId: number) => {
      return !!state.favorites[questionId];
    },

    // 获取收藏列表
    getFavoriteList: (state) => {
      return Object.entries(state.favorites).map(([questionId, record]) => ({
        questionId: Number(questionId),
        ...record
      }));
    },

    // 获取按时间排序的收藏列表
    getSortedFavorites: (state) => {
      return Object.entries(state.favorites)
        .map(([questionId, record]) => ({
          questionId: Number(questionId),
          ...record
        }))
        .sort((a, b) => b.addTime - a.addTime);
    }
  },

  actions: {
    // 初始化状态
    async init() {
      try {
        const favorites = await FavoriteStorage.getFavorites();
        this.favorites = favorites;
      } catch (error) {
        console.error('初始化收藏状态失败:', error);
        throw error;
      }
    },

    // 添加收藏
    async addFavorite(questionId: number, categoryId: number) {
      try {
        const record: FavoriteRecord = {
          addTime: Date.now(),
          categoryId
        };

        // 更新本地存储
        await FavoriteStorage.addFavorite(questionId, record);

        // 更新状态
        this.favorites[questionId] = record;
      } catch (error) {
        console.error('添加收藏失败:', error);
        throw error;
      }
    },

    // 取消收藏
    async removeFavorite(questionId: number) {
      try {
        // 更新本地存储
        await FavoriteStorage.removeFavorite(questionId);

        // 更新状态
        delete this.favorites[questionId];
      } catch (error) {
        console.error('取消收藏失败:', error);
        throw error;
      }
    },

    // 清除所有收藏
    async clearAll() {
      try {
        await FavoriteStorage.clearAll();
        this.favorites = {};
      } catch (error) {
        console.error('清除收藏失败:', error);
        throw error;
      }
    }
  }
}); 