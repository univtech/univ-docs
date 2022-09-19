import {Inject, Injectable} from '@angular/core';

import {trustedResourceUrl, unwrapResourceUrl} from 'safevalues';

import {GaWindow} from './google.model';
import {windowToken} from './window.service';
import {environment} from '../../environments/environment';

/**
 * 谷歌服务，调用谷歌分析服务。
 * 捕获应用程序的行为并发送到谷歌分析服务。
 * 假设index.html页面中加载了analytics.js脚本。
 * 把数据和环境中配置的谷歌分析服务的ID关联起来。
 * * 数据上传到传统的谷歌分析服务
 * * 数据上传到主要的谷歌分析服务4+
 */
@Injectable()
export class GoogleService {

    // 是否在在e2e protractor测试中运行应用程序
    private readonly isProtractor = this.window.name.includes('NG_DEFER_BOOTSTRAP');

    // 上个页面路径
    private prevPath: string;

    /**
     * 构造函数，创建谷歌服务
     *
     * @param window 包含谷歌分析服务的Window扩展对象
     */
    constructor(@Inject(windowToken) private window: GaWindow) {
        this.loadGtagScript();
        this.handleErrorEvent();
        // 在谷歌分析服务中自动创建id，并隐藏ip
        this.callGa('create', environment.gaIdLegacy, 'auto');
        this.callGa('set', 'anonymizeIp', true);
    }

    /**
     * 加载gtag脚本
     */
    private loadGtagScript(): void {
        const window = this.window;
        const gtagUrl: TrustedScriptURL = trustedResourceUrl`https://www.googletagmanager.com/gtag/js?id=${environment.gaId}`;

        window.dataLayer = this.window.dataLayer || [];
        window.gtag = function() {
            window.dataLayer?.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', environment.gaId);

        if (this.isProtractor) {
            return;
        }

        const scriptElement = window.document.createElement('script');
        scriptElement.async = true;
        scriptElement.src = unwrapResourceUrl(gtagUrl) as string;
        window.document.head.appendChild(scriptElement);
    }

    /**
     * 处理错误事件
     */
    private handleErrorEvent(): void {
        this.window.addEventListener('error', event => this.reportError(this.formatErrorEvent(event), true));
    }

    /**
     * 报告错误，把错误信息发送到谷歌分析服务和谷歌分析服务4+
     *
     * @param description 错误描述
     * @param fatal 是否致命错误
     */
    reportError(description: string, fatal = true): void {
        // 描述限制为150个字符，参考：https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#exd
        description = description.substring(0, 150);
        this.callGa('send', 'exception', {exDescription: description, exFatal: fatal});
        this.callGtag('event', 'exception', {description, fatal});
    }

    /**
     * 格式化错误事件信息
     *
     * @param event 错误事件对象
     * @return 格式化后的错误事件信息
     */
    private formatErrorEvent(event: ErrorEvent): string {
        if (event.error instanceof Error) {
            return this.formatErrorMessage(event.error);
        }
        return `${GoogleService.stripErrorPrefix(event.message)}\n${event.filename}: ${event.lineno || '?'}:${event.colno || '?'}`;
    }

    /**
     * 格式化错误信息
     *
     * @param error 错误对象
     * @return 格式化后的错误信息
     */
    formatErrorMessage(error: Error): string {
        let stack = '<no-stack>';

        if (error.stack) {
            // 去掉堆栈中的错误前缀
            stack = GoogleService.stripErrorPrefix(error.stack)
                // 去掉堆栈中的信息
                .replace(`${error.message}\n`, '')
                // 去掉开头的空格
                .replace(/^ +/gm, '')
                // 去掉frame开头的`at `
                .replace(/^at /gm, '')
                // 把长地址替换为最后一个片段：`filename:line:column`
                .replace(/(?: \(|@)http.+\/([^/)]+)\)?(?:\n|$)/gm, '@$1\n')
                // 替换Edge浏览器中的`eval code`
                .replace(/ *\(eval code(:\d+:\d+)\)(?:\n|$)/gm, '@???$1\n');
        }

        return `${error.message}\n${stack}`;
    }

    /**
     * 去掉信息或堆栈中的错误前缀
     *
     * @param content 信息或堆栈
     * @return 去掉错误前缀后的信息或堆栈
     */
    private static stripErrorPrefix(content: string): string {
        return content.replace(/^(Uncaught )?Error: /, '');
    }

    /**
     * 更新当前页面路径，把页面路径和页面流量发送到谷歌分析服务
     *
     * @param currPath 当前页面路径
     */
    changeCurrPath(currPath: string): void {
        this.sendPageview(currPath);
    }

    /**
     * 把页面路径和页面流量发送到谷歌分析服务
     *
     * @param currPath 当前页面路径
     */
    private sendPageview(currPath: string): void {
        // 页面路径没有发生改变，不需要重新发送
        if (currPath === this.prevPath) {
            return;
        }
        this.prevPath = currPath;
        this.callGa('set', 'page', `/${currPath}`);
        this.callGa('send', 'pageview');
    }

    /**
     * 把事件发送到谷歌分析服务4+
     *
     * @param name 名称
     * @param params 参数
     */
    sendEvent(name: string, params: Record<string, string | boolean | number>): void {
        this.callGtag('event', name, params);
    }

    /**
     * 调用ga
     *
     * @param params 参数
     */
    private callGa(...params: any[]): void {
        if (this.window.ga) {
            this.window.ga(...params);
        }
    }

    /**
     * 调用gtag
     *
     * @param params 参数
     */
    private callGtag(...params: any[]): void {
        if (this.window.gtag) {
            this.window.gtag(...params);
        }
    }

}
