/**
 * 对指定类型文档的描述进行分割的处理器，配置属性：
 * * docTypes: string[] 文档属性
 *
 * 文档描述被分割成两部分：
 * * shortDescription：第一个段落；
 * * description：剩余的段落。
 */
module.exports = function splitDocDescription() {
    return {
        docTypes: [],
        $runAfter: ['tags-extracted'],
        $runBefore: ['processing-docs'],
        $process(docs) {
            docs.forEach(doc => {
                if (this.docTypes.includes(doc.docType) && doc.description !== undefined) {
                    const description = doc.description.trim();
                    const firstParagraphEndIndex = description.search(/\n\s*\n/);
                    if (firstParagraphEndIndex === -1) {
                        doc.shortDescription = description;
                        doc.description = '';
                    } else {
                        doc.shortDescription = description.slice(0, firstParagraphEndIndex).trim();
                        doc.description = description.slice(firstParagraphEndIndex).trim();
                    }
                }
            });
        }
    };
};

