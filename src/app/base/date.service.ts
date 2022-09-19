import {InjectionToken} from '@angular/core';

// 当前日期令牌
export const currentDateToken = new InjectionToken('currentDateToken');

/**
 * 当前日期提供器
 *
 * @return 当前日期
 */
export function currentDateProvider(): Date {
    return new Date();
}
