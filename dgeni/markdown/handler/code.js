/**
 * 把Markdown代码块渲染为`<univ-code-example>`标签的处理器，代码节点示例：
 *
 * ```
 * {
 *     type: 'code',
 *     lang: 'java',
 *     meta: null,
 *     value: 'public class Test {\n\n}',
 *     position: Position {
 *         start: { line: 20, column: 1, offset: 750 },
 *         end: { line: 24, column: 4, offset: 784 },
 *         indent: [ 1, 1, 1, 1 ]
 *     }
 * }
 * ```
 *
 * @param handler 代码渲染器
 * @param node 代码节点
 * @return {*} `<univ-code-example>`标签
 */
module.exports = function code(handler, node) {
    const code = node.value ? ('\n' + node.value + '\n') : '';
    const lang = node.lang && node.lang.match(/^[^ \t]+(?=[ \t]|$)/);
    const props = {};

    if (lang) {
        props.language = lang;
    }
    return handler(node, 'univ-code-example', props, [{type: 'text', value: code}]);
};
