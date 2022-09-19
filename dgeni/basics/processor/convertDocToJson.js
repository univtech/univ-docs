/**
 * 把文档转换为JSON的处理器，配置属性：
 * * docTypes: string[] 文档类型
 *
 * @param log 记录日志的服务
 * @param createDocMessage 创建文档信息的服务
 */
module.exports = function convertDocToJson(log, createDocMessage) {
    return {
        docTypes: [],
        $runAfter: ['checkBacktickPair'],
        $runBefore: ['writeFilesProcessor'],
        $process: function(docs) {
            docs.forEach(doc => {
                if (this.docTypes.includes(doc.docType)) {
                    let title = doc.title;

                    if (title === undefined) {
                        title = (doc.vFile && doc.vFile.title);
                    }

                    if (title === undefined) {
                        title = doc.name;
                    }

                    if (title === undefined) {
                        title = '';
                        log.warn(createDocMessage('标题属性异常', doc));
                    }

                    let content = doc.renderedContent || '';
                    doc.renderedContent = JSON.stringify({id: doc.path, title, content}, null, 4);
                }
            });
        }
    };
};
