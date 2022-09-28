import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ElementComponentModule} from '../element/element-extension.service';
import {MixtureBannerModule} from '../mixture/mixture-banner.module';
import {ResourcePageComponent} from './resource-page.component';

/**
 * 资源页面模块
 */
@NgModule({
    imports: [CommonModule, MixtureBannerModule],
    declarations: [ResourcePageComponent],
})
export class ResourcePageModule implements ElementComponentModule {

    elementComponent: Type<any> = ResourcePageComponent;

}
