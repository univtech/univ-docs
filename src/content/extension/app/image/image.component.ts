import {Component, Input} from '@angular/core';

/**
 * 图片组件，使用方式：
 * ```
 * <univ-image title="图片标题" url="图片路径"></univ-image>
 * ```
 *
 */
@Component({
    selector: 'univ-image',
    templateUrl: './image.component.html',
})
export class ImageComponent {

    // 图片标题
    @Input() title: string;

    // 图片路径
    @Input() url: string;

}
