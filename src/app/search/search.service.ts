import {Injectable, NgZone} from '@angular/core';

import {ConnectableObservable, Observable, race, ReplaySubject, timer} from 'rxjs';
import {concatMap, first, publishReplay} from 'rxjs/operators';

import {WebWorkerService} from '../base/web-worker.service';
import {SearchResults} from './search.model';

/**
 * 搜索服务
 */
@Injectable()
export class SearchService {

    // 初始化完成
    private initDone: Observable<boolean>;

    // 搜索文本
    private searchText = new ReplaySubject<string>(1);

    // WebWorker服务
    private webWorkerService: WebWorkerService;

    /**
     * 构造函数，创建搜索服务
     *
     * @param ngZone 在Angular区域内外执行任务的服务
     */
    constructor(private ngZone: NgZone) {

    }

    /**
     * 初始化WebWorker
     *
     * @param initDelay 初始化延时（毫秒）
     * @return 初始化完成
     */
    initWebWorker(initDelay: number): Observable<boolean> {
        const initDone = this.initDone = race<any>(
            timer(initDelay),
            this.searchText.asObservable().pipe(first()),
        ).pipe(
            concatMap(() => {
                const worker = new Worker(new URL('./search.worker', import.meta.url), {type: 'module'});
                this.webWorkerService = WebWorkerService.create(worker, this.ngZone);
                return this.webWorkerService.sendMessage<boolean>('load-index');
            }),
            publishReplay(1),
        );

        (initDone as ConnectableObservable<boolean>).connect();
        return initDone;
    }

    /**
     * 搜索索引
     *
     * @param searchText 搜索文本
     * @return 搜索结果
     */
    searchIndex(searchText: string): Observable<SearchResults> {
        this.searchText.next(searchText);
        return this.initDone.pipe(concatMap(() => this.webWorkerService.sendMessage<SearchResults>('search-index', searchText)));
    }

}
