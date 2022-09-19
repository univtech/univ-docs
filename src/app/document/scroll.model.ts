import {PopStateEvent} from '@angular/common';

import {Observable, ReplaySubject} from 'rxjs';

// 滚动位置：[x, y]坐标
export type ScrollPosition = [number, number];

// PopStateEvent：popstate事件；ScrollPositionPopStateEvent：包含滚动位置的popstate事件
export interface ScrollPositionPopStateEvent extends PopStateEvent {
    // 存在历史状态时，总是包含滚动位置
    state?: { scrollPosition: ScrollPosition };
}

// 滚动监视器
export interface ScrollSpy {
    // 当前活动元素
    activeElement: Observable<ScrollItem | null>;
    // 停止监视元素
    unspyElements: () => void;
}

// 滚动元素
export interface ScrollItem {
    // 元素索引
    index: number;
    // 被监视元素
    element: Element;
}

// 被监视滚动元素
export class ScrollElement implements ScrollItem {

    // 元素滚动高度
    scrollHeight = 0;

    /**
     * 构造函数，创建被监视滚动元素
     *
     * @param index 元素索引
     * @param element 被监视元素
     */
    constructor(public readonly index: number, public readonly element: Element) {

    }

    /**
     * 计算元素滚动高度，以确定当前活动元素
     *
     * @param windowScrollHeight 窗口滚动高度
     * @param elementTopOffset 元素顶部偏移量
     */
    calcScrollHeight(windowScrollHeight: number, elementTopOffset: number) {
        this.scrollHeight = windowScrollHeight + this.element.getBoundingClientRect().top - elementTopOffset;
    }

}

// 被监视滚动元素组
export class ScrollElementList {

    // 被监视元素组
    private readonly scrollElements: ScrollElement[];

    // 当前活动元素
    activeElement: ReplaySubject<ScrollItem | null> = new ReplaySubject(1);

    /**
     * 构造函数，创建被监视滚动元素组
     *
     * @param elements 被监视元素组
     */
    constructor(elements: Element[]) {
        this.scrollElements = elements.map((element, index) => new ScrollElement(index, element));
    }

    /**
     * 计算元素滚动高度，按元素滚动高度降序排序
     *
     * @param windowScrollHeight 窗口滚动高度
     * @param elementTopOffset 元素顶部偏移量
     */
    calcScrollHeight(windowScrollHeight: number, elementTopOffset: number) {
        this.scrollElements.forEach(scrollElement => scrollElement.calcScrollHeight(windowScrollHeight, elementTopOffset));
        this.scrollElements.sort((first, second) => second.scrollHeight - first.scrollHeight);
    }

    /**
     * 确定并发送当前活动元素，无法确定当前活动元素时，发送null。
     * 窗口滚动时，最下面的元素被认为是当前活动元素。
     * 按元素滚动高度降序排序后，第一个元素就是最下面的元素。
     * * 窗口滚动到底部时，第一个元素就是最下面的元素；
     * * 窗口没有滚动到底部时，滚动高度小于等于窗口滚动高度的第一个元素就是最下面的元素。
     *
     * @param windowScrollHeight 窗口滚动高度
     * @param maxWindowScrollHeight 窗口最大滚动高度（基于视窗大小）
     */
    sendActiveElement(windowScrollHeight: number, maxWindowScrollHeight: number) {
        let activeElement: ScrollItem | undefined;

        if (windowScrollHeight + 1 >= maxWindowScrollHeight) {
            activeElement = this.scrollElements[0];
        } else {
            this.scrollElements.some(scrollElement => {
                if (scrollElement.scrollHeight <= windowScrollHeight) {
                    activeElement = scrollElement;
                    return true;
                }
                return false;
            });
        }

        this.activeElement.next(activeElement || null);
    }

}
