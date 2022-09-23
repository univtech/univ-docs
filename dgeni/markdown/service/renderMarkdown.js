const remark = require('remark');
const remarkHtml = require('remark-html');
const code = require('../handler/code');
const handleHeadingDepth = require('../plugin/handleHeadingDepth');

/**
 * 把Markdown渲染为HTML的服务
 */
module.exports = function renderMarkdown() {

    /**
     * Markdown渲染器
     *
     * @param content 渲染前的Markdown
     * @param headingMap 标题映射，key：标题；value：标题，例如：`{'h3': 'h4'}`
     * @return {string} 渲染后的HTML
     */
    return function renderMarkdownImpl(content, headingMap) {
        const renderer = remark()
            .use(handleIndentedCode)
            .use(handleInlineTag)
            .use(handlePlainHTMLBlocks)
            .use(handleHeadingDepth(headingMap))
            .use(remarkHtml, {handlers: {code}, sanitize: false});
        return renderer.processSync(content).toString();
    };

    /**
     * 处理缩进代码块，不渲染缩进代码块
     */
    function handleIndentedCode() {
        const blockMethods = this.Parser.prototype.blockMethods;
        blockMethods.splice(blockMethods.indexOf('indentedCode'), 1);
    }

    /**
     * 处理内联标签，不包装段落中的块级标签，不处理标签中的文本
     */
    function handleInlineTag() {
        const blockTokenizers = this.Parser.prototype.blockTokenizers;
        const blockMethods = this.Parser.prototype.blockMethods;
        const inlineTokenizers = this.Parser.prototype.inlineTokenizers;
        const inlineMethods = this.Parser.prototype.inlineMethods;

        blockTokenizers.inlineTag = inlineTagTokenizer;
        blockMethods.splice(blockMethods.indexOf('paragraph'), 0, 'inlineTag');

        inlineTokenizers.inlineTag = inlineTagTokenizer;
        inlineMethods.splice(blockMethods.indexOf('text'), 0, 'inlineTag');

        inlineTagTokenizer.notInLink = true;
        inlineTagTokenizer.locator = inlineTagLocator;

        function inlineTagTokenizer(eat, content, silent) {
            const inlineTagInfo = /^\{@[^\s}]+[^}]*\}/.exec(content);
            if (inlineTagInfo) {
                if (silent) {
                    return true;
                }
                return eat(inlineTagInfo[0])({
                    'type': 'inlineTag',
                    'value': inlineTagInfo[0]
                });
            }
        }

        function inlineTagLocator(content, fromIndex) {
            return content.indexOf('{@', fromIndex);
        }
    }

    /**
     * 处理普通HTML块，不处理不包含Markdown的HTML块
     */
    function handlePlainHTMLBlocks() {
        const plainBlocks = ['univ-code-example', 'univ-code-tab'];
        const plainBlockMatcher = new RegExp('^' + buildOpenElement(`(${plainBlocks.join('|')})`));
        const blockTokenizers = this.Parser.prototype.blockTokenizers;
        const blockMethods = this.Parser.prototype.blockMethods;

        blockTokenizers.plainHTMLBlocks = plainHTMLBlocksTokenizer;
        blockMethods.splice(blockMethods.indexOf('html'), 0, 'plainHTMLBlocks');

        function plainHTMLBlocksTokenizer(eat, content, silent) {
            const plainBlockInfo = plainBlockMatcher.exec(content);
            if (plainBlockInfo) {
                const blockName = plainBlockInfo[1];
                try {
                    const matchedContent = findMatchedContents(content, buildOpenElement(blockName), buildCloseElement(blockName), '')[0];
                    if (silent || !matchedContent) {
                        return !!matchedContent;
                    }
                    return eat(matchedContent[0])({
                        type: 'html',
                        value: matchedContent[0]
                    });
                } catch (error) {
                    this.file.fail('HTML块标签不匹配：' + error.message);
                }
            }
        }
    }

};

/**
 * 查找匹配内容，必须确保左右分隔符产生互斥匹配，右分隔符与左分隔符的内部组合方式决定了右分隔符中不支持反向引用。
 *
 * ```
 * findMatchedContents("test", "\\(", "\\)")                                        返回：[]
 * findMatchedContents("<t<<e>><s>>t<>", "<", ">", "g")                             返回：["t<<e>><s>", ""]
 * findMatchedContents("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi") 返回：["test"]
 * ```
 *
 * @param searchContent 待查找内容
 * @param leftDelimiter 左边分隔符，作为正则表达式模式
 * @param rightDelimiter 右边分隔符，作为正则表达式模式
 * @param regexFlags 可选的正则表达式标记，g标记：查找所有匹配内容，否则只查找第一个匹配内容；i标记：大小写不敏感，否则大小写敏感
 * @return {*[]} 匹配内容，可能嵌套左分隔符或右分隔符
 */
