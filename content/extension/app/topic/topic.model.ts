// 主题列表
export interface TopicList {
    // 列表标题
    title: string;
    // 主题列表
    topics: Topic[];
}

// 主题
export interface Topic {
    // 主题标题
    title: string;
    // 主题内容
    content: string;
    // 主题链接
    href: string;
}
