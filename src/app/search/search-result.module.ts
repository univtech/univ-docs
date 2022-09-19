import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

import {SearchResultComponent} from './search-result.component';

/**
 * 搜索结果模块
 */
@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
    ],
    declarations: [
        SearchResultComponent,
    ],
    exports: [
        MatIconModule,
        MatButtonModule,
        SearchResultComponent,
    ],
})
export class SearchResultModule {

}
