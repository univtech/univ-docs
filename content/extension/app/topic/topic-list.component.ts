import {Component, OnChanges} from '@angular/core';

import {TopicList} from './topic.model';

/**
 * 主题列表组件
 */
@Component({
    selector: 'univ-topic-list',
    templateUrl: './topic-list.component.html',
})
export class TopicListComponent implements OnChanges {

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
