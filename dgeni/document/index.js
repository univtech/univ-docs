const Package = require('dgeni').Package;
const dgeniJsdoc = require('dgeni-packages/jsdoc');
const {requireFolder} = require('../config');

/**
 * document包
 */
module.exports = new Package('document', [dgeniJsdoc])

    // 注册文件读取器
    .factory(require('./reader/documentFileReader'))

    // 配置处理器：readFilesProcessor
    .config(function(readFilesProcessor, documentFileReader) {
        readFilesProcessor.fileReaders.push(documentFileReader);
    })

    // 配置处理器：parseTagsProcessor
    .config(function(parseTagsProcessor, getInjectables) {
        parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat(getInjectables(requireFolder(__dirname, './tag')));
    })

    // 配置处理器：computeIdsProcessor
    .config(function(computeIdsProcessor) {
        computeIdsProcessor.idTemplates.push({
            docTypes: ['document'],
            getId: function(doc) {
                return doc.fileInfo.relativePath.replace(/\.\w*$/, '');
            },
            getAliases: function(doc) {
                return [doc.id];
            }
        });
    });
