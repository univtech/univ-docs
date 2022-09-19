import {EMPTY_HTML} from 'safevalues';

import {convertInnerHTML} from '../base/security.service';

// 安全的文档内容
export interface DocSafe {
    // 文档id
    id: string;
    // 文档内容
    content: TrustedHTML | null;
}

// 不安全的文档内容
export interface DocUnsafe {
    // 文档id
    id: string;
    // 文档内容
    content: string | null;
}

// 文档未找到的id
export const doc404Id = 'failure/404';

// 文档无法获取的id
export const docFailId = 'failure/error';

// 禁止动画
export const noAnimations = 'no-animations';

// 初始的文档查看器元素，用于在开启预渲染时防止闪烁
export const initialDocViewElement = document.querySelector('univ-doc-view');

// 初始的文档查看器内容
export const initialDocViewContent = initialDocViewElement ? convertInnerHTML(initialDocViewElement) : EMPTY_HTML;

// 可赋值可生成动画的CSS属性名，排除不可赋值不可生成动画的CSS属性，例如：
// 方法：item、removeProperty、getPropertyPriority、getPropertyValue、setProperty；
// 只读属性：length、parentRule。
export type AnimatedCssPropName = Exclude<{ [propName in keyof CSSStyleDeclaration]: CSSStyleDeclaration[propName] extends string ? propName : never; }[keyof CSSStyleDeclaration], number>;
