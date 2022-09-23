import {ErrorHandler, Inject, Injectable, Optional} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

import {Observable, of} from 'rxjs';
import {unwrapHtml} from 'safevalues';

import {namespaceDefault, SvgIcon, SvgIconMap, svgIconToken} from './icon.model';

/**
 * 图标服务，为了兼容MdIconComponent，svg图标源码必须包含以下属性：
 * * `xmlns="http://www.w3.org/2000/svg"`
 * * `focusable="false"`                   （默认值）
 * * `height="100%"`                       （默认值）
 * * `width="100%"`                        （默认值）
 * * `preserveAspectRatio="xMidYMid meet"` （默认值）
 */
@Injectable()
export class IconService extends MatIconRegistry {

    // svg图标映射，key：图标命名空间，value：svg图标元素映射（key：图标名称，value：svg图标元素）
    private svgIconMap: SvgIconMap = {[namespaceDefault]: {}};

    /**
     * 构造函数，创建图标服务
     *
     * @param httpClient HTTP客户端
     * @param domSanitizer DOM处理器
     * @param document 文档对象
     * @param errorHandler 错误处理器
     * @param svgIcons svg图标
     */
    constructor(httpClient: HttpClient,
                domSanitizer: DomSanitizer,
                @Optional() @Inject(DOCUMENT) document: Document,
                errorHandler: ErrorHandler,
                @Inject(svgIconToken) private svgIcons: SvgIcon[]) {
        super(httpClient, domSanitizer, document, errorHandler);
    }

    /**
     * 获取svg图标元素
     *
     * @param name 图标名称
     * @param namespace 图标命名空间
     * @return svg图标元素
     */
    override getNamedSvgIcon(name: string, namespace?: string): Observable<SVGElement> {
        const svgElementMap = this.svgIconMap[namespace || namespaceDefault];
        let svgElement: SVGElement | undefined = svgElementMap && svgElementMap[name];
        if (!svgElement) {
            svgElement = this.loadSvgElement(name, namespace);
        }
        return svgElement ? of(svgElement.cloneNode(true) as SVGElement) : super.getNamedSvgIcon(name, namespace);
    }

    /**
     * 加载svg图标元素
     *
     * @param name 图标名称
     * @param namespace 图标命名空间
     * @return svg图标元素或undefined
     */
    private loadSvgElement(name: string, namespace?: string): SVGElement | undefined {
        const svgIcon = this.svgIcons.find(icon => namespace ? icon.namespace === namespace && icon.name === name : icon.name === name);
        if (!svgIcon) {
            return;
        }

        const divElement = document.createElement('div');
        divElement.innerHTML = unwrapHtml(svgIcon.source) as string;
        const svgElement = divElement.querySelector('svg') as SVGElement;

        const iconNamespace = svgIcon.namespace || namespaceDefault;
        const svgElementMap = this.svgIconMap[iconNamespace] || (this.svgIconMap[iconNamespace] = {});
        svgElementMap[svgIcon.name] = svgElement;
        return svgElement;
    }

}
