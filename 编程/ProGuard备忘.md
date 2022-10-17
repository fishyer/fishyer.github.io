#ProGuard的4种功能：
---
1. 压缩(Shrink) 移除代码中无用的类、字段、方法、和特性
2. 优化(Optimize) 对字节码进行优化，移除无用的指令
3. 混淆(Obfuscate) 使用剪短无意义的名称对类、字段、方法重命名
4. 预检(Preveirfy) 在Java平台上对处理后的代码进行预检

#ProGuard的工作原理
---
ProGuard由Shrink,Optimize,Obfuscate,Preveirfy四个步骤组成，其中每个步骤都是可选的

#编写ProGuard文件
---
##1.基本指令

1. 代码混淆压缩比，在0~7之间，默认为5，-optimizationpasses 5
2. 混淆时不使用大小写混合，混淆的类名为小写 -dontusemixedcaseclassnames
3. 指定不去忽略废公共的库的类 -dontskipnonpubliclibaryclasses
4. 指定不去忽略废公共的库的类的成员 -dontskipnonpubliclibaryclassesmembers
5. 不做预校验 -dontpreverify
6. 生成映射文件 -verbose
7. 使用printmapping指定映射文件的名称 -printmapping proguardMapping.txt
8. 指定混淆时采用的算法-optimizations ! code/ simplification/ arithmetic,!fiedld/*,class/merging/*
9. 保护代码中的Annotation不被混淆 -keepattributes *Annotation*
10. 避免混淆泛型 -keepattributes Signature
11. 抛出异常时保留代码行数 -keepattributes SourceFile,LineNumberTable

##需要保留的:

1.保留本地native方法不被混淆

```java
- keepclasseswithmembernames class * {
native <methods>;
}
```

2.保留某些子类不被混淆
```java
- keep public class * extends android.app.Activity
```

3.保护在XML中设置onClick不被影响
```java
- keepclassmembers class * extends android.app.Activity {
public void *(android.view.View);
}
```

4.保护Fragment 
```java
- keep public class android.support.v4.app.Fragment.** {*;}
```

5.保留枚举不被混淆
```java
- keepclassmembers enum * {
public static **{} values();
public static ** valueOf(Java.lang.String);
}
```

6.保留自定义控件不被混淆
```java
- keep public class * extends android.view.View {
*** get*();
void set*(***);
public <init>(android.content.Context);
public <init>(android.content.Context,android.util.ArrtibuteSet);
public <init>(android.content.Context,android.util.ArrtibuteSet,int);
}
```

7.保留Parcelable序列化不被混淆
```java
- keep class * implements android.os.Parcelable {
public static final android.os.Parcelable$Creator *;
}
```

8.保留Serializable序列化类不被混淆
```java
- keepclassemembers class * implements java.io.Serializable {
static final long serialVersionID;
private static final java.io.ObjectStreamField[] serialPersistentFields;
private void writeObject(java.io.ObjectOutputStream);
private void readObject(java.io.ObjectInputStream);
java.lang.Object writeReplace();
java.lang.Object readResolve();
}
```

9.保留R文件下的资源不被混淆
```java
- keep class **.R${*;}
```

10.保留内部类不被混淆
```java
- keep class com.example.app.ui.MainActivity$*{*;}
```

11.对WebView的处理
```java
- keepclassmembers class * extends android.webkit.webViewClient {
public void *(android.webkit.WebView,java.lang.String,android.graphics.Bitmap);
public boolean *(android.webkit.WebView,java.lang.String);
}
- keepclassmembers class * extends android.webkit.webViewClient {
public void *(android.webkit.webView,java.lang.String);
}
```

12.对JavaScript
```java
- keepclassemembers class com.example.app.MainActivity$JSInterface {
<methods>;
}
```

13.针对第三方库的混淆保护1
```java
- libraryjas libs/android-support-v4.jar
- dontwarn android.support.v4.**
- keep class android.support.v4.**{*;}
- kepp interface android.support.v4.app.**{*;}
- kepp public class * extends android.support.v4.**
- keep public class * extends android.app.Fragment
```