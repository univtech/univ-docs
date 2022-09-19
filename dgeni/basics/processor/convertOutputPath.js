/**
 * 转换输出路径的处理器，在大写字母和`_`后面添加`_`，并把大写字母转换为小写字母
 */
module.exports = function convertOutputPath() {
    return {
        $runAfter: ['paths-computed'],
        $runBefore: ['rendering-docs', 'generateSitemap'],
        $process(docs) {
            for (const doc of docs) {
                if (!doc.outputPath) {
                    continue;
                }
                doc.outputPath = doc.outputPath.replace(/[A-Z_]/g, char => char.toLowerCase() + '_');
            }
        }
    };
};
