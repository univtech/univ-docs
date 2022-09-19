/**
 * 使用marked，把Markdown渲染为HTML的过滤器
 *
 * @param renderMarkdown 把Markdown渲染为HTML的服务
 */
module.exports = function markedNunjucksFilter(renderMarkdown) {
    return {
        name: 'marked',
        process: function(content, headingMap) {
            return content && renderMarkdown(content, headingMap);
        }
    };
};
