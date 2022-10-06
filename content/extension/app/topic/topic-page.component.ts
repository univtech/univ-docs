import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {getProjectionContent} from '../base/content.service';
import {TopicList, TopicPage} from './topic.model';

/**
 * 主题页面组件，使用方式：
 * ```
 * <univ-topic-page>
 * {
 *     "title": "页面标题",
 *     "topicLists": [
 *         {
 *             "title": "列表标题",
 *             "topics": [
 *                 {
 *                     "title": "主题标题",
 *                     "content": "主题内容",
 *                     "url": "主题链接"
 *                 }
 *             ]
 *         }
 *     ]
 * }
 * </univ-topic-page>
 * ```
 */
@Component({
    selector: 'univ-topic-page',
    templateUrl: './topic-page.component.html',
})
export class TopicPageComponent implements OnInit {

    // 主题页面
    topicPage: TopicPage;

    // 主题页面内容投影元素，引用`<div #topicPageContent>`
    @ViewChild('topicPageContent', {static: true}) topicPageContentElement: ElementRef<HTMLDivElement>;

    /**
     * 获取页面标题
     *
     * @return 页面标题
     */
    get title(): string {
        return this.topicPage?.title || '';
    }

    /**
     * 获取主题列表
     *
     * @return 主题列表
     */
    get topicLists(): TopicList[] {
        return this.topicPage?.topicLists || [];
    }

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        const topicPageContent = getProjectionContent(this.topicPageContentElement);
        this.topicPage = JSON.parse(`${topicPageContent}`);
    }

}
