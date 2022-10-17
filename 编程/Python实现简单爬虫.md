tags: python

> 本文是慕课网视频:[Python开发简单爬虫](http://www.imooc.com/learn/563)的学习笔记

## 1.爬虫简介
主要用于收集数据，可以说是数据分析的第一步。
![](Snip20161101_1.png)

![](Snip20161101_2.png)

## 2.爬虫架构
主要有三大模块:URL管理器、网页下载器、网页解析器
![](Snip20161101_4.png)

![](Snip20161101_5.png)

### 2.1.URL管理器
主要实现方式有3种:内存、关系数据库、缓存数据库
![](Snip20161101_7.png)

![](Snip20161101_8.png)

### 2.2.网页下载器
主要实现方式有2种:urllib2、requests
![](Snip20161101_9.png)

![](Snip20161101_10.png)

### 2.3.网页解析器
主要实现方式有2种:模糊匹配、结构化解析
![](Snip20161101_18.png)
![](Snip20161101_20.png)

![](Snip20161101_21.png)

## 3.实现爬虫的主要步骤
1. 确定收集什么数据？
2. 分析网页中目标数据的格式
3. 编写代码
4. 执行爬虫
![](Snip20161101_30.png)

目标:这里我要获取百度百科中Python词条(以及相关词条)的简介
分析:通过查看百度百科的源代码,知道简介位于
![](2016-11-01-17-03-01.jpg)
(有点蛋疼，MarkDown中写的html语句会自动显示，而不是做为字符串，只好截图了)
![](Snip20161101_32.png)

## 4.urllib2的用法简介
### 4.1.普通的url

![](Snip20161101_11.png)

### 4.2.添加data、header

![](Snip20161101_16.png)

![](Snip20161101_12.png)

### 4.3.cookie、https、proxy、redirect等特殊场景
![](Snip20161101_14.png)
![](Snip20161101_17.png)

## 5.BeautifulSoup用法简介
### 5.1.基本介绍

![](Snip20161101_24.png)

![](Snip20161101_25.png)

### 5.2.使用方法
![](Snip20161101_26.png)

![](Snip20161101_27.png)

![](Snip20161101_29.png)

## 6.爬虫的具体实现代码
![](2016-11-01-16-43-35.jpg)

### 6.1.爬虫调度端
```
# coding:utf-8
# yutianran 16/7/29 上午11:36

import sys
import os

reload(sys)
sys.setdefaultencoding("utf-8")

import url_manager, html_downloader, html_parser, html_outputer


class SipderMain(object):
    def __init__(self):
        self.urls = url_manager.UrlManager()
        self.downloader = html_downloader.HtmlDownloader()
        self.parser = html_parser.HtmlParser()
        self.outputer = html_outputer.HtmlOutputer()

    def craw(self, root_url):
        count = 1
        self.urls.add_new_url(root_url)
        while self.urls.has_new_url():
            try:
                new_url = self.urls.get_new_url()
                print("craw %d : %s" % (count, new_url))
                html_cont = self.downloader.download(new_url)
                new_urls, new_data = self.parser.parse(new_url, html_cont)
                self.urls.add_new_urls(new_urls)
                self.outputer.collect_data(new_data)

                if count == 1000:
                    break

                count = count + 1
            except:
                print("craw failed")

        self.outputer.output_html()


if __name__ == "__main__":
    root_url = "http://baike.baidu.com/view/21087.htm"
    ojb_spider = SipderMain()
    ojb_spider.craw(root_url)

```

### 6.2.URL管理器
```
# -*- coding: UTF-8 -*-
class UrlManager(object):
    def __init__(self):
        self.new_urls = set()
        self.old_urls = set()
    
    
    def add_new_url(self,url):
        if url is None:
            return
        if url not in self.new_urls and url not in self.old_urls:
            self.new_urls.add(url)
    
    def add_new_urls(self,urls):
        if urls is None or len(urls)==0:
            return
        for url in urls:
            self.add_new_url(url)
    
    def has_new_url(self):
        return len(self.new_urls) != 0

    
    def get_new_url(self):
        new_url = self.new_urls.pop()
        self.old_urls.add(new_url)
        return new_url
```

### 6.3.网页下载器
```
# coding=utf-8

import urllib2

class HtmlDownloader():
    def __init__(self):
        pass
    def download(self,url):
        if url is None:
            return None
        response = urllib2.urlopen(url)
        if response.getcode() != 200:
            return None
        html_read = response.read()
        return html_read


def test():
    url = u"http://baike.baidu.com/view/21087.htm"
    downLoader = HtmlDownloader()
    html_read = downLoader.download(url)
    return html_read

# print test()

```

### 6.4.网页解析器
```
# -*- coding: UTF-8 -*-
from bs4 import BeautifulSoup
import re
from urlparse import urljoin

class HtmlParser(object):
    def _get_new_urls(self, page_url, soup):
        new_urls = set()
        links = soup.find_all('a', href=re.compile(r"/view/\d+\.htm"))
        for link in links:
            new_url = link['href']
            new_full_url = urljoin(page_url, new_url)
            new_urls.add(new_full_url)
        return new_urls

    def _get_new_data(self, page_url, soup):
        res_data = {}
        res_data['url'] = page_url
        '''
        <dd class="lemmaWgt-lemmaTitle-title">
        <h1>Python</h1>
        '''
        title_node = soup.find('dd', class_="lemmaWgt-lemmaTitle-title").find('h1')
        res_data['title'] = title_node.get_text()
        # <div class="lemma-summary" label-module="lemmaSummary">
        summary_node = soup.find('div', class_="lemma-summary")
        res_data['summary'] = summary_node.get_text()

        return res_data

    def parse(self, page_url, html_cont):
        if page_url is None or html_cont is None:
            return

        soup = BeautifulSoup(html_cont, 'html.parser', from_encoding='utf-8')
        new_urls = self._get_new_urls(page_url, soup)
        new_data = self._get_new_data(page_url, soup)
        return new_urls, new_data


# test
import html_downloader

def test():
    url = u"http://baike.baidu.com/view/21087.htm"
    cont = html_downloader.test()
    new_urls, new_data=HtmlParser().parse(url, cont)
    print new_urls
    return new_urls, new_data

# test()
```

### 6.5.数据输出器
```
# -*- coding: UTF-8 -*-
import sys
reload(sys)
sys.setdefaultencoding("utf-8")


class HtmlOutputer(object):
    def __init__(self):
        self.datas = []

    def collect_data(self, data):
        if data is None:
            return
        self.datas.append(data)

    def output_html(self):
        fout = open('output.html', mode='w')
        fout.write("<html>")
        fout.write("<head>")
        fout.write("<meta charset=\"UTF-8\">")
        fout.write("</head>")
        fout.write("<body>")
        fout.write("<table>")
        count = 0
        for data in self.datas:
            print "%s" % count
            fout.write("<tr>")
            fout.write("<td>%d</td>" % count)
            fout.write("<td>%s</td>" % data['url'])
            print "<td>%s</td>" % data['title']
            fout.write("<td>%s</td>" % data['title'])
            print "<td>%s</td>" % data['summary']
            fout.write("<td>%s</td>" % data['summary'])
            fout.write("</tr>")
            count = count + 1

        fout.write("</table>")
        fout.write("</html>")
        fout.write("</html>")


import html_parser


def test():
    new_urls, new_data = html_parser.test()
    html_outputer = HtmlOutputer()
    html_outputer.collect_data(new_data)
    html_outputer.output_html()


# test()

```

### 6.6.输出内容
![](2016-11-01-16-47-44.jpg)
样式有点丑，大家将就着看吧
![](2016-11-01-16-47-20.jpg)

## 7.学习总结
感觉这个视频让自己受益匪浅，不仅仅是因为通过它知道了爬虫的大致流程，更重要的是，让自己对于面向对象和架构设计有了一点点感悟，需要哪些类？每个类需要哪些方法？这些类之间如何交互？这些都是需要我好好体悟的。
本爬虫实例只是一个最简单的爬虫了，不涉及登录验证、多线程、分布式等等，爬虫之路，任重而道远。
![](Snip20161101_33.png)