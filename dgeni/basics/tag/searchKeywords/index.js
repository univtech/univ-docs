/**
 * 表示文档搜索关键词的标记，用法：
 *
 * ```
 * @searchKeywords keyword1 keyword2 keywordN
 * ```
 */
module.exports = {
    name: 'searchKeywords',
    description: '表示文档搜索关键词的标记，用法：@searchKeywords keyword1 keyword2 keywordN',
    handler: function(doc, tag, searchKeywords) {
        doc.searchKeywords = searchKeywords;
        return '';
    }
};
