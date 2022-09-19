const visit = require('unist-util-visit');
const isElement = require('hast-util-is-element');
const source = require('unist-util-source');

/**
 * 添加图片大小的后处理器，img标签中没有提供width和height属性时，根据图片大小给img标签添加width和height属性，配置属性：
 * * basePath: string 基础路径，文档中`<img>`标签的用法：`<img src="相对于basePath">`
 *
 * @param getImageSize 获取图片大小的服务
 */
module.exports = function addImageSize(getImageSize) {
    return function addImageSizeImpl() {
        return (tree, file) => {
            visit(tree, node => {
                if (!isElement(node, 'img')) {
                    return;
                }

                const imageProps = node.properties;
                const imageSrc = imageProps.src;
                if (!imageSrc) {
                    file.message('img标签中缺少src属性：`' + source(node, file) + '`');
                    return;
                }

                try {
                    const imageSize = getImageSize(addImageSizeImpl.basePath, imageSrc);
                    if (imageProps.width === undefined && imageProps.height === undefined) {
                        imageProps.width = '' + imageSize.width;
                        imageProps.height = '' + imageSize.height;
                    }
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        file.fail('无法加载img标签中src属性指定的图片：`' + source(node, file) + '`');
                    } else {
                        file.fail(error.message);
                    }
                }
            });
        };
    };
};
