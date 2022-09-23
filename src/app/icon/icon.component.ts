import {Component, Input} from '@angular/core';
import {ExtIcon} from '../config/config.model';


/**
 * 外部图标组件。
 *
 * 输入属性：
 * * extIcons：外部图标
 */
@Component({
    selector: 'univ-icon',
    templateUrl: './icon.component.html',
})
export class IconComponent {

    // 外部图标
    @Input() extIcons: ExtIcon[];

}
