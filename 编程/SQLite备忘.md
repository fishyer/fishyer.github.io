#一、常用语言：
---
**1.数据操作语言(DDL):**
>select --从数据库表中检索数据行和列
insert --向数据库表添加新数据行
delete --从数据库表中删除数据行
update --更新数据库表中的数据

**2.数据定义语言(DML):**
>create table --创建一个数据库表
drop table --从数据库中删除表
alter table --修改数据库表结构
create view --创建一个视图
drop view --从数据库中删除视图
create index --为数据库表创建一个索引
drop index --从数据库中删除索引
create procedure --创建一个存储过程
drop procedure --从数据库中删除存储过程
create trigger --创建一个触发器
drop trigger --从数据库中删除触发器
create schema --向数据库添加一个新模式
drop schema --从数据库中删除一个模式
create domain --创建一个数据值域
alter domain --改变域定义
drop domain --从数据库中删除一个域

**3.数据控制语言(DCL):**
>grant --授予用户访问权限
deny --拒绝用户访问
revoke --解除用户访问权限

**4.事务控制语言(TCL):**
>commit --结束当前事务
rollback --回滚当前事务
set transaction --定义当前事务数据访问特征

#二、常用符号：
---
**1.字段类型**:
>NULL: 表示该值为NULL值。
 INTEGER: 无符号整型值。
REAL**: 浮点值。
TEXT: 文本字符串，存储使用的编码方式为UTF-8、UTF-16BE、UTF-16LE。
BLOB: 存储Blob数据，该类型数据和输入数据完全相同。

**2.字段约束**:
>NOT NULL：确保某列不能有 NULL 值。
DEFAULT：当某列没有指定值时，为该列提供默认值。
UNIQUE：确保某列中的所有值是不同的。
PRIMARY Key：唯一标识数据库表中的各行/记录。
CHECK：确保某列中的所有值满足一定条件。

**3.比较符号**:
>=,==,<, ,<=, >, >=, !=, <>, IN, NOT IN, BETWEEN, IS,IS NOT。

**4.比较规则**：
>1. 存储方式为NULL的数值小于其它存储类型的值。
2. 存储方式为INTEGER和REAL的数值小于TEXT或BLOB类型的值，如果同为INTEGER或REAL，则基于数值规则进行比较。
3. 存储方式为TEXT的数值小于BLOB类型的值，如果同为TEXT，则基于文本规则(ASCII值)进行比较。
4. 如果是两个BLOB类型的数值进行比较，其结果为C运行时函数memcmp()的结果。