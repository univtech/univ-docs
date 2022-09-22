/**
 * 去掉索引页面内部链接上的`/index`
 */
module.exports = function fixInternalLink() {
    return {
        $runAfter: ['checkAnchorLinksProcessor'],
        $runBefore: ['addLinkComment'],
        $process: function(docs) {
            const internalLink = /(<a title="链接到此标题" [^>]*\/index)(#[^"]*)/g;
            docs.forEach(doc => {
                doc.renderedContent = doc.renderedContent.replace(internalLink, (_, prefix, hash) => {
                    return prefix.replace(/\/index$/, '') + hash;
                });
            });
        }
    };
};
