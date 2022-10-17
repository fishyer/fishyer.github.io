#1.生命周期
---
![Activity的生命周期](http://upload-images.jianshu.io/upload_images/1458573-38a7ce305b5f93a1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
>补充说明：
1. 

#2.启动模式
---
**standard:标准模式**
每次都会创建新的实例
>适用于一般页面

**singleTop:栈顶复用模式**
如果目标Activity在栈顶，则不新建，调用原有的onNewIntent()方法；
如果目标Activity不在栈顶，则新建
>适用于聊天页面

**singleTask:栈内复用模式**
如果目标Activity在栈内存在，则不新建，调用原有的onNewIntent()方法；
如果目标Activity在栈内不存在，则新建
>适用于应用主页

**singleInstance:单实例模式**
如果目标Activity存在，则不新建，调用原有的onNewIntent()方法；
如果目标Activity在不存在，则新建
>适用于浏览器页面
>此种模式的Activity在一个新的任务栈中，且该任务栈只有它。

------
特别提示：如果在一个singleTop或singleInstance的ActivityA中，通过startActivityForResult()方法来启动另一个ActivityB，则系统将直接返回Activity.RESULT_CANCELED而不再等待。

#分析系统Activity栈
使用shell命令查看当前的任务栈信息：
>adb shell dumpsys activity activities

打印信息如下：
![](http://upload-images.jianshu.io/upload_images/1458573-9e74d14f70dd6742.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

信息很多，这里只需要查看
ACTIVITY MANAGER ACTIVITIES
 (dumpsys activity activities) 
--》Running activities (most recent first)即可。
这里有几个TaskRecord即表示有几个Activity栈。