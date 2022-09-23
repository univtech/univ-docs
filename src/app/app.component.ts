import {Component, ElementRef, HostBinding, HostListener, OnInit, QueryList, ViewChild, ViewChildren,} from '@angular/core';
import {MatDrawerMode, MatSidenav} from '@angular/material/sidenav';

import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';

import {Authorize, ExtIcon} from './config/config.model';
import {ConfigService} from './config/config.service';
import {CurrNode, NavNode} from './navigation/nav.model';
import {NavService} from './navigation/nav.service';
import {DocSafe} from './document/doc.model';
import {DocService} from './document/doc.service';
import {ScrollService} from './document/scroll.service';
import {DeployService} from './base/deploy.service';
import {LocationService} from './navigation/location.service';
import {ServiceWorkerService} from './base/service-worker.service';
import {TocService} from './document/toc.service';
import {SearchService} from './search/search.service';
import {NoticeComponent} from './notice/notice.component';
import {SearchBoxComponent} from './search/search-box.component';
import {SearchResults} from './search/search.model';

@Component({
    selector: 'univ-app',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    // 显示顶部菜单的最小宽度
    private showTopMenuWidth = 1150;

    // 显示左侧导航的最小宽度
    private showSideNavWidth = 992;

    // 显示右侧目录的最小宽度
    private showFloatTocWidth = 800;

    // 是否显示顶部菜单
    showTopMenu = false;

    // 是否显示左侧导航
    showSideNav = false;

    // 是否显示右侧目录
    private showFloatToc = new BehaviorSubject(false);

    // 是否拥有右侧目录
    hasFloatToc = false;

    // 是否显示搜索结果
    showSearchResult = false;

    // 是否生成公告动画
    private animateNotice = false;

    // 顶部导航节点
    topNavNodes: NavNode[];

    // 顶部当前节点
    topCurrNode?: CurrNode;

    // 窄屏顶部导航节点
    topNarrNavNodes: NavNode[];

    // 窄屏顶部当前节点
    topNarrCurrNode?: CurrNode;

    // 侧边导航节点
    sideNavNodes: NavNode[];

    // 侧边当前节点
    sideCurrNode?: CurrNode;

    // 底部导航节点
    footerNavNodes: NavNode[];

    // 授权信息
    authorize: Authorize;

    // 外部图标
    extIcons: ExtIcon[];

    // 当前路径
    private currPath: string;

    // 当前文档
    currDoc: DocSafe;

    // 文件夹id
    private folderId: string;

    // 页面id
    pageId: string;

    // CSS样式类
    @HostBinding('class') hostClasses = '';

    private isStarting = true;
    isTransitioning = true;

    // 正在获取
    isFetching = false;
    private fetchTimeoutId: any;
    private isSideNavDoc = false;

    // 最大目录高度
    maxTocHeight: string;

    // 最大目录高度偏移量
    private maxTocHeightOffset = 0;

    // 搜索结果列表
    searchResults: Observable<SearchResults>;

    // 搜索框组件
    @ViewChild(SearchBoxComponent, {static: true}) searchBoxComponent: SearchBoxComponent;

    // 搜索结果元素
    @ViewChild('searchResult', {read: ElementRef}) searchResultElement: ElementRef;

    // 搜索元素：搜索框元素、搜索结果元素
    @ViewChildren('searchBox, searchResult', {read: ElementRef}) searchElements: QueryList<ElementRef>;

    // 工具栏元素
    @ViewChild('toolbar', {read: ElementRef}) toolbarElement: ElementRef;

    // 图标元素：主题切换器元素、外部图标元素
    @ViewChildren('themeToggle, externalIcons', {read: ElementRef}) iconElements: QueryList<ElementRef>;

    // 公告组件
    @ViewChild(NoticeComponent, {static: true}) noticeComponent: NoticeComponent;

    // 侧边导航组件
    @ViewChild(MatSidenav, {static: true}) sideNavComponent: MatSidenav;

    // 用户希望减少动画
    static preferReducedMotion = window.matchMedia('(prefers-reduced-motion)').matches;

    /**
     * 判断动画是否已经禁用，用户希望减少动画，或者第一次渲染时，禁用所有Angular动画
     *
     * @return 动画是否已经禁用
     */
    @HostBinding('@.disabled')
    get animationDisabled(): boolean {
        return AppComponent.preferReducedMotion || this.isStarting;
    }

    /**
     * 判断侧边导航是否已经打开
     *
     * @return 侧边导航是否已经打开
     */
    get sideNavOpened(): boolean {
        return this.showSideNav && this.isSideNavDoc;
    }

    /**
     * 获取侧边导航模式
     *
     * @return 侧边导航已经打开，返回side；侧边导航尚未打开，返回over
     */
    get sideNavMode(): MatDrawerMode {
        return this.sideNavOpened ? 'side' : 'over';
    }

    /**
     * 构造函数，创建应用程序组件
     *
     * @param hostElement 宿主元素
     * @param deployService 部署服务
     * @param locationService 地址服务
     * @param serviceWorkerService ServiceWorker服务
     * @param configService 配置服务
     * @param navService 导航服务
     * @param docService 文档服务
     * @param tocService 目录服务
     * @param scrollService 滚动服务
     * @param searchService 搜索服务
     */
    constructor(private hostElement: ElementRef,
                private deployService: DeployService,
                private locationService: LocationService,
                private serviceWorkerService: ServiceWorkerService,
                private configService: ConfigService,
                private navService: NavService,
                private docService: DocService,
                private tocService: TocService,
                private scrollService: ScrollService,
                private searchService: SearchService) {

    }

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        if ('Worker' in window) {
            this.searchService.initWebWorker(2000);
        }

        this.handleWindowResize(window.innerWidth);

        this.docService.currDoc.subscribe(currDoc => this.currDoc = currDoc);

        this.locationService.currPath.subscribe(currPath => {
            if (currPath === this.currPath) {
                this.scrollService.scrollToHashElement();
            } else {
                this.currPath = currPath;
                clearTimeout(this.fetchTimeoutId);
                this.fetchTimeoutId = setTimeout(() => this.isFetching = true, 200);
            }
        });

        this.navService.topNavNodes.subscribe(topNavNodes => {
            this.topNavNodes = topNavNodes || [];
            this.topNarrNavNodes = this.buildTopNarrNavNodes();
        });

        this.navService.topCurrNode.subscribe(topCurrNode => {
            this.topCurrNode = topCurrNode;
            this.topNarrCurrNode = this.buildTopNarrCurrNode();
        });

        this.navService.sideNavNodes.subscribe(sideNavNodes => {
            this.sideNavNodes = sideNavNodes || [];
        });

        this.navService.sideCurrNode.subscribe(sideCurrNode => {
            this.sideCurrNode = sideCurrNode;
        });

        this.navService.footerNavNodes.subscribe(footerNavNodes => {
            this.footerNavNodes = footerNavNodes || [];
        });

        this.configService.authorize.subscribe(authorize => {
            this.authorize = authorize;
        });

        this.configService.extIcons.subscribe(extIcons => {
            this.extIcons = extIcons;
        });

        const hasTocItem = this.tocService.tocItems.pipe(map(tocItems => tocItems.length > 0));
        combineLatest([
            hasTocItem,
            this.showFloatToc
        ]).subscribe(([hasToc, showFloatToc]) => this.hasFloatToc = hasToc && showFloatToc);

        combineLatest([
            this.docService.currDoc,
            this.navService.topCurrNode,
            this.navService.sideCurrNode
        ]).pipe(first()).subscribe(() => this.updateShell());

        this.serviceWorkerService.enableUpdate();
    }

    private buildTopNarrNavNodes(): NavNode[] {
        return this.topNavNodes ? [{title: 'Univ文档', childNodes: this.topNavNodes}] : [];
    }

    private buildTopNarrCurrNode(): CurrNode | undefined {
        return this.topCurrNode ? {url: this.topCurrNode.url, traceNodes: [...this.topCurrNode.traceNodes, ...this.buildTopNarrNavNodes()]} : undefined;
    }

    /**
     * 文档查看器中准备插入当前文档
     */
    handleCurrDocReady(): void {
        this.isTransitioning = true;
        clearTimeout(this.fetchTimeoutId);
        setTimeout(() => this.isFetching = false, 500);
    }

    /**
     * 文档查看器中已经插入当前文档
     */
    handleCurrDocInserted(): void {
        setTimeout(() => this.updateShell());
        this.scrollService.scrollAfterLoad(500);
    }

    /**
     * 文档查看器中已经渲染当前文档
     */
    handleCurrDocRendered(): void {
        if (this.isStarting) {
            setTimeout(() => this.isStarting = false, 100);
        }
        this.isTransitioning = false;
    }

    /**
     * 文档查看器中已经删除上个文档
     */
    handlePrevDocRemoved(): void {
        this.scrollService.removeScrollInfos();
    }

    /**
     * 处理窗口的resize事件
     *
     * @param windowInnerWidth 窗口的内部宽度
     */
    @HostListener('window:resize', ['$event.target.innerWidth'])
    handleWindowResize(windowInnerWidth: number): void {
        this.showTopMenu = windowInnerWidth >= this.showTopMenuWidth;
        this.showSideNav = windowInnerWidth >= this.showSideNavWidth;
        this.showFloatToc.next(windowInnerWidth > this.showFloatTocWidth);

        if (this.showTopMenu && !this.isSideNavDoc) {
            this.sideNavComponent.toggle(false).then(() => undefined);
        }
    }

    /**
     * 处理元素的focusin事件
     *
     * @param targetElement 目标元素
     */
    @HostListener('focusin', ['$event.target'])
    handleElementFocusin(targetElement: HTMLElement): void {
        if (this.showSearchResult) {
            const focusinElement = [...this.iconElements, ...this.searchElements].some(element => element.nativeElement.contains(targetElement));
            const focusinToolbar = this.toolbarElement.nativeElement.contains(targetElement);
            if (!focusinElement) {
                if (!focusinToolbar) {
                    this.focusSearchBox();
                } else {
                    const closeButton: HTMLButtonElement = this.searchResultElement.nativeElement.querySelector('button.close-button');
                    closeButton.focus();
                }
            }
        }
    }

    /**
     * 处理元素的click事件
     *
     * @param targetElement 目标元素
     * @param mouseClicks 鼠标的点击次数，0：点击鼠标左键或没有点击鼠标
     * @param ctrlPressed 是否按下Ctrl键，true：按下了Ctrl键；false：没有按下Ctrl键
     * @param metaPressed 是否按下窗口键，true：按下了窗口键；false：没有按下窗口键
     * @param altPressed 是否按下Alt键，true：按下了Alt键；false：没有按下Alt键
     * @return true：让浏览器处理链接的点击事件；false：使用gotoUrl进行导航，浏览器不需要处理链接的点击事件
     */
    @HostListener('click', ['$event.target', '$event.button', '$event.ctrlKey', '$event.metaKey', '$event.altKey'])
    handleElementClick(targetElement: HTMLElement, mouseClicks: number, ctrlPressed: boolean, metaPressed: boolean, altPressed: boolean): boolean {
        if (this.showSearchResult && !this.searchElements.some(element => element.nativeElement.contains(targetElement))) {
            this.hideSearchResult();
        }

        if (targetElement.tagName === 'FOOTER' && metaPressed && altPressed) {
            return false;
        }

        let anchorElement: HTMLElement | null = targetElement;
        while (anchorElement && !(anchorElement instanceof HTMLAnchorElement)) {
            anchorElement = anchorElement.parentElement;
        }

        if (anchorElement instanceof HTMLAnchorElement) {
            return this.locationService.handleAnchorClick(anchorElement, mouseClicks, ctrlPressed, metaPressed);
        }
        return true;
    }

    /**
     * 关闭公告时，生成公告动画
     */
    handleNoticeClosed(): void {
        this.animateNotice = true;
        // 一致性：_notice.scss中的.univ-notice-animating，notice.component.ts中的animations
        setTimeout(() => this.animateNotice = false, 250);
        this.updateHostClasses();
    }

    updateShell(): void {
        this.updateSideNav();
        this.setPageId(this.currDoc.id);
        this.setFolderId(this.currDoc.id);
        this.updateHostClasses();
    }

    setPageId(currDocId: string): void {
        this.pageId = currDocId.replace('/', '-');
    }

    setFolderId(currDocId: string): void {
        this.folderId = currDocId.split('/', 1)[0];
    }

    updateHostClasses(): void {
        const mode = `mode-${this.deployService.mode}`;
        const sidenav = `sidenav-${this.sideNavComponent.opened ? 'open' : 'closed'}`;
        const page = `page-${this.pageId}`;
        const folder = `folder-${this.folderId}`;
        const viewTopBar = this.topCurrNode ? 'view-TopBar' : '';
        const viewSideNav = this.sideCurrNode ? 'view-SideNav' : '';
        const notice = `univ-notice-${this.noticeComponent.noticeVisibility}`;
        const noticeAnimating = this.animateNotice ? 'univ-notice-animating' : '';

        this.hostClasses = [
            mode,
            sidenav,
            page,
            folder,
            viewTopBar,
            viewSideNav,
            notice,
            noticeAnimating
        ].join(' ');
    }

    updateSideNav(): void {
        let sideNavOpened = this.sideNavComponent.opened;
        const isSideNavDoc = !!this.sideCurrNode;

        if (this.isSideNavDoc !== isSideNavDoc) {
            sideNavOpened = this.isSideNavDoc = isSideNavDoc;
        }

        this.sideNavComponent.toggle(this.showSideNav && sideNavOpened).then(() => undefined);
    }

    /**
     * 处理窗口的滚动事件
     */
    @HostListener('window:scroll')
    handleWindowScroll(): void {
        if (!this.maxTocHeightOffset) {
            const hostElement = this.hostElement.nativeElement as Element;
            const toolbarElement = hostElement.querySelector('.toolbar');
            const footerElement = hostElement.querySelector('footer');

            if (toolbarElement && footerElement) {
                this.maxTocHeightOffset = toolbarElement.clientHeight + footerElement.clientHeight + 24;
            }
        }

        this.maxTocHeight = (document.body.scrollHeight - window.pageYOffset - this.maxTocHeightOffset).toFixed(2);
    }

    /**
     * 处理鼠标wheel事件
     *
     * @param wheelEvent 鼠标wheel事件
     */
    handleMouseWheel(wheelEvent: WheelEvent): void {
        const targetElement = wheelEvent.currentTarget as Element;
        const scrollTop = targetElement.scrollTop;

        if (wheelEvent.deltaY < 0) {
            if (scrollTop < 1) {
                wheelEvent.preventDefault();
            }
        } else {
            const maxScrollTop = targetElement.scrollHeight - targetElement.clientHeight;
            if (maxScrollTop - scrollTop < 1) {
                wheelEvent.preventDefault();
            }
        }
    }

    hideSearchResult(): void {
        this.showSearchResult = false;
        const paramMap = this.locationService.getSearchParams();
        if (paramMap.search !== undefined) {
            this.locationService.setSearchParams('', {...paramMap, search: undefined});
        }
    }

    focusSearchBox(): void {
        if (this.searchBoxComponent) {
            this.searchBoxComponent.focusSearchBox();
        }
    }

    searchIndex(searchText: string, isFocused = false): void {
        if (this.showSearchResult && isFocused) {
            return;
        }
        this.searchResults = this.searchService.searchIndex(searchText);
        this.showSearchResult = !!searchText;
    }

    /**
     * 处理文档的keyup事件
     *
     * @param key 字符
     * @param keyCode 字符编码
     */
    @HostListener('document:keyup', ['$event.key', '$event.which'])
    handleDocumentKeyup(key: string, keyCode: number): void {
        if (key === '/' || keyCode === 191) {
            this.focusSearchBox();
        }
        if (key === 'Escape' || keyCode === 27) {
            if (this.showSearchResult) {
                this.hideSearchResult();
                this.focusSearchBox();
            }
        }
    }

}