function findMatchedContents(searchContent, leftDelimiter, rightDelimiter, regexFlags) {
    'use strict';
    const matchedContents = [];
    const matchedPositions = findMatchedPositions(searchContent, leftDelimiter, rightDelimiter, regexFlags);

    for (let index = 0; index < matchedPositions.length; index++) {
        matchedContents.push([
            searchContent.slice(matchedPositions[index].wholeContentRange.start, matchedPositions[index].wholeContentRange.end),
            searchContent.slice(matchedPositions[index].realContentRange.start, matchedPositions[index].realContentRange.end),
            searchContent.slice(matchedPositions[index].leftDelimiterRange.start, matchedPositions[index].leftDelimiterRange.end),
            searchContent.slice(matchedPositions[index].rightDelimiterRange.start, matchedPositions[index].rightDelimiterRange.end)
        ]);
    }
    return matchedContents;
}

/**
 * 查找匹配位置
 *
 * @param searchContent 待查找内容
 * @param leftDelimiter 左边分隔符，作为正则表达式模式
 * @param rightDelimiter 右边分隔符，作为正则表达式模式
 * @param regexFlags 可选的正则表达式标记，g标记：查找所有匹配内容，否则只查找第一个匹配内容；i标记：大小写不敏感，否则大小写敏感
 * @return {*[]} 匹配位置
 */
function findMatchedPositions(searchContent, leftDelimiter, rightDelimiter, regexFlags) {
    'use strict';
    regexFlags = regexFlags || '';
    const includesGlobalFlag = regexFlags.includes('g');
    const leftDelimiterMatcher = new RegExp(leftDelimiter, removeGlobalFlag(regexFlags));
    const rightDelimiterMatcher = new RegExp(rightDelimiter, removeGlobalFlag(regexFlags));
    const bothDelimiterMatcher = new RegExp(leftDelimiter + '|' + rightDelimiter, 'g' + removeGlobalFlag(regexFlags));
    let leftStartIndex = 0, leftEndIndex = 0, rightStartIndex = 0, rightEndIndex = 0, delimiterCount = 0, delimiterInfo, matchedPositions = [];

    while ((delimiterInfo = bothDelimiterMatcher.exec(searchContent))) {
        if (leftDelimiterMatcher.test(delimiterInfo[0]) && !delimiterCount++) {
            leftStartIndex = delimiterInfo.index;
            leftEndIndex = delimiterInfo.index + delimiterInfo[0].length;
        } else if (rightDelimiterMatcher.test(delimiterInfo[0]) && !--delimiterCount) {
            rightStartIndex = delimiterInfo.index;
            rightEndIndex = delimiterInfo.index + delimiterInfo[0].length;

            matchedPositions.push({
                leftDelimiterRange: {start: leftStartIndex, end: leftEndIndex},
                rightDelimiterRange: {start: rightStartIndex, end: rightEndIndex},
                realContentRange: {start: leftEndIndex, end: rightStartIndex},
                wholeContentRange: {start: leftStartIndex, end: rightEndIndex}
            });

            if (!includesGlobalFlag) {
                return matchedPositions;
            }
        }
    }

    if (delimiterCount) {
        throw new Error(`左右分隔符不配对，待查找内容：${searchContent}；左边分隔符：${leftDelimiter}；右边分隔符：${rightDelimiter}`);
    }
    return matchedPositions;
}

/**
 * 去掉正则表达式标记中的g标记
 *
 * @param regexFlags 正则表达式标记
 * @return {*} 不含g标记的正则表达式标记
 */
function removeGlobalFlag(regexFlags) {
    return regexFlags.replace(/g/g, '');
}

/**
 * 构建开始元素
 *
 * @param elementName 元素名称
 * @return {string} 开始元素
 */
function buildOpenElement(elementName) {
    const attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
    const unquotedValue = '[^"\'=<>`\\u0000-\\u0020]+';
    const singleQuotedValue = '\'[^\']*\'';
    const doubleQuotedValue = '"[^"]*"';
    const attributeValue = '(?:' + unquotedValue + '|' + singleQuotedValue + '|' + doubleQuotedValue + ')';
    const attribute = '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)';
    return `<${elementName}${attribute}*\\s*>`;
}

/**
 * 构建结束元素
 *
 * @param elementName 元素名称
 * @return {string} 结束元素
 */
function buildCloseElement(elementName) {
    return `</${elementName}>`;
}
