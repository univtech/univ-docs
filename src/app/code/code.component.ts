import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';

import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

import {unwrapHtml} from 'safevalues';
import {htmlSafeByReview} from 'safevalues/restricted/reviewed';

import {LogService} from '../base/log.service';
import {convertOuterHTML} from '../base/security.service';
import {CodePrettyService} from './code-pretty.service';

/**
 * 已格式化代码组件。
 *
 * 输入属性：
 * * header：代码标题，显示在代码上方
 * * language：代码语言：javascript、typescript
 * * linenum：是否显示行号，number或'number'：显示此数字开始的行号，true或'true'：显示行号，false或'false'：不显示行号
 * * path：代码路径
 * * region：代码显示区域
 * * hideCopy：是否隐藏复制按钮，true：隐藏复制按钮，false：显示复制按钮
 *
 * 输出属性：
 * * codeFormatted：代码已经格式化
 *
 * 使用示例：
 * ```
 * <univ-code
 *     [language]="ts"
 *     [linenum]="true"
 *     [path]="router/src/app/app.module.ts"
 *     [region]="animations-module">
 * </univ-code>
 * ```
 */
@Component({
    selector: 'univ-code',
    templateUrl: './code.component.html'
})
export class CodeComponent implements OnChanges {

    // ARIA标签
    ariaLabel = '';

    // 代码HTML，视图中显示的当前输入的已格式化代码
    private _codeHtml: TrustedHTML;

    // 代码文本，点击复制按钮时复制的非HTML编码代码
    private codeText: string;

    // 代码标题，显示在代码上方
    private _header: string | undefined;

    // 代码语言：javascript、typescript
    @Input() language: string | undefined;

    // 是否显示行号，number或'number'：显示此数字开始的行号，true或'true'：显示行号，false或'false'：不显示行号
    @Input() linenum: boolean | number | string | undefined;

    // 代码路径
    @Input() path: string;

    // 代码显示区域
    @Input() region: string;

    // 是否隐藏复制按钮，true：隐藏复制按钮，false：显示复制按钮
    @Input() hideCopy: boolean;

    // 代码已经格式化
    @Output() codeFormatted = new EventEmitter<void>();

    // 代码元素，引用`<code #code>`
    @ViewChild('code', {static: true}) codeElement: ElementRef;

    /**
     * 获取可信任的代码
     *
     * @return TrustedHTML 可信任的代码
     */
    get codeHtml(): TrustedHTML {
        return this._codeHtml;
    }

    /**
     * 设置可信任的代码
     *
     * @param codeHtml 可信任的代码
     */
    set codeHtml(codeHtml: TrustedHTML) {
        this._codeHtml = codeHtml;
        if (!this._codeHtml.toString().trim()) {
            this.showCodeMissing();
        } else {
            this.formatCodeHtml();
        }
    }

    /**
     * 获取代码标题
     *
     * @return string或undefined 代码标题
     */
    get header(): string | undefined {
        return this._header;
    }

    /**
     * 设置代码标题
     *
     * @param header 代码标题
     */
    @Input() set header(header: string | undefined) {
        this._header = header;
        this.ariaLabel = this.header ? `复制代码：${this.header}` : '';
    }

    /**
     * 构造函数，创建已格式化代码组件
     *
     * @param clipboard 剪贴板
     * @param matSnackBar 提示信息栏
     * @param logService 日志服务
     * @param codePrettyService 代码美化服务
     */
    constructor(private clipboard: Clipboard,
                private matSnackBar: MatSnackBar,
                private logService: LogService,
                private codePrettyService: CodePrettyService) {

    }

    /**
     * 数据绑定属性发生改变时的回调方法
     */
    ngOnChanges(): void {
        if (this.codeHtml) {
            this.formatCodeHtml();
        }
    }

    /**
     * 显示示例代码缺失信息
     */
    private showCodeMissing(): void {
        const region = this.region ? `#${this.region}` : '';
        const path = this.path ? `${this.path}${region}` : '';
        const paragraphElement = document.createElement('p');
        paragraphElement.className = 'code-missing';
        paragraphElement.textContent = `示例代码缺失：${path ? `\n${path}` : '。'}`;
        this.setCodeHtml(convertOuterHTML(paragraphElement));
    }

    /**
     * 格式化已显示代码
     */
    private formatCodeHtml(): void {
        const linenum = this.getLinenum();
        const alignedCode = this.alignLeft(this.codeHtml);
        this.setCodeHtml(alignedCode);
        this.codeText = this.getCodeText();

        const skipPrettify = of(undefined);
        const prettyCode = this.codePrettyService.formatCode(alignedCode, this.language, linenum).pipe(tap(formattedCode => this.setCodeHtml(formattedCode)));

        if (this.language === 'none' && linenum !== false) {
            this.logService.warn('不支持：language=none并且linenum!=false');
        }

        ((this.language === 'none' ? skipPrettify : prettyCode) as Observable<unknown>).subscribe({
            next: () => this.codeFormatted.emit(),
            error: () => {
                // 忽略代码格式化错误
            },
        });
    }

    /**
     * 左对齐代码
     *
     * @param codeHtml 可信任的代码
     * @return 可信任的代码
     */
    private alignLeft(codeHtml: TrustedHTML): TrustedHTML {
        let minIndent = Number.MAX_VALUE;
        const lines = codeHtml.toString().split('\n');
        lines.forEach(line => {
            const lineIndent = line.search(/\S/);
            if (lineIndent !== -1) {
                minIndent = Math.min(lineIndent, minIndent);
            }
        });
        return htmlSafeByReview(lines.map(line => line.slice(minIndent)).join('\n').trim(), '^');
    }

    /**
     * 获取是否显示行号
     *
     * @return number：显示此数字开始的行号，true：显示行号，false：不显示行号
     */
    private getLinenum(): number | boolean {
        const linenum = this.getLinenumValue();
        return linenum != null && !isNaN(linenum as number) && linenum;
    }

    /**
     * 获取是否显示行号
     *
     * @return number：显示此数字开始的行号，true：显示行号，false：不显示行号
     */
    private getLinenumValue(): number | boolean | undefined {
        if (typeof this.linenum === 'boolean') {
            return this.linenum;
        } else if (this.linenum === 'true') {
            return true;
        } else if (this.linenum === 'false') {
            return false;
        } else if (typeof this.linenum === 'string') {
            return parseInt(this.linenum, 10);
        } else {
            return this.linenum;
        }
    }

    /**
     * 获取代码文本
     *
     * @return 代码文本
     */
    private getCodeText(): any {
        return this.codeElement.nativeElement.textContent;
    }

    /**
     * 设置可信任的代码
     *
     * @param codeHtml 可信任的代码
     */
    private setCodeHtml(codeHtml: TrustedHTML): void {
        this.codeElement.nativeElement.innerHTML = unwrapHtml(codeHtml);
    }

    /**
     * 复制代码
     */
    copyCode(): void {
        const code = this.codeText;
        const result = this.clipboard.copy(code);
        if (result) {
            this.logService.log('代码复制成功：', code);
            this.matSnackBar.open('代码复制成功', '', {duration: 800});
        } else {
            this.logService.error(new Error(`代码复制失败："${code}"`));
            this.matSnackBar.open('代码复制失败', '', {duration: 800});
        }
    }

}
