import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ElementComponentModule} from '../element/element-extension.service';
import {TopicListModule} from './topic-list.module';
import {TopicPaneComponent} from './topic-pane.component';

/**
 * 主题面板模块
 */
@NgModule({
    imports: [CommonModule, TopicListModule],
    declarations: [TopicPaneComponent],
    exports: [TopicPaneComponent],
})
export class TopicPaneModule implements ElementComponentModule {

    elementComponent: Type<any> = TopicPaneComponent;

}
