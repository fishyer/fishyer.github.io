---
link: https://www.notion.so/Flutter-54777e504e084cd69407b7541b02649e
notionID: 54777e50-4e08-4cd6-9407-b7541b02649e
---
#Flutter

## 1.移动开发中三种跨平台技术

![](http://static.zybuluo.com/yutianran/ggsr311hcoqqae8slxaliqob/image_1d1n7p3c91tcosr51fb47p51d009.png)

Flutter使用Skia作为其2D渲染引擎，Android系统内置Skia,iOS系统未内置Skia

## 2.编译机制

Flutter使用Dart做为开发语言

Java：我们开发的 Java 的源代码，首先通过 Javac 编译成为字节码（bytecode），然后，在运行时，通过 Java 虚拟机（JVM）内嵌的解释器将字节码转换成为最终的机器码。但是常见的 JVM，比如我们大多数情况使用的 Oracle JDK 提供的 Hotspot JVM，都提供了 JIT（Just-In-Time）编译器，也就是通常所说的动态编译器，JIT 能够在运行时将热点代码编译成机器码，这种情况下部分热点代码就属于编译执行，而不是解释执行了。

JIT与AOT：（JIT，即Just-in-time,动态(即时)编译，边运行边编译；AOT，Ahead Of Time，指运行前编译）除了我们日常最常见的 Java 使用模式，其实还有一种新的编译方式，即所谓的 AOT，直接将字节码编译成机器代码，这样就避免了 JIT 预热等各方面的开销，比如 Oracle JDK 9 就引入了实验性的 AOT 特性，并且增加了新的 jaotc 工具。

Android：在Android N（7.0）中引入了一种新的编译模式，同时使用JIT和AOT。

Dart：支持JIT和AOT，建议开发时使用JIT(安装快，运行慢),发布时使用AOT(安装慢，运行快)

Dart是类型安全的语言，支持静态类型检测

## 3.Flutter架构图

![](http://static.zybuluo.com/yutianran/yocr4tyytnh02eshwlogbjww/image_1d1n91nm1o2vpsakue1ebe1m2hm.png)

Rendering：构建UI树
Widgets层：基础组件库

## 4. 项目构建的依赖关系

![](http://static.zybuluo.com/yutianran/s8096953bedcrkbrvx59tra7/di.jpg)

Flutter的包管理普遍 [pub.dartlang.org/,类似maven](http://pub.dartlang.org/,类似maven)

## 5. 关于abi和cpu之间的关系

![](http://static.zybuluo.com/yutianran/wwkmbfuiym6z7vg885jcjcac/image_1d1nta0mfv0i1hgl1v971rdd1uj81o.png)

## 6. Android旧项目集成Flutter

1. 新建flutter_module项目

2. run一下，生成apk和aar包

3. 解压apk包，复制assets/flutter_shared/icudtl.dat到旧项目

4. 在旧项目依赖aar包即可

## 7. Flutter命令

flutter doctor
flutter run
flutter build apk
flutter packages get
dart --version

## 8. 遇到问题

1. flutter build apk

&ensp;&ensp;&ensp;&ensp; [https://github.com/flutter/flutter/issues/15646](https://github.com/flutter/flutter/issues/15646)

## 相关资源

1. [《Flutter实战》](https://book.flutterchina.club/chapter1/flutter_intro.html)

