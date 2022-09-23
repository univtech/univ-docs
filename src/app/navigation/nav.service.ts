import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {combineLatest, ConnectableObservable, mergeMap, Observable, of} from 'rxjs';
import {map, publishLast, publishReplay} from 'rxjs/operators';

import {LocationService} from './location.service';
import {CurrNode, NavNode, TopNavHolder} from './nav.model';

/**
 * 导航服务
 */
@Injectable()
export class NavService {

    // 顶部导航文件
    private topNavFile = 'content/navigation/top.json';

    // 侧边导航文件
    private sideNavFile = 'content/navigation/side-';

    // 底部导航文件
    private footerNavFile = 'content/navigation/footer.json';

    // 顶部导航节点
    topNavNodes: Observable<NavNode[]>;

    // 顶部导航持有者
    topNavHolder: Observable<TopNavHolder>;

    // 顶部当前节点
    topCurrNode: Observable<CurrNode | undefined>;

    // 侧边导航节点
    sideNavNodes: Observable<NavNode[]>;

    // 侧边当前节点
    sideCurrNode: Observable<CurrNode | undefined>;

    // 底部导航节点
    footerNavNodes: Observable<NavNode[]>;

    /**
     * 构造函数，创建导航服务
     *
     * @param httpClient HTTP客户端
     * @param locationService 位置服务
     */
    constructor(private httpClient: HttpClient, private locationService: LocationService) {
        this.initData();
    }

    /**
     * 获取导航数据
     */
    private initData() {
        this.getTopNavNodes();
        this.getTopNavHolder();
        this.getTopCurrNode();
        this.getSideNavNodes();
        this.getSideCurrNode();
        this.getFooterNavNodes();
    }

    /**
     * 获取顶部导航节点
     */
    private getTopNavNodes(): void {
        this.topNavNodes = this.getNavNodes(this.topNavFile);
    }

    /**
     * 获取顶部导航持有者
     */
    private getTopNavHolder(): void {
        const topNavHolder = this.topNavNodes.pipe(
            map(navNodes => this.getTopNavUrls(navNodes)),
            publishLast()
        );
        (topNavHolder as ConnectableObservable<TopNavHolder>).connect();
        this.topNavHolder = topNavHolder;
    }

    /**
     * 获取顶部导航路径：
     * * 有侧边导航的顶部导航路径
     * * 无侧边导航的顶部导航路径
     *
     * @param topNavNodes 顶部导航节点
     * @return 顶部导航持有者
     */
    private getTopNavUrls(topNavNodes: NavNode[]): TopNavHolder {
        const topNavHolder = {hasSideNavUrls: [], noSideNavUrls: ['', 'index']};
        topNavNodes.forEach(topNavNode => this.getTopNavUrl(topNavNode, topNavHolder));
        return topNavHolder;
    }

    /**
     * 获取顶部导航路径：
     * * 有侧边导航的顶部导航路径
     * * 无侧边导航的顶部导航路径
     *
     * @param topNavNode 顶部导航节点
     * @param topNavHolder 顶部导航持有者
     */
    private getTopNavUrl(topNavNode: NavNode, topNavHolder: TopNavHolder): void {
        const topNavUrl = topNavNode.url;
        if (topNavUrl && !topNavNode.noSideNav && !topNavHolder.hasSideNavUrls.includes(topNavUrl)) {
            topNavHolder.hasSideNavUrls.push(topNavUrl);
        }
        if (topNavUrl && topNavNode.noSideNav && !topNavHolder.noSideNavUrls.includes(topNavUrl)) {
            topNavHolder.noSideNavUrls.push(topNavUrl);
        }
        topNavNode.childNodes?.forEach(childNode => this.getTopNavUrl(childNode, topNavHolder));
    }

    /**
     * 获取顶部当前节点
     */
    private getTopCurrNode(): void {
        const topCurrNode = combineLatest([
            this.locationService.currPath,
            this.topNavHolder,
            this.topNavNodes.pipe(map(navNodes => this.buildCurrNodes(navNodes)))
        ]).pipe(
            map(([currPath, topNavHolder, topCurrNodeMap]) => this.getTopCurrNodeByPath(currPath, topNavHolder, topCurrNodeMap)),
            publishReplay(1)
        );
        (topCurrNode as ConnectableObservable<CurrNode>).connect();
        this.topCurrNode = topCurrNode;
    }

