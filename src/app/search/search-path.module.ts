import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ElementComponentModule} from '../element/element-registry.service';
import {SearchResultModule} from './search-result.module';
import {SearchPathComponent} from './search-path.component';

/**
 * 搜索当前路径模块
 */
@NgModule({
    imports: [CommonModule, SearchResultModule],
    declarations: [SearchPathComponent],
})
export class SearchPathModule implements ElementComponentModule {

    elementComponent: Type<any> = SearchPathComponent;

}
