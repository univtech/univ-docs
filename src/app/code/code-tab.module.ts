import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';

import {CodeModule} from './code.module';
import {ElementComponentModule} from '../element/element-registry.service';
import {CodeTabComponent} from './code-tab.component';

/**
 * 代码选项卡模块
 */
@NgModule({
    imports: [CommonModule, MatCardModule, MatTabsModule, CodeModule],
    declarations: [CodeTabComponent],
    exports: [CodeTabComponent],
})
export class CodeTabModule implements ElementComponentModule {

    elementComponent: Type<any> = CodeTabComponent;

}
