tags: java
date: 2016-10-20

![](2020-08-03-15-33-28.jpg)

## 1.泛型类
不用泛型的容器类：

```
public class Container {
    private String key;
    private String value;

    public Container(String k, String v) {
        key = k;
        value = v;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
```
Container类保存了一对key-value键值对，但是类型是定死的，也就说如果我想要创建一个键值对是String-Integer类型的，当前这个Container是做不到的，必须再自定义。那么这明显重用性就非常低。

>当然，我可以用Object来代替String，并且在Java SE5之前，我们也只能这么做，由于Object是所有类型的基类，所以可以直接转型。但是这样灵活性还是不够，因为还是指定类型了，只不过这次指定的类型层级更高而已，有没有可能不指定类型？有没有可能**在运行时才知道具体的类型是什么**？

这，就是泛型出现的意义！

使用泛型的容器类：
```
public class Container<K, V> {
    private K key;
    private V value;

    public Container(K k, V v) {
        key = k;
        value = v;
    }

    public K getKey() {
        return key;
    }

    public void setKey(K key) {
        this.key = key;
    }

    public V getValue() {
        return value;
    }

    public void setValue(V value) {
        this.value = value;
    }
}
```
在编译期，是无法知道K和V具体是什么类型，只有在运行时才会真正根据类型来构造和分配内存。可以看一下现在Container类对于不同类型的支持情况：

```
public class Test {

    public static void main(String[] args) {
        Container<String, String> c1 = new Container<String, String>("name", "findingsea");
        Container<String, Integer> c2 = new Container<String, Integer>("age", 24);
        Container<Double, Double> c3 = new Container<Double, Double>(1.1, 2.2);
        System.out.println(c1.getKey() + " : " + c1.getValue());
        System.out.println(c2.getKey() + " : " + c2.getValue());
        System.out.println(c3.getKey() + " : " + c3.getValue());
    }
}
```
输出：
>name : findingsea
age : 24
1.1 : 2.2

## 2.泛型接口

在泛型接口中，生成器是一个很好的理解，看如下的生成器接口定义:

```
public interface Generator<T> {
    public T next();
}
```
然后定义一个生成器类来实现这个接口，看我的next方法的返回值，自动变成具体类型（String）了有木有？：

```
public class FruitGenerator implements Generator<String> {

    private String[] fruits = new String[]{"Apple", "Banana", "Pear"};

    @Override
    public String next() {
        Random rand = new Random();
        return fruits[rand.nextInt(3)];
    }
}
```
调用：

```
public class Test {

    public static void main(String[] args) {
        FruitGenerator generator = new FruitGenerator();
        System.out.println(generator.next());
        System.out.println(generator.next());
        System.out.println(generator.next());
        System.out.println(generator.next());
    }
}
```
输出：

```
Banana
Banana
Pear
Banana
```


## 3.泛型方法
>一个基本的编程原则是：

>无论何时，只要你能做到，你就应该尽量使用泛型方法。也就是说，如果使用泛型方法可以取代将整个类泛化，那么应该有限采用泛型方法。

下面来看一个简单的泛型方法的定义：
```
public class Test {

    public static <T> void out(T t) {
        System.out.println(t);
    }

    public static void main(String[] args) {
        out("findingsea");
        out(123);
        out(11.11);
        out(true);
    }
}
```
可以看到方法的参数彻底泛化了，这个过程涉及到编译器的类型推导和自动打包，也就说原来需要我们自己对类型进行的判断和处理，现在编译器帮我们做了。这样在定义方法的时候不必考虑以后到底需要处理哪些类型的参数，大大增加了编程的灵活性。

再看一个泛型方法和可变参数的例子：

```
public class Test {

    public static <T> void out(T... args) {
        for (T t : args) {
            System.out.println(t);
        }
    }

    public static void main(String[] args) {
        out("findingsea", 123, 11.11, true);
    }
}
```

## 4.类型擦除
**代码片段1：**

```
Class c1 = new ArrayList<Integer>().getClass();
Class c2 = new ArrayList<String>().getClass();
System.out.println(c1 == c2);

//输出：true
```
显然在平时使用中，ArrayList<Integer>()和new ArrayList<String>()是完全不同的类型，但是在这里，程序却的的确确会输出true。

>这就是Java泛型的**类型擦除**造成的!

因为不管是ArrayList<Integer>()还是new ArrayList<String>()，都在编译器被编译器擦除成了ArrayList。那编译器为什么要做这件事？原因也和大多数的Java让人不爽的点一样——**兼容性**。由于泛型并不是从Java诞生就存在的一个特性，而是等到SE5才被加入的，所以为了兼容之前并未使用泛型的类库和代码，不得不让编译器擦除掉代码中有关于泛型类型信息的部分，这样最后生成出来的代码其实是『泛型无关』的，我们使用别人的代码或者类库时也就不需要关心对方代码是否已经『泛化』，反之亦然。

