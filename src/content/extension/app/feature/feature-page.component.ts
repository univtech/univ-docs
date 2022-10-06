import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {getProjectionContent} from '../base/content.service';
import {FeatureList, FeaturePage} from './feature.model';

/**
 * 特性页面组件，使用方式：
 * ```
 * <univ-feature-page>
 * {
 *     "title": "页面标题",
 *     "startUrl": "开始链接",
 *     "featureLists": [
 *         {
 *             "title": "列表标题",
 *             "features": [
 *                 {
 *                     "title": "特性标题",
 *                     "content": "特性内容"
 *                 }
 *             ]
 *         }
 *     ]
 * }
 * </univ-feature-page>
 * ```
 */
@Component({
    selector: 'univ-feature-page',
    templateUrl: './feature-page.component.html',
})
export class FeaturePageComponent implements OnInit {

    // 特性页面
    featurePage: FeaturePage;

    // 特性页面内容投影元素，引用`<div #featurePageContent>`
    @ViewChild('featurePageContent', {static: true}) featurePageContentElement: ElementRef<HTMLDivElement>;

    /**
     * 获取页面标题
     *
     * @return 页面标题
     */
    get title(): string {
        return this.featurePage?.title || '';
    }

    /**
     * 获取开始链接
     *
     * @return 开始链接
     */
    get startUrl(): string {
        return this.featurePage?.startUrl || '#';
    }

    /**
     * 获取特性列表
     *
     * @return 特性列表
     */
    get featureLists(): FeatureList[] {
        return this.featurePage?.featureLists || [];
    }

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        const featurePageContent = getProjectionContent(this.featurePageContentElement);
        this.featurePage = JSON.parse(`${featurePageContent}`);
    }

}
