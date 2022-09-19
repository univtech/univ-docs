/**
 * 在hash开头的内部链接上添加文档路径的处理器
 */
module.exports = function addPathToInternalLink() {
    return {
        $runAfter: ['inlineTagProcessor'],
        $runBefore: ['convertDocToJson'],
        $process: function(docs) {
            const internalLink = /(<a [^>]*href=")(#[^"]*)/g;
            docs.forEach(doc => {
                doc.renderedContent = doc.renderedContent.replace(internalLink, (_, prefix, hash) => {
                    return prefix + doc.path + hash;
                });
            });
        }
    };
};
