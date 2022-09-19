import {Component, OnInit} from '@angular/core';

import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {LocationService} from '../navigation/location.service';
import {NavService} from '../navigation/nav.service';
import {NavNode} from '../navigation/nav.model';
import {SearchService} from './search.service';
import {SearchResults} from './search.model';

/**
 * 搜索当前路径组件
 */
@Component({
    selector: 'univ-search-path',
    templateUrl: './search-path.component.html',
})
export class SearchPathComponent implements OnInit {

    // 搜索结果
    searchResults: Observable<SearchResults>;

    // 导航节点
    navNodes: NavNode[];

    /**
     * 构造函数，创建没有搜索结果组件
     *
     * @param locationService 地址服务
     * @param navService 导航服务
     * @param searchService 搜索服务
     */
    constructor(private locationService: LocationService,
                private navService: NavService,
                private searchService: SearchService) {

    }

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        this.searchResults = this.locationService.currPath.pipe(switchMap(currPath => {
            const searchText = currPath.split(/\W+/).join(' ');
            return this.searchService.searchIndex(searchText);
        }));

        this.navService.topNavNodes.subscribe(topNavNodes => {
            this.navNodes = topNavNodes || [];
        });
    }

}
