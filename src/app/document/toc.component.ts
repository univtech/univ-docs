import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';

import {asapScheduler, combineLatest, Subject} from 'rxjs';
import {startWith, subscribeOn, takeUntil} from 'rxjs/operators';

import {ScrollService} from './scroll.service';
import {TocItem, TocType} from './toc.model';
import {TocService} from './toc.service';

/**
 * 目录组件
 */
@Component({
    selector: 'univ-toc',
    templateUrl: './toc.component.html',
})
export class TocComponent implements OnInit, AfterViewInit, OnDestroy {

    // 目录类型
    tocType: TocType = 'None';

    // 目录列表
    tocItems: TocItem[];

    // 当前活动目录索引
    activeTocIndex: number | null = null;

    // 最大主目录数量
    maxPrimaryCount = 4;

    // 是否嵌入式目录，true：嵌入式目录，false，非嵌入式目录
    isEmbedded = false;

    // 是否折叠目录，true：折叠目录，false，展开目录
    isCollapsed = true;

    // 目录元素，引用`<li #tocItemLi>`
    @ViewChildren('tocItemLi') private tocItemElements: QueryList<ElementRef>;

    // 目录已经销毁
    private tocDestroyed = new Subject<void>();

    /**
     * 构造函数，创建目录组件
     *
     * @param elementRef 元素引用
     * @param scrollService 滚动服务
     * @param tocService 目录服务
     */
    constructor(elementRef: ElementRef,
                private scrollService: ScrollService,
                private tocService: TocService) {
        this.isEmbedded = elementRef.nativeElement.className.indexOf('embedded') !== -1;
    }

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        this.tocService.tocItems.pipe(takeUntil(this.tocDestroyed)).subscribe(tocItems => {
            this.tocItems = tocItems;
            const nonH1TocItemCount = this.countItems(this.tocItems, tocItem => tocItem.level !== 'h1');
            this.tocType = this.getTocType(nonH1TocItemCount);
        });
    }

    /**
     * 组件视图初始化完成之后的回调方法
     */
    ngAfterViewInit(): void {
        if (!this.isEmbedded) {
            combineLatest([
                this.tocService.activeTocIndex.pipe(subscribeOn(asapScheduler)),
                this.tocItemElements.changes.pipe(startWith(this.tocItemElements)),
            ]).pipe(takeUntil(this.tocDestroyed)).subscribe(([activeTocIndex, tocItemElements]) => {
                this.activeTocIndex = activeTocIndex;
                if (activeTocIndex === null || activeTocIndex >= tocItemElements.length) {
                    return;
                }

                const activeTocItemElement = tocItemElements.toArray()[activeTocIndex].nativeElement;
                const parentTocItemElement = activeTocItemElement.offsetParent;

                const activeTocItemElementRect = activeTocItemElement.getBoundingClientRect();
                const parentTocItemElementRect = parentTocItemElement.getBoundingClientRect();

                const isInViewport = (activeTocItemElementRect.top >= parentTocItemElementRect.top) && (activeTocItemElementRect.bottom <= parentTocItemElementRect.bottom);
                if (!isInViewport) {
                    parentTocItemElement.scrollTop += (activeTocItemElementRect.top - parentTocItemElementRect.top) - (parentTocItemElement.clientHeight / 2);
                }
            });
        }
    }

    /**
     * 指令、管道或服务销毁之前的回调方法，执行自定义清理功能
     */
    ngOnDestroy(): void {
        this.tocDestroyed.next();
    }

    /**
     * 折叠目录
     *
     * @param canScroll 是否可以滚动，true：可以滚动；false：不可以滚动，默认true
     */
    collapseTocItem(canScroll = true): void {
        this.isCollapsed = !this.isCollapsed;
        if (canScroll && this.isCollapsed) {
            this.scrollToTopElement();
        }
    }

    /**
     * 滚动到页面顶部的元素
     */
    private scrollToTopElement(): void {
        this.scrollService.scrollToTopElement();
    }

    /**
     * 获取目录类型
     *
     * @param nonH1TocItemCount 非h1标题目录的个数
     * @return 目录类型
     */
    private getTocType(nonH1TocItemCount: number): TocType {
        if (nonH1TocItemCount <= 0) {
            return 'None';
        } else if (!this.isEmbedded) {
            return 'Floating';
        } else if (nonH1TocItemCount <= this.maxPrimaryCount) {
            return 'EmbeddedSimple';
        } else {
            return 'EmbeddedExpandable';
        }
    }

    /**
     * 计算数组中检查通过的元素个数
     *
     * @param items 数组
     * @param itemChecker 元素检查器
     * @return 数组中检查通过的元素个数
     */
    private countItems<T>(items: T[], itemChecker: (item: T) => boolean): number {
        return items.reduce((count, item) => itemChecker(item) ? count + 1 : count, 0);
    }

}
