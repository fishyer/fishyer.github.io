#! https://zhuanlan.zhihu.com/p/425602037

# Chrome-使用uBlacklist插件-清除内容农场-优化搜索结果

#Chrome

> 本文是[清理「内容农场」，还你清爽的 Google 中文搜索体验 - 少数派](https://sspai.com/post/69407) 的内容摘要，更多详细内容可查看原文。为什么要做内容摘要，因为原文太长了，我想要的也只是清除内容农场，提高搜索质量而已，至于内容农场的来龙去脉以及各种插件方案对比，我并不关心，选择一个最好的就行了。
## 为什么要清除内容农场

所谓内容农场，就是一些垃圾网站，这些网站自己不产出内容，却凭借针对性的 SEO 极力提升在搜索引擎中的权重并从中牟利。

内容农场的文章通常直接爬取自其它平台，用自动化程序实现从采集到发布的一整套流程：比较不讲究的，就是聚合下社交网络热门关键词，拼凑生成网页，主动推送至各大搜索引擎，能骗一个是一个；稍微先进点的，会扒下整篇文章，掐头去尾，再加上自己的水印，甚至直接复刻一个李鬼网站；技术力再高一点，可能从 Stack Overflow、GitHub 等外国网站搜刮热门内容，机器翻译后当成自家原创，或者干脆中翻英再翻中，让读者难以找到原文出处。
## 怎么清除内容农场

1. 安装插件：[uBlacklist - Chrome 网上应用店](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe/related)
2. 在插件黑名单列表中添加订阅源
	1. [Google-Chinese-Results-Blocklist-精确匹配](https://raw.githubusercontent.com/cobaltdisco/Google-Chinese-Results-Blocklist/master/uBlacklist_subscription.txt)
	2. [Google-Chinese-Results-Blocklist-模糊匹配](https://raw.githubusercontent.com/cobaltdisco/Google-Chinese-Results-Blocklist/master/uBlacklist_match_patterns.txt)
	3. [uBlacklist-subscription-compilation](https://cdn.jsdelivr.net/gh/eallion/uBlacklist-subscription-compilation@main/uBlacklist.txt)
	4. [ublacklist-stackoverflow-translation](https://raw.githubusercontent.com/arosh/ublacklist-stackoverflow-translation/master/uBlacklist.txt)
	5. [uBlacklist-GitHub-Translation](https://raw.githubusercontent.com/arosh/ublacklist-github-translation/master/uBlacklist.txt)
## 清除后的效果

这里以搜索"C语言二进制输出"为例，为举例子方便，我将本来被uBlacklist隐藏了的搜索结果又显示出来了，可以看到这些网站都被屏蔽掉了：
1. CSDN
2. 程序员宅基地
3. 百度知道

![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211025185709.png)
## 参考资料
- [清理「内容农场」，还你清爽的 Google 中文搜索体验 - 少数派](https://sspai.com/post/69407)
- [uBlacklist - Chrome 网上应用店](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe/related)
- [cobaltdisco/Google-Chinese-Results-Blocklist: 我终于能用谷歌搜中文了……](https://github.com/cobaltdisco/Google-Chinese-Results-Blocklist)
- [eallion/uBlacklist-subscription-compilation: uBlacklist subscription compilation 订阅合集](https://github.com/eallion/uBlacklist-subscription-compilation)
- [arosh/ublacklist-stackoverflow-translation: Stack Overflow の機械翻訳サイトの除外用フィルタ](https://github.com/arosh/ublacklist-stackoverflow-translation)
- [arosh/ublacklist-github-translation: Exclude machine-translated GitHub from Google search](https://github.com/arosh/ublacklist-github-translation)
- [Tampermonkey • 首页](https://www.tampermonkey.net/)
- [Google Hit Hider by Domain — Author's Site](http://www.jeffersonscher.com/gm/google-hit-hider/)
- [langren1353/GM_script: 我就是来分享脚本玩玩的](https://github.com/langren1353/GM_script)
- [Ban Bad Websites 标记/屏蔽机器翻译 SEO 垃圾网站](https://greasyfork.org/zh-CN/scripts/389721-ban-bad-websites-%E6%A0%87%E8%AE%B0-%E5%B1%8F%E8%94%BD%E6%9C%BA%E5%99%A8%E7%BF%BB%E8%AF%91-seo-%E5%9E%83%E5%9C%BE%E7%BD%91%E7%AB%99)
- [翻译垃圾再利用](https://greasyfork.org/zh-CN/scripts/389270-%E7%BF%BB%E8%AF%91%E5%9E%83%E5%9C%BE%E5%86%8D%E5%88%A9%E7%94%A8)
- [danny0838/content-farm-terminator: 「終結內容農場」瀏覽器套件 / Content Farm Terminator browser extension](https://github.com/danny0838/content-farm-terminator)
- [「内容农场」属实在玷污 Google 搜索结果 | ChrAlpha's Blog](https://blog.ichr.me/post/evil-content-farm/)