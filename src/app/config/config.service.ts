import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {ConnectableObservable, Observable} from 'rxjs';
import {publishLast} from 'rxjs/operators';

import {Authorize, ExtIcon} from './config.model';

/**
 * 配置服务
 */
@Injectable()
export class ConfigService {

    // 授权信息配置文件
    private authorizeFile = 'content/navigation/footer-license.json';

    // 外部图标配置文件
    private iconFile = 'content/navigation/top-icon.json';

    // 授权信息
    authorize: Observable<Authorize>;

    // 外部图标
    extIcons: Observable<ExtIcon[]>;

    /**
     * 构造函数，创建配置服务
     *
     * @param httpClient HTTP客户端
     */
    constructor(private httpClient: HttpClient) {
        this.getAuthorize();
        this.getExtIcons();
    }

    /**
     * 获取授权信息
     */
    private getAuthorize(): void {
        const authorize = this.httpClient.get<Authorize>(this.authorizeFile).pipe(publishLast());
        (authorize as ConnectableObservable<Authorize>).connect();
        this.authorize = authorize;
    }

    /**
     * 获取外部图标
     */
    private getExtIcons(): void {
        const extIcons = this.httpClient.get<ExtIcon[]>(this.iconFile).pipe(publishLast());
        (extIcons as ConnectableObservable<ExtIcon[]>).connect();
        this.extIcons = extIcons;
    }

}
