import {Component, Input} from '@angular/core';
import {Topic} from './topic.model';

/**
 * 主题列表组件，使用方式：
 * ```
 * <univ-topic-list [topics]="topics"></univ-topic-list>
 * ```
 *
 */
@Component({
    selector: 'univ-topic-list',
    templateUrl: './topic-list.component.html',
})
export class TopicListComponent {

    // 主题列表
    @Input() topics: Topic[];

}
