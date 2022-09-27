import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TopicListComponent} from './topic-list.component';

/**
 * 主题列表模块
 */
@NgModule({
    imports: [CommonModule],
    declarations: [TopicListComponent],
    exports: [TopicListComponent],
})
export class TopicListModule {

}
