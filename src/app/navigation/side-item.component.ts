import {Component, Input, OnChanges} from '@angular/core';

import {NavNode} from './nav.model';

/**
 * 侧边菜单项组件。
 *
 * 输入属性：
 * * level：节点层级
 * * navNode：导航节点
 * * traceNodes：当前节点的节点追溯栈，当前节点及其祖先节点，第一个节点为当前节点，最后一个节点为根节点
 * * isWideScreen：是否宽屏
 * * isExpandedParent：是否展开父节点
 */
@Component({
    selector: 'univ-side-item',
    templateUrl: './side-item.component.html',
})
export class SideItemComponent implements OnChanges {

    // 节点层级
    @Input() level = 1;

    // 导航节点
    @Input() navNode: NavNode;

    // 导航节点的子节点
    childNodes?: NavNode[];

    // 当前节点的节点追溯栈，当前节点及其祖先节点，第一个节点为当前节点，最后一个节点为根节点
    @Input() traceNodes?: NavNode[];

    // 是否宽屏
    @Input() isWideScreen = false;

    // 是否选中
    private isSelected = false;

    // 是否展开
    isExpanded = false;

    // 是否展开父节点
    @Input() isExpandedParent = true;

    // CSS样式类
    classes: { [level: string]: boolean };

    /**
     * 指令的数据绑定属性发生改变时的回调方法
     */
    ngOnChanges(): void {
        this.childNodes = this.navNode && this.navNode.childNodes;

        if (this.traceNodes) {
            this.isSelected = this.traceNodes.includes(this.navNode);
            this.isExpanded = this.isExpandedParent && (this.isSelected || (this.isWideScreen && this.isExpanded));
        } else {
            this.isSelected = false;
        }

        this.setClasses();
    }

    /**
     * 点击节点，切换节点的展开状态，设置CSS样式类
     */
    clickNode(): void {
        this.isExpanded = !this.isExpanded;
        this.setClasses();
    }

    /**
     * 设置CSS样式类
     */
    private setClasses(): void {
        this.classes = {
            [`level-${this.level}`]: true,
            selected: this.isSelected,
            expanded: this.isExpanded,
            collapsed: !this.isExpanded,
        };
    }

}
