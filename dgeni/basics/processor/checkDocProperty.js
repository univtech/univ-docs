/**
 * 检查文档属性的处理器，配置属性：
 * * docCheckers: {} 文件检查器
 * * failOnError: boolean 发生错误时，是否抛出错误，停止检查，默认false
 *
 * 文档检查器格式：
 * ```
 * {
 *     [docType]: {
 *         [propertyName]: Array<(doc: Document, propertyName: string, propertyValue: any) => string|undefined>
 *     }
 * }
 * ```
 *
 * 属性检查器示例：
 * ```
 * function disallowHeadings(doc, propertyName, propertyValue) {
 *     const headingInfo = /^\s?#+\s+.*$/m.exec(propertyValue);
 *     if (headingInfo) {
 *         return `"${propertyName}"属性中不允许出现标题"${headingInfo[0]}"`;
 *     }
 * }
 * ```
 *
 * @param log 记录日志的服务
 * @param createDocMessage 创建文档信息的服务
 */
module.exports = function checkDocProperty(log, createDocMessage) {
    return {
        docCheckers: {},
        failOnError: false,
        $runAfter: ['tags-extracted'],
        $runBefore: [],
        $process(docs) {
            const docErrors = [];
            const logMessage = this.failOnError ? log.error.bind(log) : log.warn.bind(log);

            docs.forEach(doc => {
                const errors = [];
                const docCheckers = this.docCheckers[doc.docType] || {};

                if (docCheckers) {
                    Object.keys(docCheckers).forEach(propertyName => {
                        const propertyCheckers = docCheckers[propertyName];
                        propertyCheckers.forEach(propertyChecker => {
                            const error = propertyChecker(doc, propertyName, doc[propertyName]);
                            if (error) {
                                errors.push(error);
                            }
                        });
                    });
                }

                if (errors.length) {
                    docErrors.push({doc, errors});
                }
            });

            if (docErrors.length) {
                logMessage('文档存在错误');

                docErrors.forEach(docError => {
                    const errors = docError.errors.join('；\n');
                    logMessage(createDocMessage(errors + '\n', docError.doc));
                });

                if (this.failOnError) {
                    throw new Error('文档存在错误，停止检查');
                }
            }
        }
    };
};
