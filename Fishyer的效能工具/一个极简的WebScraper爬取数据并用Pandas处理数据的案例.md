---
link: https://www.notion.so/WebScraper-Pandas-462f25bad8e44be08ba992afe11b4420
notionID: 462f25ba-d8e4-4be0-8ba9-92afe11b4420
---

#! https://zhuanlan.zhihu.com/p/423850628

#爬虫 #Python 

> 在逛知乎、刷微博时，我们有时候可能想要做一些批量操作，比如批量导出自己的微博，批量导出自己的知乎收藏答案等等，这个时候就是WebScraper+Pandas大显身手的时候了
## 使用WebScraper爬取数据

首选先安装WebScraper这个Chrome插件:
- [Chrome应用商店](https://chrome.google.com/webstore/detail/web-scraper-free-web-scra/jnhgnonknehpejjnehehllkliplmbmhn?utm_source=chrome-ntp-icon)
- [国内浏览器插件网站](https://www.gugeapps.net/webstore/detail/web-scraper-free-web-scra/jnhgnonknehpejjnehehllkliplmbmhn)
### 网站的样式如下
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211020232550.png)


网站url的正则匹配表达式为`https://www.tuicool.com/articles/late?pn=[0-2]`，这里我的待读列表的分页只有0-2
### 设置要抓取的站点url

打开调试工具-WebScraper,添加新站点，输入名称和url的正则表达

![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211020232807.png)
### 添加selector选择要抓取的数据

输入id名，选择抓取的数据为Link，勾选Multiple支持多选，点击select,然后依次点击前两个标题即可全选本页的所有标题了，然后下方的点击Done selecting，一个数据抓取器就添加完成了。


![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211020234829.png)


此时可以点击 Data preview 查看是否真的有数据被选中了，弹出如下表格就是真的创建Selector成功了
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211020235310.png)
### 开始抓取数据，并导出数据为csv文件
先点击Scrape抓取数据，它会自动新建浏览器窗口打开指定url，模拟真人查看网页。

如果url有点多的话，可能会稍稍要等一会。

过一会数据就抓好了,然后可以点击Browse查看抓取到的数据，最后点击'Export data as Csv'，就可以将表格数据都导出为csv文件了。

![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211020232952.png)
### 导出的csv文件样式

文件内容如下：
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211020233504.png)

我想将它转换成MarkDown格式的链接列表，类似下面这样，其实直接正则替换也行，但是那怎么考验真正的技术呢，所以我打算用python的库pandas来根据csv数据来导出这样的样式，这样就算以后有更复杂的场景，也都不在话下了。

```
- [软件架构分层，你的项目处于什么阶段?](https://www.tuicool.com/articles/ia2EvuN)
- [95% 的算法都是基于这 6 种算法思想](https://www.tuicool.com/articles/uqEzMjE)
- [中国程序员开发的远程桌面火了！Mac可用，只有9MB，支持自建中继器](https://www.tuicool.com/articles/nENJBnB)
- [从 Android 到 Java：如何从不同视角解决问题？](https://www.tuicool.com/articles/AfY7RnZ)
```
## 使用Pandas处理数据
### 安装anaconda

