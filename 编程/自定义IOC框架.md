tags: 星标

## 一、IOC简单科普
**所谓IOC，即控制反转**（Inversion of Control，英文缩写为IoC）

假如你的一个类A里面需要用到很多个成员变量F1、F2等。

传统的写法:你要用这些成员变量，那么那你就new F1()、new F2()等。

IOC的原则却是：No！我们不要new，这样耦合度太高，一旦被依赖的F1、F2的构造方法有了变动，**所有需要new F1()、new F2()的地方都需要修改！**

根据这一原则，为了解耦依赖调用者(A)和依赖提供者（F1、F2等），IOC解耦的思路有两种：
1.写配置文件
2.使用注解

当然了，有了配置文件和注解，那么怎么注入呢？也就是**如何把配置或注解的信息变成所需要的类呢？**

OK，反射上场了！话说，很久很久以前，反射很慢啊，嗯，那是很久很久以前，现在已经不是太慢了，我简单测试了一下，一个反射大概需要2ms左右的时间吧，基本可以忽略不计。PS：不要说你使用一万个注解的话会怎么样？因为你不可能同时调用一万个方法吧。所以，性能方面可以放心。

正所谓：**无反射，不框架！**

而关于注解呢，又有两种方式：**运行时注解、编译时注解。**
1. 运行时注解就是就是运行时运用反射，动态获取对象、属性、方法等，一般的IOC框架就是这样，可能会牺牲一点效率。
2. 编译时注解就是在程序编译时根据注解进行一些额外的操作，大名鼎鼎的ButterKnife运用的就是编译时注解,ButterKnife在我们编译时，就根据注解，自动生成了一些辅助类。要玩编译时注解呢，你得先依赖apt，r然后自己写一个类继承AbstractProcessor,重写process方法，在里面实现如何把配置或注解的信息变成所需要的类。

