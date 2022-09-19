import {ApplicationRef, ErrorHandler, Injectable, OnDestroy} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';

import {concat, interval, Subject} from 'rxjs';
import {first, takeUntil, tap} from 'rxjs/operators';

import {LogService} from './log.service';
import {LocationService} from '../navigation/location.service';

/**
 * ServiceWorker服务，启用ServiceWorker更新时，每6小时检查一次ServiceWorker可用更新，存在可用更新时，立即激活更新
 */
@Injectable({providedIn: 'root'})
export class ServiceWorkerService implements OnDestroy {

    // 检查ServiceWorker可用更新的时间间隔：6小时
    private checkInterval = 6 * 60 * 60 * 1000;

    // ServiceWorker更新已经禁用
    private swUpdateDisabled = new Subject<void>();

    /**
     * 构造函数，创建ServiceWorker服务
     *
     * @param applicationRef 应用程序引用
     * @param errorHandler 错误处理器
     * @param swUpdate ServiceWorker更新器
     * @param logService 日志服务
     * @param locationService 地址服务
     */
    constructor(private applicationRef: ApplicationRef,
                private errorHandler: ErrorHandler,
                private swUpdate: SwUpdate,
                private logService: LogService,
                private locationService: LocationService) {

    }

    /**
     * 指令、管道或服务销毁之前的回调方法，执行自定义清理功能
     */
    ngOnDestroy(): void {
        this.disableUpdate();
    }

    /**
     * 启用ServiceWorker更新
     */
    enableUpdate(): void {
        if (!this.swUpdate.isEnabled) {
            return;
        }

        // 应用程序稳定后，每6小时检查一次可用更新
        const isAppStable = this.applicationRef.isStable.pipe(first(isStable => isStable));
        concat(isAppStable, interval(this.checkInterval))
            .pipe(
                tap(() => this.logMessage('正在检查更新')),
                takeUntil(this.swUpdateDisabled),
            )
            .subscribe(() => this.swUpdate.checkForUpdate());

        // 应用程序新版本已经可用，把当前客户端更新为最新版本
        this.swUpdate.available
            .pipe(
                tap(event => this.logMessage(`应用程序新版本已经可用：${JSON.stringify(event)}`)),
                takeUntil(this.swUpdateDisabled),
            )
            .subscribe(() => this.swUpdate.activateUpdate());

        // 应用程序已更新为新版本，需要加载整个页面
        this.swUpdate.activated
            .pipe(
                tap(event => this.logMessage(`应用程序已更新为新版本：${JSON.stringify(event)}`)),
                takeUntil(this.swUpdateDisabled),
            )
            .subscribe(() => this.locationService.setLoadFullPage());

        // 应用程序崩溃且无法恢复，重新加载当前页面
        this.swUpdate.unrecoverable
            .pipe(
                tap(event => {
                    this.logMessage(`应用程序崩溃且无法恢复：${JSON.stringify(event)}`);
                    this.errorHandler.handleError(`应用程序崩溃且无法恢复：${event.reason}`);
                }),
                takeUntil(this.swUpdateDisabled),
            )
            .subscribe(() => this.locationService.reloadCurrentPage());
    }

    /**
     * 禁用ServiceWorker更新
     */
    private disableUpdate(): void {
        this.swUpdateDisabled.next();
    }

    /**
     * 记录日志信息
     *
     * @param message 日志信息
     */
    private logMessage(message: string): void {
        const timestamp = new Date().toISOString();
        this.logService.log(`[ServiceWorker更新 - ${timestamp}]: ${message}`);
    }

}