在编译器层面做的这件事（擦除具体的类型信息），使得Java的泛型先天都存在一个让人非常难受的缺点：
>在泛型代码内部，无法获得任何有关泛型参数类型的信息。

**代码片段2：**

```
List<Integer> list = new ArrayList<Integer>();
Map<Integer, String> map = new HashMap<Integer, String>();
System.out.println(Arrays.toString(list.getClass().getTypeParameters()));
System.out.println(Arrays.toString(map.getClass().getTypeParameters()));

//输出：
[E]
[K, V]
```

关于getTypeParameters()的解释：
>Returns an array of TypeVariable objects that represent the type variables declared by the generic declaration represented by this GenericDeclaration object, in declaration order. Returns an array of length 0 if the underlying generic declaration declares no type variables.

我们期待的是得到泛型参数的类型，但是实际上我们只得到了一堆占位符。

**代码片段3：**

```
public class Main<T> {

    public T[] makeArray() {
        // error: Type parameter 'T' cannot be instantiated directly
        return new T[5];
    }
}
```
我们无法在泛型内部创建一个T类型的数组，原因也和之前一样，T仅仅是个占位符，并没有真实的类型信息，实际上，除了new表达式之外，instanceof操作和转型（会收到警告）在泛型内部都是无法使用的，而造成这个的原因就是之前讲过的编译器对类型信息进行了擦除。

同时，面对泛型内部形如T var;的代码时，记得多念几遍：它只是个Object，它只是个Object……

**代码片段4：**

```
public class Main<T> {

    private T t;

    public void set(T t) {
        this.t = t;
    }

    public T get() {
        return t;
    }

    public static void main(String[] args) {
        Main<String> m = new Main<String>();
        m.set("findingsea");
        String s = m.get();
        System.out.println(s);
    }
}

//输出：findingsea
```
虽然有类型擦除的存在，使得编译器在泛型内部其实完全无法知道有关T的任何信息，但是编译器可以保证重要的一点：
>***内部一致性***，也是我们放进去的是什么类型的对象，取出来还是相同类型的对象，这一点让Java的泛型起码还是有用武之地的。

代码片段四展现就是编译器确保了我们放在t上的类型的确是T（即便它并不知道有关T的任何类型信息）。这种确保其实做了两步工作：

***set()*** 处的类型检验
***get()*** 处的类型转换
这两步工作也称为***边界动作***。

**代码片段5：**

```
public class Main<T> {

    public List<T> fillList(T t, int size) {
        List<T> list = new ArrayList<T>();
        for (int i = 0; i < size; i++) {
            list.add(t);
        }
        return list;
    }

    public static void main(String[] args) {
        Main<String> m = new Main<String>();
        List<String> list = m.fillList("findingsea", 5);
        System.out.println(list.toString());
    }
}

//输出：[findingsea, findingsea, findingsea, findingsea, findingsea]
```
代码片段5同样展示的是泛型的内部一致性。

## 5.擦除的补偿
如上看到的，但凡是涉及到确切类型信息的操作，在泛型内部都是无法工作的。那是否有办法绕过这个问题来编程，答案就是:
>显式地传递类型标签。

**代码片段6：**

```
public class Main<T> {

    public T create(Class<T> type) {
        try {
            return type.newInstance();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static void main(String[] args) {
        Main<String> m = new Main<String>();
        String s = m.create(String.class);
    }
}
```
代码片段6展示了一种用类型标签生成新对象的方法，但是这个办法很脆弱，因为这种办法要求对应的类型必须有默认构造函数，遇到Integer类型的时候就失败了，而且这个错误还不能在编译器捕获。

进阶的方法可以用限制类型的显式工厂和模板方法设计模式来改进这个问题，具体可以参见《Java编程思想 （第4版）》P382。

**代码片段7：**

```
public class Main<T> {

    public T[] create(Class<T> type) {
        return (T[]) Array.newInstance(type, 10);
    }

    public static void main(String[] args) {
        Main<String> m = new Main<String>();
        String[] strings = m.create(String.class);
    }
}
```
代码片段7展示了对泛型数组的擦除补偿，本质方法还是通过显式地传递类型标签，通过Array.newInstance(type, size)来生成数组，同时也是最为推荐的在泛型内部生成数组的方法。

## 参考目录
1. [Java泛型：类型擦除](https://segmentfault.com/a/1190000003831229#articleHeader0)