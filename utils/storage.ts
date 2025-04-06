/**
 * @description 本地存储工具类
 * @features
 *   - 封装 uni.setStorage 和 uni.getStorage
 *   - 支持类型安全
 *   - 数据序列化/反序列化
 *   - 错误处理
 */

import type { LocalStorage, LearningRecord, FavoriteRecord, Statistics } from '@/api/types';

// 存储键枚举
export enum StorageKey {
  LEARNING_RECORDS = 'learning_records',
  FAVORITES = 'favorites',
  STATISTICS = 'statistics'
}

// 基础存储工具类
export class StorageUtil {
  /**
   * 保存数据到本地存储
   * @param key 存储键
   * @param data 要存储的数据
   * @returns Promise<void>
   */
  static async set<T>(key: string, data: T): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      await uni.setStorage({
        key,
        data: serializedData
      });
    } catch (error) {
      console.error(`保存数据失败: ${key}`, error);
      throw new Error(`保存数据失败: ${error}`);
    }
  }

  /**
   * 从本地存储获取数据
   * @param key 存储键
   * @returns Promise<T | null>
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const { data } = await uni.getStorage({ key });
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`获取数据失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 从本地存储删除数据
   * @param key 存储键
   * @returns Promise<void>
   */
  static async remove(key: string): Promise<void> {
    try {
      await uni.removeStorage({ key });
    } catch (error) {
      console.error(`删除数据失败: ${key}`, error);
      throw new Error(`删除数据失败: ${error}`);
    }
  }

  /**
   * 清除所有本地存储
   * @returns Promise<void>
   */
  static async clearAll(): Promise<void> {
    try {
      await uni.clearStorage();
    } catch (error) {
      console.error('清除所有数据失败', error);
      throw new Error(`清除所有数据失败: ${error}`);
    }
  }

  /**
   * 获取所有存储键
   * @returns Promise<string[]>
   */
  static async keys(): Promise<string[]> {
    try {
      const { keys } = await uni.getStorageInfo();
      return keys;
    } catch (error) {
      console.error('获取存储键失败', error);
      return [];
    }
  }

  /**
   * 获取存储信息
   * @returns Promise<UniApp.GetStorageInfoSuccess>
   */
  static async info(): Promise<UniApp.GetStorageInfoSuccess> {
    try {
      return await uni.getStorageInfo();
    } catch (error) {
      console.error('获取存储信息失败', error);
      throw new Error(`获取存储信息失败: ${error}`);
    }
  }
}

/**
 * 学习记录存储类
 */
export class LearningStorage {
  /**
   * 保存学习记录
   * @param records 学习记录
   * @returns Promise<void>
   */
  static async saveRecords(records: Record<number, LearningRecord>): Promise<void> {
    return StorageUtil.set(StorageKey.LEARNING_RECORDS, records);
  }

  /**
   * 获取学习记录
   * @returns Promise<Record<number, LearningRecord>>
   */
  static async getRecords(): Promise<Record<number, LearningRecord>> {
    const records = await StorageUtil.get<Record<number, LearningRecord>>(StorageKey.LEARNING_RECORDS);
    return records || {};
  }

  /**
   * 更新学习记录
   * @param questionId 题目ID
   * @param record 学习记录
   * @returns Promise<void>
   */
  static async updateRecord(questionId: number, record: LearningRecord): Promise<void> {
    const records = await this.getRecords();
    records[questionId] = record;
    return this.saveRecords(records);
  }

  /**
   * 保存统计信息
   * @param statistics 统计信息
   * @returns Promise<void>
   */
  static async saveStatistics(statistics: Statistics): Promise<void> {
    return StorageUtil.set(StorageKey.STATISTICS, statistics);
  }

  /**
   * 获取统计信息
   * @returns Promise<Statistics>
   */
  static async getStatistics(): Promise<Statistics> {
    const statistics = await StorageUtil.get<Statistics>(StorageKey.STATISTICS);
    return statistics || {
      totalLearnCount: 0,
      totalReviewCount: 0
    };
  }

  /**
   * 清除所有学习记录
   * @returns Promise<void>
   */
  static async clearAll(): Promise<void> {
    await Promise.all([
      StorageUtil.remove(StorageKey.LEARNING_RECORDS),
      StorageUtil.remove(StorageKey.STATISTICS)
    ]);
  }
}

/**
 * 收藏存储类
 */
export class FavoriteStorage {
  /**
   * 保存收藏记录
   * @param favorites 收藏记录
   * @returns Promise<void>
   */
  static async saveFavorites(favorites: Record<number, FavoriteRecord>): Promise<void> {
    return StorageUtil.set(StorageKey.FAVORITES, favorites);
  }

  /**
   * 获取收藏记录
   * @returns Promise<Record<number, FavoriteRecord>>
   */
  static async getFavorites(): Promise<Record<number, FavoriteRecord>> {
    const favorites = await StorageUtil.get<Record<number, FavoriteRecord>>(StorageKey.FAVORITES);
    return favorites || {};
  }

  /**
   * 添加收藏
   * @param questionId 题目ID
   * @param record 收藏记录
   * @returns Promise<void>
   */
  static async addFavorite(questionId: number, record: FavoriteRecord): Promise<void> {
    const favorites = await this.getFavorites();
    favorites[questionId] = record;
    return this.saveFavorites(favorites);
  }

  /**
   * 取消收藏
   * @param questionId 题目ID
   * @returns Promise<void>
   */
  static async removeFavorite(questionId: number): Promise<void> {
    const favorites = await this.getFavorites();
    delete favorites[questionId];
    return this.saveFavorites(favorites);
  }

  /**
   * 检查是否已收藏
   * @param questionId 题目ID
   * @returns Promise<boolean>
   */
  static async isFavorite(questionId: number): Promise<boolean> {
    const favorites = await this.getFavorites();
    return !!favorites[questionId];
  }

  /**
   * 清除所有收藏
   * @returns Promise<void>
   */
  static async clearAll(): Promise<void> {
    await StorageUtil.remove(StorageKey.FAVORITES);
  }
} 