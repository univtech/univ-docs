import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

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
export class TopicListComponent implements AfterViewInit {

    // 主题内容元素，引用`<div #topicContent>`
    @ViewChild('topicContent', {static: true}) topicContentElement: ElementRef<HTMLDivElement>;

    // 主题列表
    topics: Topic[];

    /**
     * 组件视图初始化完成之后的回调方法
     */
    ngAfterViewInit(): void {
        const topicContentElement = this.topicContentElement.nativeElement;
        const topicContentHtml = htmlSafeByReview(topicContentElement.innerHTML, '^');
        const topicContent = topicContentHtml?.toString() || '[]';
        this.topics = JSON.parse(`${topicContent}`);
        topicContentElement.textContent = '';
    }

}
