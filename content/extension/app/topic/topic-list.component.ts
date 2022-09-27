import {AfterViewInit, Component, ElementRef, OnChanges, ViewChild} from '@angular/core';

import {htmlSafeByReview} from 'safevalues/restricted/reviewed';

import {Topic} from './topic.model';

/**
 * 主题列表组件，使用示例：
 * ```
 * <univ-topic-list>
 * [
 *     {
 *         "title": "主题标题",
 *         "content": "主题内容",
 *         "href": "主题链接"
 *     }
 * ]
 * </univ-topic-list>
 * ```
 */
@Component({
    selector: 'univ-topic-list',
    templateUrl: './topic-list.component.html',
})
export class TopicListComponent implements AfterViewInit, OnChanges {

    // 主题内容元素，引用`<div #topicContent>`
    @ViewChild('topicContent', {static: true}) topicContentElement: ElementRef<HTMLDivElement>;

    // 主题内容
    private _topicContent: TrustedHTML;

    // 主题列表
    private _topics: Topic[];

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
        this.parseTopics();
    }

    /**
     * 获取主题列表
     *
     * @return 主题列表
     */
    get topics(): Topic[] {
        return this._topics;
    }

    /**
     * 设置主题列表
     *
     * @param topics 主题列表
     */
    set topics(topics: Topic[]) {
        this._topics = topics;
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
        this.parseTopics();
    }

    /**
     * 解析主题列表
     */
    private parseTopics() {
        const topicContent = this.topicContent?.toString() || '[]';
        this.topics = JSON.parse(`${topicContent}`);
    }

}
