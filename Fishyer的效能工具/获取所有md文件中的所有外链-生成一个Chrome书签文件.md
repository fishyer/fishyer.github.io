---
link: https://www.notion.so/md-Chrome-955f164eeb1e4bc9a01e6f557ef68fe1
notionID: 955f164e-eb1e-4bc9-a01e-6f557ef68fe1
---

#! https://zhuanlan.zhihu.com/p/423855339

#Python #MarkDown #Chrome #Obsidian #Cubox
## 为什么我要写这个脚本

在用Obsidian写了很多md文章之后，引用了很多的外部链接（有些在文章里面引用，有些在参考资料里面引用），但是因为国内的网络环境问题，现在很多链接都是过一阵子就没了，尤其是引用的一些个人博客的链接，他们最喜欢折腾了，经常一不小心就再也找不到原始页面了，所以呢，我迫切需要一份网页快照存档的工具，以前主要是用印象笔记收藏网页，但是感觉它有点笨重，每次都需要自己手动收藏，而且不能批量收藏。还有其它各种MarkDownLoad插件(其实这个工具也可以批量下载网页成md，但是不够方便)之类的工具，都因为不能很好的批量备份而被我排除了。

我需要的是一个可以**根据链接列表批量收藏网页**的工具，很幸运的是，找到了，这就是[Cubox](https://help.cubox.pro/hi/5bca)，它可以很方便的导入chrome书签文件，所有保存在Cubox里面的书签都会有一份云端快照备份。

那么，现在的问题就是：
1. 如何获取链接列表呢？
2. 如何根据链接列表生成Chrome书签文件呢？

本文就是正则查找自己的所有md文件中的所有`[标题](链接)`格式的文本，用于获取链接列表，然后生成Chrome书签文件。

关于链接列表，还有一个很常见的来源，那就是自己在各种网站的收藏夹，这一点可以查看我的另一篇文章：[一个极简的WebScraper爬取数据并用Pandas处理数据的案例](https://zhuanlan.zhihu.com/p/423850628)

有了这两种方式，那么无论是本地的，还是网络的，只要是自己可能有用的链接，我都可以备份在Cubox了。
## 代码实现
```python
import os
import re

def read_file(path):
str=""
with open(path, 'r') as f:
    str=f.read()
return str

def mdlink_to_chromelink(mdlink):
p = re.compile("\[(.+)\]\((http[s]?://.*)\)")
# <DT><A HREF="https://www.baidu.com/">百度一下，你就知道</A>
chromelink=re.sub(p,lambda m:f"<DT><A HREF=\"{m.group(2)}\">{m.group(1)}</A>",mdlink)
return chromelink

dir_path="/Users/yutianran/Documents/MyObsidian/1-Pulish"
list=os.listdir(dir_path)

pattern = re.compile("\[.+\]\(http[s]?://.*\)")
list_item_str=""
for item in list:
path = os.path.join(dir_path, item)
# 如果是md文件
if os.path.isfile(path) and path.endswith(".md"):
    # print(item)
    md=read_file(path)
    find_list = pattern.findall(md)
    for find_item in find_list:
        chrome_link=mdlink_to_chromelink(find_item)
        list_item_str=list_item_str+f"    {chrome_link}\n"
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
chrome_str=chrome_template.replace("{LIST_ITEM}",list_item_str)

out_path="/Users/yutianran/Documents/MyObsidian/Cache/md_all.html"
if os.path.exists(out_path):
os.remove(out_path)
file = open(out_path, "w")                                   
file.write(chrome_str)                                      
file.flush()
file.close()
print(f"写入到html文件成功：{out_path}")
```
## 后续的优化

现在是直接就导出Chrome书签了，以后可以再用一个文件存储链接之间的引用关系，生成一个关系图谱。 #todo
## 小笔记

##```python
def mdlink_to_chromelink(mdlink):
p = re.compile("\[(.+)\]\((http[s]?://.*)\)")
# <DT><A HREF="https://www.baidu.com/">百度一下，你就知道</A>
chromelink=re.sub(p,lambda m:f"<DT><A HREF=\"{m.group(2)}\">{m.group(1)}</A>",mdlink)
return chromelink
```

### python读取文件
```python
def read_file(path):
str=""
with open(path, 'r') as f:
    str=f.read()
return str
```

### python遍历本地文件夹
```python

def dir_list(dir_path,level):
list=os.listdir(dir_path)
list.sort()
for item in list:
if item==".DS_Store" :
        continue
    path = os.path.join(dir_path, item) 
    print("  "*level+"- "+item)
if os.path.isdir(path):
        dir_list(path,level+1)
    elif os.path.isfile(path):
        pass
    else:
        print("it's a special file(socket,FIFO,device file):"+path)

rootDir="/Users/yutianran/Documents/MyObsidian"
dir_list(rootDir,0)
```
## 参考资料

1. [献给写作者的 Markdown 新手指南 - 简书](https://www.jianshu.com/p/q81RER)
2. [python正则加 'r' 防止字符转义_sxudong2010的博客-CSDN博客](https://blog.csdn.net/sxudong2010/article/details/83067526)
3. [正则表达式在线测试 | 菜鸟工具](https://c.runoob.com/front-end/854/)
4. [正则表达式30分钟入门教程](https://deerchao.cn/tutorials/regex/regex.htm)
5. [【干货】五分钟，正则表达式不再是你的烦恼 - 简书](https://www.jianshu.com/p/4f258d81ff4c)
6. [Python3 正则表达式 | 菜鸟教程](https://www.runoob.com/python3/python3-reg-expressions.html)