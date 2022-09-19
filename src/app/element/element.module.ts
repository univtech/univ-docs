import {NgModule} from '@angular/core';
import {ROUTES} from '@angular/router';

import {elementComponentModuleMap, elementComponentModuleRoutes, elementComponentModuleToken} from './element-registry.service';
import {ElementLoadService} from './element-load.service';
import {ElementLazyComponent} from './element-lazy.component';

/**
 * 元素模块
 */
@NgModule({
    declarations: [ElementLazyComponent],
    providers: [
        {provide: ROUTES, useValue: elementComponentModuleRoutes, multi: true},
        {provide: elementComponentModuleToken, useValue: elementComponentModuleMap},
        ElementLoadService,
    ],
    exports: [ElementLazyComponent],
})
export class ElementModule {

}
