/**
 * 文档文件读取器，读取`.md`文件的内容，doc的初始格式为：
 *
 * ```
 * {
 *   content: '文件内容',
 *   startingLine: 1
 * }
 * ```
 */
module.exports = function documentFileReader() {
    return {
        name: 'documentFileReader',
        defaultPattern: /\.md$/,
        getDocs: function(fileInfo) {
            return [{
                docType: 'document',
                content: fileInfo.content
            }];
        }
    };
};
