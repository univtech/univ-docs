import * as lunr from 'lunr';

import {WebWorkerMessage} from '../base/web-worker.model';

// 已编码页面列表，参考：search-data.json
export interface EncodedPages {
    // 关键词
    words: string;
    // 页面数组
    pages: EncodedPage[];
}

// 已编码页面，参考：search-data.json
export interface EncodedPage {
    // 页面路径
    path: string;
    // 页面类型
    type: string;
    // 页面标题
    title: string;
    // 页面搜索关键词
    topics: string;
    // 页面标题关键词
    headings: number[];
    // 页面内容关键词
    keywords: number[];
}

// 已解码页面映射，key：页面路径，value：已解码页面
export interface DecodedPageMap {
    [key: string]: DecodedPage;
}

// 已解码页面，根据EncodedPage构造
export interface DecodedPage {
    // 页面路径
    path: string;
    // 页面类型
    type: string;
    // 页面标题
    title: string;
    // 页面搜索关键词
    topics: string;
    // 页面标题关键词
    headings: string;
    // 页面内容关键词
    keywords: string;
}

// lunr索引加载器
export type LunrIndexLoader = (lunrIndexBuilder: lunr.Builder) => void;

// 搜索数据处理器
export type SearchDataHandler = (searchData: string) => void;

// 搜索信息
export interface SearchMessage {
    // WebWorker信息数据
    data: WebWorkerMessage;
}

// 搜索状态
export enum SearchState {
    // 正在进行搜索
    InSearch = 'in-search',
    // 存在搜索结果
    HasResult = 'has-result',
    // 没有搜索结果
    NoResult = 'no-result'
}

// 搜索结果区域
export interface SearchArea {
    // 区域名称
    name: string;
    // 搜索结果
    results: SearchResult[];
}

// 搜索结果数组
export interface SearchResults {
    // 搜索文本
    text: string;
    // 搜索结果
    results: SearchResult[];
}

// 搜索结果
export interface SearchResult {
    // 页面路径
    path: string;
    // 页面类型
    type: string;
    // 页面标题
    title: string;
    // 页面搜索关键词
    topics: string;
    // 页面标题关键词
    headings: string;
    // 页面内容关键词
    keywords: string;
}