    /**
     * 获取顶部当前节点
     *
     * @param currPath 当前地址
     * @param topNavHolder 顶部导航持有者
     * @param topCurrNodeMap 顶部当前节点映射，key：顶部导航路径；value：顶部当前节点
     * @return 顶部当前节点或undefined
     */
    private getTopCurrNodeByPath(currPath: string, topNavHolder: TopNavHolder, topCurrNodeMap: Map<string, CurrNode>): CurrNode | undefined {
        const topNavUrl = topNavHolder.hasSideNavUrls.find(navUrl => currPath.startsWith(navUrl));
        let topCurrNode = topCurrNodeMap.get(currPath);
        if (!topCurrNode && topNavUrl) {
            // 当前地址可能是侧边导航路径
            topCurrNode = topCurrNodeMap.get(topNavUrl);
        }
        return topCurrNode;
    }

    /**
     * 获取侧边导航节点
     */
    private getSideNavNodes(): void {
        const sideNavNodes = combineLatest([
            this.locationService.currPath,
            this.topNavHolder,
            this.topNavHolder.pipe(map(topNavHolder => this.getSideNavNodeMap(topNavHolder)))
        ]).pipe(
            mergeMap(([currPath, topNavHolder, sideNavNodeMap]) => this.getSideNavNodesByPath(currPath, topNavHolder, sideNavNodeMap)),
            publishReplay(1)
        );
        (sideNavNodes as ConnectableObservable<NavNode[]>).connect();
        this.sideNavNodes = sideNavNodes;
    }

    /**
     * 获取侧边导航节点映射
     *
     * @param topNavHolder 顶部导航持有者
     * @return 侧边导航节点映射，key：顶部导航路径；value：侧边导航节点
     */
    private getSideNavNodeMap(topNavHolder: TopNavHolder): Map<string, Observable<NavNode[]>> {
        const sideNavNodeMap = new Map<string, Observable<NavNode[]>>();
        topNavHolder.hasSideNavUrls.forEach(topNavUrl => this.getSideNavNodesByUrl(topNavUrl, sideNavNodeMap));
        return sideNavNodeMap;
    }

