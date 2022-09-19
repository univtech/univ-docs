/**
 * 表示文档最后审核日期的标记，用法：
 *
 * ```
 * @reviewed yyyy-MM-dd
 * ```
 *
 * @param createDocMessage 创建文档信息的服务
 */
module.exports = function reviewed(createDocMessage) {
    return {
        name: 'reviewed',
        transforms(doc, tag, date) {
            if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(date.trim())) {
                throw new Error(createDocMessage(`文档最后审核日期@${tag.tagName} ${date}的格式必须为：@reviewed yyyy-MM-dd\n`, doc));
            }
            return {date: new Date(date)};
        }
    };
};
