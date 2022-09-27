import {ElementRef} from '@angular/core';

import {htmlSafeByReview} from 'safevalues/restricted/reviewed';

/**
 * 获取投影内容。
 *
 * 内容投影模板：
 * ```
 * <div #projection style="display: none">
 *     <ng-content></ng-content>
 * </div>
 * ```
 *
 * 内容投影元素：
 * ```
 * @ViewChild('projection', {static: true}) projectionElement: ElementRef<HTMLDivElement>;
 * ```
 *
 * @param projectionElement 内容投影元素
 * @return 投影内容
 */
export function getProjectionContent(projectionElement: ElementRef<HTMLDivElement>): string {
    const contentElement = projectionElement.nativeElement;
    const contentHtml = htmlSafeByReview(contentElement.innerHTML, '^');
    contentElement.textContent = '';
    return contentHtml?.toString() || '';
}
