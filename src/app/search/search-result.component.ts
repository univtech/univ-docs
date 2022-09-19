import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';

import {NavNode} from '../navigation/nav.model';
import {SearchArea, SearchResult, SearchResults, SearchState} from './search.model';

/**
 * 搜索结果组件。
 *
 * 输入属性：
 * * isEmbedded：是否嵌入页面中，true：嵌入页面中；false：不嵌入页面中，默认false
 * * searchResults：搜索结果
 * * navNodes：导航节点
 *
 * 输出属性：
 * * resultSelected：搜索结果已经选择
 * * navSelected：导航节点已经选择
 * * resultClosed：搜索结果已经关闭
 */
@Component({
    selector: 'univ-search-result',
    templateUrl: './search-result.component.html',
})
export class SearchResultComponent implements OnChanges {

    // 搜索状态
    searchState: SearchState = SearchState.InSearch;

    // 搜索结果区域
    searchAreas: SearchArea[] = [];

    // 是否嵌入页面中，true：嵌入页面中；false：不嵌入页面中
    @Input() isEmbedded = false;

    // 搜索结果
    @Input() searchResults: SearchResults | null = null;

    // 导航节点
    @Input() navNodes: NavNode[];

    // 搜索结果已经选择
    @Output() resultSelected = new EventEmitter<SearchResult>();

    // 导航节点已经选择
    @Output() navSelected = new EventEmitter<NavNode>();

    // 搜索结果已经关闭
    @Output() resultClosed = new EventEmitter<void>();

    /**
     * 数据绑定属性或指令发生改变时的回调方法
     */
    ngOnChanges(): void {
        if (this.searchResults === null) {
            this.searchState = SearchState.InSearch;
        } else if (this.searchResults.results.length) {
            this.searchState = SearchState.HasResult;
        } else {
            this.searchState = SearchState.NoResult;
        }
        this.searchAreas = this.buildSearchAreas(this.searchResults);
    }

    /**
     * 构造搜索结果区域
     *
     * @param searchResults 搜索结果
     * @return 搜索结果区域
     */
    private buildSearchAreas(searchResults: SearchResults | null): SearchArea[] {
        if (!searchResults) {
            return [];
        }

        const resultMap: { [key: string]: SearchResult[] } = {};
        searchResults.results.forEach(result => {
            if (result.title) {
                const [name] = result.path.split('/', 1);
                const results = resultMap[name] = resultMap[name] || [];
                results.push(result);
            }
        });

        const names = Object.keys(resultMap).sort((first, second) => first > second ? 1 : -1);
        return names.map(name => ({name, results: resultMap[name]}));
    }

    /**
     * 选择搜索结果
     *
     * @param mouseEvent 鼠标事件
     * @param searchResult 选择的搜索结果
     */
    selectSearchResult(mouseEvent: MouseEvent, searchResult: SearchResult): void {
        if (mouseEvent.button === 0 && !mouseEvent.ctrlKey && !mouseEvent.metaKey) {
            this.resultSelected.emit(searchResult);
        }
    }

    /**
     * 选择导航节点
     *
     * @param mouseEvent 鼠标事件
     * @param navNode 选择的导航节点
     */
    selectNavNode(mouseEvent: MouseEvent, navNode: NavNode): void {
        if (mouseEvent.button === 0 && !mouseEvent.ctrlKey && !mouseEvent.metaKey) {
            this.navSelected.emit(navNode);
        }
    }

    /**
     * 关闭搜索结果
     */
    closeSearchResult(): void {
        this.resultClosed.emit();
    }

}
