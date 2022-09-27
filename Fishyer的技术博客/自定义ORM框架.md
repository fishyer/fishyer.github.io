---
link: https://www.notion.so/ORM-8ab46e978daf4a4e9f25d62e986a1dc0
notionID: 8ab46e97-8daf-4a4e-9f25-d62e986a1dc0
---

#Android

## 一、ORM简单科普

所谓ORM，即**对象-关系映射**（Object/Relation Mapping），方便我们以操作对象的方式去操作关系型数据库。

在平时的开发过程中，大家一定会或多或少地接触到SQLite。然而在使用它时，我们往往需要做许多额外的工作，像编写 SQL 语句与解析查询结果等。

假如我们有这样一个对象需要存在数据库：
```java
@Table
public class Person {
@Column
private int id;

@Check("name!='Fucker'")
@Column
private String name;

@Default
@Column
private double height = 180;

@Column
private int age;

@Default
@NotNull
@Column
private String job = "IT";
}
```
那么我们在建表时，需要写这样的sql语句：
```sql
create table if not exists Person(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT CHECK(name!='Fucker'),
height REAL DEFAULT 180.0,
age INTEGER,
job TEXT DEFAULT IT NOT NULL);
```
然后在查询后，我们又需要对Curcor进行遍历取值，然后set到对象中去，很麻烦有木有？
```java
while (cursor.moveToNext()) {
int nameColumnIndex = cursor.getColumnIndex("filedName");
String value = cursor.getString(nameColumnIndex);
}
```
一不小心sql拼错了，或者cursor取字段时字段名写错了，就GG了啊！

于是，各种ORM框架就出来了，通过注解和反射将生成建表sql、解析cursor成对象，都自动化了，这大大方便了我们这些懒人了。

但是，现在的ORM框架大多在写查询语句时，感觉有点过度封装了，有时候，使用ORM框架去做条件查询，甚至还不如自己去写查询的sql！

为了解决这个问题呢，本人封装了一套自己的ORM框架，借鉴了Guava的字符串操作库的Fluent链式接口的思想，将写查询语句方便了一点点，既尽量减少我们写原生sql语句容易拼错的问题，也不像有的ORM框架不方便做复杂的条件查询。

当然，框架还在不断的完善中（索引和多表关联暂时都还没加），如果你觉得我下面的封装有哪里不合理，欢迎和我讨论！

## 二、框架的测试类：
测试场景：
1. 执行自定义的Sql
1. 表操作：建表、删表、备份、存在判断
2. 插入
3. 删除
4. 查询
5. 更新
6. 事务

