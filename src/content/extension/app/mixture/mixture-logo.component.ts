import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {getProjectionContent} from '../base/content.service';
import {LogoBanner} from './mixture-logo.model';

/**
 * 无侧边导航页面Logo横幅组件，使用方式：
 * ```
 * <univ-mixture-logo>
 * {
 *     "logoUrl": "Logo路径",
 *     "startUrl": "开始路径",
 *     "content": "横幅内容"
 * }
 * </univ-mixture-logo>
 * ```
 */
@Component({
    selector: 'univ-mixture-logo',
    templateUrl: './mixture-logo.component.html',
})
export class MixtureLogoComponent implements OnInit{

    // Logo横幅
    logoBanner: LogoBanner;

    // Logo横幅内容投影元素，引用`<div #logoBannerContent>`
    @ViewChild('logoBannerContent', {static: true}) logoBannerContentElement: ElementRef<HTMLDivElement>;

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        const logoBannerContent = getProjectionContent(this.logoBannerContentElement);
        this.logoBanner = JSON.parse(`${logoBannerContent}`);
    }

}
