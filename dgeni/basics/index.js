const {extname, resolve} = require('canonical-path');
const {existsSync} = require('fs');
const path = require('path');

const Package = require('dgeni').Package;
const dgeniGit = require('dgeni-packages/git');
const dgeniJsdoc = require('dgeni-packages/jsdoc');
const dgeniNunjucks = require('dgeni-packages/nunjucks');
const dgeniPostProcessHtml = require('dgeni-packages/post-process-html');
const markdown = require('../markdown');

const {
    projectFolder,
    packageFile,
    srcFolder,
    dgeniTemplateFolder,
    contentNavigationFolder,
    contentImageFolder,
    srcContentNavigationFolder,
    srcContentDocumentFolder,
    srcContentImageFolder,
} = require('../config');

/**
 * basics包
 */
module.exports = new Package('basics', [dgeniGit, dgeniJsdoc, dgeniNunjucks, dgeniPostProcessHtml, markdown])

    // 注册处理器
    .processor(require('./processor/generateSearchData'))
    .processor(require('./processor/generateSitemap'))
    .processor(require('./processor/checkBacktickPair'))
    .processor(require('./processor/convertDocToJson'))
    .processor(require('./processor/addPathToInternalLink'))
    .processor(require('./processor/copyFolders'))
    .processor(require('./processor/addLinkComment'))
    .processor(require('./processor/checkDocProperty'))
    .processor(require('./processor/splitDocDescription'))
    .processor(require('./processor/convertOutputPath'))

    // 注册后处理器
    .factory(require('./post-processor/addImageSize'))

    // 重写服务：packageInfo
    .factory('packageInfo', function() {
        return require(packageFile);
    })

    // 注册服务
    .factory(require('./service/copyFolder'))
    .factory(require('./service/getImageSize'))
    .factory(require('./service/getMajorVersions'))

    // 配置处理器：inlineTagProcessor
    .config(function(inlineTagProcessor) {
        inlineTagProcessor.inlineTagDefinitions.push(require('./tag/searchKeywords/'));
    })

    // 配置处理器：readFilesProcessor
    .config(function(readFilesProcessor) {
        readFilesProcessor.basePath = projectFolder;
        readFilesProcessor.sourceFiles = [];
    })

    // 配置处理器：writeFilesProcessor
    .config(function(writeFilesProcessor) {
        writeFilesProcessor.outputFolder = srcContentDocumentFolder;
    })

    // 配置服务：templateFinder、templateEngine；配置处理器：renderDocsProcessor
    .config(function(templateFinder, templateEngine, renderDocsProcessor) {
        templateFinder.templateFolders = [dgeniTemplateFolder];
        templateFinder.templatePatterns = [
            '${ doc.template }',
            '${ doc.id }.${ doc.docType }.template.html',
            '${ doc.id }.template.html',
            '${ doc.docType }.template.html',
            '${ doc.id }.${ doc.docType }.template.json',
            '${ doc.id }.template.json',
            '${ doc.docType }.template.json',
        ];

        templateEngine.config.tags = {variableStart: '{$', variableEnd: '$}'};

        renderDocsProcessor.helpers.relativePath = function(source, target) {
            return path.relative(source, target);
        };
    })

    // 配置处理器：checkAnchorLinksProcessor
    .config(function(checkAnchorLinksProcessor) {
        checkAnchorLinksProcessor.$runAfter = ['addPathToInternalLink'];
        checkAnchorLinksProcessor.$runBefore = ['convertDocToJson'];
        checkAnchorLinksProcessor.checkDoc = doc => doc.path && doc.outputPath && extname(doc.outputPath) === '.json' && !['search-data', 'sitemap'].includes(doc.docType);
        checkAnchorLinksProcessor.base = '/';
        checkAnchorLinksProcessor.pathVariants = ['', '/', '.html', '/index.html', '#top-of-page'];
        checkAnchorLinksProcessor.errorOnUnmatchedLinks = true;
        checkAnchorLinksProcessor.ignoredLinks.push({
            test(url) {
                return existsSync(resolve(srcFolder, url));
            }
        });
    })

    // 配置处理器：generateSearchData
    .config(function(generateSearchData) {
        const ignoreWordsEn = require('./search/ignore-words-en.json');
        const ignoreWordsZh = require('./search/ignore-words-zh.json');
        generateSearchData.ignoreWords = Array.from(ignoreWordsEn).concat(ignoreWordsZh);
        generateSearchData.ignoreDocTypes = [undefined, 'search-data', 'sitemap'];
        generateSearchData.ignoreProperties = ['basePath', 'renderedContent', 'docType', 'searchTitle'];
        generateSearchData.outputFolder = '../search'; // 相对于srcContentDocumentFolder
    })

    // 配置处理器：generateSitemap
    .config(function(generateSitemap) {
        generateSitemap.ignoreDocTypes = [];
        generateSitemap.ignoreDocPaths = ['failure/404', 'failure/error'];
        generateSitemap.outputFolder = '../sitemap';   // 相对于srcContentDocumentFolder
    })

    // 配置处理器：copyFolders
    .config(function(copyFolders) {
        copyFolders.folderMap.push(
            {source: contentNavigationFolder, target: srcContentNavigationFolder},
            {source: contentImageFolder, target: srcContentImageFolder},
        );
    })

    // 配置后处理器：postProcessHtml、addImageSize
    .config(function(postProcessHtml, addImageSize) {
        addImageSize.basePath = srcFolder; // `<img src="相对于srcFolder">`
        postProcessHtml.plugins = [
            require('./post-processor/autoLinkHeading'),
            addImageSize,
            require('./post-processor/checkH1Heading')
        ];
    })

    // 配置处理器：convertDocToJson
    .config(function(convertDocToJson) {
        convertDocToJson.docTypes = [];
    })

    // 配置处理器：splitDocDescription
    .config(function(splitDocDescription) {
        splitDocDescription.docTypes = [];
    })

    // 配置处理器：addLinkComment
    .config(function(addLinkComment) {
        addLinkComment.docTypes = [];
    })

    // 配置处理器：checkDocProperty
    .config(function(checkDocProperty) {
        checkDocProperty.docCheckers = {};
        checkDocProperty.failOnError = false;
    });
