const visit = require('unist-util-visit');
const isElement = require('hast-util-is-element');
const toString = require('hast-util-to-string');
const filter = require('unist-util-filter');

/**
 * 检查是否存在多个h1标题的后处理器
 */
module.exports = function checkH1Heading() {
    return (tree, file) => {
        file.headings = {
            h1: [],
            h2: [],
            h3: [],
            h4: [],
            h5: [],
            h6: [],
            hgroup: []
        };

        visit(tree, node => {
            if (isElement(node, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup'])) {
                file.headings[node.tagName].push(getHeadingText(node));
            }
        });

        file.title = file.headings.h1[0];
        if (file.headings.h1.length > 1) {
            file.fail(`在${file}中找到多个h1标题`);
        }
    };
};

/**
 * 获取标题文本
 *
 * @param headingNode 标题节点
 * @return {*|string} 标题文本
 */
function getHeadingText(headingNode) {
    // 从标题节点中过滤掉aria-hidden链接
    const filteredNode = filter(headingNode, node => !(isElement(node, 'a') && node.properties && (node.properties.ariaHidden === 'true' || node.properties['aria-hidden'] === 'true')));
    return filteredNode ? toString(filteredNode) : '';
}
