import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {ConnectableObservable, Observable} from 'rxjs';
import {publishLast} from 'rxjs/operators';

import {Authorize} from './config.model';

/**
 * 配置服务
 */
@Injectable()
export class ConfigService {

    // 授权信息配置文件
    private authorizeFile = 'content/config/authorize.json';

    // 授权信息
    authorize: Observable<Authorize>;

    /**
     * 构造函数，创建配置服务
     *
     * @param httpClient HTTP客户端
     */
    constructor(private httpClient: HttpClient) {
        this.authorize = this.getAuthorize();
    }

    /**
     * 获取授权信息
     *
     * @return 授权信息
     */
    private getAuthorize(): Observable<Authorize> {
        const authorize = this.httpClient.get<Authorize>(this.authorizeFile).pipe(publishLast());
        (authorize as ConnectableObservable<Authorize>).connect();
        return authorize;
    }

}
