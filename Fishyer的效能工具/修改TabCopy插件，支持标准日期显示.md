---
link: https://www.notion.so/TabCopy-2f898174949b410585caa1a6ec1447c7
notionID: 2f898174-949b-4105-85ca-a1a6ec1447c7
---

源码地址：[fishyer/MyTabCopy](https://github.com/fishyer/MyTabCopy ) 

修改了一下[TabCopy](https://chrome.google.com/webstore/detail/tabcopy/micdllihgoppmejpecmkilggmaagfdmb/related?utm_source=chrome-ntp-icon)的源码：
1. 添加了日期时间的显示格式，类似：2022-09-15 19:18:47，原来的是：2022/9/15 19:25:22
2. 修改了manifest.json的key和name，改名为MyTabCopy

## 推荐的配置
`[[title]]([url] ) time: [date+time]`
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20220915192725.png)


## 使用说明
1. 下载解压，打开Chrome的开发者模式，然后加载已解压的拓展程序即可
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20220915192417.png)

## 怎么改Chrome插件源码
1. 查看插件id,获取到本地文件夹路径  
`C:\Users\Administrator\AppData\Local\Google\Chrome\User Data\Default\Extensions\micdllihgoppmejpecmkilggmaagfdmb`  
路径的最后一段就是插件id  
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20220915193154.png)

2. 然后用VSCode打开文件夹，修改源码后，再修改一下manifest.json的key和name即可，可以保留原有的插件，两个同时存在
![](https://yupic.oss-cn-shanghai.aliyuncs.com/20220915193435.png)

## 参考链接
- [一行代码实现时间格式化—toLocaleString_userkang的博客-CSDN博客](https://blog.csdn.net/userkang/article/details/113381215 ) time: 2022-09-15 19:39:33