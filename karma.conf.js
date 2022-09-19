// Karma配置文件，参考：https://karma-runner.github.io/1.0/config/configuration-file.html
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma'),
            {'reporter:jasmine-seed': ['type', JasmineSeedReporter]},
        ],
        proxies: {
            '/dummy/image': 'src/assets/images/logos/univ.png',
        },
        client: {
            clearContext: false, // 使Jasmine Spec Runner的输出在浏览器中可见
            jasmine: {
                // 添加Jasmine配置选项，选项参考：https://jasmine.github.io/api/edge/Configuration.html
                // 例如，禁用随机执行：`random: false`；设置特定种子：`seed: 4321`
                random: true,
                seed: '',
            },
        },
        jasmineHtmlReporter: {
            suppressAll: true // 删除重复跟踪
        },
        coverageReporter: {
            dir: require('path').join(__dirname, './coverage/site'),
            subdir: '.',
            reporters: [
                {type: 'html'},
                {type: 'text-summary'}
            ],
        },
        reporters: ['progress', 'kjhtml', 'jasmine-seed'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                // 参考：/integration/README.md#browser-tests
                flags: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars', '--mute-audio'],
            },
        },
        browsers: ['ChromeHeadlessNoSandbox'],
        browserNoActivityTimeout: 60000,
        singleRun: false,
        restartOnFileChange: true,
    });
};

function JasmineSeedReporter(baseReporterDecorator) {
    baseReporterDecorator(this);

    this.onBrowserComplete = (browser, result) => {
        const seed = result.order && result.order.random && result.order.seed;
        if (seed) this.write(`${browser}: 随机种子 ${seed}.\n`);
    };

    this.onRunComplete = () => undefined;
}
