import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {getProjectionContent} from '../base/content.service';
import {TopicListComponent} from './topic-list.component';

/**
 * 主题面板组件，使用方式：
 * ```
 * <univ-topic-pane>
 * [
 *     {
 *         "title": "主题标题",
 *         "content": "主题内容",
 *         "href": "主题链接"
 *     }
 * ]
 * </univ-topic-pane>
 * ```
 */
@Component({
    selector: 'univ-topic-pane',
    templateUrl: './topic-pane.component.html',
})
export class TopicPaneComponent implements OnInit {

    // 主题面板内容投影元素，引用`<div #topicPaneContent>`
    @ViewChild('topicPaneContent', {static: true}) topicPaneContentElement: ElementRef<HTMLDivElement>;

    // 主题列表组件，引用`<univ-topic-list>`
    @ViewChild(TopicListComponent, {static: true}) topicListComponent: TopicListComponent;

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        const topicPaneContent = getProjectionContent(this.topicPaneContentElement) || '[]';
        this.topicListComponent.topics = JSON.parse(`${topicPaneContent}`);
    }

}
