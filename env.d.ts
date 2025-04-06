/// <reference types="vite/client" />
/// <reference types="@dcloudio/types" />
/// <reference types="@vue/runtime-core" />

/**
 * 声明 Vue 组件类型
 */
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

/**
 * 声明 uni 对象类型
 */
declare const uni: UniApp.Uni;

/**
 * 声明全局变量
 */
declare const __VERSION__: string;
declare const __ENV__: string;

declare module '@dcloudio/vite-plugin-uni' {
  import { Plugin } from 'vite'
  const uni: () => Plugin
  export default uni
}

declare const __dirname: string

/**
 * 声明 vue-router 模块
 */
declare module 'vue-router' {
  import { Router } from 'vue-router'
  export function useRouter(): Router
  export function useRoute(): any
}

/**
 * 声明 @/api 模块
 */
declare module '@/api' {
  import type { Category, Question, CategoryResponse, QuestionResponse, QuestionDetailResponse } from './api/types'
  export function getCategories(): Promise<Category[]>
  export function getQuestions(categoryId: number): Promise<Question[]>
  export function getQuestionDetail(questionId: number, categoryId: number): Promise<Question>
  export function getCategoryDetail(categoryId: number): Promise<Category>
}
