// 主题页面
export interface TopicPage {
    // 页面标题
    title: string;
    // 主题列表
    topicLists: TopicList[];
}

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
    url: string;
}