    /**
     * 获取侧边导航节点
     *
     * @param topNavUrl 有侧边导航的顶部导航路径
     * @param sideNavNodeMap 侧边导航节点映射，key：顶部导航路径；value：侧边导航节点
     */
    private getSideNavNodesByUrl(topNavUrl: string, sideNavNodeMap: Map<string, Observable<NavNode[]>>): void {
        const fileSuffix = topNavUrl.replace(/\//g, '-');
        const sideNavFile = `${this.sideNavFile}${fileSuffix}.json`;
        sideNavNodeMap.set(topNavUrl, this.getNavNodes(sideNavFile));
    }

    /**
     * 获取侧边导航节点
     *
     * @param currPath 当前地址
     * @param topNavHolder 顶部导航持有者
     * @param sideNavNodeMap 侧边导航节点映射，key：顶部导航路径；value：侧边导航节点
     * @return 侧边导航节点
     */
    private getSideNavNodesByPath(currPath: string, topNavHolder: TopNavHolder, sideNavNodeMap: Map<string, Observable<NavNode[]>>): Observable<NavNode[]> {
        const topNavUrl = topNavHolder.hasSideNavUrls.find(navUrl => currPath.startsWith(navUrl));
        let sideNavNodes = sideNavNodeMap.get(currPath);
        if (!sideNavNodes && topNavUrl) {
            // 当前地址可能是侧边导航路径
            sideNavNodes = sideNavNodeMap.get(topNavUrl);
        }
        return sideNavNodes || of([]);
    }

    /**
     * 获取侧边当前节点
     */
    private getSideCurrNode(): void {
        const sideCurrNode = combineLatest([
            this.locationService.currPath,
            this.topNavHolder,
            this.sideNavNodes.pipe(map(navNodes => this.buildCurrNodes(navNodes)))
        ]).pipe(
            map(([currPath, topNavHolder, sideCurrNodeMap]) => NavService.getSideCurrNodeByPath(currPath, topNavHolder, sideCurrNodeMap)),
            publishReplay(1)
        );
        (sideCurrNode as ConnectableObservable<CurrNode | undefined>).connect();
        this.sideCurrNode = sideCurrNode;
    }

    /**
     * 获取侧边当前节点
     *
     * @param currPath 当前地址
     * @param topNavHolder 顶部导航持有者
     * @param sideCurrNodeMap 侧边当前节点映射，key：侧边导航路径；value：侧边当前节点
     * @return 侧边当前节点或undefined
     */
    private static getSideCurrNodeByPath(currPath: string, topNavHolder: TopNavHolder, sideCurrNodeMap: Map<string, CurrNode>): CurrNode | undefined {
        let sideCurrNode = sideCurrNodeMap.get(currPath);
        if (!sideCurrNode && topNavHolder.hasSideNavUrls.includes(currPath)) {
            // 当前地址可能是顶部导航路径
            sideCurrNode = sideCurrNodeMap.get(`${currPath}/index`);
        }
        return sideCurrNode;
    }

    /**
     * 获取底部导航节点
     */
    private getFooterNavNodes(): void {
        this.footerNavNodes = this.getNavNodes(this.footerNavFile);
    }

    /**
     * 获取导航节点
     *
     * @param navFile 导航文件
     * @return 导航节点
     */
    private getNavNodes(navFile: string): Observable<NavNode[]> {
        const navNodeObservable = this.httpClient.get<NavNode[]>(navFile).pipe(
            map(navNodes => this.filterNavNodes(navNodes)),
            map(navNodes => this.setNavNodes(navNodes)),
            publishLast()
        );
        (navNodeObservable as ConnectableObservable<NavNode[]>).connect();
        return navNodeObservable;
    }

    /**
     * 过滤导航节点
     *
     * @param navNodes 过滤前的导航节点
     * @return 过滤后的导航节点
     */
    private filterNavNodes(navNodes?: NavNode[]): NavNode[] {
        const filteredNavNodes = NavService.filterHiddenNavNodes(navNodes);
        filteredNavNodes.forEach(navNode => navNode.childNodes = this.filterNavNodes(navNode.childNodes));
        return filteredNavNodes;
    }

    /**
     * 过滤隐藏的导航节点
     *
     * @param navNodes 过滤前的导航节点
     * @return 过滤后的导航节点
     */
    private static filterHiddenNavNodes(navNodes?: NavNode[]): NavNode[] {
        return navNodes?.filter(navNode => !navNode.hidden) || [];
    }

    /**
     * 设置导航节点的默认属性
     *
     * @param navNodes 设置前的导航节点
     * @return 设置后的导航节点
     */
    private setNavNodes(navNodes?: NavNode[]): NavNode[] {
        navNodes?.forEach(navNode => {
            NavService.setNavNode(navNode);
            this.setNavNodes(navNode.childNodes);
        });
        return navNodes || [];
    }

    /**
     * 设置导航节点的默认属性
     *
     * @param navNode 设置前的导航节点
     */
    private static setNavNode(navNode: NavNode): void {
        // 布尔值为false的情况：false、undefined、null、NaN、0、-0、空字符串、值被省略
        navNode.tooltip = navNode.tooltip || navNode.title;
        navNode.url = navNode.url?.replace(/^\//, '').replace(/\/$/, '');
    }

    /**
     * 构造当前节点
     *
     * @param navNodes 导航节点
     * @return 当前节点映射，key：当前路径；value：当前节点
     */
    private buildCurrNodes(navNodes: NavNode[]): Map<string, CurrNode> {
        const currNodeMap = new Map<string, CurrNode>();
        navNodes.forEach(navNode => this.buildCurrNode(navNode, [], currNodeMap));
        return currNodeMap;
    }

    /**
     * 构造当前节点
     *
     * @param navNode 导航节点
     * @param ancestorNavNodes 导航节点的祖先节点
     * @param currNodeMap 当前节点映射，key：当前路径；value：当前节点
     */
    private buildCurrNode(navNode: NavNode, ancestorNavNodes: NavNode[], currNodeMap: Map<string, CurrNode>): void {
        const navUrl = navNode.url;
        const navNodes = [navNode, ...ancestorNavNodes];
        if (navUrl) {
            currNodeMap.set(navUrl, {url: navUrl, traceNodes: navNodes});
        }
        navNode.childNodes?.forEach(childNode => this.buildCurrNode(childNode, navNodes, currNodeMap));
    }

}
