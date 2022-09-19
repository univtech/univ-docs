import {Component, Input} from '@angular/core';

import {CurrNode, NavNode} from './nav.model';

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
    @Input() navNodes: NavNode[];

    // 当前节点
    @Input() currNode?: CurrNode;

    /**
     * 获取当前路径
     *
     * @return 当前路径或null
     */
    get currUrl(): string | null {
        return this.currNode ? this.currNode.url : null;
    }

}
