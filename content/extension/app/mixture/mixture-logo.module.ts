import {NgModule, Type} from '@angular/core';

import {ElementComponentModule} from '../element/element-extension.service';
import {MixtureLogoComponent} from '../mixture/mixture-logo.component';

/**
 * 无侧边导航页面Logo模块
 */
@NgModule({
    declarations: [MixtureLogoComponent],
    exports: [MixtureLogoComponent],
})
export class FeaturePageModule implements ElementComponentModule {

    elementComponent: Type<any> = MixtureLogoComponent;

}
