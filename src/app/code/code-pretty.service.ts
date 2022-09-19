import {Injectable} from '@angular/core';

import {from, Observable} from 'rxjs';
import {first, map, share} from 'rxjs/operators';

import {htmlSafeByReview} from 'safevalues/restricted/reviewed';

import {LogService} from '../base/log.service';
import {PrettyPrintOne} from './code.model';

/**
 * 代码美化服务，包装prettify.js库
 */
@Injectable()
export class CodePrettyService {

    // 代码美化对象
    private prettyPrintOne: Observable<PrettyPrintOne>;

    /**
     * 构造函数，创建代码美化服务
     *
     * @param logService 日志服务
     */
    constructor(private logService: LogService) {
        this.prettyPrintOne = from(this.getPrettyPrintOne()).pipe(share());
    }

    /**
     * 获取代码美化对象
     *
     * @return 代码美化对象
     */
    private getPrettyPrintOne(): Promise<PrettyPrintOne> {
        const pretty = (window as any).prettyPrintOne;
        return pretty ? Promise.resolve(pretty) : import('assets/js/prettify.js' as any).then(
            () => (window as any).prettyPrintOne,
            error => {
                const message = `无法获取prettify.js：${error.message}`;
                this.logService.error(new Error(message));
                return () => {
                    throw new Error(message);
                };
            }
        );
    }

    /**
     * 格式化代码
     *
     * @param code 格式化前的代码
     * @param language 代码语言：javascript、typescript
     * @param linenum 是否显示行号，number：显示此数字开始的行号，true：显示行号，false：不显示行号
     * @return 格式化后的代码
     */
    formatCode(code: TrustedHTML, language?: string, linenum?: number | boolean): Observable<TrustedHTML> {
        return this.prettyPrintOne.pipe(
            map(pretty => {
                try {
                    return htmlSafeByReview(pretty(code, language, linenum), '^');
                } catch (error) {
                    const message = `无法格式化代码：'${code.toString().slice(0, 50)}...'`;
                    console.error(message, error);
                    throw new Error(message);
                }
            }),
            first(),
        );
    }

}
