import {Type} from '@angular/core';

// 元素组件模块接口，由声明元素组件的模块实现
export interface ElementComponentModule {
    // 元素组件
    elementComponent: Type<any>;
}

// 扩展元素组件模块路由
export const extensionElementComponentModuleRoutes = [
    {selector: 'univ-topic-pane', loadChildren: () => import('../topic/topic-pane.module').then(module => module.TopicPaneModule)},
    {selector: 'univ-topic-page', loadChildren: () => import('../topic/topic-page.module').then(module => module.TopicPageModule)},
    {selector: 'univ-feature-page', loadChildren: () => import('../feature/feature-page.module').then(module => module.FeaturePageModule)},
];
