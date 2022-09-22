import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

import {AsyncSubject, combineLatest, Observable, of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {htmlSafeByReview} from 'safevalues/restricted/reviewed';

import {LogService} from '../base/log.service';
import {TopNavHolder} from '../navigation/nav.model';
import {NavService} from '../navigation/nav.service';
import {LocationService} from '../navigation/location.service';
import {doc404Id, docFailId, DocSafe, DocUnsafe} from './doc.model';

/**
 * 文档服务
 */
@Injectable()
export class DocService {

    // 文件文件夹路径
    private docFolder = 'content/document/';

    // 文档映射，用于缓存文档，key：文档id；value：文档
    private docMap = new Map<string, Observable<DocSafe>>();

    // 当前文档
    currDoc: Observable<DocSafe>;

    // 顶部导航持有者
    private topNavHolder: TopNavHolder;

    /**
     * 构造函数，创建文档服务
     *
     * @param httpClient HTTP客户端
     * @param logService 日志服务
     * @param navService 导航服务
     * @param locationService 地址服务
     */
    constructor(private httpClient: HttpClient,
                private logService: LogService,
                private navService: NavService,
                private locationService: LocationService) {
        this.initData();
    }

    /**
     * 初始化数据
     */
    private initData() {
        this.currDoc = combineLatest([
            this.locationService.currPath,
            this.navService.topNavHolder
        ]).pipe(
            switchMap(([currPath, topNavHolder]) => {
                this.topNavHolder = topNavHolder;
                return this.getDoc(currPath);
            })
        );
    }

    /**
     * 获取文档
     *
     * @param docPath 文档路径
     * @return 文档
     */
    private getDoc(docPath: string): Observable<DocSafe> {
        const docId = this.getDocId(docPath);
        if (!this.docMap.has(docId)) {
            this.docMap.set(docId, this.getDocContent(docId));
        }
        return this.docMap.get(docId) as Observable<DocSafe>;
    }

    /**
     * 获取文档id
     *
     * @param docPath 文档路径
     * @return 文档id
     */
    private getDocId(docPath: string): string {
        let docId = docPath;
        if (this.topNavHolder.noSideNavUrls.includes(docId) && ['', 'index'].includes(docId)) {
            docId = 'mixture/index';
        } else if (this.topNavHolder.hasSideNavUrls.includes(docId)) {
            docId = `${docId}/index`;
        }
        return docId;
    }

    /**
     * 获取文档内容
     *
     * @param docId 文档id
     * @return 文档
     */
    private getDocContent(docId: string): Observable<DocSafe> {
        const docSafe = new AsyncSubject<DocSafe>();
        const docPath = `${this.docFolder}${DocService.convertDocId(docId)}.json`;
        this.logService.log(`获取文档内容：${docPath}`);

        this.httpClient.get<DocUnsafe>(docPath, {responseType: 'json'}).pipe(
            tap(doc => {
                if (!doc || typeof doc !== 'object') {
                    const message = `文档内容无效：${docPath}；文档内容：${JSON.stringify(doc)}`;
                    this.logService.error(new Error(message));
                    throw Error(message);
                }
            }),
            map(doc => ({
                id: doc.id,
                content: htmlSafeByReview(doc.content ? doc.content : '', '^')
            })),
            catchError((response: HttpErrorResponse) =>
                response.status === 404 ? this.getDocContentOf404(docId, docPath) : this.getDocContentOfFail(docId, docPath, response)
            ),
        ).subscribe(docSafe);

        return docSafe.asObservable();
    }

    /**
     * 获取文档未找到时的文档内容
     *
     * @param docId 文档id
     * @param docPath 文档路径
     * @return 文档
     */
    private getDocContentOf404(docId: string, docPath: string): Observable<DocSafe> {
        this.logService.error(new Error(`文档未找到：${docPath}`));
        return this.getDocContentOfError(docId, doc404Id, '文档未找到');
    }

    /**
     * 获取文档无法获取时的文档内容
     *
     * @param docId 文档id
     * @param docPath 文档路径
     * @param response 错误响应
     * @return 文档
     */
    private getDocContentOfFail(docId: string, docPath: string, response: HttpErrorResponse): Observable<DocSafe> {
        this.logService.error(new Error(`文档无法获取：${docPath}；错误信息：${response.message}`));
        return this.getDocContentOfError(docId, docFailId, '文档无法获取');
    }

    /**
     * 获取文档未找到或无法获取时的文档内容
     *
     * @param docId 文档id
     * @param docErrorId 文档错误id
     * @param docContent 默认文档内容
     * @return 文档
     */
    private getDocContentOfError(docId: string, docErrorId: string, docContent: string): Observable<DocSafe> {
        this.docMap.delete(docId);
        if (![doc404Id, docFailId].includes(docId)) {
            // 其他文档未找到或无法获取
            return this.getDoc(docErrorId);
        } else {
            // 404和fail文档未找到或无法获取
            return of({
                id: docErrorId,
                content: htmlSafeByReview(docContent, '^')
            });
        }
    }

    /**
     * 转换文档id，在大写字母和`_`后面添加`_`，并把大写字母转换为小写字母
     *
     * @param docId 转换前的文档id
     * @return 转换后的文档id
     */
    private static convertDocId(docId: string): string {
        return docId.replace(/[A-Z_]/g, char => `${char.toLowerCase()}_`);
    }

}