首选安装 [Annaconda](https://www.anaconda.com/products/individual) 这个Python集成开发软件，因为它自带了很多数据分析的模块，不用我们再去额外安装了，很省心。

国内下载可能有点慢，推荐使用镜像源：[anaconda | 镜像站使用帮助 | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirror.tuna.tsinghua.edu.cn/help/anaconda/)

至于安装过程中的一些配置，可以参考：[【Anaconda教程01】怎么安装Anaconda3 - 知乎](https://zhuanlan.zhihu.com/p/75717350)
### 启动jupyter

安装好了以后，直接命令行`jupyter notebook`启动jupyter，然后在打开的类似`http://localhost:8888/tree/jupyter-notebook`页面下(建议将此页面保存为书签，方便随时写代码)，就可以新建python3环境的ipynb代码了。

Jupyter Notebook可以在网页页面中**直接编写代码**和**运行代码**，每一个Block的代码的**运行结果**也会直接在代码块下显示。如在编程过程中需要编写MarkDown说明文档，可在同一个页面中直接添加Block来编写，便于作及时的说明和解释。类似这样的，就是一个Block。
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211021001737.png)
### Pandas读取csv文件并修改数据

```python
import pandas as pd
import numpy as np
import re,os

path="~/Documents/MyObsidian/Cache/tuicoool.csv"

#filename可以直接从盘符开始，标明每一级的文件夹直到csv文件，header=None表示头部为空，sep=' '表示数据间使用空格作为分隔符，如果分隔符是逗号，只需换成 ‘，’即可。
df = pd.read_csv(path)

df['pageId'] = df['web-scraper-order'].str.replace(re.compile('([0-9]+)-([0-9]+)'),r"\1").astype('int')
df['elementId'] = df['web-scraper-order'].str.replace(re.compile('([0-9]+)-([0-9]+)'),r"\2").astype('int')

df.sort_values(by=['elementId'],na_position='first',inplace=True)

df=df[['pageId','elementId','article','article-href']]




# 准备输出Chrome书签格式的html文件，方便导入到各种书签工具    
out_path="/Users/yutianran/Documents/MyObsidian/Cache/tuicool.html"
chrome_template="""<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  <DT><H3 ADD_DATE="1634759143" LAST_MODIFIED="1634759173" PERSONAL_TOOLBAR_FOLDER="true">书签栏</H3>
  <DL><p>
{LIST_ITEM}
  </DL><p>
</DL><p>
"""
dt_template="""        <DT><A HREF="ARTICLE_LINK" ADD_DATE="1634759157">ARTICLE</A>"""+"\n"

list_item_str=""
for idx,data in df[['article','article-href']].iterrows():
  dt_str=f"        <DT><A HREF=\"{data[1]}\">{data[0]}</A>\n"
  list_item_str=list_item_str+dt_str
chrome_str=chrome_template.replace("{LIST_ITEM}",list_item_str)
if os.path.exists(out_path):
  os.remove(out_path)
file = open(out_path, "w")                                                    
file.write(chrome_str)                                                  
file.flush()
file.close()
print(f"写入到html文件成功：{out_path}")

out_csv="/Users/yutianran/Documents/MyObsidian/Cache/tuicoool_sorted.csv"
if os.path.exists(out_csv):
  os.remove(out_csv)
df.to_csv(out_csv)
print(f"写入到csv文件成功：{out_csv}")
```
## 小笔记
> 以后每次做一个小案例，都可以将一些以后可以复用的代码抽取出来，用一个标题表示用处。[Obsidian](https://publish.obsidian.md/help-zh/%E7%94%B1%E6%AD%A4%E5%BC%80%E5%A7%8B)仓库可将文章中的各级标题做块引用，是笔记管理的利器。为什么不用gist，因为有的时候一个代码用法可能涉及到多个类，用gist不够灵活。
### Chrome书签格式

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  <DT><H3 ADD_DATE="1634759143" LAST_MODIFIED="1634759173" PERSONAL_TOOLBAR_FOLDER="true">书签栏</H3>
  <DL><p>
      <DT><A HREF="https://www.baidu.com/" ADD_DATE="1634759157">百度一下，你就知道</A>
      <DT><A HREF="https://www.zhihu.com/signin?next=%2F" ADD_DATE="1634759157">知乎 - 有问题，就会有答案</A>
  </DL><p>
</DL><p>
```
### Python写入字符串到文件 

```python
if os.path.exists(out_path):
  os.remove(out_path)
file = open(out_path, "w")                                                    
file.write(chrome_str)                                                  
file.flush()
file.close()
print(f"写入到文件成功：{out_path}")
```
### DataFrame做正则替换

```python
df['pageId'] = df['web-scraper-order'].str.replace(re.compile('([0-9]+)-([0-9]+)'),r"\1").astype('int')
```
### DataFrame截取指定行和列

```python
print(df[0:5][['pageId','elementId','article','article-href']])

print(df[0:5])

print(df[['pageId','elementId','article']] )

print(df.to_string())
```
### 按行遍历DataFrame

```python
for idx,data in df[['article','article-href']].iterrows():
  dt_str=f"<DT><A HREF=\"{data[1]}\">{data[0]}</A>\n"
```
### 字符串做正则替换
和DataFrame不太一样，不如DataFrame简洁

```python
import re

url='http://www.55188.com/thread-8306254-2-3.html'
pattern='-(\d+)-(\d+)-(\d+)'
i=5678
newUrl=re.sub(pattern,lambda m:'-'+m.group(1)+'-'+str(i)+'-'+m.group(3),url)
print(newUrl)
```

![](https://yupic.oss-cn-shanghai.aliyuncs.com/20211020222648.png)
## 参考资料

> 以后每次边写笔记边搜索资料时，都可以将有用的链接贴在这里。可以用[hypothes](https://hypothes.is/)在链接网页上做高亮和标注，这样下次打开的话，也能看到之前的高亮标注，可以有效防止重复阅读。参考资料的链接格式统一为`- [name](link)`,方便正则匹配到，以后定期扫描自己的本地所有md文件里面的该模式字符串，自动生成一个chrome书签格式的链接列表，然后导入到[Cubox](https://help.cubox.pro/)这个书签管理神器里面，可以批量备份网页，这样就算原始链接失效了，也还有Cubox里面的备份可以看。
- [python - 如何在pandas.Series.str.replace()中使用正则表达式 - IT工具网](https://www.coder.work/article/4939634)
- [【python】用正则表达式进行文字局部替换_weixin_34216196的博客-CSDN博客](https://blog.csdn.net/weixin_34216196/article/details/86399674)
- [Pandas 用户指南目录 | Pandas 中文](https://www.pypandas.cn/docs/user_guide/)
- [《Python Cookbook》3rd 中文版3.0.0](https://python3-cookbook.readthedocs.io/zh_CN/latest/)
- [Pandas 数据结构 – DataFrame | 菜鸟教程](https://www.runoob.com/pandas/pandas-dataframe.html)
- [用pandas中的DataFrame时选取行或列_wanglingli95的博客-CSDN博客_pandas取行](https://blog.csdn.net/wanglingli95/article/details/78887771)
- [正则表达式在线测试 | 菜鸟工具](https://c.runoob.com/front-end/854/)
- [正则表达式 – 语法 | 菜鸟教程](https://www.runoob.com/regexp/regexp-syntax.html)
- [爬虫工具(二) webscraper 教程 (知乎案例) | 自由微信 | FreeWeChat](https://freewechat.com/a/MzAxMTM3MDk2Ng==/2451659842/1)
- [Google Chrome插件下载|谷歌浏览器插件商店|谷歌浏览器下载-Chrome网上应用店](https://www.gugeapps.net/)
- [手把手教你如何在 Windows 安装 Anaconda - SegmentFault 思否](https://segmentfault.com/a/1190000037752539)