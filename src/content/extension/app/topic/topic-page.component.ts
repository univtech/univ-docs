import {AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';

import {htmlSafeByReview} from 'safevalues/restricted/reviewed';

import {TopicList} from './topic.model';

/**
 * 主题元素组件，使用示例：
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
export class TopicPageComponent implements AfterViewInit, OnChanges {

    // 页面标题
    @Input() title: string;

    // 主题内容元素，引用`<div #topicContent>`
    @ViewChild('topicContent', {static: true}) topicContentElement: ElementRef<HTMLDivElement>;

    // 主题内容
    private _topicContent: TrustedHTML;

    // 主题列表
    private _topicLists: TopicList[];

    /**
     * 获取主题内容
     *
     * @return 主题内容
     */
    get topicContent(): TrustedHTML {
        return this._topicContent;
    }

    /**
     * 设置主题内容
     *
     * @param topicContent 主题内容
     */
    set topicContent(topicContent: TrustedHTML) {
        this._topicContent = topicContent;
        this.parseTopicLists();
    }

    /**
     * 获取主题列表
     *
     * @return 主题列表
     */
    get topicLists(): TopicList[] {
        return this._topicLists;
    }

    /**
     * 设置主题列表
     *
     * @param topicLists 主题列表
     */
    set topicLists(topicLists: TopicList[]) {
        this._topicLists = topicLists;
    }

    /**
     * 组件视图初始化完成之后的回调方法
     */
    ngAfterViewInit(): void {
        const topicContentElement = this.topicContentElement.nativeElement;
        this.topicContent = htmlSafeByReview(topicContentElement.innerHTML, '^');
        topicContentElement.textContent = '';
    }

    /**
     * 数据绑定属性发生改变时的回调方法
     */
    ngOnChanges(): void {
        this.parseTopicLists();
    }

    /**
     * 解析主题列表
     */
    private parseTopicLists() {
        const topicContent = this.topicContent?.toString() || '[]';
        this.topicLists = JSON.parse(`${topicContent}`);
    }

}
