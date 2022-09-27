---
link: https://www.notion.so/Chrome-Hypothesis-017d13a2920d4911b8181cf8970b5a97
notionID: 017d13a2-920d-4911-b818-1cf8970b5a97
---

#! https://zhuanlan.zhihu.com/p/425289678

#Chrome #Hypothesis
## 为什么要优化Hypothesis

目前在使用Hypothesis进行网页标注时，感觉有一个体验不是很好的地方：它不是默认启动标注插件，每次都需要点击一下Hypothesis插件按钮，才能开始标注。
## 找到插件的安装路径

地址栏输入`chrome://version/`，在打开的页面中找到个人资料路径`/Users/yutianran/Library/Application Support/Google/Chrome/Default`，再找到`Extensions`子文件夹，里面就是所有已安装的插件文件夹了，不过都是一串ID，没有名字，所以还得去我们的插件页面找到它对应的ID。
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211025014222.png)


再在插件的选项页面，找到ID:`bjfhmglciegochdpefhhlphglcehbmek`
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211025014024.png)

于是插件的完整路径就是：`/Users/yutianran/Library/Application Support/Google/Chrome/Default/Extensions/bjfhmglciegochdpefhhlphglcehbmek`
## 复制一份插件文件夹到桌面，修改插件信息

用VSCode打开插件文件夹，通过全文搜索`browserAction.onClicked`，找到点击Hypothesis后调用的方法：
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211025015117.png)

进去后看到，原来它是通过`state: 'active'`这个状态来控制Hypothesis插件的开关的。

于是点击`state`状态的定义找到它初始化的地方，修改它的默认值`state: 'inactive'`为`state: 'active'`，表示默认启动Hypothesis插件。
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211025015404.png)

要是懒得自己去找，可以在这里看看：extension.bundle.js文件第5376行。
## 删除原来的插件，安装修改后的插件

通过`chrome://extensions/`打开拓展管理页面，移除原来的插件，再加载已解压的插件-选中修改后的插件文件夹即可。

好了，以后我们在看网页时，就可以愉快的标注啦，再也不会出现：准备高亮的文字都选择好了，结果却没有弹出高亮的浮动按钮。
## 防止插件以后再自动更新-2021年11月07日补充

在manifest.json文件中，将"update_url"属性设置为无效的内容，例如:https://localhost
## 参考资料
- [Chrome插件开发入门：如何实现一键上班赖皮 - 掘金](https://juejin.cn/post/6844903740827238413)
- [hypothesis/browser-extension: The Hypothesis browser extensions.](https://github.com/hypothesis/browser-extension)
- [Chrome浏览器扩展开发系列之四：Browser Action类型的Chrome浏览器扩展 - Chrome扩展开发极客 - 博客园](https://www.cnblogs.com/champagne/p/4807632.html)
- [修改chrome插件 - 云+社区 - 腾讯云](https://cloud.tencent.com/developer/article/1028111)
- [Chrome扩展程序的二次开发：把它改得更适合自己使用 - 刘哇勇 - 博客园](https://www.cnblogs.com/Wayou/p/how_to_adapt_chrome_extension_for_your_own_willing.html)
- [Getting started - Chrome Developers](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [如何开发Chrome(谷歌)浏览器的插件 - JoinJ - 博客园](https://www.cnblogs.com/jinho/archive/2010/11/11/1875046.html)