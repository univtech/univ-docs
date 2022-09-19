// 包含谷歌分析服务的Window扩展对象
export interface GaWindow extends Window {
    // 数据层
    dataLayer?: any[];

    // https://www.googletagmanager.com/gtag/js
    gtag?(...params: any[]): void;

    // https://www.google-analytics.com/analytics.js，参考：index.html
    ga?(...params: any[]): void;
}
