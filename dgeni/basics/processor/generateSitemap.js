/**
 * 提取文档路径，生成网站地图的处理器，配置属性：
 * * ignoreDocTypes: string[] 忽略文档类型
 * * ignoreDocPaths: string[] 忽略文档路径
 * * outputFolder: string 输出文件夹
 */
module.exports = function generateSitemap() {
    return {
        ignoreDocTypes: [],
        ignoreDocPaths: [],
        outputFolder: '',
        $validate: {
            ignoreDocTypes: {},
            ignoreDocPaths: {},
            outputFolder: {presence: true}
        },
        $runAfter: ['paths-computed'],
        $runBefore: ['rendering-docs'],
        $process(docs) {
            docs.push({
                docType: 'sitemap',
                id: 'sitemap',
                path: this.outputFolder + '/sitemap.xml',
                outputPath: this.outputFolder + '/sitemap.xml',
                template: 'sitemap.template.xml',
                urls: docs
                    .filter(doc => doc.outputPath)
                    .filter(doc => !this.ignoreDocTypes.includes(doc.docType))
                    .filter(doc => !this.ignoreDocPaths.includes(doc.path))
                    .map(doc => doc.path.replace(/mixture\/index$/, '').replace(/\/index$/, ''))
            });
        }
    };
};