比如Butterknife的实现方式：就是调用APT，用JavaFileObject在编译时根据注解创建了一个辅助类，也就是传说中**代码生成器：用代码生成代码！**不要问我为什么这么了解ButterKnife，因为我之前写过：[源码解析：ButterKnife（7.0.1）](http://www.jianshu.com/p/8a6b8aa8ff33)。

预备知识：
[Java反射](http://www.jianshu.com/p/7146f59af101)
[Java注解](http://www.jianshu.com/p/4cd6dd109d85)
[Java代理](http://www.jianshu.com/p/301446de9918)

## 二、自定义IOC框架的使用
### 1.使用说明
(1) 类注解：
IContentView:注入ContentView
(2) 字段注解：
IView：注入View
IString：注入String
IColor：注入Color
(3) 方法注解：
IClick：注入点击事件
(4) 工具类：
InjectUtil.bind(this):绑定Activity
InjectUtil.unbind(this):解绑Activity

### 2.示例代码
```
package com.che.baseutil;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.che.fast_ioc.InjectUtil;
import com.che.fast_ioc.annotation.IClick;
import com.che.fast_ioc.annotation.IColor;
import com.che.fast_ioc.annotation.IContentView;
import com.che.fast_ioc.annotation.IString;
import com.che.fast_ioc.annotation.IView;

import java.util.Random;


@IContentView(R.layout.activity_main)
public class MainActivity extends Activity {
    @IView(R.id.tv)
    TextView tv;
    @IView(R.id.bt)
    Button bt;
    @IString(R.string.text_home)
    String title;
    @IColor(R.color.turquoise)
    int turquoiseColor;
    @IColor(R.color.moccasin)
    int moccasinColor;
    private Random random;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        InjectUtil.bind(this);
        random = new Random();
        tv.setText(title);
        tv.setBackgroundColor(turquoiseColor);
        bt.setBackgroundColor(moccasinColor);
    }

    @Override
    protected void onDestroy() {
        InjectUtil.unbind(this);
        super.onDestroy();
    }

    @IClick({R.id.tv, R.id.bt})
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.tv:
                bt.setText(random.nextInt(100) + "");
                break;
            case R.id.bt:
                tv.setText("我要变");
                Intent intent = new Intent();
                intent.setAction(IntentKey.ACTIVITY_SECOND);
                startActivity(intent);
                break;
        }

    }
}
```
## 三、如何实现自定义IOC框架

### 1.定义你所需要的注解
注入布局：
```
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface IContentView {
    //默认字段，使用时：@IView(R.id.tv)
    int value();

    //其它字段，使用时：@IView(id=R.id.tv)
//    int id() default 0;
}
```
注入视图：
```
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface IView {
    int value();
}
```
注入字符串
```
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface IString {
    int value();
}
```
注入色值
```
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface IColor {
    int value();
}
```
注入点击事件
```
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface IClick {
    int[] value();
}
```
### 2.编写注入工具类
**备用知识：**
1. 获取类：activity.getClass();
2. 获取字段：activity.getDeclaredFields();
3. 获取方法：activity.getDeclaredMethods();
4. 判断是否存在某注解：isAnnotationPresent()
5. 获取注解：getAnnotation()
6. 获取注解的字段：annotation.value()，其他字段同理
7. 设置某字段可读写：field.setAccessible(true);
8. 修改对象的字段值：field.set(object，value);
---
**思路分析：**
1. 获取类注解、字段注解的值，根据该注解值，执行相关的操作：例如setContentView(value)、findViewById(value)等。
2. 获取方法注解的值，根据该注解值，生成动态代理类，调用setOnClickListener()等

```
package com.che.fast_ioc;

import android.app.Activity;
import android.view.View;

import com.che.base_util.LogUtil;
import com.che.fast_ioc.annotation.IClick;
import com.che.fast_ioc.annotation.IColor;
import com.che.fast_ioc.annotation.IContentView;
import com.che.fast_ioc.annotation.IString;
import com.che.fast_ioc.annotation.IView;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;

/**
 * 注解工具类
 * <p>
 * 作者：余天然 on 16/9/16 上午2:10
 */
public class InjectUtil {

    /**
     * 绑定
     *
     * @param activity
     */
    public static void bind(Activity activity) {
        Class<? extends Activity> clazz = activity.getClass();
        //处理类
        processType(activity, clazz);
        //遍历所有的字段
        for (Field field : clazz.getDeclaredFields()) {
            //处理字段
            processField(activity, field);
        }
        //遍历所有的方法
        for (Method method : clazz.getDeclaredMethods()) {
            //处理方法
            processMethod(activity, method);
        }
    }

    /**
     * 解绑
     *
     * @param activity
     */
    public static void unbind(Activity activity) {
        try {
            Class<? extends Activity> clazz = activity.getClass();
            //遍历所有的字段
            for (Field field : clazz.getDeclaredFields()) {
                LogUtil.print("field=" + field.getName() + "\t" + field.getType());
                //将所有字段置空
                boolean accessible = field.isAccessible();
                field.setAccessible(true);
                field.set(activity, null);
                field.setAccessible(accessible);
            }
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    /**
     * 处理类注解
     */
    private static void processType(Activity activity, Class<? extends Activity> clazz) {
        List<Class<? extends Annotation>> annoList = new ArrayList<>();
        annoList.add(IContentView.class);

        for (Class<? extends Annotation> annotationType : annoList) {
            //判断是否存在IContentView注解
            if (clazz.isAnnotationPresent(annotationType)) {
                dispatchType(activity, clazz, annotationType);
            }
        }
    }

    /**
     * 分发类注解
     */
    private static void dispatchType(Activity activity, Class<? extends Activity> clazz, Class<? extends Annotation> annotationType) {
        if (annotationType == IContentView.class) {
            IContentView annotation = clazz.getAnnotation(IContentView.class);
            int value = annotation.value();
            activity.setContentView(value);
        }
    }

    /**
     * 处理字段注解
     */
    private static void processField(Activity activity, Field field) {
        List<Class<? extends Annotation>> annoList = new ArrayList<>();
        annoList.add(IView.class);
        annoList.add(IColor.class);
        annoList.add(IString.class);

        for (Class<? extends Annotation> annotationType : annoList) {
            if (field.isAnnotationPresent(annotationType)) {
                boolean accessible = field.isAccessible();
                field.setAccessible(true);
                dispatchFiled(activity, field, annotationType);
                field.setAccessible(accessible);
            }
        }
    }

    /**
     * 分发字段注解
     */
    private static void dispatchFiled(Activity activity, Field field, Class<?> annotationType) {
        try {
            if (annotationType == IView.class) {
                IView anno = field.getAnnotation(IView.class);
                int value = anno.value();
                field.set(activity, activity.findViewById(value));
            }
            if (annotationType == IString.class) {
                IString anno = field.getAnnotation(IString.class);
                int value = anno.value();
                field.set(activity, activity.getString(value));
            }
            if (annotationType == IColor.class) {
                IColor anno = field.getAnnotation(IColor.class);
                int value = anno.value();
                field.set(activity, activity.getResources().getColor(value));
            }
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }

    }

    /**
     * 处理方法注解
     */
    private static void processMethod(Activity activity, Method method) {
        List<Class<? extends Annotation>> annoList = new ArrayList<>();
        annoList.add(IClick.class);

        for (Class<? extends Annotation> annotationType : annoList) {
            //判断是否存在IContentView注解
            if (method.isAnnotationPresent(annotationType)) {
                dispatchMethod(activity, method, annotationType);
            }
        }
    }

    /**
     * 分发方法注解
     */
    private static void dispatchMethod(Activity activity, Method method, Class<? extends Annotation> annotationType) {
        try {
            if (annotationType == IClick.class) {
                IClick annotation = method.getAnnotation(IClick.class);
                // 获取注解里面的id
                int[] ids = annotation.value();
                // 当有注解的时候生成动态代理
                ClassLoader classLoader = View.OnClickListener.class.getClassLoader();
                Class<?>[] interfaces = {View.OnClickListener.class};
                Object proxy = Proxy.newProxyInstance(classLoader, interfaces, new DynaHandler(activity, method));
                for (int id : ids) {
                    View view = activity.findViewById(id);
                    Method onClickMethod = view.getClass().getMethod("setOnClickListener", View.OnClickListener.class);
                    // 调用setOnClickListener方法回调在动态类里面
                    onClickMethod.invoke(view, proxy);
                }
            }
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
    }
}

```

### 3.方法注解的动态代理类
```
/**
 * 动态代理，调用activity里面的method：例如：onClick等
 * <p>
 * 作者：余天然 on 16/9/16 上午2:13
 */
public class DynaHandler implements InvocationHandler {

    private Activity activity;
    private Method method;

    public DynaHandler(Activity activity, Method method) {
        this.activity = activity;
        this.method = method;
    }

    @Override
    public Object invoke(Object o, Method method, Object[] args) throws Throwable {
        // 这里调用动态注入的方法
        return this.method.invoke(activity, args);
    }
}
```