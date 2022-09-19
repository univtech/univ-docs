/**
 * 复制文件夹的处理器，配置属性：
 * * folderMap: *[] 文件夹映射
 *
 * 文件夹映射格式：
 * ```
 * [{source: sourceFolder, target: targetFolder}]
 * ```
 *
 * @param copyFolder 复制文件夹的服务
 */
module.exports = function copyFolders(copyFolder) {
    return {
        folderMap: [],
        $runBefore: ['postProcessHtml'],
        $process() {
            this.folderMap.forEach(folder => {
                copyFolder(folder.source, folder.target);
            });
        }
    };
};
