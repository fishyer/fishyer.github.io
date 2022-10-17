#1.表的操作：
---
**创建表**：
>create table if not exists Student(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,age TEXT)

**删除表**：
>drop table Student;

**备份表**:
>create table Student_bak as select *from Student;

通过该方式创建的数据表将与SELECT查询返回的结果集具有相同的Schema信息,但是不包含缺省值和主键等约束信息。然而新创建的表将会包含结果集返回的所有数据。

#2.表中数据的操作：
---
**插入数据**：
>insert into Student (name,age) values ('Fishyer',23);
insert into Student (name,age) values ('Stay',23);
insert into Student (name) values ('Ricky');
insert into Student (age) values (21);

**查询所有数据**：
>select * from Student;

**条件查询**：
>select * from Student where age=23 and name='Stay';

**排序**：
>select * from Student order by age desc