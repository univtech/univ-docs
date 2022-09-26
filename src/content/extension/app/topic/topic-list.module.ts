import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ElementComponentModule} from '../element/element-extension.service';
import {TopicListComponent} from './topic-list.component';

/**
 * 主题列表模块
 */
@NgModule({
    imports: [CommonModule],
    declarations: [TopicListComponent],
    exports: [TopicListComponent],
})
export class TopicListModule implements ElementComponentModule {

    elementComponent: Type<any> = TopicListComponent;

}
