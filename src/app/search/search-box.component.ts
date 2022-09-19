import {AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';

import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

import {LocationService} from '../navigation/location.service';

/**
 * 搜索框组件。
 *
 * 输出属性：
 * * textChanged：搜索文本发生改变
 * * boxFocused：搜索框获得焦点
 */
@Component({
    selector: 'univ-search-box',
    templateUrl: './search-box.component.html'
})
export class SearchBoxComponent implements AfterViewInit {

    // 搜索文本
    private searchText = new Subject<string>();

    // 搜索框元素，引用`<input #searchBox>`
    @ViewChild('searchBox', {static: true}) searchBoxElement: ElementRef;

    // 搜索文本发生改变
    @Output() textChanged = this.searchText.pipe(distinctUntilChanged(), debounceTime(300));

    // 搜索框获得焦点
    @Output() boxFocused = new EventEmitter<string>();

    /**
     * 构造函数，创建搜索框组件
     *
     * @param locationService 地址服务
     */
    constructor(private locationService: LocationService) {

    }

    /**
     * 组件视图初始化完成之后的回调方法
     */
    ngAfterViewInit(): void {
        const searchText = this.locationService.getSearchParams().search;
        if (searchText) {
            this.setSearchText(searchText);
            this.changeSearchText();
        }
    }

    /**
     * 搜索框输入、松开键盘或点击时，变更搜索文本
     */
    changeSearchText(): void {
        this.searchText.next(this.getSearchText());
    }

    /**
     * 搜索框获得焦点，发送搜索文本
     */
    sendSearchText(): void {
        this.boxFocused.emit(this.getSearchText());
    }

    /**
     * 搜索框获得焦点
     */
    focusSearchBox(): void {
        this.searchBoxElement.nativeElement.focus();
    }

    /**
     * 获取搜索文本
     *
     * @return 搜索文本
     */
    private getSearchText(): any {
        return this.searchBoxElement.nativeElement.value;
    }

    /**
     * 设置搜索文本
     *
     * @param searchText 搜索文本
     */
    private setSearchText(searchText: string): void {
        this.searchBoxElement.nativeElement.value = SearchBoxComponent.decodeSearchText(searchText);
    }

    /**
     * 对搜索文本进行解码
     *
     * @param searchText 解码前的搜索文本
     * @return 解码后的搜索文本
     */
    private static decodeSearchText(searchText: string): string {
        return searchText.replace(/\+/g, ' ');
    }

}