```java
package com.che.baseutil.sqlite;

import android.app.Application;

import com.che.base_util.LogUtil;
import com.che.baseutil.BuildConfig;
import com.che.baseutil.table.Person;
import com.che.baseutil.table.Teacher;
import com.che.fast_orm.DBHelper;
import com.che.fast_orm.helper.DBException;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowLog;

import java.util.ArrayList;
import java.util.List;

import static com.google.common.truth.Truth.assertThat;

/**
 * 作者：余天然 on 16/9/16 下午10:17
 */
@RunWith(RobolectricTestRunner.class)
@Config(constants = BuildConfig.class,
  sdk = 21,
  manifest = "src/main/AndroidManifest.xml",
  packageName = "com.che.baseutil",
  resourceDir = "res")
public class DBTestClient {

private DBHelper dbHelper;//数据库辅助类

@Before
public void setUp() throws DBException {
  ShadowLog.stream = System.out;
  Application application = RuntimeEnvironment.application;
  dbHelper = new DBHelper(application, "mydb", 1);
  //删除表
  dbHelper.drop(Person.class);
  //创建表
  dbHelper.create(Person.class);
  //初始化数据，方便之后操作
  initData();
}

/**
 * 插入
 */
public void initData() {
  try {
      //插入多条数据
      List<Person> persons = new ArrayList<>();
      persons.add(new Person("Fishyer", 23));
      persons.add(new Person("Stay", 23));
      persons.add(new Person("Ricky"));
      persons.add(new Person("Stay", 23));
      persons.add(new Person("Fuck", 24));
      persons.add(new Person("Albert"));
      dbHelper.insertAll(persons);

      //插入单条数据
      Person untitled = new Person();
      untitled.setAge(21);
      untitled.setHeight(200);
      dbHelper.insert(untitled);
  } catch (DBException e) {
      LogUtil.print("数据库异常：" + e.getMessage());
  }
}

/**
 * 自定义Sql
 */
@Test
public void testSql() throws DBException {
  dbHelper.execSQL("drop table if exists Person");
  dbHelper.execSQL("create table if not exists Person(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT,age INTEGER DEFAULT 100)");
  dbHelper.execSQL("insert into Person (age) values (21)");
  dbHelper.execSQL("insert into Person (name,age) values ('Fishyer',23)");
}

/**
 * 表操作
 */
@Test
public void testTable() throws DBException {
  //删除表: drop table if exists Teacher
  dbHelper.drop(Teacher.class);
  //断言表不存在:select count(*) from sqlite_master where type='table' and name='Teacher'
  assertThat(dbHelper.isExist(Teacher.class)).isEqualTo(false);
  //创建表:create table if not exists Teacher(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,age INTEGER,course TEXT)
  dbHelper.create(Teacher.class);
  //断言表存在:
  assertThat(dbHelper.isExist("Teacher")).isEqualTo(true);
}

/**
 * 事务
 */
@Test
public void testTransaction() throws DBException {
  Person person = new Person("Fishyer", 23);
  dbHelper.beginTransaction();
  for (int i = 0; i < 100; i++) {
      //insert or replace into Person (name,height,age) values ('Fishyer',180.0,23)
      dbHelper.insert(person);
  }
  dbHelper.endTransaction();
}

/**
 * 删除
 */
@Test
public void testDelete() throws DBException {
  //删除指定数据(不推荐，建议使用条件删除):delete from Person where name='Stay' and height=180.0 and age=-1;
  dbHelper.deleteObj(new Person("Stay"));

  //删除所有数据:delete from Person
  dbHelper.deleteAll(Person.class);

  //条件删除：delete from Person where name='Stay'
  dbHelper.delete(Person.class).where("name=Stay").execute();
}

@Test
public void testQuery() throws DBException {
  //查询所有数据: select * from Person
  dbHelper.queryAll(Person.class);

  //查询指定数据: select * from Person where name='Stay'
  dbHelper.queryObj(new Person("Stay"));
}

@Test
public void testSelect() throws DBException {
  //条件查询1：select * from Person where age>='21' order by name
  dbHelper.select(Person.class).whereInt("age>=21").orderBy("name").query();

  //条件查询2：select * from Person order by age desc
  dbHelper.select(Person.class).where("name=Stay").append("order by id").desc().query();

  //条件查询3：select * from Person where age='23' order by name
  dbHelper.select(Person.class).whereInt("age=23").orderBy("id").query();

  //去重查询：select distinct * from Person order by age desc
  dbHelper.distinct(Person.class).whereInt("age=23").orderBy("id").query();
}

@Test
public void testBackup() throws DBException {
  //建立备份：create table Student_bak as select *from Person
  dbHelper.bak(Person.class);

  //查询备份：select * from Student_bak
  dbHelper.queryBak(Person.class);
}

@Test
public void testUpdate() throws DBException {
  //更新数据：update Person set age=99 where name='Fishyer'
  dbHelper.update(Person.class).setInt("age=99").where("name=Fishyer").execute();

  dbHelper.queryAll(Person.class);
}

@Test
public void testIndex() throws DBException {
  // TODO: 自定义ORM 16/9/17 添加索引
}

@Test
public void testMap() throws DBException {
  // TODO: 16/9/17 添加多表关联
}

}
```

## 三、ORM框架的封装之路：

