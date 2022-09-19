import {Component, Input} from '@angular/core';

import {CurrNode, NavNode} from './nav.model';

/**
 * 侧边菜单组件。
 *
 * 输入属性：
 * * navNodes：侧边导航节点
 * * currNode：侧边当前节点
 * * isWideScreen：是否宽屏
 * * navLabel：导航标签
 */
@Component({
    selector: 'univ-side-menu',
    templateUrl: './side-menu.component.html',
})
export class SideMenuComponent {

    // 导航节点
    @Input() navNodes: NavNode[];

    // 当前节点
    @Input() currNode?: CurrNode;

    // 是否宽屏
    @Input() isWideScreen = false;

    // 导航标签
    @Input() navLabel: string;

}
