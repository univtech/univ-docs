const {resolve} = require('path');
const {readdirSync} = require('fs');

// 项目根目录
const projectFolder = resolve(__dirname, '..');

// package.json文件
const packageFile = resolve(projectFolder, 'package.json');

// src目录
const srcFolder = resolve(projectFolder, 'src');

// dgeni/template目录
const dgeniTemplateFolder = resolve(projectFolder, 'dgeni/template');

// content/extension目录
const contentExtensionFolder = resolve(projectFolder, 'content/extension');

// content/navigation目录
const contentNavigationFolder = resolve(projectFolder, 'content/navigation');

// content/document目录
const contentDocumentFolder = resolve(projectFolder, 'content/document');

// content/image目录
const contentImageFolder = resolve(projectFolder, 'content/image');

// src/content/extension目录
const srcContentExtensionFolder = resolve(projectFolder, 'src/content/extension');

// src/content/navigation目录
const srcContentNavigationFolder = resolve(projectFolder, 'src/content/navigation');

// src/content/document目录
const srcContentDocumentFolder = resolve(projectFolder, 'src/content/document');

// src/content/image目录
const srcContentImageFolder = resolve(projectFolder, 'src/content/image');

/**
 * 需要文件夹
 *
 * @param dirName 目录名称
 * @param folderPath 文件夹路径
 * @return {*[]} 文件夹路径
 */
function requireFolder(dirName, folderPath) {
    const absolutePath = resolve(dirName, folderPath);
    return readdirSync(absolutePath).filter(path => !/[._]spec\.js$/.test(path)).map(path => require(resolve(absolutePath, path)));
}

/**
 * 导出路径
 */
module.exports = {
    projectFolder,
    packageFile,
    srcFolder,
    dgeniTemplateFolder,
    contentExtensionFolder,
    contentNavigationFolder,
    contentDocumentFolder,
    contentImageFolder,
    srcContentExtensionFolder,
    srcContentNavigationFolder,
    srcContentDocumentFolder,
    srcContentImageFolder,
    requireFolder,
};
