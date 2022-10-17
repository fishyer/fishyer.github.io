1.下载Git，然后安装
地址：[https://git-scm.com/download/win](https://git-scm.com/download/win)

2.到Git@OSC注册一个帐号：
git@osc地址：[http://git.oschina.net/signup?inviter=yutianran](http://git.oschina.net/signup?inviter=yutianran)
之所以用git@osc而不是Github，很简单，因为github的私有项目是收费滴！

3.配置Git帐号：
**git config --global user.name "Fishyer"**git config --global user.email [13419527681@163.com](mailto:13419527681@163.com)****
**//查看是否配置成功**
**git config --list**
****
4.配置SSH密钥：
**$ cd ~/.ssh**如果提示：No such file or directory 说明你是第一次使用git。如果不是第一次使用，请执行下面的操作,清理原有ssh密钥。
**$ mkdir key_backup****$ cp id_rsa* key_backup**
**$ rm id_rsa***生成新的密钥：
**$ ssh-keygen -t rsa -C “[13419527681@163.com](mailto:13419527681@163.com)”****连按3次空格，不要输入任何密码！**在回车中会提示你输入一个密码，这个密码会在你提交项目时使用，如果为空的话提交项目时则不用输入。
您可以在你本机系统盘下，您的用户文件夹里发现一个.ssh文件，其中的id_rsa.pub文件里储存的即为刚刚生成的ssh密钥。下面的id_rsa是私钥
![](http://upload-images.jianshu.io/upload_images/1458573-3305d42883fe423a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
用记事本打开：
![](http://upload-images.jianshu.io/upload_images/1458573-d91e4883010cf3f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
****特别提示：**从后往前复制，不要全选！！！（全选会多一个换行符导致公钥格式错误！！！）**

登录[Git@osc](mailto:Git@osc)，粘贴你刚生成的公钥：
![](http://upload-images.jianshu.io/upload_images/1458573-72dd7c1ab5d9b4bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5.在Android Studio配置Git
![](http://upload-images.jianshu.io/upload_images/1458573-ffbec99d52b7068d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

6.将项目同步保存到Git
**(1)复制SSH地址**
![](http://upload-images.jianshu.io/upload_images/1458573-6882fa2cbe1e3c96.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
**(2)将Android Studio项目进行初始化git**
![](http://upload-images.jianshu.io/upload_images/1458573-c9969aadc60b0609.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)![](http://upload-images.jianshu.io/upload_images/1458573-a5f095062d73ee1e.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
**(3)将本地项目连接远程项目**
![](http://upload-images.jianshu.io/upload_images/1458573-34bb9a9e38d9980a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
输入：
git remote add origin [复制的SSH地址]
![](http://upload-images.jianshu.io/upload_images/1458573-9a734a2ee5ac6989.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
查看是否连接上：
git remote -v
![](http://upload-images.jianshu.io/upload_images/1458573-98aaaf495b3028d4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
**(4)本地项目进行pull,使本地项目获取远程项目的一些初始配置，例如ReadMe文件等**

![](http://upload-images.jianshu.io/upload_images/1458573-d904d259211b2923.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-7cbdf0ed88f86794.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
**(5)提交三部曲：add commit push**
![](http://upload-images.jianshu.io/upload_images/1458573-e51f34f94b901b7c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-ef8b4fe83debaeb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)![](http://upload-images.jianshu.io/upload_images/1458573-52f08cf36af7ecfa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 建议：commit时取消右侧的那两个默认的选项，我勾选的时候会无法commit，不知道是什么鬼

![](http://upload-images.jianshu.io/upload_images/1458573-66991678af70ed2b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-1b6c6c3543cb3d20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)、

之后 ，我们就可以看到我们的git提交记录啦
![](http://upload-images.jianshu.io/upload_images/1458573-9e3322768f73f15c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

常见问题01：
![](http://upload-images.jianshu.io/upload_images/1458573-2bb76824694f7227.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

答案01：
一般是因为没有pull 就直接提交三部曲了

常见问题02：
怎么版本回退？

答案02：
![](http://upload-images.jianshu.io/upload_images/1458573-ec7c1baabbe2cc6d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

常见问题03：
为什么pull无效？

答案03
![](http://upload-images.jianshu.io/upload_images/1458573-d19676a7bf4c127e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此对话框要关闭了之后，再来pull！