import {Component, Input} from '@angular/core';

import {CurrNode, NavNode} from './nav.model';
import {NavService} from './nav.service';

/**
 * 顶部菜单组件。
 *
 * 输入属性：
 * * navNodes：顶部导航节点
 * * currNode：顶部当前节点
 */
@Component({
    selector: 'univ-top-menu',
    templateUrl: './top-menu.component.html',
})
export class TopMenuComponent {

    // 导航节点
    _navNodes: NavNode[];

    // 当前节点
    @Input() currNode?: CurrNode;

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

    /**
     * 获取当前路径
     *
     * @return 当前路径或null
     */
    get currUrl(): string | null {
        return this.currNode ? this.currNode.url : null;
    }

}
