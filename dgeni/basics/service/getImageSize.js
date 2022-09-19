const {join} = require('canonical-path');
const imageSize = require('image-size');

/**
 * 获取图片大小的服务
 */
module.exports = function getImageSize() {
    return (basePath, path) => imageSize(join(basePath, path));
};
