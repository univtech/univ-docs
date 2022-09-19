import {createNgModuleRef, Inject, Injectable, NgModuleRef, Type} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {LoadChildrenCallback} from '@angular/router';

import {from, Observable, of} from 'rxjs';

import {ElementComponentModule, elementComponentModuleToken} from './element-registry.service';

/**
 * 元素加载服务
 */
@Injectable()
export class ElementLoadService {

    // 未加载的元素组件模块映射
    private unloadedElementComponentModuleMap: Map<string, LoadChildrenCallback>;

    // 正在加载的元素组件模块映射
    private loadingElementComponentModuleMap = new Map<string, Promise<void>>();

    /**
     * 构造函数，创建元素加载服务
     *
     * @param ngModuleRef 模块引用
     * @param elementComponentModuleMap 元素组件模块映射
     */
    constructor(private ngModuleRef: NgModuleRef<any>,
                @Inject(elementComponentModuleToken) elementComponentModuleMap: Map<string, LoadChildrenCallback>) {
        this.unloadedElementComponentModuleMap = new Map(elementComponentModuleMap);
    }

    /**
     * 加载未注册到浏览器的元素
     *
     * @param element HTML元素
     * @return 所有元素加载完成
     */
    loadElementComponentModules(element: HTMLElement): Observable<void> {
        const unloadedSelectors = Array.from(this.unloadedElementComponentModuleMap.keys()).filter(selector => element.querySelector(selector));
        if (!unloadedSelectors.length) {
            return of(undefined);
        }
        const loadDone = Promise.all(unloadedSelectors.map(selector => this.loadElementComponentModule(selector)));
        return from(loadDone.then(() => undefined));
    }

    /**
     * 加载未注册到浏览器的元素
     *
     * @param selector 元素选择器
     * @return 异步加载结果，成功或失败
     */
    loadElementComponentModule(selector: string): Promise<void> {
        if (this.loadingElementComponentModuleMap.has(selector)) {
            return this.loadingElementComponentModuleMap.get(selector) as Promise<void>;
        } else if (this.unloadedElementComponentModuleMap.has(selector)) {
            const unloadedElementComponentModule = this.unloadedElementComponentModuleMap.get(selector) as LoadChildrenCallback;
            const loadingElementComponentModule = (unloadedElementComponentModule() as Promise<Type<ElementComponentModule>>)
                .then(elementComponentModule => {
                    const elementComponentModuleRef = createNgModuleRef(elementComponentModule, this.ngModuleRef.injector);
                    const elementComponent = elementComponentModuleRef.instance.elementComponent;
                    const moduleInjector = elementComponentModuleRef.injector;
                    const elementConstructor = createCustomElement(elementComponent, {injector: moduleInjector});

                    customElements.define(selector, elementConstructor);
                    return customElements.whenDefined(selector);
                })
                .then(() => {
                    this.loadingElementComponentModuleMap.delete(selector);
                    this.unloadedElementComponentModuleMap.delete(selector);
                })
                .catch(error => {
                    this.loadingElementComponentModuleMap.delete(selector);
                    return Promise.reject(error);
                });

            this.loadingElementComponentModuleMap.set(selector, loadingElementComponentModule);
            return loadingElementComponentModule;
        } else {
            return Promise.resolve();
        }
    }

}
