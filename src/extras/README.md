# extras

部署到firebase时应该包含的其他文件。

在应用程序构建之后和部署之前，这个文件夹中与当前部署模式（stable）名称相同的所有文件和文件夹，都会被复制到dist文件夹。

更多信息请参考：scripts/deploy-to-firebase/index.mjs

注意：这个脚本总是期望存在一个用于当前部署模式的文件夹，即便这个文件夹是空的。


