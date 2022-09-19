const Package = require('dgeni').Package;

/**
 * markdown包，使用remark重写renderMarkdown服务
 */
module.exports = new Package('markdown', ['nunjucks'])

    // 注册过滤器
    .factory(require('./filter/markedNunjucksFilter'))

    // 注册服务
    .factory(require('./service/renderMarkdown'));
