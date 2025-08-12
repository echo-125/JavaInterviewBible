<!--
 * @description 题目详情页面
 * @features
 *   - 题目内容展示
 *   - 答案解析
 *   - 导航控制
 *   - 收藏功能
 *   - 学习状态管理
 *   - 支持HTML内容
 -->
<template>
  <view class="question-detail">
    <view class="question-detail__header">
      <view class="question-detail__title-bar">
        <text class="question-detail__category">{{ categoryName }}</text>
        <text class="question-detail__progress">{{ currentIndex + 1 }}/{{ totalCount }}</text>
      </view>
    </view>
    
    <!-- 添加固定位置的学习计时器 -->
    <view v-if="!isLearned && autoLearnProgress > 0" class="question-detail__fixed-timer">
      <view class="question-detail__learn-progress">
        <view class="question-detail__learn-progress-text">
          <text><text class="timer-icon">⌛</text> 学习计时中</text>
          <text>{{ autoLearnProgress }}/{{ autoLearnDuration }}秒</text>
        </view>
        <view class="question-detail__learn-progress-bar">
          <view 
            class="question-detail__learn-progress-fill"
            :style="{ width: (autoLearnProgress / autoLearnDuration * 100) + '%' }"
          ></view>
        </view>
      </view>
    </view>
    
    <scroll-view 
      class="question-detail__content"
      scroll-y
      :style="contentStyle"
    >
      <view class="question-detail__wrapper">
        <view class="question-detail__section">
          <view class="question-detail__section-header">
            <text class="question-detail__section-title">题目</text>
            <view class="question-detail__section-actions">
              <view class="question-detail__audio-btn" @click="toggleAudioPlayback">
                <view :class="[
                  'icon',
                  isPlayingQuestion ? 'icon-pause' : 'icon-play'
                ]"></view>
              </view>
              <view class="question-detail__learn-tag" @click="handleLearn">
                <text v-if="isLearned" class="question-detail__tag question-detail__tag--learned">
                  已学习 {{ formatDate(learningRecord.lastLearnTime) }}
                </text>
                <text v-else class="question-detail__tag question-detail__tag--unlearned">未学习</text>
              </view>
            </view>
          </view>
          <text class="question-detail__text">{{ currentQuestion?.title }}</text>
        </view>
        
        <view class="question-detail__section">
          <view class="question-detail__section-header">
            <text class="question-detail__section-title">答案</text>
            <view class="question-detail__audio-btn" @click="toggleAnswerAudioPlayback">
              <view :class="[
                'icon',
                isPlayingAnswer ? 'icon-pause' : 'icon-play'
              ]"></view>
            </view>
          </view>
          <rich-text class="question-detail__rich-text" :nodes="processedAnswer"></rich-text>
        </view>
        
        <!-- 底部占位，确保内容不被底部按钮遮挡 -->
        <view style="height: 80px;"></view>
      </view>
    </scroll-view>
    
    <view class="question-detail__fixed-buttons">
      <view 
        class="question-detail__action-btn question-detail__prev-btn"
        :class="{ 'question-detail__action-btn--disabled': !hasPrev }"
        @click="hasPrev && handlePrev()"
      >
        <text class="btn-icon iconfont icon-left"></text>
        <text class="btn-text">上一题</text>
      </view>
      
      <view 
        class="question-detail__action-btn question-detail__favorite-btn"
        :class="{ 'question-detail__favorite-btn--active': isFavorite }"
        @click="handleFavorite"
      >
        <text class="btn-icon iconfont" :class="isFavorite ? 'icon-heart-fill' : 'icon-heart'"></text>
        <text class="btn-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
      </view>
      
      <view 
        class="question-detail__action-btn question-detail__next-btn"
        :class="{ 'question-detail__action-btn--disabled': !hasNext }"
        @click="hasNext && handleNext()"
      >
        <text class="btn-text">下一题</text>
        <text class="btn-icon iconfont icon-right"></text>
      </view>
    </view>
  </view>
