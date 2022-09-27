---
link: https://www.notion.so/Python-1639db87d4174ff0b50a3fa5ea50aa33
notionID: 1639db87-d417-4ff0-b50a-3fa5ea50aa33
---

#! https://zhuanlan.zhihu.com/p/433259455

![](https://yupic.oss-cn-shanghai.aliyuncs.com/202111142357131.png)


[[003-Archive/python]]的[[列表推导式]]，用来实现[[函数式编程]]的map和filter，是一种非常不错的实践。

![](https://yupic.oss-cn-shanghai.aliyuncs.com/202111142229325.png)

我们可以在`output expression`中做map操作，在`if conditions`中做filter操作。

下面我用一个具体的例子来说明一下：平方列表中所有小于0的数

## 最原始的写法

```python
x = range(-5, 5)
new_list=[]
for item in x:
    if item < 0:
        new_item=item*item
        new_list.append(new_item)
print(new_list)
```

## map和filter的函数式编程写法

```python
x = range(-5, 5)
all_less_than_zero = list(map(lambda num: num * num, list(filter(lambda num: num < 0, x))))
print(all_less_than_zero)
```

## 列表推导式的写法

```python
x = range(-5, 5)
all_less_than_zero = [num * num for num in x if num < 0]
print(all_less_than_zero)
```

## 3种写法的对比

我们可以看到，虽然map的写法只有一行了，但是完全被括号和lambda关键字淹没了，反而失去了简介易读的优点。

列表推导式则是非常简洁易懂，也同样只有一行。

## 列表推导式生成字典

和列表类似，区别是最外层使用{},而不是[]

```python
DIAL_CODES = [
    (86, 'China'),
    (91, 'India'),
    (1, 'United States'),
    (7, 'Russia'),
    (81, 'Japan'),
    ]
country_code = {country: code for code, country in DIAL_CODES}
print(country_code)
```

## 参考资料

1. [[翻译]10分钟快速入门Python函数式编程 - 知乎](https://zhuanlan.zhihu.com/p/42621241)
2. [Python列表推导教程(List Comprehensions)_neweastsun的专栏-CSDN博客](https://blog.csdn.net/neweastsun/article/details/98535850)
3. [列表推导式（ comprehensions） - Python 进阶 - 极客学院Wiki](https://wiki.jikexueyuan.com/project/interpy-zh/Comprehensions/list-comprehensions.html)