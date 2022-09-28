import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

import {getProjectionContent} from '../base/content.service';
import {ResourceList} from './resource.model';

/**
 * 资源页面组件，使用方式：
 * ```
 * <univ-resource-page title="页面标题">
 * [
 *     {
 *         "title": "列表标题",
 *         "resources": [
 *             {
 *                 "title": "资源标题",
 *                 "content": "资源内容",
 *                 "url": "资源链接"
 *             }
 *         ]
 *     }
 * ]
 * </univ-resource-page>
 * ```
 */
@Component({
    selector: 'univ-resource-page',
    templateUrl: './resource-page.component.html',
})
export class ResourcePageComponent implements OnInit {

    // 页面标题
    @Input() title: string;

    // 资源列表
    resourceLists: ResourceList[];

    // 资源页面内容投影元素，引用`<div #resourcePageContent>`
    @ViewChild('resourcePageContent', {static: true}) resourcePageContentElement: ElementRef<HTMLDivElement>;

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        const resourcePageContent = getProjectionContent(this.resourcePageContentElement) || '[]';
        this.resourceLists = JSON.parse(`${resourcePageContent}`);
    }

}
