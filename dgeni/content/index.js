const Package = require('dgeni').Package;
const basics = require('../basics');
const document = require('../document');
const {contentDocumentFolder} = require('../config');

/**
 * content包
 */
module.exports = new Package('content', [basics, document])

    // 配置处理器：readFilesProcessor
    .config(function(readFilesProcessor) {
        readFilesProcessor.sourceFiles = readFilesProcessor.sourceFiles.concat([
            {
                basePath: contentDocumentFolder,
                include: contentDocumentFolder + '/**/*.{html,md}',
                fileReader: 'documentFileReader'
            }
        ]);
    })

    // 配置处理器：computePathsProcessor
    .config(function(computePathsProcessor) {
        computePathsProcessor.pathTemplates = computePathsProcessor.pathTemplates.concat([
            {
                docTypes: ['document'],
                getPath: doc => `${doc.id}`,
                outputPathTemplate: '${path}.json'
            }
        ]);
    })

    // 配置处理器：convertDocToJson、postProcessHtml
    .config(function(convertDocToJson, postProcessHtml) {
        convertDocToJson.docTypes.push('document');
        postProcessHtml.docTypes.push('document');
    });
