/**
 * 使用这个脚本来运行生成文档的测试。
 * 不能直接使用Jasmine CLI，因为Jasmine CLI似乎并不理解glob，所以Jasmine CLI只能运行一个spec文件。
 * 同样，不能使用jasmine.json配置文件，因为jasmine.json配置文件不允许设置projectBaseDir，这就意味着只能在这个目录中运行Jasmine CLI。
 * 使用这样的文件可以完全控制jasmine，并保持package.json文件的简洁。
 */
const Jasmine = require('jasmine');
const jasmine = new Jasmine({projectBaseDir: __dirname});
jasmine.loadConfig({random: true, spec_files: ['**/*.spec.js']});
jasmine.execute().catch(error => {
    // 发生错误时，以非零代码退出，阻止进程成功
    console.error(error);
    process.exit(1);
});