</template>

<script>
import { getQuestions, getCategoryDetail } from '../../utils/dataLoader';
import { LearningStorage, FavoriteStorage } from '../../utils/storage';

export default {
  data() {
    return {
      categoryId: 0,
      questionId: 0,
      categoryName: '',
      questions: [],
      currentQuestion: null,
      isLearned: false,
      isFavorite: false,
      learningRecord: {
        lastLearnTime: 0,
        reviewCount: 0
      },
      autoLearnTimer: null,
      autoLearnProgress: 0,
      autoLearnInterval: null,
      autoLearnDuration: 85, // 自动学习所需秒数
      // 语音播放相关状态
      isPlayingQuestion: false,
      isPlayingAnswer: false,
      audioContext: null,
      plugin: null
    }
  },
  
  computed: {
    currentIndex() {
      return this.questions.findIndex(q => q.id === this.questionId);
    },
    
    totalCount() {
      return this.questions.length;
    },
    
    hasPrev() {
      return this.currentIndex > 0;
    },
    
    hasNext() {
      return this.currentIndex < this.totalCount - 1;
    },
    
    // 处理HTML答案
    processedAnswer() {
      if (!this.currentQuestion?.answer) return '';
      
      // 确保内容可以正确显示HTML
      let content = this.currentQuestion.answer;
      
      // 处理代码块和其他格式化
      content = content.replace(/\n/g, '<br>');
      
      return content;
    },
    
    // 计算内容区域的顶部边距
    contentStyle() {
      // 如果显示计时器，则添加额外的边距
      if (!this.isLearned && this.autoLearnProgress > 0) {
        return { paddingTop: '50px' };
      }
      return {};
    }
  },
  
  onLoad(options) {
    if (options.categoryId && options.questionId) {
      this.categoryId = Number(options.categoryId);
      this.questionId = Number(options.questionId);
      this.loadQuestions();
      this.loadCategoryName();
    }
  },
  
  onShow() {
    // 开始计时器
    this.startAutoLearnTimer();
  },
  
  onHide() {
    // 清除计时器
    this.clearAutoLearnTimer();
    // 停止语音播放
    this.stopAudioPlayback();
  },
  
  onUnload() {
    // 清除计时器
    this.clearAutoLearnTimer();
    // 停止语音播放
    this.stopAudioPlayback();
  },
  
  methods: {
    // 加载分类名称
    async loadCategoryName() {
      try {
        const category = await getCategoryDetail(this.categoryId);
        this.categoryName = category.name || '未知分类';
      } catch (error) {
        console.error('加载分类名称失败:', error);
      }
    },
    
    // 加载题目列表和详情
    async loadQuestions() {
      try {
        this.questions = await getQuestions(this.categoryId);
        this.currentQuestion = this.questions.find(q => q.id === this.questionId) || null;
        
        if (!this.currentQuestion) {
          uni.showToast({
            title: '题目不存在',
            icon: 'none'
          });
          uni.navigateBack();
          return;
        }
        
        // 更新学习状态
        const records = await LearningStorage.getRecords();
        const record = records[this.questionId];
        this.isLearned = record?.isLearned || false;
        this.learningRecord = record || { lastLearnTime: 0, reviewCount: 0 };
        
        // 更新收藏状态
        const favorites = await FavoriteStorage.getFavorites();
        this.isFavorite = !!favorites[this.questionId];
        
        // 数据加载完成后，开始自动学习计时器
        this.$nextTick(() => {
          this.startAutoLearnTimer();
        });
      } catch (error) {
        console.error('加载题目失败:', error);
        uni.showToast({
          title: '加载题目失败',
          icon: 'none'
        });
      }
    },
    
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      return `${month}/${day}`;
    },
    
    // 初始化TTS插件
    initTTSPlugin() {
      if (!this.plugin) {
        this.plugin = requirePlugin("WechatAI");
      }
    },
    
    // 切换题目语音播放
    toggleAudioPlayback() {
      if (this.isPlayingQuestion) {
        this.stopAudioPlayback();
      } else {
        this.playQuestionAndAnswer();
      }
    },
    
    // 播放题目和答案
    playQuestionAndAnswer() {
      this.initTTSPlugin();
      
      // 停止当前播放
      this.stopAudioPlayback();
      
      // 设置播放状态
      this.isPlayingQuestion = true;
      
      // 播放题目
      const questionText = this.currentQuestion?.title || '';
      if (questionText) {
        this.playText(questionText, () => {
          // 题目播放完成后播放答案
          const answerText = this.stripHtmlTags(this.currentQuestion?.answer || '');
          if (answerText) {
            this.isPlayingQuestion = false;
            this.isPlayingAnswer = true;
            this.playText(answerText, () => {
              // 答案播放完成，重置状态
              this.isPlayingAnswer = false;
            });
          } else {
            this.isPlayingQuestion = false;
          }
        });
      }
    },
    
    // 切换答案语音播放
    toggleAnswerAudioPlayback() {
      if (this.isPlayingAnswer) {
        this.stopAudioPlayback();
      } else {
        this.playAnswer();
      }
    },
    
    // 播放答案
    playAnswer() {
      this.initTTSPlugin();
      
      // 停止当前播放
      this.stopAudioPlayback();
      
      // 设置播放状态
      this.isPlayingAnswer = true;
      
      // 播放答案
      const answerText = this.stripHtmlTags(this.currentQuestion?.answer || '');
      if (answerText) {
        this.playText(answerText, () => {
          // 播放完成，重置状态
          this.isPlayingAnswer = false;
        });
      }
    },
    
    // 播放文本
    playText(text, callback) {
      // 微信TTS单次最多播放50个字符，需要分段播放
      const maxLength = 50;
      if (text.length <= maxLength) {
        this.speakText(text, callback);
      } else {
        // 如果文本过长，分段播放
        this.playTextSegments(text, maxLength, callback);
      }
    },
    
    // 分段播放文本
    playTextSegments(text, maxLength, finalCallback) {
      const segments = [];
      let currentSegment = '';
      
      // 简单按标点符号分段
      const sentences = text.split(/([。！？；;!?])/);
      for (let i = 0; i < sentences.length; i += 2) {
        const sentence = sentences[i] + (sentences[i+1] || '');
        if (currentSegment.length + sentence.length <= maxLength) {
          currentSegment += sentence;
        } else {
          if (currentSegment) {
            segments.push(currentSegment);
          }
          if (sentence.length <= maxLength) {
            currentSegment = sentence;
          } else {
            // 如果单句超过长度限制，强制分割
            for (let j = 0; j < sentence.length; j += maxLength) {
              segments.push(sentence.substring(j, j + maxLength));
            }
            currentSegment = '';
          }
        }
      }
      
      if (currentSegment) {
        segments.push(currentSegment);
      }
      
      // 依次播放各段
      this.playSegments(segments, 0, finalCallback);
    },
    
    // 播放段落
    playSegments(segments, index, finalCallback) {
      if (index >= segments.length) {
        if (finalCallback) finalCallback();
        return;
      }
      
      this.speakText(segments[index], () => {
        this.playSegments(segments, index + 1, finalCallback);
      });
    },
    
    // 调用TTS接口播放文本
    speakText(text, callback) {
      this.plugin.textToSpeech({
        lang: "zh_CN",
        content: text,
        success: (res) => {
          if (res.retcode === 0) {
            this.audioContext = uni.createInnerAudioContext();
            this.audioContext.src = res.filename;
            this.audioContext.volume = 1;
            this.audioContext.playbackRate = 1;
            this.audioContext.play();
            
            this.audioContext.onEnded(() => {
              if (callback) callback();
            });
            
            this.audioContext.onError((res) => {
              console.error('音频播放错误', res.errMsg);
              this.resetAudioState();
            });
          } else {
            console.error('TTS合成失败', res);
            this.resetAudioState();
          }
        },
        fail: (res) => {
          console.error('TTS调用失败', res);
          this.resetAudioState();
        }
      });
    },
    
    // 停止音频播放
    stopAudioPlayback() {
      if (this.audioContext) {
        this.audioContext.stop();
        this.audioContext = null;
      }
      this.resetAudioState();
    },
    
    // 重置音频状态
    resetAudioState() {
      this.isPlayingQuestion = false;
      this.isPlayingAnswer = false;
    },
    
    // 去除HTML标签
    stripHtmlTags(html) {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '');
    },
    
    // 上一题
    handlePrev() {
      if (this.hasPrev) {
        // 清除当前计时器
        this.clearAutoLearnTimer();
        // 停止语音播放
        this.stopAudioPlayback();
        
        const prevQuestion = this.questions[this.currentIndex - 1];
        uni.redirectTo({
          url: `/pages/question-detail/index?questionId=${prevQuestion.id}&categoryId=${this.categoryId}`
        });
      }
    },
    
    // 下一题
    handleNext() {
      if (this.hasNext) {
        // 清除当前计时器
        this.clearAutoLearnTimer();
        // 停止语音播放
        this.stopAudioPlayback();
        
        const nextQuestion = this.questions[this.currentIndex + 1];
        uni.redirectTo({
          url: `/pages/question-detail/index?questionId=${nextQuestion.id}&categoryId=${this.categoryId}`
        });
      }
    },
    
    // 收藏/取消收藏
    handleFavorite() {
      if (this.isFavorite) {
        FavoriteStorage.removeFavorite(this.questionId);
      } else {
        FavoriteStorage.addFavorite(this.questionId, {
          id: this.questionId,
          title: this.currentQuestion?.title || '',
          addTime: Date.now(),
          categoryId: this.categoryId
        });
      }
      this.isFavorite = !this.isFavorite;
    },
    
    // 开始自动学习计时器
    startAutoLearnTimer() {
      // 如果已经学习过，则不需要计时
      if (this.isLearned) {
        return;
      }
      
      // 清除可能存在的旧计时器
      this.clearAutoLearnTimer();
      
      // 设置主计时器，25秒后标记为已学习
      this.autoLearnTimer = setTimeout(() => {
        if (!this.isLearned) {
          this.markAsLearned();
        }
      }, this.autoLearnDuration * 1000);
      
      // 设置进度更新计时器，每秒更新一次
      this.autoLearnProgress = 0;
      this.autoLearnInterval = setInterval(() => {
        if (this.autoLearnProgress < this.autoLearnDuration) {
          this.autoLearnProgress++;
        } else {
          clearInterval(this.autoLearnInterval);
        }
      }, 1000);
    },
    
    // 清除自动学习计时器
    clearAutoLearnTimer() {
      if (this.autoLearnTimer) {
        clearTimeout(this.autoLearnTimer);
        this.autoLearnTimer = null;
      }
      
      if (this.autoLearnInterval) {
        clearInterval(this.autoLearnInterval);
        this.autoLearnInterval = null;
      }
    },
    
    // 标记为已学习
    markAsLearned() {
      const now = Date.now();
      const newRecord = {
        isLearned: true,
        lastLearnTime: now,
        reviewCount: this.learningRecord.reviewCount + 1
      };
      
      LearningStorage.updateRecord(this.questionId, newRecord);
      this.isLearned = true;
      this.learningRecord = newRecord;
      
      // 显示提示
      uni.showToast({
        title: '已标记为学习完成',
        icon: 'none',
        duration: 1500
      });
    },
    
    // 标记学习状态
    handleLearn() {
      const now = Date.now();
      const newRecord = {
        isLearned: !this.isLearned,
        lastLearnTime: now,
        reviewCount: this.learningRecord.reviewCount + (this.isLearned ? 0 : 1)
      };
      
      LearningStorage.updateRecord(this.questionId, newRecord);
      this.isLearned = newRecord.isLearned;
      this.learningRecord = newRecord;
      
      // 如果标记为未学习，则重新开始计时
      if (!this.isLearned) {
        this.startAutoLearnTimer();
      } else {
        // 如果标记为已学习，则清除计时器
        this.clearAutoLearnTimer();
      }
    }
  }
}
</script>

