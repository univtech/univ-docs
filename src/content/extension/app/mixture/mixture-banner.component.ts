import {Component, Input} from '@angular/core';

/**
 * 无侧边导航页面横幅组件，使用方式：
 * ```
 * <univ-mixture-banner [title]="title"></univ-mixture-banner>
 * ```
 *
 */
@Component({
    selector: 'univ-mixture-banner',
    templateUrl: './mixture-banner.component.html',
})
export class MixtureBannerComponent {

    // 横幅标题
    @Input() title: string;

}
