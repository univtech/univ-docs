const hasProperty = require('hast-util-has-property');
const isElement = require('hast-util-is-element');
const slug = require('rehype-slug');
const visit = require('unist-util-visit');

// 标题
const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

// CSS类：`no-anchor`
const noAnchorClass = 'no-anchor';

/**
 * 克隆对象
 *
 * @param object 克隆前的对象
 * @return {any} 克隆后的对象
 */
const cloneObject = object => JSON.parse(JSON.stringify(object));

/**
 * 判断节点的CSS类中是否存在指定的CSS类
 *
 * @param node 节点
 * @param className CSS类名
 * @return {*} ture：节点的CSS类中存在指定的CSS类；false：节点的CSS类中不存在指定的CSS类
 */
const hasClass = (node, className) => {
    const classNames = node.properties.className;
    return classNames && classNames.includes(className);
};

/**
 * 让remark给标题添加id并注入链接。
 * 这是简化版的[rehype-autolink-headings](https://github.com/wooorm/rehype-autolink-headings)，支持使用CSS类`no-anchor`来忽略标题。
 *
 * @param options 选项
 */
const autoLinkHeading = options => tree => visit(tree, node => {
    if (isElement(node, headings) && hasProperty(node, 'id') && !hasClass(node, noAnchorClass)) {
        node.children.push({
            type: 'element',
            tagName: 'a',
            properties: Object.assign(cloneObject(options.properties), {href: `#${node.properties.id}`}),
            children: cloneObject(options.content)
        });
    }
});

/**
 * 让remark给标题添加id并注入链接的后处理器
 */
module.exports = [
    slug,
    [autoLinkHeading, {
        properties: {
            title: '链接到此标题',
            className: ['header-link'],
            'aria-hidden': 'true'
        },
        content: [
            {
                type: 'element',
                tagName: 'i',
                properties: {className: ['material-icons']},
                children: [{type: 'text', value: 'link'}]
            }
        ]
    }]
];