这个框架，与其说是设计出来的，倒不如说是不断重构出来的。一开始，我是想写一个工具类，后来不断的拓展和优化，结果，就变成框架了。
![fast-orm库的项目结构](fast-orm库的项目结构.png)
### 1.ORM工具类
```java
public class DBHelper extends SQLiteOpenHelper {

/**
 * 构造函数，必须实现
 *
 * @param context 上下文
 * @param name    数据库名称
 * @param version 当前数据库版本号
 */
public DBHelper(Context context, String name, int version) {
  super(context, name, null, version);
}

//数据库第一次创建时会调用，一般在其中创建数据库表
@Override
public void onCreate(SQLiteDatabase db) {
}

//当数据库需要修改的时候，Android系统会主动的调用这个方法。
@Override
public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

}

//基本修改命令
public void execSQL(String sql) throws DBException {
  try {
      sql += ";";
      LogUtil.print(sql);
      getWritableDatabase().execSQL(sql);
  } catch (Exception e) {
      e.printStackTrace();
      throw new DBException(e.getMessage());
  }
}

//基本查询命令
public Cursor rawQuery(String sql) throws DBException {
  Cursor cursor = null;
  try {
      sql += ";";
      LogUtil.print(sql);
      cursor = getReadableDatabase().rawQuery(sql, null);
  } catch (Exception e) {
      e.printStackTrace();
      throw new DBException(e.getMessage());
  }
  return cursor;
}

/**
 * 表操作命令
 */
public void create(Class<?> clazz) throws DBException {
  String createSql = SqlGenerater.create(clazz);
  execSQL(createSql);
}

public void drop(Class<?> clazz) throws DBException {
  String dropSql = SqlGenerater.drop(clazz);
  execSQL(dropSql);
}

public <T> void bak(Class<T> clazz) throws DBException {
  String bakSql = SqlGenerater.bak(clazz);
  execSQL(bakSql);
}

public <T> boolean isExist(Class<T> clazz) throws DBException {
  return isExist(ReflectHelper.getTableName(clazz));
}

public boolean isExist(String tableName) throws DBException {
  Cursor cursor = rawQuery("select count(*) from sqlite_master where type='table' and name='" + tableName + "'");
  if (cursor.moveToNext()) {
      int count = cursor.getInt(0);
      if (count > 0) {
          return true;
      }
  }
  return false;
}

/**
 * 新增
 */
public <T> void insert(T t) throws DBException {
  String insertSql = SqlGenerater.insert(t);
  execSQL(insertSql);
}

public <T> void insertAll(List<T> list) throws DBException {
  getWritableDatabase().beginTransaction();
  for (T t : list) {
      insert(t);
  }
  getWritableDatabase().setTransactionSuccessful();
  getWritableDatabase().endTransaction();
}

/**
 * 删除
 */
public <T> void deleteObj(T t) throws DBException {
  String whereSql = SqlGenerater.deleteObj(t);
  execSQL(whereSql);
}

public <T> void deleteAll(Class<T> clazz) throws DBException {
  String deleteAllSql = SqlGenerater.deleteAll(clazz);
  execSQL(deleteAllSql);
}

/**
 * 查询
 */
public <T> List<T> queryObj(T t) throws DBException {
  String whereSql = SqlGenerater.queryObj(t);
  Cursor cursor = rawQuery(whereSql);
  return (List<T>) ReflectHelper.parseCursor(cursor, t.getClass());
}

public <T> List<T> queryAll(Class<T> clazz) throws DBException {
  String queryAllSql = SqlGenerater.queryAll(clazz);
  Cursor cursor = rawQuery(queryAllSql);
  return ReflectHelper.parseCursor(cursor, clazz);
}

public <T> List<T> queryBak(Class<T> clazz) throws DBException {
  String selectAllSql = SqlGenerater.queryBak(clazz);
  Cursor cursor = rawQuery(selectAllSql);
  return ReflectHelper.parseCursor(cursor, clazz);
}

/**
 * 创建连接符编辑器
 */
//查询
public <T> ConnectBuilder<T> select(Class<T> clazz) throws DBException {
  return new ConnectBuilder(this, clazz, "select * from " + ReflectHelper.getTableName(clazz));
}

//去重查询
public <T> ConnectBuilder<T> distinct(Class<T> clazz) throws DBException {
  return new ConnectBuilder(this, clazz, "select distinct * from " + ReflectHelper.getTableName(clazz));
}

//删除
public <T> ConnectBuilder<T> delete(Class<T> clazz) throws DBException {
  return new ConnectBuilder(this, clazz, "delete from " + ReflectHelper.getTableName(clazz));
}

//修改
public <T> ConnectBuilder<T> update(Class<T> clazz) throws DBException {
  return new ConnectBuilder(this, clazz, "update " + ReflectHelper.getTableName(clazz));
}

/**
 * 连接符编辑器-执行，无返回值
 */
public <T> void execute(ConnectBuilder<T> builder) throws DBException {
  execSQL(builder.sql);
}

/**
 * 编辑器-查询，有返回值
 */
public <T> List<T> query(ConnectBuilder<T> builder) throws DBException {
  Cursor cursor = rawQuery(builder.sql);
  return ReflectHelper.parseCursor(cursor, builder.clazz);
}

/**
 * 开启事务
 */
public void beginTransaction() {
  getReadableDatabase().beginTransaction();
}

/**
 * 关闭事务
 */
public void endTransaction() {
  getReadableDatabase().setTransactionSuccessful();
  getReadableDatabase().endTransaction();
}

}
```
### 2.SQL语句封装
在上面的工具类中，大家可以看到我的封装，主要就是将创建sql语句的过程进行了封装，主要从2个方面入手：
>1. **SqlGenerater：Sql语句生成器**
这个类主要就是根据类信息、对象信息生成一个sql语句，交给DBHelper处理，适合一些模式化的sql,例如：create、insert等
---
>2.**ConnectBuilder：连接符编辑器**
这个类主要就是为了方便写查询sql，将where、and、set等，通过链式调用拼接起来，合成一条sql，和写原生的sql差不多，不过又尽可能避免了写原生sql时一不小心哪里少打了空格等问题

