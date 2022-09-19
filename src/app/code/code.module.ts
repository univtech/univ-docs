import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import {CodeComponent} from './code.component';
import {CodePrettyService} from './code-pretty.service';

/**
 * 代码模块
 */
@NgModule({
    imports: [CommonModule, MatSnackBarModule],
    declarations: [CodeComponent],
    providers: [CodePrettyService],
    exports: [CodeComponent],
})
export class CodeModule {

}
