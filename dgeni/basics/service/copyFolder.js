const {copySync} = require('fs-extra');

/**
 * 复制文件夹的服务
 */
module.exports = function copyFolder() {
    return (source, target) => copySync(source, target);
};
