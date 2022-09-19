import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {fromEvent, Subject} from 'rxjs';
import {auditTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';

import {ScrollService} from './scroll.service';
import {ScrollSpy, ScrollElementList} from './scroll.model';

/**
 * 滚动监视服务
 */
@Injectable()
export class ScrollSpyService {

    // 被监视滚动元素组
    private scrollElementLists: ScrollElementList[] = [];

    // 停止监听resize和scroll事件
    private stopListenEvent = new Subject<void>();

    // resize事件
    private resizeEvent = fromEvent(window, 'resize').pipe(auditTime(300), takeUntil(this.stopListenEvent));

    // scroll事件
    private scrollEvent = fromEvent(window, 'scroll').pipe(auditTime(10), takeUntil(this.stopListenEvent));

    // 视窗滚动高度
    private viewportScrollHeight: number;

    // 窗口最大滚动高度 = 视窗滚动高度 - 视窗高度
    private maxWindowScrollHeight: number;

    /**
     * 构造函数，创建滚动监视服务
     *
     * @param document 文档对象
     * @param scrollService 滚动服务
     */
    constructor(@Inject(DOCUMENT) private document: Document, private scrollService: ScrollService) {

    }

    /**
     * 开始监视元素，开始发送当前活动元素，不存在其他被监视元素组时，开始监听resize和scroll事件
     *
     * @param elements 被监视元素组
     * @return 滚动监视器
     */
    spyElements(elements: Element[]): ScrollSpy {
        if (!this.scrollElementLists.length) {
            this.resizeEvent.subscribe(() => this.calcScrollHeight());
            this.scrollEvent.subscribe(() => this.sendActiveElement());
            this.calcScrollHeight();
        }

        const windowScrollHeight = ScrollSpyService.getWindowScrollHeight();
        const elementTopOffset = this.getElementTopOffset();
        const maxWindowScrollHeight = this.maxWindowScrollHeight;

        const scrollElementList = new ScrollElementList(elements);
        scrollElementList.calcScrollHeight(windowScrollHeight, elementTopOffset);
        scrollElementList.sendActiveElement(windowScrollHeight, maxWindowScrollHeight);
        this.scrollElementLists.push(scrollElementList);

        return {
            activeElement: scrollElementList.activeElement.asObservable().pipe(distinctUntilChanged()),
            unspyElements: () => this.unspyElements(scrollElementList)
        };
    }

    /**
     * 停止监视元素，停止发送当前活动元素，不存在其他被监视元素组时，停止监听resize和scroll事件
     *
     * @param unspyScrollElementList 停止监视元素组
     */
    private unspyElements(unspyScrollElementList: ScrollElementList) {
        unspyScrollElementList.activeElement.complete();
        this.scrollElementLists = this.scrollElementLists.filter(scrollElementList => scrollElementList !== unspyScrollElementList);
        if (!this.scrollElementLists.length) {
            this.stopListenEvent.next();
        }
    }

    /**
     * 窗口大小发生改变，重新计算所有受影响值，滚动时才能有效确定当前活动元素
     */
    private calcScrollHeight() {
        const viewportHeight = this.getViewportHeight();
        const viewportScrollHeight = this.getViewportScrollHeight();
        const windowScrollHeight = ScrollSpyService.getWindowScrollHeight();
        const elementTopOffset = this.getElementTopOffset();

        this.viewportScrollHeight = viewportScrollHeight;
        this.maxWindowScrollHeight = viewportScrollHeight - viewportHeight;
        this.scrollElementLists.forEach(scrollElementList => scrollElementList.calcScrollHeight(windowScrollHeight, elementTopOffset));
    }

    /**
     * 确定并发送当前活动元素，视窗滚动高度发生改变时，重新计算所有受影响值
     */
    private sendActiveElement() {
        // 图片下载、展开折叠都会改变视窗滚动高度
        if (this.viewportScrollHeight !== this.getViewportScrollHeight()) {
            this.calcScrollHeight();
        }

        const windowScrollHeight = ScrollSpyService.getWindowScrollHeight();
        const maxWindowScrollHeight = this.maxWindowScrollHeight;
        this.scrollElementLists.forEach(scrollElementList => scrollElementList.sendActiveElement(windowScrollHeight, maxWindowScrollHeight));
    }

    /**
     * 获取视窗高度
     *
     * @return 视窗高度
     */
    private getViewportHeight(): number {
        return this.document.body.clientHeight || 0;
    }

    /**
     * 获取视窗滚动高度
     *
     * @return 视窗滚动高度
     */
    private getViewportScrollHeight(): number {
        return this.document.body.scrollHeight || Number.MAX_SAFE_INTEGER;
    }

    /**
     * 获取窗口滚动高度
     *
     * @return 窗口滚动高度
     */
    private static getWindowScrollHeight(): number {
        return window && window.pageYOffset || 0;
    }

    /**
     * 获取元素顶部偏移量
     *
     * @return 元素顶部偏移量
     */
    private getElementTopOffset(): number {
        return this.scrollService.topOffset + 50;
    }

}
