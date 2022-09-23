// 授权信息
export interface Authorize {
    // 技术支持
    support: Support;
    // 许可协议
    licenses: License[];
}

// 技术支持
export interface Support {
    // 标签
    label: string;
    // 内容
    content: string;
}

// 许可协议
export interface License {
    // 标签
    label: string;
    // 标题
    title: string;
    // 链接
    href: string;
    // 内容
    content: string;
}

// 外部图标
export interface ExtIcon {
    // 标签
    label: string;
    // 标题
    title: string;
    // 链接
    href: string;
    // 图标
    icon: string;
}
