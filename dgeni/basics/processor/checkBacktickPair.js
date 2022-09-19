/**
 * 检查renderedContent中反引号（```）是否配对的处理器
 *
 * @param log 记录日志的服务
 * @param createDocMessage 创建文档信息的服务
 */
module.exports = function checkBacktickPair(log, createDocMessage) {
    return {
        $runAfter: ['inlineTagProcessor'],
        $runBefore: ['writeFilesProcessor'],
        $process: function(docs) {
            const backtick = /^ *```/gm;
            docs.forEach(doc => {
                if (!doc.renderedContent) {
                    return;
                }
                const backtickInfo = doc.renderedContent.match(backtick);
                if (backtickInfo && backtickInfo.length % 2 !== 0) {
                    doc.unbalancedBackTicks = true;
                    log.warn(createDocMessage('renderedContent中反引号（```）不配对', doc));
                    log.warn(doc.renderedContent);
                }
            });
        }
    };
};
