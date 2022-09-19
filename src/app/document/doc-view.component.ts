import {Component, ElementRef, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';

import {asapScheduler, Observable, of, timer} from 'rxjs';
import {catchError, observeOn, switchMap, takeUntil, tap} from 'rxjs/operators';

import {unwrapHtml} from 'safevalues';

import {LogService} from '../base/log.service';
import {CurrNode} from '../navigation/nav.model';
import {ElementLoadService} from '../element/element-load.service';
import {TocService} from './toc.service';
import {AnimatedCssPropName, doc404Id, docFailId, DocSafe, initialDocViewContent, noAnimations} from './doc.model';

/**
 * 文档查看器组件。
 *
 * 输入属性：
 * * currNode：顶部当前节点
 * * currDoc：当前文档
 *
 * 输出属性：
 * * currDocReady：文档查看器中准备插入当前文档
 * * currDocInserted：文档查看器中已经插入当前文档
 * * currDocRendered：文档查看器中已经渲染当前文档
 * * prevDocRemoved：文档查看器中已经删除上个文档
 */
@Component({
    selector: 'univ-doc-view',
    template: ''
})
export class DocViewComponent implements OnDestroy {

    // 文档的宿主元素
    private docHostElement: HTMLElement;

    // 上个文档的div元素
    private prevDocDivElement: HTMLElement = document.createElement('div');

    // 当前文档的div元素
    private currDocDivElement: HTMLElement = document.createElement('div');

    // 处理完成
    private processDone = of<void>(undefined);

    // 文档查看器已经销毁
    private docViewDestroyed = new EventEmitter<void>();

    // 已经设置当前文档
    private currDocSet = new EventEmitter<DocSafe>();

    // 文档查看器中准备插入当前文档
    @Output() currDocReady = new EventEmitter<void>();

    // 文档查看器中已经插入当前文档
    @Output() currDocInserted = new EventEmitter<void>();

    // 文档查看器中已经渲染当前文档
    @Output() currDocRendered = new EventEmitter<void>();

    // 文档查看器中已经删除上个文档
    @Output() prevDocRemoved = new EventEmitter<void>();

    // 当前节点
    @Input() currNode?: CurrNode;

    /**
     * 设置当前文档
     *
     * @param currDoc 当前文档
     */
    @Input() set currDoc(currDoc: DocSafe) {
        if (currDoc) {
            this.currDocSet.emit(currDoc);
        }
    }

    /**
     * 构造函数，创建文档查看器组件
     *
     * @param elementRef 元素引用，视图中native元素的包装器
     * @param htmlDocTitle 标题服务，用于获取和设置`<title>`标签
     * @param htmlDocMeta 元数据服务，用于管理`<meta>`标签
     * @param logService 日志服务
     * @param tocService 目录服务
     * @param elementLoadService 元素加载服务
     */
    constructor(elementRef: ElementRef,
                private htmlDocTitle: Title,
                private htmlDocMeta: Meta,
                private logService: LogService,
                private tocService: TocService,
                private elementLoadService: ElementLoadService) {
        this.createDocView(elementRef);
    }

    /**
     * 指令、管道或服务销毁之前的回调方法，执行自定义清理功能
     */
    ngOnDestroy(): void {
        this.docViewDestroyed.emit();
    }

    /**
     * 创建文档查看器
     *
     * @param elementRef 元素引用，视图中native元素的包装器
     */
    private createDocView(elementRef: ElementRef): void {
        this.docHostElement = elementRef.nativeElement;
        this.docHostElement.innerHTML = unwrapHtml(initialDocViewContent) as string;

        if (this.docHostElement.firstElementChild) {
            this.prevDocDivElement = this.docHostElement.firstElementChild as HTMLElement;
        }

        this.currDocSet.pipe(
            observeOn(asapScheduler),
            switchMap(currDoc => this.renderCurrDoc(currDoc)),
            takeUntil(this.docViewDestroyed),
        ).subscribe();
    }

    /**
     * 渲染当前文档
     *
     * @param currDoc 当前文档
     * @return 当前文档渲染完成
     */
    private renderCurrDoc(currDoc: DocSafe): Observable<void> {
        let addTitleAndToc: () => void;
        this.setRobotNoindex(currDoc.id === doc404Id || currDoc.id === docFailId);

        return this.processDone.pipe(
            tap(() => this.addDocContent(currDoc)),
            tap(() => addTitleAndToc = this.addWindowTitleAndDocToc(currDoc)),
            switchMap(() => this.elementLoadService.loadElementComponentModules(this.currDocDivElement)),
            tap(() => this.currDocReady.emit()),
            switchMap(() => this.swapDocView(addTitleAndToc)),
            tap(() => this.currDocRendered.emit()),
            catchError(error => this.handleRenderError(currDoc, error)),
        );
    }

    /**
     * 设置搜索引擎爬虫是否不索引当前页面
     *
     * @param noindex 搜索引擎爬虫是否不索引当前页面，true：不索引当前页面；false：索引当前页面
     */
    private setRobotNoindex(noindex: boolean): void {
        if (noindex) {
            this.htmlDocMeta.addTag({name: 'robots', content: 'noindex'});
        } else {
            this.htmlDocMeta.removeTag('name="robots"');
        }
    }

    /**
     * 添加当前文档内容
     *
     * @param currDoc 当前文档
     */
    private addDocContent(currDoc: DocSafe): void {
        if (currDoc.content === null) {
            this.currDocDivElement.textContent = '';
        } else {
            this.currDocDivElement.innerHTML = unwrapHtml(currDoc.content) as string;
        }
    }

    /**
     * 添加窗口标题和文档目录
     *
     * @param currDoc 当前文档
     * @return 添加窗口标题和文档目录的方法
     */
    private addWindowTitleAndDocToc(currDoc: DocSafe): () => void {
        const h1Element = this.currDocDivElement.querySelector('h1');
        const tocElementEmbedded = this.currDocDivElement.querySelector('univ-toc.embedded');
        const isNeededTitle = !!h1Element && !/no-?title/i.test(h1Element.className);
        const isNeededToc = !!h1Element && !/no-?toc/i.test(h1Element.className);

        if (h1Element && h1Element.parentNode && isNeededToc && !tocElementEmbedded) {
            const tocElement = document.createElement('univ-toc');
            tocElement.className = 'embedded';
            h1Element.parentNode.insertBefore(tocElement, h1Element.nextSibling);
        } else if (!isNeededToc && tocElementEmbedded) {
            tocElementEmbedded.remove();
        }

        return () => this.addTitleAndToc(currDoc, h1Element, isNeededTitle, isNeededToc);
    }

    /**
     * 添加窗口标题和文档目录
     *
     * @param currDoc 当前文档
     * @param h1Element 当前文档的h1标题元素
     * @param isNeededTitle 是否需要窗口标题
     * @param isNeededToc 是否需要文档目录
     */
    private addTitleAndToc(currDoc: DocSafe, h1Element: HTMLHeadingElement | null, isNeededTitle: boolean, isNeededToc: boolean): void {
        let title: string | null = '';
        this.tocService.resetTocItems();

        if (h1Element) {
            if (isNeededTitle) {
                title = h1Element.innerText;
            }
            if (isNeededToc) {
                this.tocService.generateTocItems(this.currDocDivElement, currDoc.id);
            }
        }

        const currTitle = this.currNode ? this.currNode.traceNodes[0].title : 'Univ';
        this.htmlDocTitle.setTitle(title ? `${currTitle} - ${title}` : currTitle);
    }

    /**
     * 处理当前文档的渲染错误
     *
     * @param currDoc 当前文档
     * @param error 错误
     * @return 处理完成
     */
    private handleRenderError(currDoc: DocSafe, error: any): Observable<void> {
        const errorMessage = `${error instanceof Error ? error.stack : error}`;
        this.logService.error(new Error(`[文档查看器] 渲染文档错误，文档id：${currDoc.id}；错误信息：${errorMessage}`));
        this.currDocDivElement.textContent = '';
        this.setRobotNoindex(true);
        return this.processDone;
    }

    /**
     * 切换文档视图
     *
     * @param addTitleAndToc 添加窗口标题和右侧页面目录的方法
     * @return 文档视图切换完成
     */
    private swapDocView(addTitleAndToc: () => void): Observable<void> {
        let processDone = this.processDone;
        const enterAnimation = (element: HTMLElement) => this.generateAnimation(element, 'opacity', '0.1', '1');
        const leaveAnimation = (element: HTMLElement) => this.generateAnimation(element, 'opacity', '1', '0.1');

        if (this.prevDocDivElement.parentElement) {
            processDone = processDone.pipe(
                // 从文档查看器中删除当前视图
                switchMap(() => leaveAnimation(this.prevDocDivElement)),
                tap(() => (this.prevDocDivElement.parentElement as HTMLElement).removeChild(this.prevDocDivElement)),
                tap(() => this.prevDocRemoved.emit()),
            );
        }

        return processDone.pipe(
            // 在文档查看器中插入下个视图
            tap(() => this.docHostElement.appendChild(this.currDocDivElement)),
            tap(() => addTitleAndToc()),
            tap(() => this.currDocInserted.emit()),
            switchMap(() => enterAnimation(this.currDocDivElement)),
            // 更新视图引用，清理未使用节点，释放内存
            tap(() => {
                const tempDocViewDivElement = this.prevDocDivElement;
                this.prevDocDivElement = this.currDocDivElement;
                this.currDocDivElement = tempDocViewDivElement;
                this.currDocDivElement.textContent = '';
            }),
        );
    }

    /**
     * 生成动画
     *
     * @param element HTML元素
     * @param propName 可赋值可生成动画的CSS属性名
     * @param fromValue CSS属性的开始值
     * @param toValue CSS属性的结束值
     * @param duration 完成过渡动画所需的毫秒数
     * @return 动画
     */
    private generateAnimation(element: HTMLElement, propName: AnimatedCssPropName, fromValue: string, toValue: string, duration = 200): Observable<void> {
        element.style.transition = '';
        const animationFrameObservable = this.requestAnimationFrame();
        const isNoAnimations = this.docHostElement.classList.contains(noAnimations);

        if (isNoAnimations) {
            return this.processDone.pipe(
                tap(() => element.style[propName] = toValue)
            );
        } else {
            // 为了在没有过渡样式的情况下应用from值，以及在存在过渡样式的情况下应用to值，因此设置每个样式前都要传入动画帧
            return this.processDone.pipe(
                switchMap(() => animationFrameObservable),
                tap(() => element.style[propName] = fromValue),
                switchMap(() => animationFrameObservable),
                tap(() => element.style.transition = `all ${duration}ms ease-in-out`),
                switchMap(() => animationFrameObservable),
                tap(() => element.style[propName] = toValue),
                switchMap(() => timer(DocViewComponent.getTransitionDuration(element))),
                switchMap(() => this.processDone),
            );
        }
    }

    /**
     * 请求和取消动画帧
     *
     * @return 动画帧
     */
    private requestAnimationFrame(): Observable<void> {
        return new Observable<void>(subscriber => {
            // 请求动画帧，请求浏览器执行动画，并在下次重绘之前调用更新动画的方法
            const requestId = requestAnimationFrame(() => {
                subscriber.next();
                subscriber.complete();
            });
            // 取消动画帧请求
            return () => cancelAnimationFrame(requestId);
        });
    }

    /**
     * 获取完成过渡动画所需的时间，以毫秒为单位
     *
     * @param element HTML元素
     * @return 完成过渡动画所需的毫秒数
     */
    private static getTransitionDuration(element: HTMLElement): number {
        // 获取完成过渡动画所需的时间，以秒为单位，默认为0s，表示不出现过渡动画
        const transitionDuration = getComputedStyle(element).transitionDuration || '';
        const transitionSeconds = Number(transitionDuration.replace(/s$/, ''));
        return 1000 * transitionSeconds;
    }

}
