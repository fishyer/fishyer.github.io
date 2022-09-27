---
link: https://www.notion.so/git-Syncthing-e7464450d9144ca7ad6cc56632283bf6
notionID: e7464450-d914-4ca7-ad6c-c56632283bf6
---

#! https://zhuanlan.zhihu.com/p/432554268

这是一套开源免费的文件夹管理工具流，适合文档管理、代码管理、图片管理等

![](https://yupic.oss-cn-shanghai.aliyuncs.com/202111121558005.png)


## 核心思路

就是将项目文件夹同时用git和Syncthing管理

不过我更建议的操作是电脑上同时存在两个文件夹：
1. 一个文件夹作为本地仓库，主要用于提交修改记录
2. 另一个文件夹作为远程仓库，主要用于和其它设备同步

为什么不直接在一个文件夹里面既管理版本记录，又多端同步呢？
因为修改记录可能很频繁，随时自动同步容易因为同步不及时导致莫名的冲突问题，建议用定期提交修改记录的方式来同步

## [[Git]]的优点

1. 可以查看每一个版本的所有文件修改详情
2. 可以查看单个文件的历史版本详情
3. 可以恢复到任意一个版本
4. 可以对比两个版本之间的差异

## [[MyObsidianNote/Archive/01-Inbox/syncthing]]的优点

1. 可以多端自动同步，支持[[Windwos]]、[[macOS]]、[[MyObsidianNote/Archive/01-Inbox/Android]]、[[MyHulu/archive/MyLogseq/pages/Linux]]、[[MyObsidianNote/Inbox/ios]]
2. 基于P2P技术，去中心化，无服务器，安全，保证隐私

## 操作流程

建议直接使用[[Git-GUI工具]]：[[MyObsidianNote/Inbox/sourcetree]]或[[MyObsidianNote/Archive/01-Inbox/vscode]]，而非命令行操作

以下代码主要是体现思路：

1. 创建本地仓库

```shell
cd ~/project
git init
git add .
git commit -m “first commit”
```

2. 创建远程仓库

```shell
mkdir -p ~/Downloads/Syncthing/MyNote
cd ~/Syncthing/project
git init --bare
```

3. 提交本地仓库的文件到远程仓库中

```shell
cd ~/project
git remote add origin ~/Downloads/Syncthing/MyNote-Remote
git push origin master
```

## Relate

[[MyObsidianNote/Archive/01-Inbox/git init 和 git init –bare 的区别]]

## Reference

1. [猴子都能懂的GIT入门 | 贝格乐（Backlog）](https://backlog.com/git-tutorial/cn/)
2. [Syncthing - P2P文件同步工具 - 知乎](https://zhuanlan.zhihu.com/p/69267020)
3. [你的github-通过坚果云管理您的代码 | [[坚果云]]博客](http://jianguoyun.blog.techweb.com.cn/archives/80.html)
4. [git init 与 git init --bare 区别 - 陈浩然201 - 博客园](https://www.cnblogs.com/irockcode/p/8761954.html)