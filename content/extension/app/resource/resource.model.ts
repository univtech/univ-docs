// 资源列表
export interface ResourceList {
    // 列表标题
    title: string;
    // 资源列表
    resources: Resource[];
}

// 资源
export interface Resource {
    // 资源标题
    title: string;
    // 资源内容
    content: string;
    // 资源链接
    href: string;
}
