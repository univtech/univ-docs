import {Component, Inject} from '@angular/core';

import {localStorageToken} from '../base/storage.service';

/**
 * 接受Cookie公告组件
 */
@Component({
    selector: 'univ-cookie-popup',
    templateUrl: './cookie-popup.component.html',
})
export class CookiePopupComponent {

    // 是否接受Cookie的存储Key
    private isAcceptedCookieKey = 'isAcceptedCookie';

    // 是否接受Cookie
    isAcceptedCookie: boolean;

    /**
     * 构造函数，创建接受Cookie公告组件
     *
     * @param localStorage 本地存储
     */
    constructor(@Inject(localStorageToken) private localStorage: Storage) {
        this.isAcceptedCookie = this.localStorage.getItem(this.isAcceptedCookieKey) === 'true';
    }

    /**
     * 接受Cookie
     */
    acceptCookie(): void {
        this.localStorage.setItem(this.isAcceptedCookieKey, 'true');
        this.isAcceptedCookie = true;
    }

}
