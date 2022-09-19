import {AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';

import {convertInnerHTML} from '../base/security.service';
import {CodeComponent} from './code.component';
import {CodeTab} from './code.model';

/**
 * 代码选项卡组件。
 *
 * `<univ-code-tab>`输入属性：
 * * linenum：是否显示行号，'number'：显示此数字开始的行号，'true'：显示行号，'false'：不显示行号
 *
 * `<univ-code-pane>`输入属性：
 * * class：CSS样式类
 * * codeHtml：代码HTML
 * * header：代码标题，显示在代码上方
 * * language：代码语言：javascript、typescript
 * * linenum：是否显示行号，'number'：显示此数字开始的行号，'true'：显示行号，'false'：不显示行号
 * * path：代码路径
 * * region：代码显示区域
 *
 * 使用示例：
 * ```
 * <univ-code-tab>
 *     <univ-code-pane header="" path=""></univ-code-pane>
 *     <univ-code-pane header="" path=""></univ-code-pane>
 * </univ-code-tab>
 * ```
 */
@Component({
    selector: 'univ-code-tab',
    templateUrl: './code-tab.component.html',
})
export class CodeTabComponent implements OnInit, AfterViewInit {

    // 代码选项卡
    codeTabs: CodeTab[];

    // 是否显示行号，'number'：显示此数字开始的行号，'true'：显示行号，'false'：不显示行号
    @Input() linenum: string | undefined;

    // 内容元素，引用`<div #content>`
    @ViewChild('content', {static: true}) contentElement: ElementRef<HTMLDivElement>;

    // 代码组件，引用所有`<univ-code>`
    @ViewChildren(CodeComponent) codeComponents: QueryList<CodeComponent>;

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        this.codeTabs = [];
        const contentElement = this.contentElement.nativeElement;
        const codePaneElements = Array.from(contentElement.querySelectorAll('univ-code-pane'));
        contentElement.textContent = '';

        for (const codePaneElement of codePaneElements) {
            this.codeTabs.push(this.buildCodeTab(codePaneElement));
        }
    }

    /**
     * 组件视图初始化完成之后的回调方法
     */
    ngAfterViewInit(): void {
        this.codeComponents.toArray().forEach((codeComponent, index) => {
            codeComponent.codeHtml = this.codeTabs[index].codeHtml;
        });
    }

    /**
     * 构造代码选项卡
     *
     * @param codePaneElement 代码面板元素
     * @return 代码选项卡
     */
    private buildCodeTab(codePaneElement: Element): CodeTab {
        return {
            class: codePaneElement.getAttribute('class') || '',
            codeHtml: convertInnerHTML(codePaneElement),
            header: codePaneElement.getAttribute('header') || undefined,
            language: codePaneElement.getAttribute('language') || undefined,
            linenum: codePaneElement.getAttribute('linenum') || this.linenum,
            path: codePaneElement.getAttribute('path') || '',
            region: codePaneElement.getAttribute('region') || '',
        };
    }

}
