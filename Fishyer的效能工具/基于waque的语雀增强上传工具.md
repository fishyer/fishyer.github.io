---
link: https://www.notion.so/waque-c0aa5589b64c46259b4f4047ada310d9
notionID: c0aa5589-b64c-4625-9b4f-4047ada310d9
---

这是用[瓦雀-命令行工具](https://github.com/yesmeck/waque)来同步本地md文件夹到[语雀知识库](https://www.yuque.com/waquehq/docs/getting-started)的模板。

## 1-效果网站

网站： [Fishyer的测试仓库 · Yuque](https://www.yuque.com/fishyer/test)

源码： [fishyer/yuque-test](https://github.com/fishyer/yuque-test)

## 2-特色

本地md文件夹 -> 语雀知识库，初始配置完成后，后续使用都是无感知的，很方便我们像玩本地文件夹那样去玩语雀知识库。

![](https://yupic.oss-cn-shanghai.aliyuncs.com/202208281558795.png)

![](https://yupic.oss-cn-shanghai.aliyuncs.com/202208281628556.png)

## 3-部署要求

1. 克隆本仓库，然后将自己的md文件夹都放到exports文件夹下面，我原有的md文件，不建议删除，移动到一个子文件夹里面即可，里面有些md笔记可能你会用得到
2. 本仓库需要用瓦雀这个nodejs库、还用到了自己写的一个python脚本，所以你的电脑也需要nodejs环境和python环境
3. 需要你对git有一点点了解，当然如果你用的是Obsidian、Logseq、VSCode这种很方便集成git插件的本地md编辑器，那其实你可以不了解git
 
因为本模板主要是利用git hook机制实现本地保存笔记时的自动上传到语雀的

其实不需要自动同步的话，也可以手动运行`sh test-shell`来上传md文件夹

![](https://yupic.oss-cn-shanghai.aliyuncs.com/202208281618844.png)

## 4-使用方法

1. 先安装瓦雀，然后参考[瓦雀的基础教程](https://www.yuque.com/waquehq/docs/getting-started)
熟悉这四个指令：

waque login
waque init
waque export
waque upload

2. 然后修改yuque.yml中的这3个参数，具体样式以配置文件中的为准。

repo: 'fishyer/test'
author: Fishyer
targetUrl: https://www.yuque.com/fishyer/test

version:: 100