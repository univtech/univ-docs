import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ElementComponentModule} from '../element/element-extension.service';
import {MixtureModule} from '../mixture/mixture.module';
import {TopicListModule} from './topic-list.module';
import {TopicPageComponent} from './topic-page.component';

/**
 * 主题页面模块
 */
@NgModule({
    imports: [CommonModule, MixtureModule, TopicListModule],
    declarations: [TopicPageComponent],
})
export class TopicPageModule implements ElementComponentModule {

    elementComponent: Type<any> = TopicPageComponent;

}
