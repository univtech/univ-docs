import {InjectionToken, Type} from '@angular/core';
import {LoadChildrenCallback} from '@angular/router';

// 元素组件模块接口，由声明元素组件的模块实现
export interface ElementComponentModule {
    // 元素组件
    elementComponent: Type<any>;
}

// 元素组件模块令牌
export const elementComponentModuleToken = new InjectionToken<Map<string, LoadChildrenCallback>>('elementComponentModuleToken');

// 元素组件模块映射，key：元素组件选择器；value：延时加载的元素组件模块
export const elementComponentModuleMap = new Map<string, LoadChildrenCallback>();

// 元素组件模块路由
export const elementComponentModuleRoutes = [
    {selector: 'univ-search-path', loadChildren: () => import('../search/search-path.module').then(module => module.SearchPathModule)},
    {selector: 'univ-code-example', loadChildren: () => import('../code/code-example.module').then(module => module.CodeExampleModule)},
    {selector: 'univ-code-tab', loadChildren: () => import('../code/code-tab.module').then(module => module.CodeTabModule)},
    {selector: 'univ-toc', loadChildren: () => import('../document/toc.module').then(module => module.TocModule)},
];

// 把元素组件模块路由转换为元素组件模块映射
elementComponentModuleRoutes.forEach(route => {
    elementComponentModuleMap.set(route.selector, route.loadChildren);
});
