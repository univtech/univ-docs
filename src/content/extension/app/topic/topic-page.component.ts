import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';

import {getProjectionContent} from '../base/content.service';
import {TopicList} from './topic.model';

/**
 * 主题页面元素。
 *
 * 使用方式一：
 * ```
 * <univ-topic-page title="页面标题" [topicLists]="topicLists">
 * </univ-topic-page>
 * ```
 *
 * 使用方式二：
 * ```
 * <univ-topic-page title="页面标题">
 * [
 *     {
 *         "title": "列表标题",
 *         "topics": [
 *             {
 *                 "title": "主题标题",
 *                 "content": "主题内容",
 *                 "href": "主题链接"
 *             }
 *         ]
 *     }
 * ]
 * </univ-topic-page>
 * ```
 */
@Component({
    selector: 'univ-topic-page',
    templateUrl: './topic-page.component.html',
})
export class TopicPageComponent implements AfterViewInit {

    // 页面标题
    @Input() title: string;

    // 主题列表
    @Input() topicLists: TopicList[];

    // 主题页面内容投影元素，引用`<div #topicPageContent>`
    @ViewChild('topicPageContent', {static: true}) topicPageContentElement: ElementRef<HTMLDivElement>;

    /**
     * 组件视图初始化完成之后的回调方法
     */
    ngAfterViewInit(): void {
        if (!this.topicLists) {
            const topicPageContent = getProjectionContent(this.topicPageContentElement) || '[]';
            this.topicLists = JSON.parse(`${topicPageContent}`);
        }
    }

}
