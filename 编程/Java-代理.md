tags: java

## 一、代理测试类
大家一看就懂动态代理的作用了。
```
package com.che.baseutil.proxy;

import org.junit.Before;
import org.junit.Test;

public class ProxyTestClient {

    private UserImpl target;//被代理类

    @Before
    public void setUp() {
        target = new UserImpl();
    }

    /**
     * 原始
     */
    @Test
    public void testTarget() {
        target.login();
        target.updateInfo();
    }

    /**
     * 静态代理
     */
    @Test
    public void testStaticProxy() {
        UserStaticProxy staticProxy = new UserStaticProxy(target);
        staticProxy.login();
        staticProxy.updateInfo();
    }

    /**
     * Jdk动态代理
     */
    @Test
    public void testJdkProxy() {
        JdkProxyFactory jdkFactory = new JdkProxyFactory();
        IUser jdkProxy = (IUser) jdkFactory.createProxy(target);
        jdkProxy.login();
        jdkProxy.updateInfo();
    }

    /**
     * Cglib动态代理
     * <p>
     * Jdk只能对接口进行代理，而cglib却可以对普通类进行代理！
     * <p>
     * 注意：此代码在Java环境可运行，但在Android环境会报错！
     * 原因：Java是JVM虚拟器,Android是DarvikVM虚拟机,类加载机制有区别，而Cglib是基于继承的字节码生成技术，所有有问题。
     * Android中推荐使用AspectJ，不过这个玩意在AS中的配置有点麻烦
     */
    @Test
    public void testCglibProxy() {
        CglibProxyFactory cglibFactory = new CglibProxyFactory();
        IUser cglibProxy = (IUser) cglibFactory.createProxy(target);
        cglibProxy.login();
        cglibProxy.updateInfo();
    }
}
```

原始方式：
```
小明在登录……
小明在更新信息……
```

代理方式：
```
前置动作……
小明在登录……

前置动作……
小明在更新信息……
后置动作……
```

看，使用代理后，我可以在登录和更新命令时，自动添加一些前置动作（比如检查下网络什么的），而在原命令完成之后，我还可以自动添加一些后置操作（比如更新后保存到数据库中）

这样一来的话，在一样常见的场景中：例如日志统计、用户行为统计等，我们就再也不必在原方法前和原方法后加一坨重复的代码了！这其实就是**AOP的编程思想**！大家不妨自己谷歌下。

## 二、代理实现：
其实静态代理和Cglib的动态代理都不一定需要接口，不过Jdk的代理的话，就必须要实现接口了。
### 1.接口
```
/**
 * 用户接口
 * <p>
 * 作者：余天然 on 16/9/18 下午3:45
 */
public interface IUser {
    void login();

    void updateInfo();
}
```

### 2.实现类
```
/**
 * 用户接口实现类
 * <p>
 * 作者：余天然 on 16/9/18 下午3:45
 */
public class UserImpl implements IUser {

    @Override
    public void login() {
        System.out.println("小明在登录……");

    }

    @Override
    public void updateInfo() {
        System.out.println("小明在更新信息……");
    }
}
```

### 3.静态代理类
```
package com.che.baseutil.proxy;

/**
 * 静态代理类
 * <p>
 * 作者：余天然 on 16/9/18 下午3:46
 */
public class UserStaticProxy implements IUser {

    private UserImpl userImpl;

    public UserStaticProxy(UserImpl userImpl) {
        this.userImpl = userImpl;
    }

    /**
     * 登录有前置动作
     */
    @Override
    public void login() {
        doBefore();
        this.userImpl.login();
    }

    /**
     * 更新有前置动作和后置动作
     */
    @Override
    public void updateInfo() {
        doBefore();
        this.userImpl.updateInfo();
        doAfter();
    }

    private void doBefore() {
        System.out.println("静态代理:前置动作……");
    }

    private void doAfter() {
        System.out.println("静态代理:后置动作……");
    }
}
```

### 4.JDK动态代理工厂
```
package com.che.baseutil.proxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * Jdk动态代理
 * <p>
 * 作者：余天然 on 16/9/18 下午3:47
 */
public class JdkProxyFactory implements InvocationHandler {
    private Object target;

    //创建代理类
    public Object createProxy(Object target) {
        this.target = target;
        //取得代理对象
        return Proxy.newProxyInstance(
                target.getClass().getClassLoader(), target.getClass().getInterfaces(), this);
    }

    //改变委托类方法的调用逻辑
    @Override
    public Object invoke(Object proxy, Method method, Object[] args)
            throws Throwable {
        Object result = null;
        if (method.getName().equals("login")) {
            doBefore();
            result = method.invoke(target, args);
        }
        if (method.getName().equals("updateInfo")) {
            doBefore();
            result = method.invoke(target, args);
            doAfter();
        }
        return result;
    }

    private void doBefore() {
        System.out.println("JDK动态代理:前置动作……");
    }

    private void doAfter() {
        System.out.println("JDK动态代理:后置动作……");
    }

}
```

### 5.Gglib动态代理工厂
```
package com.che.baseutil.proxy;


import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

/**
 * Cglib动态代理
 * <p>
 * 作者：余天然 on 16/9/18 下午3:48
 */
public class CglibProxyFactory implements MethodInterceptor {
    private Object target;

    //创建代理类
    public Object createProxy(Object target) {
        this.target = target;
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(this.target.getClass());
        enhancer.setCallback(this);
        return enhancer.create();
    }

    //改变委托类方法的调用逻辑
    @Override
    public Object intercept(Object target, Method method, Object[] args, MethodProxy proxy) throws Throwable {
        Object result = null;
        if (method.getName().equals("login")) {
            doBefore();
            result = proxy.invokeSuper(target, args);
        }
        if (method.getName().equals("updateInfo")) {
            doBefore();
            result = proxy.invokeSuper(target, args);
            doAfter();
        }
        return result;
    }

    private void doBefore() {
        System.out.println("Cglib动态代理:前置动作……");
    }

    private void doAfter() {
        System.out.println("Cglib动态代理:后置动作……");
    }
}
```