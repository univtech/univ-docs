import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ElementComponentModule} from '../element/element-extension.service';
import {MixtureBannerModule} from '../mixture/mixture-banner.module';
import {FeaturePageComponent} from './feature-page.component';

/**
 * 特性页面模块
 */
@NgModule({
    imports: [CommonModule, MixtureBannerModule],
    declarations: [FeaturePageComponent],
})
export class FeaturePageModule implements ElementComponentModule {

    elementComponent: Type<any> = FeaturePageComponent;

}
