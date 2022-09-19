import {InjectionToken} from '@angular/core';

// Window对象令牌
export const windowToken = new InjectionToken<Window>('windowToken');

/**
 * Window对象提供器
 *
 * @return Window对象
 */
export function windowProvider(): Window {
    return window;
}
