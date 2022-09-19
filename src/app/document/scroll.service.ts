import {Inject, Injectable, OnDestroy} from '@angular/core';
import {DOCUMENT, Location, PlatformLocation, ViewportScroller} from '@angular/common';

import {fromEvent, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';

import {sessionStorageToken} from '../base/storage.service';
import {ScrollPosition, ScrollPositionPopStateEvent} from './scroll.model';

/**
 * 滚动服务，把文档元素滚进视图中
 */
@Injectable()
export class ScrollService implements OnDestroy {

    // 滚动地址的存储Key
    private scrollLocationKey = 'scrollLocation';

    // 滚动位置的存储Key
    private scrollPositionKey = 'scrollPosition';

    // 元素顶部偏移量
    private _topOffset: number | null;

    // 页面顶部元素
    private _topElement: HTMLElement;

    // 滚动已经禁用
    private scrollDisabled = new Subject<void>();

    // popstate事件修正的滚动位置
    scrollPositionPopped: ScrollPosition | null = null;

    // 浏览器是否允许手动修正滚动位置：Window对象具有scrollTo方法和pageXOffset属性，并且history的scrollRestoration属性可写
    canFixScrollPosition: boolean = !!window && ('scrollTo' in window) && ('pageXOffset' in window) && ScrollService.isScrollRestorationWritable();

    /**
     * 获取元素的顶部偏移量：页面顶部的工具栏高度 + 顶部外边距
     *
     * @return 元素的顶部偏移量
     */
    get topOffset(): number {
        if (!this._topOffset) {
            const toolbar = this.document.querySelector('.toolbar');
            this._topOffset = (toolbar && toolbar.clientHeight || 0) + 16;
        }
        return this._topOffset as number;
    }

    /**
     * 获取页面顶部的元素：id为top-of-page的元素或document.body
     *
     * @return 页面顶部的元素
     */
    get topElement(): HTMLElement {
        if (!this._topElement) {
            this._topElement = this.document.getElementById('top-of-page') || this.document.body;
        }
        return this._topElement;
    }

    /**
     * 构造函数，创建滚动服务
     *
     * @param viewportScroller 视窗滚动器，通过浏览器视窗滚动器实现的滚动位置管理器
     * @param platformLocation 平台定位器，封装DOM接口的调用，实现平台无关的路由器
     * @param location 定位器，用于与浏览器的URL进行交互
     * @param document 文档对象，浏览器加载的Web页面
     * @param sessionStorage 会话存储
     */
    constructor(private viewportScroller: ViewportScroller,
                private platformLocation: PlatformLocation,
                private location: Location,
                @Inject(DOCUMENT) private document: Document,
                @Inject(sessionStorageToken) private sessionStorage: Storage) {
        // 调整大小时，页面顶部的工具栏高度可能会发生改变，把元素的顶部偏移量设置为null
        fromEvent(window, 'resize').pipe(takeUntil(this.scrollDisabled)).subscribe(() => this._topOffset = null);

        // 滚动时，更新存储的滚动位置，更新history栈中的滚动位置状态
        fromEvent(window, 'scroll').pipe(debounceTime(250), takeUntil(this.scrollDisabled)).subscribe(() => this.updateScrollPosition());

        // 卸载之前，更新存储的滚动地址
        fromEvent(window, 'beforeunload').pipe(takeUntil(this.scrollDisabled)).subscribe(() => this.updateScrollLocation());

        if (this.canFixScrollPosition) {
            // 浏览器可以手动修正滚动位置时，把history的scrollRestoration属性设置为manual
            history.scrollRestoration = 'manual';

            // 点击前进或后退按钮触发的popstate事件的监听器
            const locationSubscriber = this.location.subscribe((event: ScrollPositionPopStateEvent) => this.handlePopStateEvent(event));
            this.scrollDisabled.subscribe(() => locationSubscriber.unsubscribe());
        }

        // 没有重新加载时，删除存储的滚动地址和滚动位置
        if (window.location.href !== this.getScrollLocation()) {
            this.removeScrollInfos();
        }
    }

    /**
     * 指令、管道或服务销毁之前的回调方法，执行自定义清理功能
     */
    ngOnDestroy(): void {
        this.scrollDisabled.next();
    }

    /**
     * 处理popstate事件
     *
     * @param event 包含滚动位置的popstate事件
     */
    private handlePopStateEvent(event: ScrollPositionPopStateEvent): void {
        if (event.type === 'hashchange') {
            // 当前地址的hash片段发生改变触发popstate事件时，事件类型是hashchange，滚动到popstate事件修正的滚动位置
            this.scrollToPosition();
        } else {
            // 点击前进或后退按钮触发popstate事件时，事件类型不是hashchange，删除存储的滚动地址和滚动位置
            this.removeScrollInfos();
            // 修正滚动位置，popstate事件后面可能紧跟着hashchange事件
            this.scrollPositionPopped = event.state ? event.state.scrollPosition : null;
        }
    }

    /**
     * 加载页面时，滚动到正确的位置。
     * 页面加载方式：在地址栏中输入URL、点击链接、点击刷新按钮、点击前进或后退按钮。
     *
     * @param delayTime 滚动延迟时间（毫秒）
     */
    scrollAfterLoad(delayTime: number): void {
        const storedScrollPosition = this.getScrollPosition();
        if (storedScrollPosition) {
            // 点击刷新按钮重新加载页面时，使用存储的滚动位置
            this.viewportScroller.scrollToPosition(storedScrollPosition);
        } else {
            if (this.isNeededFixScrollPosition()) {
                // 点击前进或后退按钮触发popstate事件重新加载页面时，管理滚动位置
                this.scrollToPosition();
            } else {
                // 地址栏中输入URL加载页面，或者点击链接加载页面
                if (this.hasCurrentLocationHash()) {
                    // 当前地址中存在hash片段时，按指定的滚动延迟时间，等待异步布局完成之后，滚动到hash片段对应的元素
                    setTimeout(() => this.scrollToHashElement(), delayTime);
                } else {
                    // 当前地址中不存在hash片段时，滚动到页面顶部的元素
                    this.scrollToTopElement();
                }
            }
        }
    }

    /**
     * 滚动到当前地址的hash片段对应的元素。
     * 当前地址中没有hash片段时，滚动到页面顶部的元素。
     * 当前地址的hash片段没有对应的元素时，不需要滚动。
     */
    scrollToHashElement(): void {
        // 当前地址的hash片段去掉开头的#之后就是元素id
        const hash = this.getCurrentLocationHash();
        const element = hash ? this.document.getElementById(hash) ?? null : this.topElement;
        this.scrollToElement(element);
    }

    /**
     * 滚动到页面顶部的元素
     */
    scrollToTopElement(): void {
        this.scrollToElement(this.topElement);
    }

    /**
     * 滚动到元素，没有元素时，不需要滚动
     */
    private scrollToElement(element: HTMLElement | null): void {
        if (element) {
            element.scrollIntoView();
            element.focus?.();

            if (window && window.scrollBy) {
                // 把元素顶部滚动到元素顶部偏移量的位置。
                // top属性的值通常为0，除非元素无法滚动到页面顶部，因为视窗的高度大于元素内容的高度。
                window.scrollBy(0, element.getBoundingClientRect().top - this.topOffset);

                // 非常接近页面顶部（小于20像素）时，滚动到页面顶部。
                // 元素位于页面顶部，并且元素的顶部外边距很小时，可能会发生这种情况。
                if (window.pageYOffset < 20) {
                    window.scrollBy(0, -window.pageYOffset);
                }
            }
        }
    }

    /**
     * 滚动到popstate事件修正的滚动位置
     */
    private scrollToPosition(): void {
        if (this.scrollPositionPopped) {
            this.viewportScroller.scrollToPosition(this.scrollPositionPopped);
            this.scrollPositionPopped = null;
        }
    }

    /**
     * 更新存储的滚动地址
     */
    private updateScrollLocation(): void {
        this.sessionStorage.setItem(this.scrollLocationKey, window.location.href);
    }

    /**
     * 更新存储的滚动位置，更新history栈中的滚动位置状态
     */
    private updateScrollPosition(): void {
        if (this.canFixScrollPosition) {
            const currentScrollPosition = this.viewportScroller.getScrollPosition();
            // 把浏览器的URL修改为规范的URL，替换history栈中最上面的URL
            this.location.replaceState(this.location.path(true), undefined, {scrollPosition: currentScrollPosition});
            this.sessionStorage.setItem(this.scrollPositionKey, currentScrollPosition.join(','));
        }
    }

    /**
     * 判断popState事件之后是否需要手动修正滚动位置
     *
     * @return true：需要手动修正滚动位置，false：不需要手动修正滚动位置
     */
    private isNeededFixScrollPosition(): boolean {
        return this.canFixScrollPosition && !!this.scrollPositionPopped;
    }

    /**
     * 判断当前地址中是否存在hash片段，即以#为开头的URL片段
     *
     * @return true：存在hash片段，false：不存在hash片段
     */
    private hasCurrentLocationHash(): boolean {
        return !!this.getCurrentLocationHash();
    }

    /**
     * 获取当前地址的hash片段，并去掉开头的#
     *
     * @return 当前地址的hash片段
     */
    private getCurrentLocationHash(): string {
        return decodeURIComponent(this.platformLocation.hash.replace(/^#/, ''));
    }

    /**
     * 获取存储的滚动地址
     *
     * @return 存储的滚动地址或null
     */
    private getScrollLocation(): string | null {
        return this.sessionStorage.getItem(this.scrollLocationKey) || null;
    }

    /**
     * 获取存储的滚动位置
     *
     * @return 存储的滚动位置或null
     */
    private getScrollPosition(): ScrollPosition | null {
        const scrollPosition = this.sessionStorage.getItem(this.scrollPositionKey);
        if (!scrollPosition) {
            return null;
        }
        const [x, y] = scrollPosition.split(',');
        return [+x, +y];
    }

    /**
     * 删除存储的滚动地址和滚动位置
     */
    removeScrollInfos(): void {
        this.sessionStorage.removeItem(this.scrollLocationKey);
        this.sessionStorage.removeItem(this.scrollPositionKey);
    }

    /**
     * 根据history实例或原型中的scrollRestoration属性描述符是否可写或是否具有set方法，判断history的scrollRestoration属性是否可写
     *
     * @return true：history的scrollRestoration属性可写，false：history的scrollRestoration属性不可写
     */
    private static isScrollRestorationWritable(): boolean {
        const scrollRestorationDescriptor = Object.getOwnPropertyDescriptor(history, 'scrollRestoration') || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(history), 'scrollRestoration');
        return scrollRestorationDescriptor !== undefined && !!(scrollRestorationDescriptor.writable || scrollRestorationDescriptor.set);
    }

}
