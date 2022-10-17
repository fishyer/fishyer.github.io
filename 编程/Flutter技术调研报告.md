tags: 星标

## 1.Flutter简介

### 1.1.什么是Flutter

Flutter是Google开发的一套全新的跨平台、开源UI框架，支持iOS、Android系统开发，并且是未来新操作系统Fuchsia的默认开发套件。自从2017年5月发布第一个版本以来，目前Flutter已经发布了近60个版本，并且在2018年12月初发布1.0稳定版。

在Flutter诞生之前，已经有许多跨平台UI框架的方案，比如基于WebView的Cordova、AppCan等，还有使用HTML+JavaScript渲染成原生控件的React Native、Weex等。

Flutter与用于构建移动应用程序的其它大多数框架不同，因为Flutter既不使用WebView，也不使用操作系统的原生控件。Flutter使用Skia作为其2D渲染引擎。

> 注意：Android系统内置Skia,iOS系统未内置Skia，所以ios的包会比Android更大。

![image](http://upload-images.jianshu.io/upload_images/1458573-c6bb1cf0bd39781e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 1.2.Flutter架构图

![image](http://upload-images.jianshu.io/upload_images/1458573-792ddb0c0018e442.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- Flutter Framework：纯 Dart实现的 SDK
    - 底下两层：底层UI库，提供动画、手势及绘制能力
    - Rendering层：构建UI树，当UI树有变化时，会计算出有变化的部分，然后更新UI树，最终将UI树绘制到屏幕上
    - Widgets层：基础组件库，提供了 Material 和Cupertino两种视觉风格的组件库
- Flutter Engine：纯 C++实现的 SDK
    - Skia:渲染引擎
    - Dart:Dart运行时
    - Text:文字排版引擎
    
### 1.3.Flutter渲染机制

1.Flutter 布局渲染的整体流程

在Flutter界面渲染过程分为三个阶段：布局、绘制、合成，布局和绘制在Flutter框架中完成，合成则交由引擎负责。

添加合成图层的理由：由于直接交付给 GPU 多图层视图数据是低效率的，可能会重复绘制，所以还需要进行一步图层的合成，最后才交由引擎负责光栅化视图

![image](http://upload-images.jianshu.io/upload_images/1458573-c57f01484a9bd6a3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2.虚拟DOM技术

![image](http://upload-images.jianshu.io/upload_images/1458573-95b2646f6c24291c.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Widget树：就是我们的UI组件树，但这个只是一种描述信息，渲染引擎是不认识的

RenderObject树：这才是渲染引擎真的认识的，我们需要将 Widget 转化为能用来渲染视图的 Render Object

虚拟DOM解决了一个重要的矛盾：就是 DOM 操作的性能损耗与频繁进行局部 DOM 操作的矛盾

没用虚拟DOM之前：DOM会在每一次元素更新到来之时渲染一次DOM

用了虚拟DOM之后：虚拟DOM会先汇总各个元素的更新情况，通过diff算法计算出与原来 DOM 树的差异，最后通过一次 DOM 更新解决

### 1.4.Flutter编译机制

Flutter之所以采用Dart语言，其中很重要的一点就是因为Dart同时支持JIT和AOT两种编译方式

- 基于JIT的快速开发周期：Flutter在开发阶段采用，采用JIT模式，这样就避免了每次改动都要进行编译，实现极大的节省了开发时间；

- 基于AOT的发布包: Flutter在发布时可以通过AOT生成高效的ARM代码以保证应用性能。而JavaScript则不具有这个能力。

>1. JIT，Just-in-time,动态(即时)编译，边运行边编译;
>2. AOT，Ahead Of Time，指运行前编译;

### 1.5.Flutter项目结构

![image](http://upload-images.jianshu.io/upload_images/1458573-69867fcedaf8d5b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1. android:android平台相关代码
2. ios:ios平台相关代码
3. lib:flutter相关代码，我们主要编写的代码就在这个文件夹
4. test:用于存放测试代码
5. pubspec.yaml:配置文件，一般存放一些第三方的依赖。主要是用Dart的pub包管理工具

### 1.6.目前已使用Flutter的团队

1. 美团
2. 闲鱼
3. 腾讯NOW直播
3. Github等国外大厂

## 2.本次调研的目标

### 2.1.打包成aar，集成到老Android项目

已完成，集成过程基本顺利，除了一个assets里面的icudtl.dat文件，因为gradle脚本 3.0以上的bug，需要自己手动复制到app的assets目录下，其它的问题都不大。

### 2.2.集成grpc

已完成，Dart调用grpc请求的方式非常简单，一行代码可以搞定，都不需要额外的封装了

### 2.3.完成多Item布局的列表，实现App首页效果

已完成，实现过程中主要踩了两个坑：
1. 滚动组件里面再嵌套滚动组件，需要指定高度，不然子组件就是无限高度，导致报错
2. 纵向滑动嵌套横向滑动，需要做一下适配

其它的一些问题，主要还是API的熟悉度问题，写多了布局以后，问题都不大。

## 3.Flutter的优势

1. 跨平台，同一套代码适用于Android和ios两个平台，可以节省开发资源、测试资源
2. 原生性能，使用Skia作为其2D渲染引擎，既不使用WebView，也不使用操作系统的原生控件，这样不仅可以保证在Android和iOS上UI的一致性，而且也可以避免对原生控件依赖而带来的限制及高昂的维护成本
3. 开发效率高，Flutter的热重载可以快速地进行测试、构建UI、添加功能并更快地修复错误
4. 从底层C++到高层Dart，可扩展性高
5. 整体开发环境要求不高，轻量编辑器+模拟器即可完成开发，已支持IDE:Android Studio和VSCode

## 4.目前发现的问题

### 4.1.重要问题

1. 其官方编程语言为Dart，是一门全新的语言。所以说，上手成本比较高，对于移动端开发人员，语言以及框架都是全新的，整个技术栈的积累也都得从头开始
2. 编译后的包体积较大
3. 第三方工具库，目前还比较欠缺，需要自己造轮子
4. 错误提示信息不够友好，难以定位到具体代码行
5. 遇到问题的寂寞，目前应用的人群还较少，有时候遇到问题在社区里面搜不到解决方案

### 4.2.一般问题

1. CPU架构兼容性问题，默认生成的库文件只支持armeabi-v7a,后期应该可以修改编译配置解决此问题
2. 多个Feature同时请求时，可能有的收不到回调，这个可能是Dart的消息机制有关，需要进一步研究，非必现
3. WebView的支持很弱
4. 音视频的支持很弱
5. 整体API像Android ,对iOS开发者上手可能不是非常友好
6. 图片资源的多倍率适配问题，必须提供一倍图，会增大应用体积
7. 如何在Flutter中实现悬停效果，需要调研
8. 如何在Flutter中实现富文本效果，需要调研
9. Flutter和Android/ios之间的通讯机制，需要调研（已有MethodChannel方案，尚未实现）
10. Flutter的国际化支持，需要调研
11. Fluter UI实现嵌套层次太多，可阅读程度不高（很低 ）
12. 境外环境依赖（有国内镜像），新建项目 `dart package get` 不稳定
13. Flutter的设计图标准，比如像素值，和Android和ios的设计标准有区别
14. 图片和文字混排，实现比较麻烦
15. ListView的视图复用机制，需要调研，感觉View多了会有点卡顿
16. 网络图片的缓存机制，需要调研，目前Image所以支持网络图片，但是关于它的缓存，还不清楚

## 5.Demo调研结果

1. Dart语法上手难度：中等，Dart的语法和响应式编程理念和原生开发还是有一定差别，更偏向Web开发
2. UI实现难度：低，在绘制复杂页面方便，比原生更有优势，自定义组件非常方便
3. API丰富性：一般，目前成熟的第三方库还比较少
4. 性能：好
- 帧率：目前只绘制了首页，FPS基本在50fps以上，几乎达到了一般游戏的标准
![image](http://upload-images.jianshu.io/upload_images/1458573-91fddf5fb47a2a1f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 内存：占用低，首页内存占用在60m左右，比Android原生低
Flutter绘制的首页，占用60m左右
![image](http://upload-images.jianshu.io/upload_images/1458573-b04227c8b7529853.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Android原生绘制的首页，内置内存占用240m左右
![image](http://upload-images.jianshu.io/upload_images/1458573-f4e3faa799c9e87f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5. 安装包体积：较大，仅仅绘制了一个首页，安装包就达到了15M。Android项目集成Flutter之前，apk体积是22M，集成Flutter之后，apk体积是32M，增加了10M。

> 总结：在UI方面用Flutter开发确实很有优势，可以加快开发速度，但是涉及系统服务方面的地方，还需要进一步调研

## 6.Demo信息

[Apk下载地址](https://www.pgyer.com/ezbuy-flutter)

## 7.Demo用到的组件

在Flutter中，一切皆组件，这一点需要特别注意

1. StatelessWidget-无状态组件
2. StatefulWidget-有状态组件
3. Image-图片
4. Icon-图标 
5. Text-文字 
6. Container-容器组件，内置Padding、宽高、背景、边框等细节操作 
7. Center-居中显示Layout 
8. Column-纵向排列Layout 
9. Row-横向排列Layout 
10. Wrap-横向排列Layout，自动换行 
11. CustomScrollView-支持嵌套滚动子控件的滚动视图
12. SliverToBoxAdapter-包装普通控件，适配CustomScrollView
13. ListView-单一的List组件，不支持PullRefresh 
14. GideView-网格组件
15. Divider-分割线组件 

## 8.相关资源

1. [Flutter官网](https://flutter.io/)
2. [Flutter中文网](https://flutterchina.club/)
3. [Dart官网](https://www.dartlang.org/)
4. [Github/Flutter](https://github.com/flutter/flutter)
5. [grpc官网](https://grpc.io/docs/quickstart/dart.html)
6. [帮你整理一份快速入门Flutter的秘籍](https://mp.weixin.qq.com/s/nXWri-9dAE0mtjihT3V1Vg)
7. [Dart中文社区](http://www.cndartlang.com/)
8. [玩Android/Flutter资料](http://wanandroid.com/article/query?k=flutter)
9. [Github/grpc-dart](https://github.com/grpc/grpc-dart)
10. [Github/protobuf](https://github.com/dart-lang/protobuf)
11. [官方pub](https://pub.dartlang.org/)
12. [Github/awesome-flutter-cn](https://github.com/crazycodeboy/awesome-flutter-cn)
13. [闲鱼技术/Flutter](https://www.yuque.com/xytech/flutter)