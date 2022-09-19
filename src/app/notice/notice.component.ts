import {Component, EventEmitter, HostBinding, Inject, Input, OnInit, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

import {localStorageToken} from '../base/storage.service';
import {currentDateToken} from '../base/date.service';

/**
 * 公告组件。
 *
 * 输入属性：
 * * noticeId：公告id
 * * expiredDate：公告过期日期
 *
 * 输出属性：
 * * noticeClosed：公告已经关闭
 */
@Component({
    selector: 'univ-notice',
    templateUrl: './notice.component.html',
    animations: [
        trigger('noticeVisibilityTrigger', [
            state('show', style({height: '*'})),
            state('hide', style({height: 0, display: 'none'})),
            // 一致性：_notice.scss中的.univ-notice-animating，app.component.ts中的handleNoticeClosed()
            transition('show => hide', animate(250))
        ])
    ],
    host: {role: 'group', 'aria-label': '公告'}
})
export class NoticeComponent implements OnInit {

    // 公告命名空间
    private noticeNamespace = 'notices/';

    // 公告id
    @Input() noticeId: string;

    // 公告过期日期
    @Input() expiredDate?: string;

    // 公告已经关闭
    @Output() noticeClosed = new EventEmitter<void>();

    // 公告可见性，显示或隐藏
    @HostBinding('@noticeVisibilityTrigger') noticeVisibility: 'show' | 'hide';

    /**
     * 构造函数，创建公告组件
     *
     * @param localStorage 本地存储
     * @param currentDate 当前日期
     */
    constructor(@Inject(localStorageToken) private localStorage: Storage, @Inject(currentDateToken) private currentDate: Date) {

    }

    /**
     * 指令的数据绑定属性初始化之后的回调方法
     */
    ngOnInit(): void {
        const isHidden = this.localStorage.getItem(this.getNoticeVisibilityKey()) === 'hide';
        const isExpired = this.expiredDate ? this.currentDate > new Date(this.expiredDate) : false;
        this.noticeVisibility = isHidden || isExpired ? 'hide' : 'show';
    }

    /**
     * 关闭公告
     */
    closeNotice(): void {
        this.localStorage.setItem(this.getNoticeVisibilityKey(), 'hide');
        this.noticeVisibility = 'hide';
        this.noticeClosed.next();
    }

    /**
     * 获取公告可见性的存储Key
     */
    private getNoticeVisibilityKey(): string {
        return `${this.noticeNamespace}${this.noticeId}`;
    }

}
