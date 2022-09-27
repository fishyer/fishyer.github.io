---
link: https://www.notion.so/AOP-01-ASM-Class-72b8aff7ff834bb099bc8ef4ed4b6ee7
notionID: 72b8aff7-ff83-4bb0-99bc-8ef4ed4b6ee7
---

#AOP

## 背景

最近在调研在Android中运用AOP，发现主要有这几种技术方案：

![](https://upload-images.jianshu.io/upload_images/1458573-ac777a02493f8654.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1. APT：可以在编译期帮我们生成Java文件（需要手动拼接代码，或使用Javapoet），但无法修改已有Java文件，应用案例：ButterKnife、Dragger2、EventBus3、DataBinding、AndroidAnnotation，主要就是一些DI框架

2. AspectJ：可以修改Java文件，功能强大，最常见的AOP库，但需要学习AspectJ语法，在Android端集成稍复杂，应用案例：Hugo、AspectJx

3. Javassist：可以修改Class字节码，通过反射在编译时加入逻辑，性能较低，应用案例：HotFix

4. ASM：可以修改Class字节码，在编译时插入逻辑，性能好，有ASM Btyecode Outline插件支持生成ASM代码，应用案例：各种JVM上的语言，比如Kotlin

5. ASMDEX、DexMaker：也是静态织入代码，学习成本太高

6. cglib：运行时织入代码，作用于class字节码，常用的动态代理库，比JVM自带的动态代理更灵活，但不适用于Android，因为Android运行时是dex文件，不是class文件

7. xposed、dexposed、epic：运行时hook，有兼容性问题，只适合调试时玩玩，不适合生产环境

也有一些基于上面这些技术方案的工具库，比如Hunter、lancet、X-AOP，但集成到自己的项目中，还是有各种问题。

最开始考虑使用沪江的AspectJx，但是运行时一直报找不到Application的错误，无法运行起来，只好放弃，其实这应该是Android端最简单的AOP方案了，虽然需要学一点AspectJ的语法，但是并不算太难，无奈集成失败，只好放弃。

目前考虑利用ASM+自定义gradle插件，在编译时，通过gradle的Transformer修改Class文件，织入AOP的代码，使用起来会比用AspectJ麻烦一点，但好在有插件写ASM Code，比起用Javassist手动拼接Java代码，还是好一点。

## 开始写一个ASM的Demo

### 1.创建的类的原型

```Java
package com.ezbuy.asmdemo;

/**
 * author : yutianran
 * time   : 2019/01/15
 * desc   :
 * version: 1.0
 */
public class Person {

    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void say(String desc) {
        System.out.println(String.format("Hello,%s", desc));
    }

    public String getInfo() {
        return "name=" + name + ",age=" + age;
    }
}
```


### 2.根据原型，利用插件自动生成的ASM代码

先安装ASM Btyecode Outline插件，重启Android Studio后，右键原型文件，点击show Bytecode outline，

![](https://upload-images.jianshu.io/upload_images/1458573-175da7fe86ceddac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后等它编译完成，就会出现我们想要的ASM的代码


![](https://upload-images.jianshu.io/upload_images/1458573-a501aa8b3d94a028.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

代码如下：

```Java
package com.ezbuy.asmdemo;

import java.util.*;

import org.objectweb.asm.*;

public class PersonDump implements Opcodes {

    public static byte[] dump() throws Exception {

        ClassWriter cw = new ClassWriter(0);
        FieldVisitor fv;
        MethodVisitor mv;
        AnnotationVisitor av0;

        cw.visit(V1_7, ACC_PUBLIC + ACC_SUPER, "com/ezbuy/asmdemo/Person", null, "java/lang/Object", null);

        cw.visitSource("Person.java", null);

        {
            fv = cw.visitField(ACC_PRIVATE, "name", "Ljava/lang/String;", null, null);
            fv.visitEnd();
        }
        {
            fv = cw.visitField(ACC_PRIVATE, "age", "I", null, null);
            fv.visitEnd();
        }
        {
            mv = cw.visitMethod(ACC_PUBLIC, "<init>", "(Ljava/lang/String;I)V", null, null);
            mv.visitCode();
            Label l0 = new Label();
            mv.visitLabel(l0);
            mv.visitLineNumber(14, l0);
            mv.visitVarInsn(ALOAD, 0);
            mv.visitMethodInsn(INVOKESPECIAL, "java/lang/Object", "<init>", "()V", false);
            Label l1 = new Label();
            mv.visitLabel(l1);
            mv.visitLineNumber(15, l1);
            mv.visitVarInsn(ALOAD, 0);
            mv.visitVarInsn(ALOAD, 1);
            mv.visitFieldInsn(PUTFIELD, "com/ezbuy/asmdemo/Person", "name", "Ljava/lang/String;");
            Label l2 = new Label();
            mv.visitLabel(l2);
            mv.visitLineNumber(16, l2);
            mv.visitVarInsn(ALOAD, 0);
            mv.visitVarInsn(ILOAD, 2);
            mv.visitFieldInsn(PUTFIELD, "com/ezbuy/asmdemo/Person", "age", "I");
            Label l3 = new Label();
            mv.visitLabel(l3);
            mv.visitLineNumber(17, l3);
            mv.visitInsn(RETURN);
            Label l4 = new Label();
            mv.visitLabel(l4);
            mv.visitLocalVariable("this", "Lcom/ezbuy/asmdemo/Person;", null, l0, l4, 0);
            mv.visitLocalVariable("name", "Ljava/lang/String;", null, l0, l4, 1);
            mv.visitLocalVariable("age", "I", null, l0, l4, 2);
            mv.visitMaxs(2, 3);
            mv.visitEnd();
        }
        {
            mv = cw.visitMethod(ACC_PUBLIC, "say", "(Ljava/lang/String;)V", null, null);
            mv.visitCode();
            Label l0 = new Label();
            mv.visitLabel(l0);
            mv.visitLineNumber(20, l0);
            mv.visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
            mv.visitLdcInsn("Hello,%s");
            mv.visitInsn(ICONST_1);
            mv.visitTypeInsn(ANEWARRAY, "java/lang/Object");
            mv.visitInsn(DUP);
            mv.visitInsn(ICONST_0);
            mv.visitVarInsn(ALOAD, 1);
            mv.visitInsn(AASTORE);
            mv.visitMethodInsn(INVOKESTATIC, "java/lang/String", "format", "(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;", false);
            mv.visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println", "(Ljava/lang/String;)V", false);
            Label l1 = new Label();
            mv.visitLabel(l1);
            mv.visitLineNumber(21, l1);
            mv.visitInsn(RETURN);
            Label l2 = new Label();
            mv.visitLabel(l2);
            mv.visitLocalVariable("this", "Lcom/ezbuy/asmdemo/Person;", null, l0, l2, 0);
            mv.visitLocalVariable("desc", "Ljava/lang/String;", null, l0, l2, 1);
            mv.visitMaxs(6, 2);
            mv.visitEnd();
        }
        {
            mv = cw.visitMethod(ACC_PUBLIC, "getInfo", "()Ljava/lang/String;", null, null);
            mv.visitCode();
            Label l0 = new Label();
            mv.visitLabel(l0);
            mv.visitLineNumber(24, l0);
            mv.visitTypeInsn(NEW, "java/lang/StringBuilder");
            mv.visitInsn(DUP);
            mv.visitMethodInsn(INVOKESPECIAL, "java/lang/StringBuilder", "<init>", "()V", false);
            mv.visitLdcInsn("name=");
            mv.visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/String;)Ljava/lang/StringBuilder;", false);
            mv.visitVarInsn(ALOAD, 0);
            mv.visitFieldInsn(GETFIELD, "com/ezbuy/asmdemo/Person", "name", "Ljava/lang/String;");
            mv.visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/String;)Ljava/lang/StringBuilder;", false);
            mv.visitLdcInsn(",age=");
            mv.visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/String;)Ljava/lang/StringBuilder;", false);
            mv.visitVarInsn(ALOAD, 0);
            mv.visitFieldInsn(GETFIELD, "com/ezbuy/asmdemo/Person", "age", "I");
            mv.visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(I)Ljava/lang/StringBuilder;", false);
            mv.visitMethodInsn(INVOKEVIRTUAL, "java/lang/StringBuilder", "toString", "()Ljava/lang/String;", false);
            mv.visitInsn(ARETURN);
            Label l1 = new Label();
            mv.visitLabel(l1);
            mv.visitLocalVariable("this", "Lcom/ezbuy/asmdemo/Person;", null, l0, l1, 0);
            mv.visitMaxs(2, 1);
            mv.visitEnd();
        }
        cw.visitEnd();

        return cw.toByteArray();
    }
}
```


### 3.测试类,比较两种方式

好了，原型类和Class生成类我们都有了，现在我们来比较下两种方式创建对象和调用方法的区别

这里为了防止Class命名冲突，我将原型文件重命名为Person2了

```Java
package com.ezbuy.asmdemo;

import com.shanhy.demo.asm.hello.MyClassLoader;

import org.junit.Test;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;

public class TestClient {

    @Test
    public void testFile() throws Exception {
        Person2 libai = new Person2("libai", 24);
        String info = libai.getInfo();
        libai.say(info);
    }

    @Test
    public void testGen() throws Exception {
        //ASM创建Class
        byte[] data = PersonDump.dump();
        MyClassLoader myClassLoader = new MyClassLoader();
        Class<?> personClass = myClassLoader.defineClass("com.ezbuy.asmdemo.Person", data);
        //反射调用构造方法
        Constructor<?> constructor = personClass.getConstructor(String.class, int.class);
        Object libai = constructor.newInstance("libai", 24);
        //反射调用普通方法
        Method getInfo = personClass.getMethod("getInfo", null);
        Object info = getInfo.invoke(libai, null);
        Method say = personClass.getMethod("say", String.class);
        say.invoke(libai, info);
    }

}

```


跑一下test方法，发现两个方法输出结果是一致的

![](https://upload-images.jianshu.io/upload_images/1458573-431d7acbfe173807.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

最后，放一下我这个demo用的依赖

```Groovy
implementation 'junit:junit:4.12'
//ASM相关
implementation 'org.ow2.asm:asm:5.1'
implementation 'org.ow2.asm:asm-util:5.1'
implementation 'org.ow2.asm:asm-commons:5.1'
```


代码已上传到码云:[ASMDemo](https://gitee.com/yutianran02/ASMDemo)

## 总结

可能你会说，我明明可以自己手写一个Java文件啊，干嘛还得这么麻烦去ASM去动态创建Class呢。但是，你想一下，如果你能操控Class文件，可以动态的添加Class、方法、字段，那你可以做多少黑科技的事情啊。在编译的时候，通过gradle提供的Transformer，在这里做做手脚，给原有的方法加加料，比如加上日志统计、性能监控、埋点、权限控制、事务控制、防抖，不是很容易么。只要你定义好在什么时候，加上什么代码，就可以实现批量修改多个Class，而且不侵入原有的Java文件，业务逻辑和通用的切面逻辑解耦，多爽。假如现在要你在你的包下面的每个方法里面都加一个统计该方法的耗时，你原来的方式得修改你的每个方法，但现在，你只需要在编译时加一点料就可以了。

## 相关参考

1. [一文读懂 AOP | 你想要的最全面 AOP 方法探讨](https://www.jianshu.com/p/0799aa19ada1)

2. [eleme/lancet](https://github.com/eleme/lancet)

3. [ASM Bytecode Framework探索与使用](https://www.jianshu.com/p/760229bfe18a)

4. [使用ASM操作Java字节码，实现AOP原理](https://yq.aliyun.com/articles/4798)