Sql语句生成器:
```java
public class SqlGenerater {

public final static String BAK_SUFFIX = "_bak";//备份的后缀

/**
 * 生成create语句
 * <p>
 * 格式：create table Student(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, age TEXT)
 */
public static String create(Class<?> clazz) {
  TableWrapper wrapper = ReflectHelper.parseClass(clazz);
  //拼接：create table Student(id INTEGER PRIMARY KEY AUTOINCREMENT,
  StringBuilder sb = new StringBuilder("create table if not exists " + wrapper.name);
  //拼接：(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, age TEXT)
  sb.append(TypeConverter.zipNameType(wrapper));
  return sb.toString();
}

/**
 * 生成drop语句
 * <p>
 * 格式：drop table if exists Student;
 */
public static String drop(Class<?> clazz) {
  StringBuilder sb = new StringBuilder("drop table if exists " + ReflectHelper.getTableName(clazz));
  return sb.toString();
}

/**
 * 生成insert语句
 * <p>
 * 格式：insert or replace into Student (name,age) values ('Fishyer',23)
 */
public static <T> String insert(T t) {
  TableWrapper wrapper = ReflectHelper.parseObject(t);
  //拼接：insert into Student
  StringBuilder sb = new StringBuilder("insert or replace into " + wrapper.name + " ");
  //拼接：(name,age)
  sb.append(TypeConverter.zipName(wrapper));
  //拼接： values
  sb.append(" values ");
  //拼接：('Fishyer',23)
  sb.append(TypeConverter.zipValue(wrapper));
  return sb.toString();
}

/**
 * 生成queryAll语句
 * <p>
 * 格式：select * from Student
 */
public static String queryAll(Class<?> clazz) {
  StringBuilder sb = new StringBuilder("select * from " + ReflectHelper.getTableName(clazz));
  return sb.toString();
}

/**
 * 生成deleteAll语句
 * <p>
 * 格式：delete from Student
 */
public static String deleteAll(Class<?> clazz) {
  StringBuilder sb = new StringBuilder("delete from " + ReflectHelper.getTableName(clazz));
  return sb.toString();
}


/**
 * 生成queryObj语句
 * <p>
 * 格式：select * from Student where name='Fishyer' and age=23
 */
public static <T> String queryObj(T t) {
  TableWrapper wrapper = ReflectHelper.parseObject(t);
  //拼接：select * from Student
  StringBuilder sb = new StringBuilder("select * from " + wrapper.name);
  //拼接： where name='Fishyer' and age=23
  sb.append(TypeConverter.zipConnNameValue(wrapper));
  return sb.toString();
}

/**
 * 生成deleteObj语句
 * <p>
 * 格式：delete from Student where name='Fishyer' and age=23
 */
public static <T> String deleteObj(T t) {
  TableWrapper wrapper = ReflectHelper.parseObject(t);
  //拼接：select * from Student
  StringBuilder sb = new StringBuilder("delete from " + wrapper.name);
  //拼接： where name='Fishyer' and age=23
  sb.append(TypeConverter.zipConnNameValue(wrapper));
  return sb.toString();
}

/**
 * 生成bak语句
 * <p>
 * 格式：create table Student2 as select *from Student
 */
public static <T> String bak(Class<T> clazz) {
  String table = ReflectHelper.getTableName(clazz);
  String tableBak = table + BAK_SUFFIX;
  StringBuilder sb = new StringBuilder("create table " + tableBak + " as select *from " + table);
  return sb.toString();
}

/**
 * 生成queryBak语句
 * <p>
 * 格式：select * from Student
 */
public static String queryBak(Class<?> clazz) {
  StringBuilder sb = new StringBuilder("select * from " + ReflectHelper.getTableName(clazz) + BAK_SUFFIX);
  return sb.toString();
}

}
```
连接符编辑器:
```java
public class ConnectBuilder<T> {
public DBHelper dbHelper;//用于调用终止连接符：query和execute
public Class<T> clazz;//用于解析Cursor
public String sql;

public ConnectBuilder(DBHelper dbHelper, Class<T> clazz, String sql) {
  this.dbHelper = dbHelper;
  this.clazz = clazz;
  this.sql = sql;
}

/**
 * where 连接符
 * <p>
 * 1、where的默认比较符是=，如果是其它符号，需在第二个参数说明
 * 2、where与whereInt的区别在于：是否给后面的值加单引号
 */
public ConnectBuilder<T> where(String s) {
  return where(s, "=");
}

public ConnectBuilder<T> where(String s, String operation) {
  this.sql = sql + (" where " + TypeConverter.addQuote(s, operation));
  return this;
}

public ConnectBuilder<T> whereInt(String s) {
  this.sql = sql + (" where " + s);
  return this;
}


/**
 * and 连接符
 */
public ConnectBuilder<T> and(String s) {
  return and(s, "=");
}

public ConnectBuilder<T> and(String s, String operation) {
  this.sql = sql + (" and " + TypeConverter.addQuote(s, operation));
  return this;
}

public ConnectBuilder<T> andInt(String s) {
  this.sql = sql + (" and " + s);
  return this;
}

/**
 * set 连接符
 */
public ConnectBuilder<T> set(String s) {
  return where(s, "=");
}

public ConnectBuilder<T> set(String s, String operation) {
  this.sql = sql + (" set " + TypeConverter.addQuote(s, operation));
  return this;
}

public ConnectBuilder<T> setInt(String s) {
  this.sql = sql + (" set " + s);
  return this;
}

/**
 * order by 连接符
 */
public ConnectBuilder<T> orderBy(String field) {
  this.sql = sql + (" order by " + field);
  return this;
}

/**
 * desc 连接符
 */
public ConnectBuilder<T> desc() {
  this.sql = sql + (" desc");
  return this;
}

/**
 * append 连接符
 * <p>
 * 代表一个空格
 */
public ConnectBuilder<T> append(String s) {
  this.sql = sql + (" " + s);
  return this;
}

/**
 * 执行Sql语句，查询，有返回值
 *
 * @return
 */
public List<T> query() throws DBException {
  return dbHelper.query(this);
}

/**
 * 执行Sql语句,非查询，无返回值
 *
 * @return
 */
public void execute() throws DBException {
  dbHelper.execute(this);
}

}
```
### 3.反射辅助类
为了上面的SqlGenerater能生成正确的sql,我们需要用到注解和反射。

