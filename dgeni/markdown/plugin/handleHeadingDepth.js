const visit = require('unist-util-visit');

/**
 * 修复标题深度的插件
 *
 * @param headingMap 标题映射，key：标题；value：标题，例如：`{'h3': 'h4'}`
 */
module.exports = function handleHeadingDepth(headingMap) {
    const headingLevelMap = getHeadingLevels(headingMap || {});
    return () => tree => {
        const fixNodes = [];
        Object.keys(headingLevelMap).forEach(headingLevel => {
            visit(tree, 'heading', node => {
                if (node.depth === Number(headingLevel)) {
                    fixNodes.push(node);
                }
            });
        });
        fixNodes.forEach(node => node.depth = headingLevelMap[node.depth]);
        return tree;
    };
};

/**
 * 获取标题级别映射
 *
 * @param headingMap 标题映射，key：标题；value：标题，例如：`{'h3': 'h4'}`
 * @return {{}} 标题级别映射，key：标题级别；value：标题级别，例如：`{'3': '4'}`
 */
function getHeadingLevels(headingMap) {
    const headingLevelMap = {};
    Object.keys(headingMap).forEach(heading => headingLevelMap[getHeadingLevel(heading)] = getHeadingLevel(headingMap[heading]));
    return headingLevelMap;
}

/**
 * 获取标题级别
 *
 * @param heading 标题
 * @return {string|string} 标题级别或0
 */
function getHeadingLevel(heading) {
    const headingInfo = /^h(\d+)/.exec(heading);
    return headingInfo ? headingInfo[1] : '0';
}
