tags: python

防止乱码
```
# coding=utf-8
print "Hello Python"
```
## 1.变量
```
a=12
b=23
c=a+b
print c
```
## 2.判断语句
```
score=67
if score>=90:
    print "优秀"
elif score>=60:
    print "及格"
else:
    print "不及格"
```

## 3.循环语句
```
for i in range(0,10,2):
    print ("Item {0} {1}".format(i,"Fishyer"))
```

## 4.函数
```
def say():
    print ("我在说话")
def max(a,b):
    if a>b:
        return a
    else:
        return b
say()
print (max(12,23))
```

## 5.面向对象
```
class Person:
    def __init__(self,name):
        self.name=name;
    def say(self,content):
        print("{0}说:{1}".format(self.name,content))
class Student(Person):
    def __init__(self,name,grade):
        Person.__init__(self,name)
        self.grade=grade
    def say(self,content):
        Person.say(self,content)
    def study(self,course):
        print ("{2}年纪的{0}在学习{1}".format(self.name,course,self.grade))
laoWang=Person("老王")
laoWang.say("我是逗比")
xiaoMing=Student("小明",1)
xiaoMing.say("我去找小红了")
xiaoMing.study("语文课")
```

## 6.引用外部文件
```
import lib
b=lib.Book("数学之美")
print ("我借了一本书:{0}".format(b.getName()))
from lib import Book
b=Book("五子棋先手必胜法")
print ("我买了一本书:{0}".format(b.getName()))
```