import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ElementComponentModule} from '../element/element-extension.service';
import {MixtureModule} from '../mixture/mixture.module';
import {FeaturePageComponent} from './feature-page.component';

/**
 * 特性页面模块
 */
@NgModule({
    imports: [CommonModule, MixtureModule],
    declarations: [FeaturePageComponent],
    exports: [FeaturePageComponent],
})
export class FeaturePageModule implements ElementComponentModule {

    elementComponent: Type<any> = FeaturePageComponent;

}
