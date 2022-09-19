'use strict';

const childProcess = require('child_process');
const semver = require('semver');

/**
 * 获取最新主版本的服务，按语义版本降序排序
 *
 * @param packageInfo 提供包信息的服务，参考：dgeni-packages/git
 * @param versionInfo 提供版本信息的服务，参考：dgeni-packages/git
 */
module.exports = function getMajorVersions(packageInfo, versionInfo) {
    return () => {
        // 使用远程tag，因为使用`git clone --depth=...`进行克隆时，本地仓库可能没有包含所有提交
        const repositoryUrl = packageInfo.repository.url;
        const gitTagsResult = childProcess.spawnSync('git', ['ls-remote', '--tags', repositoryUrl], {encoding: 'utf8'});
        if (gitTagsResult.status !== 0) {
            return [];
        }

        const tagVersionMap = {};
        const tagVersionMatcher = /refs\/tags\/(\d+.+)$/mg;
        gitTagsResult.stdout.replace(tagVersionMatcher, (_, tagVersionInfo) => {
            const tagVersion = semver.parse(tagVersionInfo);

            // 忽略不匹配语义版本格式的tag
            if (tagVersion === null) {
                return;
            }

            // 忽略预发版本的tag
            if (tagVersion.prerelease !== null && tagVersion.prerelease.length > 0) {
                return;
            }

            // 忽略主版本大于等于当前主版本的tag
            if (tagVersion.major >= versionInfo.currentVersion.major) {
                return;
            }

            // tag版本大于之前获取的tag版本时，更新tag主版本对应的tag版本
            const prevTagVersion = tagVersionMap[tagVersion.major];
            if (prevTagVersion === undefined || semver.compare(tagVersion, prevTagVersion) === 1) {
                tagVersionMap[tagVersion.major] = tagVersion;
            }
        });

        // tag版本降序排序
        return semver.sort(Object.values(tagVersionMap)).reverse();
    };
};
