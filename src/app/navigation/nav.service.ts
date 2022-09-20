import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {combineLatest, ConnectableObservable, Observable} from 'rxjs';
import {map, publishLast, publishReplay} from 'rxjs/operators';

import {LocationService} from './location.service';
import {CurrNode, NavNode, TopSideNode, TopSideNodeMap} from './nav.model';

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

    // 顶部当前节点、侧边导航节点和侧边当前节点
    topSideNode: Observable<TopSideNode>;

    // 底部导航节点
    footerNavNodes: Observable<NavNode[]>;

    // 有侧边导航节点路径
    hasSideNavUrls = new Array<string>();

    // 无侧边导航节点路径
    noSideNavUrls = new Array<string>('', 'index');

    /**
     * 构造函数，创建导航服务
     *
     * @param httpClient HTTP客户端
     * @param locationService 位置服务
     */
    constructor(private httpClient: HttpClient, private locationService: LocationService) {
        this.topNavNodes = this.getNavNodes(this.topNavFile);
        this.footerNavNodes = this.getNavNodes(this.footerNavFile);
        this.topSideNode = this.getTopSideNode();
    }

    /**
     * 获取导航节点
     *
     * @param navFilePath 导航文件路径
     * @return 导航节点
     */
    private getNavNodes(navFilePath: string): Observable<NavNode[]> {
        const navNodesObservable = this.httpClient.get<NavNode[]>(navFilePath).pipe(
            map(navNodes => this.setNavNodes(navNodes)),
            map(navNodes => this.filterNavNodes(navNodes)),
            publishLast()
        );
        (navNodesObservable as ConnectableObservable<NavNode[]>).connect();
        return navNodesObservable;
    }

    /**
     * 获取顶部当前节点、侧边导航节点和侧边当前节点
     *
     * @return 顶部当前节点、侧边导航节点和侧边当前节点
     */
    private getTopSideNode(): Observable<TopSideNode> {
        const currNodeObservable = combineLatest([
            this.locationService.currPath,
            this.topNavNodes.pipe(map(navNodes => this.getTopSideNodeMap(navNodes))),
        ]).pipe(
            map(([currPath, topSideNodeMap]) => this.getTopSideNodeCurr(currPath, topSideNodeMap)),
            publishReplay(1)
        );
        (currNodeObservable as ConnectableObservable<TopSideNode>).connect();
        return currNodeObservable;
    }

    /**
     * 根据当前路径获取顶部当前节点、侧边导航节点和侧边当前节点
     *
     * @param currPath 当前路径
     * @param topSideNodeMap 顶部当前节点、侧边导航节点和侧边当前节点映射
     * @return 顶部当前节点、侧边导航节点和侧边当前节点
     */
    private getTopSideNodeCurr(currPath: string, topSideNodeMap: TopSideNodeMap): TopSideNode {
        const topNavUrl = this.hasSideNavUrls.find(url => currPath.startsWith(url));

        let topCurrNode = topSideNodeMap.topCurrNodeMap.get(currPath);
        if (!topCurrNode && topNavUrl) {
            topCurrNode = topSideNodeMap.topCurrNodeMap.get(topNavUrl);
        }

        let sideNavNodes = topSideNodeMap.sideNavNodeMap.get(currPath);
        if (!sideNavNodes && topNavUrl) {
            sideNavNodes = topSideNodeMap.sideNavNodeMap.get(topNavUrl);
        }

        let sideCurrNode = topSideNodeMap.sideCurrNodeMap.get(currPath);
        if (!sideCurrNode && this.hasSideNavUrls.includes(currPath)) {
            sideCurrNode = topSideNodeMap.sideCurrNodeMap.get(`${currPath}/${currPath}`);
        }

        return {topCurrNode, sideNavNodes, sideCurrNode};
    }

    /**
     * 获取顶部当前节点、侧边导航节点和侧边当前节点映射
     *
     * @param topNavNodes 顶部导航节点
     * @return 顶部当前节点、侧边导航节点和侧边当前节点映射
     */
    private getTopSideNodeMap(topNavNodes: NavNode[]): TopSideNodeMap {
        const topCurrNodeMap = new Map<string, CurrNode>();
        const sideNavNodeMap = new Map<string, NavNode[]>();
        const sideCurrNodeMap = new Map<string, CurrNode>();

        topNavNodes.forEach(topNavNode => {
            this.buildCurrNode(topCurrNodeMap, topNavNode);
            this.getSideNodes(sideNavNodeMap, sideCurrNodeMap, topNavNode);
        });
        return {topCurrNodeMap, sideNavNodeMap, sideCurrNodeMap};
    }

    /**
     * 获取侧边导航节点和侧边当前节点
     *
     * @param sideNavNodeMap 侧边导航节点，key：顶部当前路径；value：侧边导航节点
     * @param sideCurrNodeMap 侧边当前节点，key：侧边当前路径；value：侧边当前节点
     * @param topNavNode 顶部导航节点
     */
    private getSideNodes(sideNavNodeMap: Map<string, NavNode[]>, sideCurrNodeMap: Map<string, CurrNode>, topNavNode: NavNode): void {
        const navUrl = topNavNode.url;

        if (navUrl) {
            if (topNavNode.noSideNav) {
                this.noSideNavUrls.push(navUrl);
            } else {
                this.hasSideNavUrls.push(navUrl);

                const navPath = navUrl.replace(/\/$/, '');
                const sideNavNodes = this.getNavNodes(`${this.sideNavFile}${navPath}.json`);

                sideNavNodes.subscribe(navNodes => {
                    sideNavNodeMap.set(navPath, navNodes);

                    const currNodeMap = this.buildCurrNodes(navNodes);
                    currNodeMap.forEach((currNode, currPath) => sideCurrNodeMap.set(currPath, currNode));
                });
            }
        }

        if (topNavNode.childNodes) {
            topNavNode.childNodes.forEach(childNavNode => this.getSideNodes(sideNavNodeMap, sideCurrNodeMap, childNavNode));
        }
    }

    /**
     * 设置导航节点的默认属性值
     *
     * @param navNodes 导航节点
     * @return 导航节点
     */
    private setNavNodes(navNodes?: NavNode[]): NavNode[] {
        if (navNodes) {
            navNodes.forEach(navNode => {
                NavService.setNavNode(navNode);
                this.setNavNodes(navNode.childNodes);
            });
            return navNodes;
        }
        return [];
    }

    /**
     * 设置导航节点的默认属性值
     *
     * @param navNode 导航节点
     */
    private static setNavNode(navNode: NavNode): void {
        // 布尔值为false的情况：false、undefined、null、NaN、0、-0、空字符串、值被省略
        if (!navNode.tooltip) {
            navNode.tooltip = navNode.title;
        }
    }

    /**
     * 过滤导航节点
     *
     * @param navNodes 导航节点
     * @return 过滤后的导航节点
     */
    private filterNavNodes(navNodes?: NavNode[]): NavNode[] {
        const filteredNavNodes = NavService.filterHiddenNavNodes(navNodes);
        filteredNavNodes.forEach(navNode => navNode.childNodes = this.filterNavNodes(navNode.childNodes));
        return filteredNavNodes;
    }

    /**
     * 过滤掉隐藏的导航节点
     *
     * @param navNodes 导航节点
     * @return 过滤后的导航节点
     */
    private static filterHiddenNavNodes(navNodes?: NavNode[]): NavNode[] {
        return navNodes ? navNodes.filter(navNode => !navNode.hidden) : [];
    }

    /**
     * 构造当前节点
     *
     * @param navNodes 导航节点
     * @return 当前节点映射，key：当前路径；value：当前节点
     */
    private buildCurrNodes(navNodes: NavNode[]): Map<string, CurrNode> {
        const currNodeMap = new Map<string, CurrNode>();
        navNodes.forEach(navNode => this.buildCurrNode(currNodeMap, navNode));
        return currNodeMap;
    }

    /**
     * 构造当前节点
     *
     * @param currNodeMap 当前节点映射，key：当前路径；value：当前节点
     * @param navNode 导航节点
     * @param ancestorNavNodes 导航节点的祖先节点
     */
    private buildCurrNode(currNodeMap: Map<string, CurrNode>, navNode: NavNode, ancestorNavNodes: NavNode[] = []): void {
        const navUrl = navNode.url;
        const navNodes = [navNode, ...ancestorNavNodes];

        if (navUrl) {
            const navPath = navUrl.replace(/\/$/, '');
            currNodeMap.set(navPath, {url: navUrl, traceNodes: navNodes});
        }

        if (navNode.childNodes) {
            navNode.childNodes.forEach(childNavNode => this.buildCurrNode(currNodeMap, childNavNode, navNodes));
        }
    }

}
