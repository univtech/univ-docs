'use strict';

/**
 * 提取文档关键词，生成搜索数据的处理器，配置属性：
 * * ignoreDocTypes: string[] 忽略文档类型
 * * ignoreWords: string[] 忽略词汇
 * * ignoreProperties: string[] 忽略属性
 * * outputFolder: string 输出文件夹
 */
module.exports = function generateSearchData() {
    return {
        ignoreDocTypes: [],
        ignoreWords: [],
        ignoreProperties: [],
        outputFolder: '',
        $validate: {
            ignoreDocTypes: {},
            ignoreWords: {},
            ignoreProperties: {},
            outputFolder: {presence: true}
        },
        $runAfter: ['postProcessHtml'],
        $runBefore: ['writing-files'],
        async $process(docs) {
            const {stemmer: stemmer} = await import('stemmer'); // 词干分析器
            const keywordMap = new Map();                       // 关键词映射，key：关键词；value：关键词索引
            const filteredDocs = docs.filter(doc => !this.ignoreDocTypes.includes(doc.docType));

            for (const doc of filteredDocs) {
                // 获取标题关键词索引
                let headingKeywordIndexs = [];
                if (doc.vFile && doc.vFile.headings) {
                    for (const headingName of Object.keys(doc.vFile.headings)) {
                        for (const headingText of doc.vFile.headings[headingName]) {
                            headingKeywordIndexs.push(...getKeywordIndexs(stemmer, headingText, this.ignoreWords, keywordMap));
                        }
                    }
                }

                // 获取属性关键词索引
                let propertyKeywordIndexs = [];
                for (const propertyName of Object.keys(doc)) {
                    const propertyValue = doc[propertyName];
                    if (typeof propertyValue === 'string' && !this.ignoreProperties.includes(propertyName)) {
                        propertyKeywordIndexs.push(...getKeywordIndexs(stemmer, propertyValue, this.ignoreWords, keywordMap));
                    }
                }

                // 设置搜索标题
                doc.searchTitle = doc.searchTitle || doc.title || doc.vFile && doc.vFile.title || doc.name || '';

                // 添加搜索数据
                doc.searchTerms = {};
                if (doc.searchKeywords) {
                    doc.searchTerms.topics = doc.searchKeywords.trim();
                }
                if (headingKeywordIndexs.length > 0) {
                    doc.searchTerms.headings = headingKeywordIndexs;
                }
                if (propertyKeywordIndexs.length > 0) {
                    doc.searchTerms.keywords = propertyKeywordIndexs;
                }
            }

            // 生成搜索数据
            const searchData = {
                words: Array.from(keywordMap.keys()).join(' '),
                pages: filteredDocs.map(doc => {
                    const page = {
                        path: doc.path,
                        type: doc.docType,
                        title: doc.searchTitle,
                    };
                    return Object.assign(page, doc.searchTerms);
                }),
            };

            // 添加搜索数据文档
            docs.push({
                docType: 'search-data',
                id: 'search-data',
                path: this.outputFolder + '/search-data.json',
                outputPath: this.outputFolder + '/search-data.json',
                template: 'search-data.template.json',
                data: searchData,
                renderedContent: JSON.stringify(searchData)
            });

            return docs;

            /**
             * 获取关键词索引
             *
             * @param stemmer 词干分析器
             * @param text 文本
             * @param ignoreWords 忽略词汇
             * @param keywordMap 键词映射，key：关键词；value：关键词索引
             * @return number[] 关键词索引
             */
            function getKeywordIndexs(stemmer, text, ignoreWords, keywordMap) {
                const keywordIndexs = [];
                const keywords = text.split(new RegExp('[\\s/]+|</?[a-z]+(?:\\s+\\w+(?:="[^"]+")?)*/?>', 'ig')); // 去掉空格或HTML标签

                for (let keyword of keywords) {
                    const triviaChars = '[\\s_"\'`({[<$*)}\\]>.,-]'; // 去掉不需要的琐碎字符
                    const validKeyword = '[a-z0-9_.-]*[a-z0-9]';     // 关键词中可以包含：字母、数字、下划线、点号、连字符
                    keyword = keyword.trim().replace(new RegExp(`^${triviaChars}*(${validKeyword})${triviaChars}*$`, 'i'), '$1');

                    // 关键词为空、关键词属于忽略词汇、关键词中包含怪异字符时，忽略关键词
                    if (keyword === '' || ignoreWords.includes(keyword.toLowerCase()) || !/^\w[\w.-]*$/.test(keyword)) {
                        continue;
                    }
                    saveKeyword(stemmer, keyword, keywordIndexs, keywordMap);
                }
                return keywordIndexs;
            }

            /**
             * 保存关键词
             *
             * @param stemmer 词干分析器
             * @param keyword 关键词
             * @param keywordIndexs 关键词索引
             * @param keywordMap 键词映射，key：关键词；value：关键词索引
             */
            function saveKeyword(stemmer, keyword, keywordIndexs, keywordMap) {
                keyword = stemmer(keyword);
                if (!keywordMap.has(keyword)) {
                    keywordMap.set(keyword, keywordMap.size);
                }
                keywordIndexs.push(keywordMap.get(keyword));
            }
        }
    };
};
