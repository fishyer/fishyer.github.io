tags: python

> 主要实现了一个银行转账的功能，acct1减款100，acct2账户加款100。

![](Snip20161031_12.png)

## 1.数据表
![](2016-10-31-23-01-22.png)

## 2.实现代码
```
# coding:utf-8
# yutianran 2016/10/31 下午7:46

import sys
import os
import MySQLdb

reload(sys)
sys.setdefaultencoding("utf-8")

import MySQLdb

host = "127.0.0.1"
user = "root"
passwd = "123456"
port = "3306"
db = "test"

class TransferMoney(object):
    def __init__(self, conn):
        self.conn = conn

    def transfer(self, source_acctid, targt_acctid, money):
        try:
            self.check_acct_available(source_acctid)
            self.check_acct_available(targt_acctid)
            self.has_enough_money(source_acctid, money)
            self.reduce_money(source_acctid, money)
            self.add_money(targt_acctid, money)
            self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise e

    def check_acct_available(self, acctid):
        cursor = self.conn.cursor()
        try:
            sql = "select * from account where acctid=%s" % acctid
            cursor.execute(sql)
            print "check_acct_available:" + sql
            rs = cursor.fetchall()
            if len(rs) != 1:
                raise Exception("账号%s不存在" % acctid)
        finally:
            cursor.close()

    def has_enough_money(self, acctid, money):
        cursor = self.conn.cursor()
        try:
            sql = "select * from account where acctid=%s and money>%s" % (acctid, money)
            cursor.execute(sql)
            print "has_enough_money:" + sql
            rs = cursor.fetchall()
            if len(rs) != 1:
                raise Exception("账号%s没有足够的钱" % acctid)
        finally:
            cursor.close()

    def reduce_money(self, acctid, money):
        cursor = self.conn.cursor()
        try:
            sql = "update account set money=money-%s where acctid=%s" % (money, acctid)
            cursor.execute(sql)
            print "reduce_money:" + sql
            if cursor.rowcount != 1:
                raise Exception("账号%s减款失败" % acctid)
        finally:
            cursor.close()

    def add_money(self, acctid, money):
        cursor = self.conn.cursor()
        try:
            sql = "update account set money=money+%s where acctid=%s" % (money, acctid)
            cursor.execute(sql)
            print "add_money:" + sql
            if cursor.rowcount != 1:
                raise Exception("账号%s加款失败" % acctid)
        finally:
            cursor.close()


# 测试是否连接上数据库
def test_conn():
    cursor = conn.cursor()
    sql = "select * from account"
    cursor.execute(sql)
    print cursor.rowcount
    rs = cursor.fetchall()
    print rs
    for row in rs:
        print "acctid=%s,money=%s" % row

# 执行转账
def transfer_money(conn):
    try:
        tr_money = TransferMoney(conn)
        tr_money.transfer(source_acctid, targt_acctid, money)
    except Exception as e:
        print "出现问题:" + str(e)

if __name__ == "__main__":
    source_acctid = 1
    targt_acctid = 2
    money = 100
    conn = MySQLdb.connect(host=host, user=user, passwd=passwd, db=db)
    test_conn()
    transfer_money(conn)
    test_conn()
    conn.close()
```

## 3.执行结果
![](2016-10-31-23-23-45.jpg)

## 4.补充说明
代码其实很简单，主要就是引用了MySQLdb这个库，不过这个库配置的话有点蛋疼，我使用
> pip install MySQL-python

后，最开始总是报:EnvironmentError: mysql_config not found。后来，我执行
> sudo ln -s /usr/local/mysql/bin/mysql_config /usr/bin/mysql_config

然后就好了。不过，为了执行这个命令，因为我的Mac升级到了macOS Sierra，需要[关闭SIP](http://www.jianshu.com/p/0572336a0771)。

其实这个过程中，还有一些坑，我就不一一细说了，大家不妨自己去亲自踩踩吧。

这个库有三大对象:
1. conn:数据库连接对象
2. cursor:数据库交互对象
3. exptions:数据库异常类

![](Snip20161031_6.png)



然后，连接数据库，执行CRUD操作

![](Snip20161031_7.png)
连接时的参数说明:

![](Snip20161031_9.png)

在本实例中，使用MySQLdb默认开启事务，执行转账事务的一系列操作，中间有错误就回滚。
![](Snip20161031_10.png)

## 参考目录
1. [Python操作MySQL数据库](http://www.imooc.com/learn/475)
2. [MySQLdb在 OS X 中安装指南](http://www.cnblogs.com/ifantastic/archive/2013/04/13/3017677.html)
3. [如何关闭OSX 10.11 SIP](http://www.jianshu.com/p/0572336a0771)