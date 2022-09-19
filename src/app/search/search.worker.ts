import * as lunr from 'lunr';

import {DecodedPage, DecodedPageMap, EncodedPage, EncodedPages, LunrIndexLoader, SearchDataHandler, SearchMessage} from './search.model';

// 搜索数据路径
const searchDataUrl = '/content/search/search-data.json';

// 已解码页面映射
const decodedPageMap: DecodedPageMap = {};

// lunr索引
let lunrIndex: lunr.Index;

// 添加信息事件处理器
addEventListener('message', handleMessage);

/**
 * 处理信息事件
 *
 * @param message WebWorker搜索信息
 */
function handleMessage(message: SearchMessage): void {
    const type = message.data.type;
    const id = message.data.id;
    const payload = message.data.payload;
    switch (type) {
        case 'load-index':
            getSearchData((searchData: string) => {
                lunrIndex = buildLunrIndex(JSON.parse(searchData));
                postMessage({type, id, payload: true});
            });
            break;
        case 'search-index':
            postMessage({type, id, payload: {search: payload, results: searchIndex(payload)}});
            break;
        default:
            postMessage({type, id, payload: {error: '信息类型无效'}});
    }
}

/**
 * 获取搜索数据
 *
 * @param searchDataHandler 搜索数据处理器
 */
function getSearchData(searchDataHandler: SearchDataHandler): void {
    const request = new XMLHttpRequest();
    request.onload = function() {
        searchDataHandler(this.responseText);
    };
    request.open('GET', searchDataUrl);
    request.send();
}

/**
 * 构造lunr索引
 *
 * @param encodedPages 已编码页面
 * @return lunr索引
 */
function buildLunrIndex(encodedPages: EncodedPages): lunr.Index {
    const lunrIndexLoader: LunrIndexLoader = buildLunrIndexLoader(encodedPages);
    const queryLexer = (lunr as any as { QueryLexer: { termSeparator: RegExp } }).QueryLexer;
    queryLexer.termSeparator = lunr.tokenizer.separator = /\s+/;
    return lunr(function() {
        this.pipeline.remove(lunr.stemmer);
        this.ref('path');
        this.field('topics', {boost: 15});
        this.field('title', {boost: 10});
        this.field('headings', {boost: 5});
        this.field('keywords', {boost: 2});
        lunrIndexLoader(this);
    });
}

/**
 * 构造索引加载器
 *
 * @param encodedPages 已编码页面
 * @return 索引加载器
 */
function buildLunrIndexLoader(encodedPages: EncodedPages): LunrIndexLoader {
    const words = encodedPages.words.split(' ');
    return (lunrIndexBuilder: lunr.Builder) => {
        encodedPages.pages.forEach(encodedPage => {
            const decodedPage = buildDecodedPage(encodedPage, words);
            lunrIndexBuilder.add(decodedPage);
            decodedPageMap[decodedPage.path] = decodedPage;
        });
    };
}

/**
 * 构造已解码页面
 *
 * @param encodedPage 已编码页面
 * @param words 关键词
 * @return 已解码页面
 */
function buildDecodedPage(encodedPage: EncodedPage, words: string[]): DecodedPage {
    return {
        ...encodedPage,
        headings: encodedPage.headings?.map(index => words[index]).join(' ') ?? '',
        keywords: encodedPage.keywords?.map(index => words[index]).join(' ') ?? '',
    };
}

/**
 * 搜索索引
 *
 * @param searchText 搜索文本
 * @return 已解码页面
 */
function searchIndex(searchText: string): DecodedPage[] {
    searchText = searchText.replace(/^["']|['"]$/g, '');
    try {
        if (searchText.length) {
            const searchTextAll = searchText.replace(/\S+/g, '+$&');
            let searchResults = lunrIndex.search(searchTextAll);

            if (searchResults.length === 0) {
                searchResults = lunrIndex.search(searchText);
            }

            if (searchResults.length === 0) {
                const searchTextTitle = `title:*${searchText.split(' ', 1)[0]}*`;
                searchResults = lunrIndex.search( `${searchText} ${searchTextTitle}`);
            }

            return searchResults.map(result => decodedPageMap[result.ref]);
        }
    } catch (error) {
        console.error(error);
    }
    return [];
}
