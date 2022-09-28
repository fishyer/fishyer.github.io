## 为什么创建这个网站

以前折腾过很多种博客搭建方式：WordPress、Hexo、Hugo、Github Pages、Notion+Nobu

Obsidian是管理本地md文件的神器，而Docsify是分享md文件的神器，Vercel是部署静态网站的神器。三者结合，简直如虎添翼。

这一套搭配的优点有：

1. 所有的工具、资源都是免费的
2. docsify生成文档网站非常简单，只需要创建一个 index.html
3. 相比于“文件夹+Markdown”，Obsidian在保证了本地化的同时，提供了更高效的文档组织管理方式

这一套搭配的缺点有：

1. 前期配置有一丢丢的学习成本，要配置一个html文件，不过完全可以直接复制我的
2. Vercel站点没啥流量，搭建站点是自娱自乐。但是可以配置Zhihu-On-VSCode发布到知乎来引流，就不怕酒香无人问了

## 它和Logseq站点的区别

一个是文档，一个是大纲

## 为什么不用语雀

因为它和Obsidian结合的更自然，全自动

## 如何部署

克隆我的Github模板
- MyObsdian模板【待分享】

要修改的点：
下面的4个仓库名

创建4个Github站点
- MyObsidian 私有仓库，所有笔记都存在这【和本地的Obsidian文件夹同步即可】
- MyLogseq 私有仓库，所有的大纲笔记都存在这【无须管理，本来可以不用的，它是由MyObsidian导出的一个子文件夹-MyLogseq，目的是为了自动化生成logseq的公开图片】
- MyLogseq-Publish，公开仓库，自动导出的所有的公开大纲笔记，自动部署成 logseq.fishyer.com
- fishyer.github.io，公开仓库，等价于MyDocsify，所有的文档笔记都存在这，自动部署成 docsify.fishyer.com


