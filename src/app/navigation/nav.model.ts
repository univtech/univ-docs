// 导航节点
export interface NavNode {
    // 节点标题
    title: string;
    // 节点路径
    url?: string;
    // 节点提示
    tooltip?: string;
    // 是否隐藏
    hidden?: boolean;
    // 是否无侧边导航，true：无侧边导航；false：有侧边导航
    noSideNav?: boolean;
    // 子节点
    childNodes?: NavNode[];
}

// 当前节点
export interface CurrNode {
    // 节点路径
    url: string;
    // 节点追溯栈，当前节点及其祖先节点，第一个节点为当前节点，最后一个节点为根节点
    traceNodes: NavNode[];
}

// 顶部导航持有者
export interface TopNavHolder {
    // 有侧边导航的顶部导航路径
    hasSideNavUrls: string[];
    // 无侧边导航的顶部导航路径
    noSideNavUrls: string[];
}
