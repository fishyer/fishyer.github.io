tags: java

## 1.假克隆
### 1.1测试代码
```
 /**
     * 假克隆
     * <p>
     * 只复制了对象，没有复制对象的引用
     */
    private static void testFakeClone() {
        //源对象
        Bean bean = new Bean("张三", new Boss("老大"));

        //这是克隆对象
        Bean clone = bean;
        clone.setName("小明");
        clone.getBoss().setName("头");

        System.out.println("这是原始数据：");
        System.out.println(JSON.toJSONString(bean));
        System.out.println("这是假克隆：");
        System.out.println(JSON.toJSONString(clone));
    }
```

### 1.2.输出结果：
```
 //这是原始数据：
{
  "boss": {
    "name": "头"
  },
  "name": "小明"
}
//这是假克隆：
{
  "boss": {
    "name": "头"
  },
  "name": "小明"
}
```

### 1.3.结果分析
这里，我们修改了克隆对象的属性之后，源对象的属性也同样变了，关系如图所示(图是盗来的，不要纠结于名称)：
![](2020-08-03-15-25-35.jpg)

## 2.浅克隆
### 2.1.测试代码
```
/**
     * 浅克隆
     * <p>
     * 既复制了对象，也复制了对象的引用
     * 但是如果引用还存在引用，而更深层的引用如果没有实现cloneable接口，就还是会指向源对象
     */
    private static void testShallowClone() {
        //源对象
        Bean bean = new Bean("张三", new Boss("老大"));

        //这是克隆对象
        Bean clone = bean.clone();
        clone.setName("小明");
        clone.getBoss().setName("头");

        System.out.println("这是原始数据：");
        System.out.println(JSON.toJSONString(bean));
        System.out.println("这是浅克隆：");
        System.out.println(JSON.toJSONString(clone));
    }
```
需要Bean实现Cloneable接口：

```
/**
     * 被克隆对象
     * <p>
     */
    public static class Bean implements Cloneable {
        private String name;
        private Boss boss;

        public Bean() {
        }

        public Bean(String name, Boss boss) {
            this.name = name;
            this.boss = boss;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Boss getBoss() {
            return boss;
        }

        public void setBoss(Boss boss) {
            this.boss = boss;
        }

        @Override
        protected Bean clone() {
            Bean clone = null;
            try {
                clone = (Bean) super.clone();

            } catch (CloneNotSupportedException e) {
                throw new RuntimeException(e);
            }
            return clone;
        }
    }
```

### 2.2.输出结果
```
//这是原始数据：
{
  "boss": {
    "name": "头"
  },
  "name": "张三"
}
//这是浅克隆：
{
  "boss": {
    "name": "头"
  },
  "name": "小明"
}
```

### 2.3.结果分析
这里，我们修改了克隆对象的属性之后，源对象的name属性没有变，但是更深的引用boss却变了，说明此时源对象和克隆对象所引用的boss对象，其实还是同一个，关系如图所示(图是盗来的，不要纠结于名称)： 
![](2020-08-03-15-26-21.jpg)

## 3.深克隆
### 3.1.测试代码
```
/**
     * 深克隆
     * <p>
     * 将对象序列化，再反序列化生成一个新对象即可
     * Serializable、Parcelable、JSON等均可
     */
    private static void testDeepClone() {
        //源对象
        Bean bean = new Bean("张三", new Boss("老大"));

        //这是克隆对象
        String json = JSON.toJSONString(bean);
        Bean clone = JSON.parseObject(json, Bean.class);
        clone.setName("小明");
        clone.getBoss().setName("头");

        System.out.println("这是原始数据：");
        System.out.println(JSON.toJSONString(bean));
        System.out.println("这是深克隆：");
        System.out.println(JSON.toJSONString(clone));
    }
```

### 3.2.输出结果
```
//这是原始数据：
{
  "boss": {
    "name": "老大"
  },
  "name": "张三"
}
//这是深克隆：
{
  "boss": {
    "name": "头"
  },
  "name": "小明"
}
```

### 3.3.结果分析
![](2020-08-03-15-27-40.jpg)

## 4.总结
1. clone在平时项目中虽然用的不多，但是，区分深克隆和浅克隆却可以帮助我们理解java的内存结构
2. clone的深克隆其实就是序列化和反序列化，这里有很多种选择，Serializable、Parcelable、JSON等均可
3. clone方法不同于new方法,不会执行构造方法

## 5.参考目录
1. [详解Java中的clone方法 -- 原型模式](http://blog.csdn.net/zhangjg_blog/article/details/18369201)