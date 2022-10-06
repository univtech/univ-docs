// 特性页面
export interface FeaturePage {
    // 页面标题
    title: string;
    // 开始链接
    startUrl: string;
    // 特性列表
    featureLists: FeatureList[];
}

// 特性列表
export interface FeatureList {
    // 列表标题
    title: string;
    // 特性列表
    features: Feature[];
}

// 特性
export interface Feature {
    // 特性标题
    title: string;
    // 特性内容
    content: string;
}
