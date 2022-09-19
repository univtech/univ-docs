import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CodeModule} from './code.module';
import {ElementComponentModule} from '../element/element-registry.service';
import {CodeExampleComponent} from './code-example.component';

/**
 * 代码示例模块
 */
@NgModule({
    imports: [CommonModule, CodeModule],
    declarations: [CodeExampleComponent],
    exports: [CodeExampleComponent],
})
export class CodeExampleModule implements ElementComponentModule {

    elementComponent: Type<any> = CodeExampleComponent;

}
