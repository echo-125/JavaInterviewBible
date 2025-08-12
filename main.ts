/**
 * @description 应用入口文件
 */
import {createSSRApp} from "vue";
import {createPinia} from 'pinia';
import App from "./App.vue";

export function createApp() {
    const app = createSSRApp(App);
    const pinia = createPinia();

    app.use(pinia);

    // 全局分享默认配置
    app.mixin({
        onShareAppMessage() {
            return {
                title: 'Java面试题精选',
                desc: '专为Java求职者打造的高频面试题库，帮助你高效准备面试，提升竞争力',
                path: '/pages/index/index',
                imageUrl: '/static/logo.png'
            }
        },
        onShareTimeline() {
            return {
                title: 'Java面试题精选',
                desc: '专为Java求职者打造的高频面试题库，帮助你高效准备面试，提升竞争力',
                path: '/pages/index/index',
                imageUrl: '/static/logo.png'
            }
        }
    })

    return {
        app,
        pinia
    };
}