通过注解，我们在一个类中（例如上面的Person），标明了我们根据这个类去创建表时所需要的参数。

通过反射，我们可以在运行时获取到这些参数，交给SqlGenerater。
```java
public class ReflectHelper {


/**
 * 直接反射，获取字段值
 */
private static <T> Object getFieldValue(T t, Field field) {
  // TODO: 16/9/15 这里怎么将返回值自动强转成fieldType呢？求解！！！
  Object value = null;
  try {
      field.setAccessible(true);
      value = field.get(t);
      field.setAccessible(false);
  } catch (IllegalAccessException e) {
      e.printStackTrace();
  }
  return value;
}

/**
 * 解析数据库游标
 *
 * @param cursor
 * @param clazz
 * @return
 */
public static <T> List<T> parseCursor(Cursor cursor, Class<T> clazz) {
  List<T> list = new ArrayList<>();
  try {
      TableWrapper wrapper = ReflectHelper.parseClass(clazz);
      while (cursor.moveToNext()) {
          T t = clazz.newInstance();
          int pos = 0;
          for (String filedName : wrapper.filedList) {
              Class<?> type = wrapper.typeList.get(pos);
              Object value = getCursorValue(cursor, filedName, type);
              Field field = clazz.getDeclaredField(filedName);
              field.setAccessible(true);
              field.set(t, value);
              field.setAccessible(false);
              pos++;
          }
          LogUtil.print("-->:" + t.toString());
          list.add(t);
      }
      cursor.close();
  } catch (InstantiationException e) {
      e.printStackTrace();
  } catch (IllegalAccessException e) {
      e.printStackTrace();
  } catch (NoSuchFieldException e) {
      e.printStackTrace();
  }
  return list;
}

/**
 * 解析类或对象的信息
 */
private static <T> TableWrapper parse(Class<?> clazz, T t) {
  List<String> filedList = new ArrayList<>();//字段名
  List<Class<?>> typeList = new ArrayList<>();//字段类型
  List<String> constraintList = new ArrayList<>();//字段约束(一个列的约束可能不止一个)
  List<Object> valueList = new ArrayList<>();//字段值
  //判断是否存在表注解
  if (!clazz.isAnnotationPresent(Table.class)) {
      throw new RuntimeException(clazz.getName() + "没有添加表注解");
  }

  int column = 0;
  //遍历所有的字段
  for (Field field : clazz.getDeclaredFields()) {
      //判断是否存在列注解
      if (field.isAnnotationPresent(Column.class)) {
          column++;
          String fieldName = ReflectHelper.getColumnName(field); //获取字段名
          Class<?> fieldType = field.getType();//获取字段类型
          Object fieldValue = t == null ? null : getFieldValue(t, field);//获取字段值

          //非创建时，忽略id字段
          if (t != null && fieldName.toLowerCase().equals("id".toLowerCase())) {
              continue;
          }

          //创建表时，添加字段约束
          if (t == null) {
              addConstraint(clazz, field, constraintList);
          }

          //插入数据时，忽略空字段
          if (t != null && fieldValue == null) {
              continue;
          }

          //添加字段名、字段类型、字段值到列表中
          filedList.add(fieldName);
          typeList.add(fieldType);
          valueList.add(fieldValue);
      }
  }
  if (column == 0) {
      throw new RuntimeException(clazz.getName() + "表中没有添加任何列注解");
  }
  if (t != null && filedList.isEmpty()) {
      throw new RuntimeException(clazz.getName() + "表中对象所有列均为空");
  }
  return new TableWrapper(getTableName(clazz), filedList, typeList, constraintList, valueList);
}

/**
 * 获取表名
 *
 * @param clazz
 * @return
 */
public static String getTableName(Class<?> clazz) {
  Table annotation = clazz.getAnnotation(Table.class);
  String value = annotation.value();
  return TextUtils.isEmpty(value) ? clazz.getSimpleName() : value;

}

/**
 * 获取列名
 *
 * @param field
 * @return
 */
private static String getColumnName(Field field) {
  Column annotation = field.getAnnotation(Column.class);
  String value = annotation.value();
  return TextUtils.isEmpty(value) ? field.getName() : value;
}


/**
 * 添加字段约束
 *
 * @param clazz
 * @param field
 * @param list
 */
private static <T> void addConstraint(Class<T> clazz, Field field, List<String> list) {
  StringBuffer sb = new StringBuffer();
  //遍历该字段的所有注解
  for (Annotation item : field.getDeclaredAnnotations()) {
      if (item instanceof NotNull) {
          sb.append(Constraint.NOT_NULL);
      } else if (item instanceof Default) {
          String value = getDefaultValue(clazz, field);
          sb.append(Constraint.DEFAULT + " " + value);
      } else if (item instanceof Unique) {
          sb.append(Constraint.UNIQUE);
      } else if (item instanceof Check) {
          Check annotation = field.getAnnotation(Check.class);
          String value = annotation.value();
          sb.append(Constraint.CHECK + "(" + value + ")");
      } else {
          sb.append("");
      }
  }
  list.add(sb.toString());
}

/**
 * 获取列的默认值
 *
 * @param clazz
 * @param field
 * @return
 */
private static <T> String getDefaultValue(Class<T> clazz, Field field) {
  try {
      T t = clazz.newInstance();
      return getFieldValue(t, field).toString();
  } catch (InstantiationException e) {
      e.printStackTrace();
  } catch (IllegalAccessException e) {
      e.printStackTrace();
  }
  throw new RuntimeException("获取列的默认值异常");
}

/**
 * 解析对象的信息
 */
public static <T> TableWrapper parseObject(T t) {
  return parse(t.getClass(), t);
}

/**
 * 解析类的信息
 */
public static TableWrapper parseClass(Class<?> clazz) {
  return parse(clazz, null);
}

/**
 * 解析列表的信息
 */
public static <T> List<TableWrapper> parseList(List<T> list) {
  List<TableWrapper> wrappers = new ArrayList<>();
  for (T t : list) {
      wrappers.add(parse(t.getClass(), t));
  }
  return wrappers;
}

/**
 * 获取数据库Cursor的值
 * <p>
 * 例如:'Stay',23
 */
private static Object getCursorValue(Cursor cursor, String filedName, Class<?> type) {
  while (cursor.moveToNext()) {
      int nameColumnIndex = cursor.getColumnIndex("filedName");
      String value = cursor.getString(nameColumnIndex);
  }

  //文本
  if (type == String.class) {
      return cursor.getString(cursor.getColumnIndex(filedName));
  }
  // TODO: 16/9/15 获取整数时，如果数据库存的是null，这里会自动变成0，是个问题！
  //整数
  else if (type == int.class) {
      return cursor.getInt(cursor.getColumnIndex(filedName));
  } else if (type == Integer.class) {
      return cursor.getInt(cursor.getColumnIndex(filedName));
  } else if (type == long.class) {
      return cursor.getLong(cursor.getColumnIndex(filedName));
  } else if (type == Long.class) {
      return cursor.getLong(cursor.getColumnIndex(filedName));
  } else if (type == boolean.class) {
      int anInt = cursor.getInt(cursor.getColumnIndex(filedName));
      return anInt == 0 ? false : true;
  } else if (type == Boolean.class) {
      int anInt = cursor.getInt(cursor.getColumnIndex(filedName));
      return anInt == 0 ? false : true;
  }
  //实数
  else if (type == float.class) {
      return cursor.getFloat(cursor.getColumnIndex(filedName));
  } else if (type == Float.class) {
      return cursor.getFloat(cursor.getColumnIndex(filedName));
  } else if (type == double.class) {
      return cursor.getDouble(cursor.getColumnIndex(filedName));
  } else if (type == Double.class) {
      return cursor.getDouble(cursor.getColumnIndex(filedName));
  }
  //输入形式
  else {
      return " BLOB";
  }
}

}

```
### 4.其余辅助类
**表信息包装类：**
这个其实就是通过ReflectHelper将一个Class<T> 解析成这个TableWrapper，它是那些写SQL的参数的载体
```java
public class TableWrapper {
public String name;//类名
public List<String> filedList;//字段名
public List<Class<?>> typeList;//字段类型
public List<String> constraintList;//字段约束
public List<Object> valueList;//字段值

public TableWrapper(String name, List<String> filedList, List<Class<?>> typeList, List<String> constraintList, List<Object> valueList) {
  this.name = name;
  this.filedList = filedList;
  this.typeList = typeList;
  this.constraintList = constraintList;
  this.valueList = valueList;
}
}
```
**类型转换器**：
因为不同sql命令的参数的格式不一样，这里就是为了方便处理从class的field到table的column之间的转换
```java
public class TypeConverter {

//wrapper --> (name,age)
public static String zipName(TableWrapper wrapper) {
  StringBuilder sb = new StringBuilder();
  sb.append("(");
  for (int i = 0; i < wrapper.filedList.size(); i++) {
      String filed = wrapper.filedList.get(i);
      sb.append(filed);
      if (i != wrapper.filedList.size() - 1) {
          sb.append(",");
      }
  }
  sb.append(")");
  return sb.toString();
}

//wrapper --> ('Fishyer',23)
public static String zipValue(TableWrapper wrapper) {
  StringBuilder sb = new StringBuilder();
  sb.append("(");
  for (int j = 0; j < wrapper.filedList.size(); j++) {
      Class<?> type = wrapper.typeList.get(j);
      Object value = wrapper.valueList.get(j);
      sb.append(TypeConverter.getInsertValue(type, value));
      if (j != wrapper.typeList.size() - 1) {
          sb.append(",");
      }
  }
  sb.append(")");
  return sb.toString();
}

//wrapper --> (name TEXT NOT NULL, age TEXT)
public static String zipNameType(TableWrapper wrapper) {
  StringBuilder sb = new StringBuilder();
  sb.append("(");
  for (int i = 0; i < wrapper.filedList.size(); i++) {
      String filed = wrapper.filedList.get(i);
      String type = TypeConverter.getCreateType(filed, wrapper.typeList.get(i));
      String constraint = wrapper.constraintList.get(i);
      sb.append(filed + type + constraint);
      if (i != wrapper.filedList.size() - 1) {
          sb.append(",");
      }
  }
  sb.append(")");
  return sb.toString();
}

//wrapper --> where name='Fishyer' and age=23
public static String zipConnNameValue(TableWrapper wrapper) {
  StringBuilder sb = new StringBuilder();
  for (int i = 0; i < wrapper.filedList.size(); i++) {
      if (i == 0) {
          sb.append(" where ");
      } else {
          sb.append(" and ");
      }
      String filed = wrapper.filedList.get(i);
      Class<?> type = wrapper.typeList.get(i);
      Object value = wrapper.valueList.get(i);
      sb.append(filed + "=" + TypeConverter.getInsertValue(type, value));
  }
  return sb.toString();
}

/**
 * 获取create时的存储类型
 * <p>
 * 例如:TEXT、INTEGER
 */
private static String getCreateType(String field, Class<?> type) {
  //主键
  if (field.toLowerCase().equals("id".toLowerCase())) {
      return " INTEGER PRIMARY KEY AUTOINCREMENT";
  }
  //文本
  if (type == String.class) {
      return " TEXT";
  }
  //整数
  else if (type == int.class) {
      return " INTEGER";
  } else if (type == Integer.class) {
      return " INTEGER";
  } else if (type == long.class) {
      return " INTEGER";
  } else if (type == Long.class) {
      return " INTEGER";
  } else if (type == boolean.class) {
      return " INTEGER";
  } else if (type == Boolean.class) {
      return " INTEGER";
  }
  //实数
  else if (type == float.class) {
      return " REAL";
  } else if (type == Float.class) {
      return " REAL";
  } else if (type == double.class) {
      return " REAL";
  } else if (type == Double.class) {
      return " REAL";
  }
  //输入形式
  else {
      return " BLOB";
  }
}

/**
 * 获取Insert时的存储值
 * <p>
 * 例如:'Stay',23 (主要就是为了给String加单引号)
 */
private static String getInsertValue(Class<?> type, Object value) {
  if (type == String.class) {
      return "'" + value + "'";
  }
  else if (type == int.class) {
      return value.toString();
  }else {
      return value.toString();
  }
}

/**
 * 给字段加单引号
 * <p>
 * 例：Fishyer --> 'Fishyer'
 */
public static String addQuote(String s, String operation) {
  String[] strings = s.split(operation);
  return strings[0] + operation + "'" + strings[1] + "'";
}

}
```

**各种注解标识**:
>@Table:表注解，默认是类名，也可以自定义表名
@Column：列注解，默认是字段名，也可自定义列名
@Unique：唯一性约束
@NotNull：非空约束
@Default：默认值约束
@Check：条件约束

**约束符号常量**
```java
public class Constraint {
public static final String NOT_NULL = " NOT NULL";
public static final String DEFAULT = " DEFAULT";
public static final String UNIQUE = " UNIQUE";
public static final String CHECK = " CHECK";
}
```