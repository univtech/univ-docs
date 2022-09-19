/**
 * 给指定类型的文档添加链接注释的处理器，配置属性：
 * * docTypes: string[] 文档类型
 *
 * 链接注释包括：
 * * 链接到此文档的链接
 * * 来源于此文档的链接
 *
 * @param extractLinks 提取链接的服务
 */
module.exports = function addLinkComment(extractLinks) {
    return {
        docTypes: [],
        $runAfter: ['addPathToInternalLink'],
        $runBefore: ['convertDocToJson'],
        $process(docs) {
            const ofLinkMap = {}, toLinkMap = {};
            const filteredDocs = docs.filter(doc => this.docTypes.includes(doc.docType));

            filteredDocs.forEach(doc => {
                const ofLinks = extractLinks(doc.renderedContent).hrefs;
                ofLinkMap[doc.path] = ofLinks;
                ofLinks.forEach(link => {
                    link = link.match(/^[^#?]+/)[0];
                    (toLinkMap[link] = toLinkMap[link] || []).push(doc.path);
                });
            });

            filteredDocs.forEach(doc => {
                const ofLinks = getLinks(ofLinkMap, doc.path);
                const toLinks = getLinks(toLinkMap, doc.path);
                doc.renderedContent += `\n<!-- 链接到此文档的链接：${toLinks.map(link => `\n - ${link}`).join('')}\n-->\n`;
                doc.renderedContent += `<!-- 来源于此文档的链接：${ofLinks.map(link => `\n - ${link}`).join('')}\n-->`;
            });
        }
    };
};

/**
 * 获取链接，内部链接放在前面，外部链接放在后面
 *
 * @param linkMap 链接映射
 * @param docPath 文档路径
 * @return {string[]} 链接
 */
function getLinks(linkMap, docPath) {
    const internalLinkMap = {}, externalLinkMap = {};
    const links = (linkMap[docPath] || []).filter(link => link !== docPath);
    links.forEach(link => {
        if (/^[^:/#?]+:/.test(link)) {
            externalLinkMap[link] = true;
        } else {
            internalLinkMap[link] = true;
        }
    });
    return Object.keys(internalLinkMap).sort().concat(Object.keys(externalLinkMap).sort());
}
