import {Component, ElementRef, Input, OnInit} from '@angular/core';

import {LogService} from '../base/log.service';
import {ElementLoadService} from './element-load.service';

/**
 * 元素延时加载组件。
 *
 * 输入属性：
 * * selector：元素选择器
 */
@Component({
    selector: 'univ-element-lazy',
    template: '',
})
export class ElementLazyComponent implements OnInit {

    // 元素选择器
    @Input() selector = '';

    /**
     * 构造函数，创建元素延时加载组件
     *
     * @param elementRef 元素引用
     * @param logService 日志服务
     * @param elementLoadService 元素加载服务
     */
    constructor(private elementRef: ElementRef,
                private logService: LogService,
                private elementLoadService: ElementLoadService) {

    }

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        if (!this.selector || /[^\w-]/.test(this.selector)) {
            this.logService.error(new Error(`'univ-element-lazy'组件中使用的选择器无效：${this.selector}`));
            return;
        }
        this.elementRef.nativeElement.textContent = '';
        this.elementRef.nativeElement.appendChild(document.createElement(this.selector));
        this.elementLoadService.loadElementComponentModule(this.selector).then(() => undefined);
    }

}
