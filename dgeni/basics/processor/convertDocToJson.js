/**
 * 把文档转换为JSON的处理器，配置属性：
 * * docTypes: string[] 文档类型
 */
module.exports = function convertDocToJson() {
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
                        title = '无标题文档'; // 暂不需要使用文档标题
                    }

                    let content = doc.renderedContent || '';
                    doc.renderedContent = JSON.stringify({id: doc.path, title, content}, null, 4);
                }
            });
        }
    };
};
