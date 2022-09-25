import {Type} from '@angular/core';

// 元素组件模块接口，由声明元素组件的模块实现
export interface ElementComponentModule {
    // 元素组件
    elementComponent: Type<any>;
}

// 扩展元素组件模块路由
export const extensionElementComponentModuleRoutes = [
    // {selector: 'univ-search-path', loadChildren: () => import('../search/search-path.module').then(module => module.SearchPathModule)},
];
