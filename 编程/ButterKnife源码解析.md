tags: 源码解析

> 看过很多的源码解析的文章，都是从**整体的框架设计**入手开讲的，对于我们这种菜鸟而言，无异于天书，一点也不接地气，格式例如：[android-Ultra-Pull-To-Refresh 源码解析](http://a.codekk.com/detail/Android/Grumoon/android-Ultra-Pull-To-Refresh%20%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90)，可能你看了半天，感觉似懂非懂了，但是让你去讲这个框架的一些实现细节，你可能还是一脸懵逼。这里呢，我使用了另一种更适合我们菜鸟的阅读源码的方式：**从实际使用入手，跟踪具体流程**

预备知识：
[Java反射](http://www.jianshu.com/p/7146f59af101)

[Java注解](http://www.jianshu.com/p/4cd6dd109d85)

## 1.ButterKnife的使用
---
![](http://upload-images.jianshu.io/upload_images/1458573-dab6c1dfb1324df2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 2.源码解析：
我们使用ButterKnife时，使用了@Bind和@OnClick这两个注解，还有ButterKnife.bind(this)这一个初始化的方法。OK,就从它们开始我们的解析之路吧：

> **温馨提示**：本次解析的流程可能比较绕，请打开IDE，依赖ButterKnife,一边观看本博客，一边查看ButterKnife的源码！（解析版本：7.0.1）

### （1）绑定视图id
![](http://upload-images.jianshu.io/upload_images/1458573-036cab56c757b364.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### （2）绑定点击事件
![](http://upload-images.jianshu.io/upload_images/1458573-08357dde88b94d64.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
OnClick类第28行，调用了另一个自定义注解
![](http://upload-images.jianshu.io/upload_images/1458573-08cf88a32dbfb324.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
OnClick类第32行，也调用了另一个自定义注解
![](http://upload-images.jianshu.io/upload_images/1458573-594349d93aeb4635.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### （3）在activity.onCreate中初始化时
![](http://upload-images.jianshu.io/upload_images/1458573-be5ec6beceeb6510.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-114cfd3bc7da8019.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

首先，bind方法的第317行，会调用findViewBinderForClass，获取ViewBinder对象
![](http://upload-images.jianshu.io/upload_images/1458573-7ceac10a639732ee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
然后，bind方法的第319行，会调用ViewBinder对象的bind方法
![](http://upload-images.jianshu.io/upload_images/1458573-531c409229256374.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

坑爹啊，居然是接口，那么，它的实现类在哪呢？暂且不表，下回细说。
先深入findViewBinderForClass方法
![](http://upload-images.jianshu.io/upload_images/1458573-796ce5285922be92.png)
第339、340行，会用反射创建一个ViewBinder对象，类名为：原类名+![](http://upload-images.jianshu.io/upload_images/1458573-f6dd8819ccce4e2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这个玩意应该就是ViewBinder的实现类了，但是我找遍ButterKnife的源码，都找不到该实现类的源码。
于是，源码解析卡在这里了。后来，看了AbstractProcessor的相关知识，才知道，注解可以分为：运行时注解、编译时注解，
运行时注解就是就是运行时运用反射，动态获取对象、属性、方法等，一般的IOC框架就是这样，可能会牺牲一点效率。
然而，大名鼎鼎的ButterKnife运用的是编译时注解。
编译时注解就是在程序编译时根据注解进行一些额外的操作，ButterKnife在我们编译时，就根据注解，自动生成了一些辅助类。
入口为AbstractProcessor的process方法。好，终于又有方向，继续深入。

###（4）编译时注解****，ButterKnifeProcessor会自动根据注解生成辅助类
在源码中找到了AbstractProcessor的子类：ButterKnifeProcessor
![](http://upload-images.jianshu.io/upload_images/1458573-6a61f20bc6972dbc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
有点坑爹，源码中AbstractProcessor等类会标红，好奇怪，我明明程序可以好好的运行呀，怎么会找不到这些类呢？javax不是jdk自带的api吗？
算了，先不管这了，继续看。
![](http://upload-images.jianshu.io/upload_images/1458573-6e0b53117fdab2f9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
其中，process方法的129行，调用了brewJava方法,哈哈，就是这个方法，会自动创建java文件并写入代码
![](http://upload-images.jianshu.io/upload_images/1458573-2ab99eebae4586a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
我将程序编译后，在![](http://upload-images.jianshu.io/upload_images/1458573-371d7064bab3e9ba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
目录下找到了自动创建的java文件，如下：
看这个类的名称，“$$ViewBinder”,是不是有印象。嘿嘿，ViewBinder的实现类，终于找到了。
![](http://upload-images.jianshu.io/upload_images/1458573-7475f2d237aeb671.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
第11行，调用findRequiredView方法
![](http://upload-images.jianshu.io/upload_images/1458573-327a86b2a9c71707.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-526c637a8fb88436.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
首先，调用findView,找到View类型的目标对象
坑爹啊，抽象方法，那么实现方法在哪呢？再次短路！
![](http://upload-images.jianshu.io/upload_images/1458573-ccc8e1b3ef278f73.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
好吧，暂时略过，先去看看转换View类型的方法，发现其实就是强转而已
![](http://upload-images.jianshu.io/upload_images/1458573-ea5ec1ae09ec129b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

继续寻找findView的实现类，全局搜索“findView(”,然后发现：
![](http://upload-images.jianshu.io/upload_images/1458573-9fe3468bb28efe12.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

上面的抽象方法findView其实也在枚举类Finder中，好吧，原来枚举类中可以定义抽象方法，而且，枚举值，还可以实现它的抽象方法，表示又学到了一招。
我们传入的为Activity，于是，见第100行，哈哈，熟悉的findViewById终于看到了。好！ButterKnife的@bind注解的流程已经走通了，下面再看@OnClick的流程：

返回去看那个自动生成的$$ViewBinder类，
![](http://upload-images.jianshu.io/upload_images/1458573-fe0bb7ca64bbc95c.png)

见第17行，DebouncingOnClickListener即为点击事件的监听器，
![](http://upload-images.jianshu.io/upload_images/1458573-81ed13483f91a174.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第26行，在onClick方法中，调用了抽象方法doClick，实现方法在哪呢？在自动生成的辅助类中，见$$ViewBinder类的第18行。
![](http://upload-images.jianshu.io/upload_images/1458573-e0761ceaca989a6c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实现方法中，调用了target.doMyClick(po),嘿嘿，回去看我们的使用类LoginActivity，见第44行，好！ButterKnife的@bind注解的流程也走通了！
![](http://upload-images.jianshu.io/upload_images/1458573-8316370bf099ecef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

那么，到这就大功告成了吗？不！
现在我们只知道，ButterKnife在编译时，根据注解，自动生成了一个辅助类，这个辅助类，帮我们搞定了findViewById和OnClick!
但是，这个辅助类的生成细节，我们还不是很清楚。

###（5）分析ButterKnifeProcessor自动生成代码的细节

通过前面的分析，我们知道，自动生成主要涉及到两个方法：
入口方法process
写码方法brewJava

再次回顾下最终生成的辅助类：
![](http://upload-images.jianshu.io/upload_images/1458573-d1133ba093c1cbee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

先看与这个类联系最紧密的brewJava方法吧：
![](http://upload-images.jianshu.io/upload_images/1458573-1b704604878244ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

包名、导入类、类名的生成，都可以一目了然，问题是：bind和unbind方法里面的细节，这些都是和我们自己写的代码紧密联系的，它是怎么知道我们的字段名和方法名的？
不得不说，反射和注解真是太牛逼了，也许有一天，真的就可以完全用机器写代码了。好了，先不感慨了，继续看代码：
第104行,调用emitBindMethod方法
第106行，调用emitUnbindMethod方法
![](http://upload-images.jianshu.io/upload_images/1458573-34910d73eabbba7c.png)

第127行，遍历id，调用emitViewBindings方法
![](http://upload-images.jianshu.io/upload_images/1458573-9e40356234e07956.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第198行，看到了辅助类的11行的东东，然后调用了emitHumanDescription方法
![](http://upload-images.jianshu.io/upload_images/1458573-7150239c2fd3f12f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其实这个方法没什么用，看看就过去吧。

再看process:
![](http://upload-images.jianshu.io/upload_images/1458573-768d59c5d2c6a66c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第120行，调用findAndParseTargets方法，查找并解析目标。
不得不说，大牛的代码真的是不用太多的注释的，代码本身就是注释了，实乃吾辈学习楷模！
![](http://upload-images.jianshu.io/upload_images/1458573-dfa685686bbe9323.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-25d202eb12a9893a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其实就是根据不同的注解，分别遍历，这里我们只分析@Bind和@OnClick,所以就只看第148行的parseBind和第156行的findandParseListener了,

![](http://upload-images.jianshu.io/upload_images/1458573-27db446b31a33f1f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
先看parseBind，因为我们的使用类中@Bind的参数只是一个id，这里就只看parseBindOne


啊，快绕糊涂了，先略过吧，大家可以顺着我的思路继续去探究……

## 参考目录
1. [Annotation实战【自定义AbstractProcessor】](http://www.cnblogs.com/avenwu/p/4173899.html)
2. [Android 打造编译时注解解析框架 这只是一个开始](http://blog.csdn.net/lmj623565791/article/details/43452969)