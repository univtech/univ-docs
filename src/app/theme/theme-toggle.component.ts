import {Component, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {localStorageToken} from '../base/storage.service';

/**
 * 主题切换组件
 */
@Component({
    selector: 'univ-theme-toggle',
    templateUrl: './theme-toggle.component.html'
})
export class ThemeToggleComponent {

    // 主题链接id
    private themeLinkId = 'themeLink';

    // 是否黑暗主题的存储key
    private isDarkThemeKey = 'isDarkTheme';

    // 是否黑暗主题
    isDarkTheme = false;

    /**
     * 构造函数，创建主题切换组件
     *
     * @param document 文档对象
     * @param localStorage 本地存储
     */
    constructor(@Inject(DOCUMENT) private document: Document, @Inject(localStorageToken) private localStorage: Storage) {
        this.initTheme();
    }

    /**
     * 初始化主题
     */
    private initTheme(): void {
        const isDarkTheme = this.localStorage.getItem(this.isDarkThemeKey);
        if (isDarkTheme) {
            this.isDarkTheme = isDarkTheme === 'true';
        } else {
            this.isDarkTheme = matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
        }

        const initialTheme = this.document.querySelector('#univ-initial-theme');
        if (initialTheme) {
            initialTheme.parentElement?.removeChild(initialTheme);
        }

        const themeLinkElement = this.document.createElement('link');
        themeLinkElement.id = this.themeLinkId;
        themeLinkElement.rel = 'stylesheet';
        themeLinkElement.href = `${this.getThemeName()}-theme.css`;
        this.document.head.appendChild(themeLinkElement);
    }

    /**
     * 切换主题
     */
    toggleTheme(): void {
        this.isDarkTheme = !this.isDarkTheme;
        this.updateTheme();
    }

    /**
     * 更新主题
     */
    private updateTheme(): void {
        const themeLinkElement = this.document.getElementById(this.themeLinkId) as HTMLLinkElement | null;
        if (themeLinkElement) {
            themeLinkElement.href = `${this.getThemeName()}-theme.css`;
        }
        this.localStorage.setItem(this.isDarkThemeKey, String(this.isDarkTheme));
    }

    /**
     * 获取主题名称
     *
     * @return 主题名称
     */
    private getThemeName(): string {
        return this.isDarkTheme ? 'dark' : 'light';
    }

    /**
     * 获取切换标签
     *
     * @return 切换标签
     */
    getToggleLabel(): string {
        return `切换为${this.isDarkTheme ? '明亮' : '黑暗'}模式`;
    }

}
