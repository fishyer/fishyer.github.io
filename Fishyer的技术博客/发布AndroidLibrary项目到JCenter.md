---
link: https://www.notion.so/Android-Library-JCenter-f0f18c3145814fcebeb806612e775b6e
notionID: f0f18c31-4581-4fce-beb8-06612e775b6e
---

## 1、注册Bintray账号
[传送门](https://bintray.com)
注册后在个人信息编辑页面找到API Key
然后新建仓库maven,**名字必须是maven,否则插件会报错！**
然后在仓库下新建自己的Library，
**名字必须和Module名一致,否则插件会报错！**

## 2、在项目build.gradle中添加插件
```
classpath 'com.github.dcendents:android-maven-gradle-plugin:1.3'
classpath 'com.jfrog.bintray.gradle:gradle-bintray-plugin:1.6'
```

## 3、在模块build.gradle中使用插件
```
apply from: "https://raw.githubusercontent.com/xiaopansky/android-library-publish-to-jcenter/master/bintrayUpload.gradle"
```

## 4、在模块目录下，新建project.properties
```
#project
project.name=super-adapter
project.groupId=com.yutianran.maven
project.artifactId=super-adapter
project.packaging=aar
project.siteUrl=https://github.com/fishyer/SuperAdapter
project.gitUrl=https://github.com/fishyer/SuperAdapter.git

#javadoc
javadoc.name=super-adapter
```

## 5、在模块目录下，新建local.properties
```
#bintray
bintray.user=yutianran
bintray.apikey=[你的API Key]

#developer
developer.id=yutianran
developer.name=yutianran
developer.email=yutianran@aliyun.com
```

## 6、上传到到Bintray
打开终端，在项目目录下，执行：
```
./gradlew bintrayUpload
```

## 7、进入Bintray网站，查看上传信息
![](1458573-f07542a0b537dc62.png)

## 8、引用库
![](1458573-c2caf72a15830948.png)
```
compile 'com.yutianran.maven:super-adapter:1.0.0'
```

此时还没有添加到Jcenter中，需要自己提交下，会有审核延迟
![](1458573-da86c63ea56d7b22.png)

在未审核通过之前，可以这样使用自己的maven仓库：
```
maven {
    url 'https://dl.bintray.com/yutianran/maven/'
}
```

随便介绍下自己的这个super-adapter库，这是一个RecyclerView的万能Adapter库，快速实现单布局列表、多布局列表、多布局多列的列表等。详情参见：[Adapter的封装之路](http://www.jianshu.com/p/f530318be47a )

## 参考目录
1. [5分钟发布AndroidLibrary项目到JCenter](http://www.jianshu.com/p/0e7b8e14f0cd/comments/1050253)
2. [如何使用Android Studio把自己的Android library分发到jCenter和Maven Central](http://www.devtf.cn/?p=760)
3. [Android 快速发布开源项目到jcenter](http://blog.csdn.net/lmj623565791/article/details/51148825)