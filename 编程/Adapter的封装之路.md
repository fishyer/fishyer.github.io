---
link: https://www.notion.so/Adapter-49bc6aa37feb4a62b2d35a31bb1eb364
notionID: 49bc6aa3-7feb-4a62-b2d3-5a31bb1eb364
---

#Android

最终成品库已上传到Jcenter:

```Groovy
compile 'com.yutianran.maven:super-adapter:1.0.0'
```


可能还没有通过审核，可以连接我的maven仓库：

```Groovy
maven {
    url 'https://dl.bintray.com/yutianran/maven/'
}
```


## 一、几种常见列表效果：

假如要用RecyclerView实现下面的几种效果，你会如何实现呢？

### **效果1：单布局效果** 

![](http://upload-images.jianshu.io/upload_images/1458573-1927be380afca974.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/310)

**效果2：多布局效果** 

> 有多种Item布局


![](http://upload-images.jianshu.io/upload_images/1458573-31dafe929c00d83d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/310)

**效果3：多布局多列效果** 

> 有多种Item布局，有的Item占1行，有的Item占1/2行


![](http://upload-images.jianshu.io/upload_images/1458573-ba6767e02d35564e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/310)

## 二、使用方法

**1.原始的Adapter-单布局效果** 

![](http://upload-images.jianshu.io/upload_images/1458573-a8cd2fe9d0338d40?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-c5c7fd0cd3399bca?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实现效果如图1。

**2.封装后的单布局的Adapter** 

看！再也不用自己去继承RecyclerView.Adapter，写那么一大坨了，轻轻松松几行代码搞定


![](http://upload-images.jianshu.io/upload_images/1458573-6c5b97bc4c1af6e6?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实现效果如图1。

**3.升级后的多布局的Adapter** 

使用多布局的Adapter时候呢，我需要实现两个方法了，一个绑定布局，一个用来绑定数据，不过也不算麻烦，比起那些写个多布局写的欲仙欲死的原始写法而言，我们已经很幸福了，不算么？

![](http://upload-images.jianshu.io/upload_images/1458573-1b77062abe1eaa4d?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实现效果如图2。

**4.再次升级，多布局-多实体的Adapter** 

简单的多布局呢，就像聊天界面的发送和接受一样，只是布局不一样，但是布局所使用的数据源其实是一致的，就像3里面一样，都是SimpleBean

但是，还有很多坑爹的多布局呢，不只是布局不一样，连数据源也不一样，如果要：
R.layout.item_super对应SuperBean,
R.layout.item_simple对应SimpleBean，

你会怎么搞？

下面看我的用法！用LayoutWrapper<T>包起来，不就统一成一种实体了么？

为了让不同的布局绑定数据之间尽量解耦，我加了一个新的DataHolder，来专门处理布局--数据的映射关系。

![](http://upload-images.jianshu.io/upload_images/1458573-85f8b7ec7fab8250?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实现效果如图2。

**6.究极进化！多布局-多实体-多列的Adapter** 

我们已经实现了多布局中，每个布局都可以对应一个实体了，但是，这就够了么？no! too native!

要知道，产品的想法、UI的创意，是我们这些凡人永远无法预料的？

你能猜到下一版又会改成什么风格么？额，扯远了，先把上面的效果3实现了再说吧，毕竟，这种效果也是非常非常常见的，也是让很多人觉得头疼的，尤其是，当我们要实现这种效果：


![](http://upload-images.jianshu.io/upload_images/1458573-bb1828cd2ab9bd33.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

注意哦！里面的车型、车龄、里程等分组项是后台配的，至于每个分组里面的选择项，就更是不用说了。

当一切都是动态可配置的时候，你该何去何从？还敢用线性布局嵌套多个列表来硬编码么？

其实我们发现这个黑不溜秋的界面，其实也就是上面的效果3的升级版，所以，我们只要能实现效果3就可以了。

下面亮大招！

其实RecyclerView的LayoutManager是可以控制每个Item所占的列数的，所以，我们可以在包装类LayoutWrapper里面，再加一个表示列数的字段即可！

使用时，主要注意两点：

1. GridLayoutManager的列数，应该是所有Item的列数的最小公倍数！比如我有两种Item,分别为一行显示1个和2个，于是最小公倍数是2

2. LayoutWrapper的表示列数的字段，则是最小公倍数/N，N表示一行显示多少个，比如一行显示1个，则为2，一行显示2个，则为1

![](http://upload-images.jianshu.io/upload_images/1458573-d3993e24c1224ef7?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实现效果如图3。搞定收工！

> 其实，你的所有界面，除去导航栏和底部工具栏，中间全部可以用RecyclerView来实现！


每个item表示一块区域，这样分区域的来实现，也是一种很好的解耦思路，避免改了下面的视图，上面的视图莫名其妙的被改了。

## 三.具体的封装过程

> 我想分享的，不仅仅只是工具类，更是封装的思想！


当然，也许我的封装有不妥之处，欢迎和我探讨！@QQ:630709658

### **1.SingleAdapter:将Adapter从具体到泛型** 

思路：

1. 构造时传入layoutId

2. 数据类型泛化

3. 提取出万能的SuperViewHolder

4. bindData的方法抽象化，延迟实现（交由具体的子类实现）

![](http://upload-images.jianshu.io/upload_images/1458573-9a006c4a49de919e?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里还用到了一个封装的万能ViewHolder


![](http://upload-images.jianshu.io/upload_images/1458573-d2dc9d01c9c00b84?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### **2.MultiAdapter:从单布局到多布局** 

思路：

1. 构造时传入layoutId数组

2. 添加layoutMap,记录layoutId--viewType的对应关系

3. bindLayout的方法抽象化，由子类实现Item--layoutId的对应关系

![](http://upload-images.jianshu.io/upload_images/1458573-62d9f2822f535ad0?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里主要有以下两部分：用map存放viewType和layoutId的对应关系

![](http://upload-images.jianshu.io/upload_images/1458573-8251b9eccd8e0f0e?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

用map.entrySet来根据value读取key


![](http://upload-images.jianshu.io/upload_images/1458573-4a5bfbb408c58930?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### **3.SuperAdapter:多布局中，从单实体到多实体** 

思路：

1. 将泛型T升级为包装类LayoutWrapper,持有布局id,泛型数据Item，控制器holder

2. 提取出接口DataHolder，用于实现ViewHolder和ItemData的绑定

![](http://upload-images.jianshu.io/upload_images/1458573-ea82df7a2faa483a?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-a602f83e88d7824a?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-d4f09f759644584d?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**4-LayoutWrapper:多布局中，配置某项可占据多列** 

思路：

1. LayoutWrapper添加spanSize属性，记录该item的列数

2. 使用时调用gridLayoutManager.setSpanSizeLookup来动态设置列数

![](http://upload-images.jianshu.io/upload_images/1458573-a775f17a99f61af4?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后使用时：


![](http://upload-images.jianshu.io/upload_images/1458573-bcf7fe25efffa69c?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1. 如果你的代码中，存在着大段相同或极其相似的代码，那么，开始重构吧！

2. 在不断的重构中，你会发现：实现很重要，如何组织这些实现也同样重要！

3. 重构两个着力点：数据泛型化、方法抽象化

最后和大家分享一句话：

> 封装技术的快速提升，来自于对代码的不断重构


当然，没有单元测试作为保障的重构，谁也不敢说自己就不会在重构中：自己把自己给作死了！so,要重构，更要单测！不说了，我继续研究单元测试了，不得不说，Android这个坑货，单元测试还真麻烦，凡是用到了Android系统的API的地方，一律不能用JUnit测试（在不引入Roboletric的情况下）因为：

> IDE和SDK只为Android开发者提供了开发和编译一个项目的环境，并没有提供运行这个项目的环境！


而运行unit test，说白了还是个运行的过程，所以如果你的unit test代码里面有android相关的代码的话，那运行的时候将会抛出RuntimeException("stub!!”)。

---
 <sub>本文档由[瓦雀](https://www.yuque.com/waquehq)创建</sub>