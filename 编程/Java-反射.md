tags: java

![JAVA反射](http://upload-images.jianshu.io/upload_images/1458573-fc93acd4ac58514e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## JAVA反射机制
> 简单的来说，反射机制指的是程序在运行时能够获取自身的信息。在java中，只要给定类的名字， 那么就可以通过反射机制来获得类的所有信息。

## 一、Class是什么？
>Java程序在运行时，Java运行时系统一直对所有的对象进行所谓的运行时类型标识。这项信息纪录了每个对象所属的类。虚拟机通常使用运行时类型信息选择正确方法去执行，用来保存这些类型信息的类是Class类。

Class类封装一个对象和接口运行时的状态，当装载类时，Class类型的对象自动创建。 Class 没有公共构造方法。Class 对象是在加载类时由 Java 虚拟机以及通过调用类加载器中的 defineClass 方法自动构造的，因此不能显式地声明一个Class对象。

虚拟机为每种类型管理一个独一无二的Class对象。也就是说，每个类（型）都有一个Class对象。运行程序时，Java虚拟机(JVM)首先检查是否所要加载的类对应的Class对象是否已经加载。如果没有加载，JVM就会根据类名查找.class文件，并将其Class对象载入。

基本的 Java 类型（boolean、byte、char、short、int、long、float 和 double）和关键字 void 也都对应一个 Class 对象。       每个数组属于被映射为 Class 对象的一个类，所有具有相同元素类型和维数的数组都共享该 Class 对象。一般某个类的Class对象被载入内存，它就用来创建这个类的所有对象。

## 二、Class类的常用方法
在java.lang.Object 类中定义了getClass()方法，因此对于任意一个Java对象，都可以通过此方法获得对象的类型。Class类是Reflection API 中的核心类，它有以下方法
1. getName()：获得类的完整名字。
2. getFields()：获得类的public类型的属性。
3. getDeclaredFields()：获得类的所有属性。
4. getMethods()：获得类的public类型的方法。
5. getDeclaredMethods()：获得类的所有方法。
6. getMethod(String name, Class[] parameterTypes)：获得类的特定方法，name参数指定方法的名字，parameterTypes 参数指定方法的参数类型。
7. getConstructors()：获得类的public类型的构造方法。
8. getConstructor(Class[] parameterTypes)：获得类的特定构造方法，parameterTypes 参数指定构造方法的参数类型。
9. newInstance()：通过类的不带参数的构造方法创建这个类的一个对象。

**提醒**: 
1. 大家在使用Class实例化其他类的对象的时候，一定要自己定义无参的构造函数
2. 所有类的对象其实都是Class的实例。

## 三、获取Class对象的三种方式

1.通过Object类的getClass()方法。
`例如：Class c1 = new String("").getClass();`
2.通过Class类的静态方法——forName()来实现：
`Class c2 = Class.forName("MyObject");`
3.如果T是一个已定义的类型的话，在java中，它的.class文件名：T.class就代表了与其匹配的Class对象
例如：
```
Class c3 = Manager.class;
Class c4 = int.class;
Class c5 = Double[].class;
```


## 四、几个反射用例
先介绍2个很牛逼的方法：
1. getClass().getDeclaredField("x");//获取类的属性x,无视权限（获取方法类似）
2. setAccessible(true);//设置属性可编辑

实体类
```java
package reflection;

/**
 * yutianran 16/8/1 下午3:45
 */
public class Point {
    private int x;
    public int y;

    public Point() {
    }

    public Point(int x) {
        this.x = x;
    }

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    private void draw(String msg){
        System.out.println("msg="+msg);
    }

    @Override
    public String toString() {
        return "Point{" +
                "x=" + x +
                ", y=" + y +
                '}';
    }
}
```

### 1. 修改私有属性
```java
    //修改私有属性
    private static void modifyFiled() throws Exception {
        Point pt1 = new Point(3, 5);
        Class<?> clazz = pt1.getClass();//通过Ponit对象获取Class实例
        //得到一个字段
        Field fieldY = clazz.getField("y"); //y 是变量名
        //fieldY的值是5么？？ 大错特错
        //fieldY和pt1根本没有什么关系，你看，是pt1.getClass()，是 字节码 啊
        //不是pt1对象身上的变量，而是类上的，要用它取某个对象上对应的值
        //要这样
        System.out.println(fieldY.get(pt1)); //这才是5

        //现在要x了

        /*
        Field fieldX = pt1.getClass().getField("x"); //x 是变量名
        System.out.println(fieldX.get(pt1));
        */

        //运行 报错 私有的，找不到
        //NoSuchFieldException
        //说明getField 只可以得到 公有的
        //怎么得到私有的呢？？

        /*
        Field fieldX = pt1.getClass().getDeclaredField("x"); //这个管你公的私的，都拿来
        //然后轮到这里错了
        // java.lang.IllegalAccessException:
        //Class com.ncs.ReflectTest can not access a member of class com.ncs.Point with modifiers "private"
        System.out.println(fieldX.get(pt1));
        */

        //三步曲 一是不让你知道我有钱 二是把钱晃一下，不给用  三是暴力抢了

        //暴力反射
        Field fieldX = pt1.getClass().getDeclaredField("x"); //这个管你公的私的，都拿来
        fieldX.setAccessible(true);//上面的代码已经看见钱了，开始抢了
        fieldX.set(pt1, 2);//抢到手自己改一下
        System.out.println(pt1.getX());

        //out 2 OK!!
    }
```

### 2.调用私有方法
```java
    //调用私有方法
    private static void invokeMethod() throws Exception {
        Class<?> clazz = Point.class;//通过Ponit类获取Class实例
        //调用Point类中的draw方法
        Method method = clazz.getDeclaredMethod("draw", String.class);
        method.setAccessible(true);
        method.invoke(clazz.newInstance(), "HelloWorld");

    }
```

### 3.调用构造方法
```java
    //调用构造方法
    private static void invokeConstructor() throws Exception {
        Class<?> clazz = Class.forName("reflection.Point");//通过类名获取Class实例
        Point pt1 = null;
        Point pt2 = null;
        Point pt3 = null;
        //取得全部的构造函数
        Constructor<?> cons[] = clazz.getConstructors();

        for (int i = 0; i < cons.length; i++) {
            System.out.println("构造方法：  " + cons[i]);
        }
        //这里构造方法的顺序倒过来了,有点诡异
        pt1 = (Point) cons[2].newInstance();
        pt2 = (Point) cons[1].newInstance(20);
        pt3 = (Point) cons[0].newInstance(49, 81);
        System.out.println(pt1);
        System.out.println(pt2);
        System.out.println(pt3);
    }
```

## 参考目录
1. [深入研究java.lang.Class类](http://lavasoft.blog.51cto.com/62575/15433)
2. [[java反射详解](http://www.cnblogs.com/rollenholt/archive/2011/09/02/2163758.html)](http://www.cnblogs.com/rollenholt/archive/2011/09/02/2163758.html)
3. [java 反射 Field类](http://www.360doc.com/content/11/1231/14/1954236_176297236.shtml#)
4. [Java反射机制](http://wiki.jikexueyuan.com/project/java-reflection/java-classes.html)
5. [Java 反射机制深入研究](http://lavasoft.blog.51cto.com/62575/43218)