import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

import {getProjectionContent} from '../base/content.service';
import {TopicList} from './topic.model';

/**
 * 主题页面组件，使用方式：
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
export class TopicPageComponent implements OnInit {

    // 页面标题
    @Input() title: string;

    // 主题列表
    topicLists: TopicList[];

    // 主题页面内容投影元素，引用`<div #topicPageContent>`
    @ViewChild('topicPageContent', {static: true}) topicPageContentElement: ElementRef<HTMLDivElement>;

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        const topicPageContent = getProjectionContent(this.topicPageContentElement) || '[]';
        this.topicLists = JSON.parse(`${topicPageContent}`);
    }

}
