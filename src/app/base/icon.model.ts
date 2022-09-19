import {InjectionToken, StaticProvider} from '@angular/core';

import {convertSvgTemplate} from './security.service';

// svg图标
export interface SvgIcon {
    // 图标命名空间
    namespace?: string;
    // 图标名称
    name: string;
    // 图标源码
    source: TrustedHTML;
}

// svg图标映射，key：图标命名空间，value：svg图标元素映射（key：图标名称，value：svg图标元素）
export interface SvgIconMap {
    [namespace: string]: {
        [name: string]: SVGElement;
    };
}

// 关闭图标的svg源码
const svgSourceClose = convertSvgTemplate`
    <svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        <path d="M0 0h24v24H0z" fill="none" />
    </svg>`;

// 评论图标的svg源码
const svgSourceComment = convertSvgTemplate`
    <svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        <path d="M0 0h24v24H0z" fill="none" />
    </svg>`;

// 右键箭头图标的svg源码
const svgSourceFold = convertSvgTemplate`
    <svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
    </svg>`;

// 菜单图标的svg源码
const svgSourceMenu = convertSvgTemplate`
    <svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>`;

// Github图标的svg源码
const svgSourceGithub = convertSvgTemplate`
    <svg focusable="false" viewBox="0 0 51.8 50.4" xmlns="http://www.w3.org/2000/svg">
        <path d="M25.9,0.2C11.8,0.2,0.3,11.7,0.3,25.8c0,11.3,7.3,20.9,17.5,24.3c1.3,0.2,1.7-0.6,1.7-1.2c0-0.6,0-2.6,0-4.8c-7.1,
                 1.5-8.6-3-8.6-3c-1.2-3-2.8-3.7-2.8-3.7c-2.3-1.6,0.2-1.6,0.2-1.6c2.6,0.2,3.9,2.6,3.9,2.6c2.3,3.9,6,2.8,7.5,2.1c0.2-1.7,
                 0.9-2.8,1.6-3.4c-5.7-0.6-11.7-2.8-11.7-12.7c0-2.8,1-5.1,2.6-6.9c-0.3-0.7-1.1-3.3,0.3-6.8c0,0,2.1-0.7,7,2.6c2-0.6,4.2-0.9,
                 6.4-0.9c2.2,0,4.4,0.3,6.4,0.9c4.9-3.3,7-2.6,7-2.6c1.4,3.5,0.5,6.1,0.3,6.8c1.6,1.8,2.6,4.1,2.6,6.9c0,9.8-6,12-11.7,12.6c0.9,
                 0.8,1.7,2.4,1.7,4.7c0,3.4,0,6.2,0,7c0,0.7,0.5,1.5,1.8,1.2c10.2-3.4,17.5-13,17.5-24.3C51.5,11.7,40.1,0.2,25.9,0.2z"/>
    </svg>`;

// svg图标令牌
export const svgIconToken = new InjectionToken<Array<SvgIcon>>('svgIconToken');

// svg图标提供器：关闭图标提供器、评论图标提供器、折叠图标提供器、菜单图标提供器、Github图标提供器
export const svgIconProviders: StaticProvider[] = [
    {provide: svgIconToken, multi: true, useValue: {namespace: 'default', name: 'icon_close', source: svgSourceClose}},
    {provide: svgIconToken, multi: true, useValue: {namespace: 'default', name: 'icon_comment', source: svgSourceComment}},
    {provide: svgIconToken, multi: true, useValue: {namespace: 'default', name: 'icon_fold', source: svgSourceFold}},
    {provide: svgIconToken, multi: true, useValue: {namespace: 'default', name: 'icon_menu', source: svgSourceMenu}},
    {provide: svgIconToken, multi: true, useValue: {namespace: 'logos', name: 'icon_github', source: svgSourceGithub}},
];

// 默认的图标命名空间
export const namespaceDefault = 'default';
