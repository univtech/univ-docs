import {Component, Input} from '@angular/core';

import {NavNode} from './nav.model';
import {NavService} from './nav.service';
import {Authorize, License, Support} from '../config/config.model';

/**
 * 页脚组件。
 *
 * 输入属性：
 * * navNodes：页脚导航节点
 * * authorize：页脚授权信息
 */
@Component({
    selector: 'univ-footer',
    templateUrl: './footer.component.html'
})
export class FooterComponent {

    // 导航节点
    _navNodes: NavNode[];

    // 授权信息
    @Input() authorize: Authorize;

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
     * 获取技术支持
     *
     * @return 技术支持或null
     */
    get support(): Support | null {
        return this.authorize ? this.authorize.support : null;
    }

    /**
     * 获取许可协议
     *
     * @return 技术支持
     */
    get licenses(): License[] {
        return this.authorize ? this.authorize.licenses : [];
    }

    /**
     * 获取最后一个许可协议的索引
     *
     * @return 最后一个许可协议的索引或-1
     */
    get lastLicenseIndex(): number {
        return this.licenses ? this.licenses.length - 1 : -1;
    }

}
