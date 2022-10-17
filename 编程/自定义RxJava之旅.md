tags: 星标

![自定义RxJava之旅](http://upload-images.jianshu.io/upload_images/1458573-fa9d670a54dae7b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 序幕

### 1.什么是RxJava？
[RxJava](https://github.com/ReactiveX/RxJava)是一个针对于Java语言的一个**异步**的响应式编程库。
核心是**【异步】**！！！

### 2.RxJava的特性
1. **事件变换**
2. 链式调用
3. 观察者模式
4. 异常传递
5. 线程控制

核心特性是**【事件变换】**！在事件变换的基础上，才有了其它的特性！

最大的用处就是**像调用同步的方法那样去调用异步的方法**。

### 3.RxJava有什么用？
如果有这样的需求：获取指定标签的新闻列表,得到其中最新的新闻,保存它并返回Uri，你会怎么写？注意：getNewsList和save都是耗时操作哦！你希望可以这样：
![同步方式](http://upload-images.jianshu.io/upload_images/1458573-5d9786f6a6b299ea?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是，为了避免**【阻塞主线程】**，你不得不写这样的**迷之缩进**：
![迷之缩进](http://upload-images.jianshu.io/upload_images/1458573-e40b7fcd6796e8db?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

好吧，现在确实是不会阻塞主线程了，但是，这样的代码，你不觉得难以阅读么？这还好只有两层回调，那要是来个四五层回调的嵌套，那代码，想想也是醉了，相信没有人愿意看四五层回调的代码！这就是传说中的**【回调地狱】**！

如果用了RxJava的话，那你可以这样实现：
![RxJava方式](http://upload-images.jianshu.io/upload_images/1458573-f7e032dbcea5614d?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

好吧，如果你说你没玩过Lambda表达式，那好，我们就不用Lambda表达式简写了，来点原始的：

![原始的RxJava方式](http://upload-images.jianshu.io/upload_images/1458573-3c03d1c9a9e55c61?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看，这就是RxJava的好处：**简洁，能把任何复杂逻辑都能串成一条线**。

现在，心动了吧？那么，从现在开始，我们一步步的自己实现一个简单版的RxJava吧！相信看完之后，大家对于RxJava一定可以豁然开朗！

准备开始自定义RxJava之旅：

还是上面的例子，让大家看看如何将一个回调嵌套变成链式调用！

需求：获取指定标签的新闻列表,得到其中最新的新闻,保存它的Uri

条件：现在我们有个第三方的API，可以获取指定标签的所有新闻列表,每条新闻包含时间和内容等，同时API也可以保存单条新闻得到一个URI地址。

补充：假设第三方提供的jar里面提供了Api和ApiImpl,不可再更改:并且getNewsList耗时1.5秒，save耗时0.5秒。

![第三方接口](http://upload-images.jianshu.io/upload_images/1458573-a65c6fe11c24cab4?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![第三方接口的实现类](http://upload-images.jianshu.io/upload_images/1458573-c25f0c48361c64dd?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 自定义RxJava之旅
### 1.同步方式
实现代码：
![同步方式实现代码](http://upload-images.jianshu.io/upload_images/1458573-d9d5080d4113cbe5?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码：
![同步方式测试代码](http://upload-images.jianshu.io/upload_images/1458573-c9b51c79abdd3616?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输出日志：
![同步方式输出日志](http://upload-images.jianshu.io/upload_images/1458573-f8b2d0612eecf7d7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里的getNewsList和save都是耗时操作，会阻塞主线程，显然同步方式不适用！

准备开始异步回调方式：

因为原始的Api并没有给我们提供异步的调用方式，所以在正式开始之前，我们需要将原始的APi转换成异步的ApiAsync,所以我们添加了几个辅助类：ApiAsync、Callback

![接口的异步封装](http://upload-images.jianshu.io/upload_images/1458573-6b6215d8a3e619d7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![泛型回调](http://upload-images.jianshu.io/upload_images/1458573-76d834b5d09cad2a?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)在ApiAsync中，我自己将api.getNewsList放在了一个子线程中，这样就不怕阻塞主线程了。这里，用到了一个自定义的线程池，不记得了的童鞋可以查看我的另一篇博文：[Java-线程池](http://blog.csdn.net/fisher0113/article/details/51505106)

### 2.异步回调方式
实现代码：
![异步回调方式实现代码](http://upload-images.jianshu.io/upload_images/1458573-8350dd6bb9cede2b?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码：
![异步回调方式测试代码](http://upload-images.jianshu.io/upload_images/1458573-68ae1a19c483c6d7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输出日志：
![异步回调方式输出日志](http://upload-images.jianshu.io/upload_images/1458573-e463d1619e9735d6?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里我没有将最后得到的Uri切换回主线程，这涉及到线程间通讯的问题，详情可查看我的另一篇博文：[自定义消息传递机制](http://blog.csdn.net/fisher0113/article/details/51824666)

由日志可知，**【主线程阻塞】**的问题解决了，获取新闻列表是在thread-1执行的，保存得到URI是在thread-2执行的，但是，新的问题又来了：**【回调嵌套】**！怎么办？耐心看！

准备开始最原始的异步任务方式
---
同样的，需要先引入几个辅助类：ApiWork、AsyncWork

![接口的异步任务式封装](http://upload-images.jianshu.io/upload_images/1458573-9e85bb210ff12684?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![异步任务](http://upload-images.jianshu.io/upload_images/1458573-7a6041707ee5a782?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这是一个很重要的封装！！！
这里，我们将异步操作抽象成一个对象。
我们看接口封装类ApiWork中的异步操作的特点：
1. 入参（tag、news）,
2. 返回AsyncWork< T>,T为(List< News>、Uri)。
3. AsynWork内部实现了start方法，将回调传递给ApiAsync对象的(getNewsList、save)等方法。

**再次说明：任何异步操作需要携带所需的常规参数和一个回调实例对象**。

通过将异步操作抽象成对象，以后我们就可以在异步任务的抽象类中定义一些常用的变换逻辑（RxJava称之为操作符，例如：map、flatMap等），这样，就可以避免在具体的异步任务中，要做一些变换时，又要写一大堆业务无关的模板代码！

### 3.异步任务方式-原始
实现代码：
![异步任务方式-原始实现代码](http://upload-images.jianshu.io/upload_images/1458573-221ba9767b6429da?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码：
![异步任务方式-原始测试代码](http://upload-images.jianshu.io/upload_images/1458573-470f4961ade8c8df?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输出日志：
![异步任务方式-原始输出日志](http://upload-images.jianshu.io/upload_images/1458573-c50760381aa8cbca?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在实现时，大家记住AsyncWork<T>只是一个异步任务的封装，只有调用了start之后，任务才真正开始执行！姑且可以认为start也是一个特殊的操作符：
>start:
作用:AsyncWork T> -> T
说明:调用start方法,执行异步任务,通过接口回调,得到结果T

这里相比第2种异步方式，似乎更复杂了啊！回调还是有两层嵌套，而且还多绕了几个弯，还不如以前好懂了呢，这不是吃饱了撑着么？别急，接下来见分晓！

准备开始异步任务方式-事件变换
---
根据刚才的实现流程，我们知道异步任务的变换流程是：
1. AsyncWork<List<News>>：获取新闻列表的异步任务
2. AsyncWork<News>：获取最新新闻的异步任务
3. AsyncWork<Uri>：保存新闻得到URI的异步任务 

(其实获取AsyncWork<News>并不是异步的操作，不过，不要曲解了我的异步任务的意思： 异步任务：是指可以支持异步操作，但并不是只支持异步操作)将一个异步任务变换成另一个异步任务，这就是**【事件变换】**，这也是RxJava的核心特性！！！

### 4.异步任务方式-事件变换
实现代码：
![异步任务方式-事件变换实现代码](http://upload-images.jianshu.io/upload_images/1458573-74ea07f3dce476a2?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码：
![异步任务方式-事件变换测试代码](http://upload-images.jianshu.io/upload_images/1458573-846610d97580ef0e?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输出日志：
![异步任务方式-事件变换输出日志](http://upload-images.jianshu.io/upload_images/1458573-0f4d03584733ae6b?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)这里，我们将三步操作，分成了三个异步任务，开始有了一点链式调用的影子了。

不过，在每个任务里面，还有着大量的业务无关的模板代码：
1. 获取AsyncWork< News>时，只有getLatestNews(newsList)是有用的！
2. 获取AsyncWork< Uri>时，只有apiWork.save(result)是有用的！

这显然还存在着很大的优化空间，是时候干掉那些模板代码了！

准备开始异步任务方式-操作符控制事件变换
---
将上一种实现方式中，获取AsyncWork< News>的逻辑泛型化，其实就是：AsyncWork< T> -> AsyncWork< R> (T指List< News>,R指News)

上面我们已经提到了：
>将异步操作抽象成对象，以后我们就可以在异步任务的抽象类中定义一些常用的变换逻辑

这里的AsyncWork<T> -> AsyncWork<R> 显然就是一个常用的变换逻辑。于是我们拓展一下我们的AsyncWork<T>抽象类！
>定义一个map方法：
入参：T,R
出参：AsyncWork<R>

如何实现map方法呢？先看我们上一种实现方式里面是如何实现AsyncWork<List<News>> 变换成AsyncWork<News>的：

![map的来源](http://upload-images.jianshu.io/upload_images/1458573-f7e62caa77171955?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

泛化一下就是：
![map的泛化](http://upload-images.jianshu.io/upload_images/1458573-855caf33cca2780b?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个castT2R的方法显然应该是抽象方法，不应该由自己实现的，于是，我们又引入了一个辅助类：

![类型变换泛型接口](http://upload-images.jianshu.io/upload_images/1458573-dd3669920318b4a6?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

引用这个辅助类之后，我们的map就可以调整成：

![map操作符](http://upload-images.jianshu.io/upload_images/1458573-833a3a05eae52b03?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

好了！第一个操作符map搞定：
>map
作用:AsyncWork<T> --> AsyncWork<R>
说明:Func接口的call方法中实现(T -> R)

于是上一种实现方式的第二步-获取AsyncWork<News>，就可以用map来简化了。
![map的使用](http://upload-images.jianshu.io/upload_images/1458573-7e3175610eb98d91?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

那么上一种实现方式的第三步-获取AsyncWork< Uri>，可以使用map来简化么？
![map的局限](http://upload-images.jianshu.io/upload_images/1458573-c570a570b912a0cc?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在将News变换成Uri的时候，卡住了！！！
因为我们现有的api没有实现：News -> Uri
只有一个api(也就是save)实现了：News -> AsyncWrok< Uri>

这里我们就对map方法的使用条件也就更清楚了：存在方法：T -> R

既然map无法实现，那我们就再定义一个操作符吧！
于是我们再次拓展一下我们的AsyncWork<T>抽象类！

>定义一个flatMap方法：
入参：T,R
出参：AsyncWork< R>
条件：存在方法：T -> AsyncWork<R>

如何实现flatMap方法呢？老规矩，先看我们上一种实现方式里面是如何实现AsyncWork<News> 变换成AsyncWork<Uri>的：

![flatMap的来源](http://upload-images.jianshu.io/upload_images/1458573-d827d9b9469468fd?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

泛化一下就是：
![flatMap的泛化](http://upload-images.jianshu.io/upload_images/1458573-8bd33f0ce3a94d60?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

同理，这个castT2WorkR的方法也应该是抽象方法，不应该由自己实现的，于是，我们引入了刚才的辅助类-类型变换泛型接口，调整后得到：

![flatMap的实现](http://upload-images.jianshu.io/upload_images/1458573-3026770fe3701319?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 5.异步任务方式-操作符控制事件变换
实现代码：
![异步任务方式-操作符控制事件变换实现代码](http://upload-images.jianshu.io/upload_images/1458573-24dee5fa01ed5686?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码：
![异步任务方式-操作符控制事件变换测试代码](http://upload-images.jianshu.io/upload_images/1458573-c9fb4d2137408d62?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输出日志：
![异步任务方式-操作符控制事件变换输出日志](http://upload-images.jianshu.io/upload_images/1458573-a78c4ee7b183477f?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

现在我们再看，每个异步任务里面都没有嵌套的回调了，终于摆脱**回调地狱**了！

相信看了上面的代码之后，大家也都了解了map和flatMap的作用了：

>想将AsyncWork< T>转成AsyncWork< R>:
1. 如果存在方法：T -> R，则使用map
2. 如果存在方法：T -> AsynWork< R>，则使用flatMap

但是，现在的代码显然还是没有最初的同步方式简洁，所以，是时候玩Lambda表达式！

准备开始Lambda表达式：
---
> Lambda表达式说明：
1. Lambda表达式可以认为是匿名方法,左边是形参,右边是方法体,一般用于接口回调的实现
2. 特别注意:这里接口中不要有相同入参、相同出参的方法,哪怕方法名不同也不行,因为Lambda表达式是在编译时自动根据入参和出参来寻找方法的(存疑！)

一个简单的Lambda用例：
![简单的Lambda用例](http://upload-images.jianshu.io/upload_images/1458573-40f744aa05b28209?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 6.异步任务方式-Lambda简写事件变换
实现代码：
![异步任务方式-Lambda简写事件变换实现代码](http://upload-images.jianshu.io/upload_images/1458573-7365f41a4604529e?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码：
![异步任务方式-Lambda简写事件变换测试代码](http://upload-images.jianshu.io/upload_images/1458573-dd5786be18ea09a5?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输出日志：
![异步任务方式-Lambda简写事件变换输出日志](http://upload-images.jianshu.io/upload_images/1458573-ed24a996ce0d4c16?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

现在的异步方式，是不是和最开始的同步方式，看起来很相似了啊，这就是RxJava的好处，**像写同步的代码一样去写异步的代码!**

### 7.异步任务方式-事件链式变换
实现代码：
![异步任务方式-事件链式变换实现代码](http://upload-images.jianshu.io/upload_images/1458573-830356612a24c346?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码：
![异步任务方式-事件链式变换测试代码](http://upload-images.jianshu.io/upload_images/1458573-2930931df1378435?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输出日志：
![异步任务方式-事件链式变换输出日志](http://upload-images.jianshu.io/upload_images/1458573-ad754f0eb5e5b1bc?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

好了，到这里，我们自定义的RxJava就完结了。下面我们来看看真正的RxJava是怎么玩这个例子的吧！

同样的，首先定义一个辅助类：ApiRx,将原始的Api的接口转成Rx方式的接口

![Rx方式的接口](http://upload-images.jianshu.io/upload_images/1458573-7a59ac272c518e6a?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

辅助类搞定，下面正式开始！

### 8.RxJava方式-原始
实现代码：
![RxJava方式-原始实现代码](http://upload-images.jianshu.io/upload_images/1458573-956f578a77cd18a8?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码：
![RxJava方式-原始测试代码](http://upload-images.jianshu.io/upload_images/1458573-63035fbc9438afe4?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输出日志：
![RxJava方式-原始输出日志](http://upload-images.jianshu.io/upload_images/1458573-28689633e8736f06?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 9.RxJava方式-Lambda+链式
如果你偏爱链式调用，那也可以这样：
实现代码：
![RxJava方式-Lambda+链式实现代码](http://upload-images.jianshu.io/upload_images/1458573-ed01ddabac3789d9?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码：
![RxJava方式-Lambda+链式测试代码](http://upload-images.jianshu.io/upload_images/1458573-6c7ff6c4de6070bd?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输出日志：
![RxJava方式-Lambda+链式输出日志](http://upload-images.jianshu.io/upload_images/1458573-49abee9e034ac6ac?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 总结回顾
在最后，我们回顾一下：
首先，将我们的框架AsyncWork与RxJava对比：
1. AsyncWork = Observable 消息发射器
2. Callback = Subscriber 消息接受器
3. asynWork.start() = observable.subscribe()
4. 操作符：AsyncWork只实现了map和flatMap，不过经过上面的实现，自己再另外拓展一个操作符也未必是难事！

然后，我们审视下我们的框架，具备了以下的RxJava的特性：
1. **事件变换**
2. 链式调用
3. 观察者模式
4. 异常传递

就是第5项-线程控制没有实现，关于线程并发这一块，感觉自己还不是太了解，需要进一步研究，以后有成果了，再来和大家分享。

同时，我们会发现：如果一个发射器想将一个消息，发送给多个接收器，用AsyncWork是无能为力的，RxJava的话呢，也需要自己去拓展一个RxBus，感觉还是不如EventBus方便！下次有机会的话，争取再自定义一个EventBus吧，感觉这种模仿一个框架的学习方式，是最能领悟到原来框架的精髓的！

看了那么多的源码解析，但是如果没有自己去实现一次，就算知道了框架的大致结构，一些细节性的东西，还是不太明白的。

> 有的坑，只有自己亲自踩过，才会刻骨铭心！

所有代码均已上传到：[Github](https://github.com/fishyer/JavaStudy/blob/master/src/base/rx/RxJavaStudy.java),欢迎Star!

随便再给大家分享一个学习android进阶知识的好网站：[有心课堂](http://www.stay4it.com/)，传递给你的不仅仅是技术！

**菜鸟一枚，水平有限，欢迎大家指出博文中的不足之处，小鱼将不胜感激！@qq:630709658**

## 参考目录
1. [NotRxJava懒人专用指南](http://www.devtf.cn/?p=323)
2. [给Android开发者的RxJava详解](http://gank.io/post/560e15be2dca930e00da1083)
3. [深入浅出RxJava](http://blog.csdn.net/lzyzsd/article/details/41833541)
4. [用RxJava实现事件总线(Event Bus)](http://www.jianshu.com/p/ca090f6e2fe2/)
5. [用RxJava实现事件总线RxBus并实现同类型事件的区分](http://www.loongwind.com/archives/264.html)
6. [RxBus升级篇](http://www.loongwind.com/archives/277.html)