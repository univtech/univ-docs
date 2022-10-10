import {NgModule, Type} from '@angular/core';

import {ElementComponentModule} from '../element/element-extension.service';
import {ImageComponent} from './image.component';

/**
 * 图片模块
 */
@NgModule({
    declarations: [ImageComponent],
    exports: [ImageComponent],
})
export class ImageModule implements ElementComponentModule {

    elementComponent: Type<any> = ImageComponent;

}
