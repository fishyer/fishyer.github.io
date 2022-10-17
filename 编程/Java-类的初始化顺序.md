tags: java

## 基本顺序
（静态变量、静态初始化块）>（变量、初始化块）>构造器。

## 测试代码
```
package com.che.carcheck.support.test.other;

/**
 * 测试类的初始化顺序
 *
 * 作者：余天然 on 16/5/25 上午11:49
 */
public class TestInitOrder {

    public static void main(String[] args) {
        System.out.println("测试一般类的初始化顺序：");
        new General();

        System.out.println("测试继承类的初始化顺序");
        new Subclass();
    }

    //一般类
    public static class General {
        // 静态变量
        public static String staticField = "静态变量";
        // 变量
        public String field = "变量";

        // 静态初始化块
        static {
            System.out.println(staticField);
            System.out.println("静态初始化块");
        }

        // 初始化块
        {
            System.out.println(field);
            System.out.println("初始化块");
        }

        // 构造器
        public General() {
            System.out.println("构造器");
        }

    }

    //父类
    public static class Parent {
        // 静态变量
        public static String pStaticField = "父类--静态变量";
        // 变量
        public String pField = "父类--变量";

        // 静态初始化块
        static {
            System.out.println(pStaticField);
            System.out.println("父类--静态初始化块");
        }

        // 初始化块
        {
            System.out.println(pField);
            System.out.println("父类--初始化块");
        }

        // 构造器
        public Parent() {
            System.out.println("父类--构造器");
        }

    }

    //子类
    public static class Subclass extends Parent {

        // 静态变量
        public static String sStaticField = "子类--静态变量";
        // 变量
        public String sField = "子类--变量";

        // 静态初始化块
        static {
            System.out.println(sStaticField);
            System.out.println("子类--静态初始化块");
        }

        // 初始化块
        {
            System.out.println(sField);
            System.out.println("子类--初始化块");
        }

        // 构造器
        public Subclass() {
            System.out.println("子类--构造器");
        }

    }
}
```

## 测试结果
测试一般类的初始化顺序：
```
静态变量
静态初始化块
变量
初始化块
构造器
```


测试继承类的初始化顺序
```
父类--静态变量
父类--静态初始化块
子类--静态变量
子类--静态初始化块
父类--变量
父类--初始化块
父类--构造器
子类--变量
子类--初始化块
子类--构造器
```