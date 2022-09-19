import {Component, Input} from '@angular/core';

import {NavNode} from './nav.model';

/**
 * 页脚组件。
 *
 * 输入属性：
 * * navNodes：页脚导航节点
 */
@Component({
    selector: 'univ-footer',
    templateUrl: './footer.component.html'
})
export class FooterComponent {

    // 导航节点
    @Input() navNodes: NavNode[];

}
