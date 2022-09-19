// 代码美化对象
export type PrettyPrintOne = (code: TrustedHTML, language?: string, linenum?: number | boolean) => string;

// 代码选项卡
export interface CodeTab {
    // 样式
    class: string;
    // 代码HTML，视图中显示的当前输入的已格式化代码
    codeHtml: TrustedHTML;
    // 代码标题，显示在代码上方
    header?: string;
    // 代码语言：javascript、typescript
    language?: string;
    // 是否显示行号，number或'number'：显示此数字开始的行号，true或'true'：显示行号，false或'false'：不显示行号
    linenum?: string;
    // 代码路径
    path: string;
    // 代码显示区域
    region: string;
}
