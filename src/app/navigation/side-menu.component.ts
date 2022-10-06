import {Component, Input} from '@angular/core';

import {CurrNode, NavNode} from './nav.model';
import {NavService} from './nav.service';

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
    _navNodes: NavNode[];

    // 当前节点
    @Input() currNode?: CurrNode;

    // 是否宽屏
    @Input() isWideScreen = false;

    // 导航标签
    @Input() navLabel: string;

    /**
     * 获取导航节点
     *
     * @return 导航节点
     */
    get navNodes(): NavNode[] {
        return this._navNodes;
    }

    /**
     * 设置导航节点
     *
     * @param navNodes 导航节点
     */
    @Input() set navNodes(navNodes: NavNode[]) {
        this._navNodes = NavService.filterNavNodes(navNodes);
    }

}
