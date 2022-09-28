import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

import {getProjectionContent} from '../base/content.service';
import {FeatureList} from './feature.model';

/**
 * 特性页面组件，使用方式：
 * ```
 * <univ-feature-page title="页面标题" start="开始链接">
 * [
 *     {
 *         "title": "列表标题",
 *         "features": [
 *             {
 *                 "title": "特性标题",
 *                 "content": "特性内容",
 *                 "url": "特性链接"
 *             }
 *         ]
 *     }
 * ]
 * </univ-feature-page>
 * ```
 */
@Component({
    selector: 'univ-feature-page',
    templateUrl: './feature-page.component.html',
})
export class FeaturePageComponent implements OnInit {

    // 页面标题
    @Input() title: string;

    // 开始链接
    @Input() start: string;

    // 特性列表
    featureLists: FeatureList[];

    // 特性页面内容投影元素，引用`<div #featurePageContent>`
    @ViewChild('featurePageContent', {static: true}) featurePageContentElement: ElementRef<HTMLDivElement>;

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        const featurePageContent = getProjectionContent(this.featurePageContentElement) || '[]';
        this.featureLists = JSON.parse(`${featurePageContent}`);
    }

}