<style lang="scss">
/* 使用Unicode符号替代图标字体 */
.question-detail {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  
  &__header {
    background: #ffffff;
    padding: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }
  
  &__title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__category {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
  }
  
  &__progress {
    font-size: 14px;
    color: #666666;
  }
  
  &__content {
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    position: relative;
  }
  
  &__wrapper {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  &__section {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    width: 100%;
    box-sizing: border-box;
  }
  
  &__section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -1px;
      width: 40px;
      height: 2px;
      background: linear-gradient(to right, #4dabf7, #3a8ee6);
      border-radius: 2px;
    }
  }
  
  &__section-title {
    font-size: 16px;
    font-weight: 500;
    color: #333333;
  }
  
  &__section-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  &__audio-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(to right, #4dabf7, #3a8ee6);
  }
  
  &__learn-tag {
    
  }
  
  &__tag {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    
    &--learned {
      color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
    }
    
    &--unlearned {
      color: #9E9E9E;
      background: rgba(158, 158, 158, 0.1);
    }
  }
  
  .icon {
    width: 18px;
    height: 18px;
    display: inline-block;
    
    &.icon-play {
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiPjxwYXRoIGQ9Ik04IDV2MTRsMTEtN3oiLz48cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PC9zdmc+');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    
    &.icon-pause {
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiPjxwYXRoIGQ9Ik02IDE5aDRWNUg2djE0em04LTE0djE0aDRWNWgtNHoiLz48cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PC9zdmc+');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
  }
  
  &__text {
    font-size: 15px;
    color: #333333;
    line-height: 1.6;
  }
  
  &__rich-text {
    font-size: 15px;
    color: #333333;
    line-height: 1.6;
  }
  
  &__fixed-buttons {
    position: fixed;
    bottom: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
  }
  
  &__action-btn {
    min-width: 80px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
    gap: 4px;
    transition: all 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    
    .btn-icon {
      font-size: 20px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-text {
      font-size: 13px;
    }
    
    &:active {
      transform: scale(0.95);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    &--disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }
  
  &__prev-btn, &__next-btn {
    min-width: 70px;
    background: linear-gradient(to right, #4dabf7, #3a8ee6);
    
    .btn-icon, .btn-text {
      color: white;
    }
  }
  
  &__favorite-btn {
    background: linear-gradient(to right, #fd7e14, #f76707);
    
    .btn-icon, .btn-text {
      color: white;
    }
    
    &--active {
      background: linear-gradient(to right, #ff922b, #fd7e14);
      
      .btn-icon, .btn-text {
        color: white;
      }
    }
  }
  
  &__fixed-timer {
    position: fixed;
    top: 54px; /* 根据header高度调整 */
    left: 0;
    right: 0;
    z-index: 9;
    padding: 0 16px;
    animation: slideDown 0.3s ease-out;
  }
  
  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  &__learn-progress {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 8px 12px;
    border-left: 3px solid #3a8ee6;
  }
  
  &__learn-progress-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #666666;
    margin-bottom: 6px;
    
    .timer-icon {
      font-size: 14px;
      margin-right: 4px;
      display: inline-block;
      animation: rotate 2s infinite linear;
    }
    
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(0deg); }
      50% { transform: rotate(180deg); }
      75% { transform: rotate(180deg); }
      100% { transform: rotate(360deg); }
    }
  }
  
  &__learn-progress-bar {
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
  }
  
  &__learn-progress-fill {
    height: 100%;
    background: linear-gradient(to right, #4dabf7, #3a8ee6);
    border-radius: 3px;
    transition: width 0.3s linear;
  }
}
</style>