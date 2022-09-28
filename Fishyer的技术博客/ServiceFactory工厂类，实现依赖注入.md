# ServiceFactory工厂类，实现依赖注入

#工具类

这个工具类，算是一个简单的依赖注入工具，可以用最小的成本来解耦接口和具体实现，其实我们常用的一些路由框架，核心就是这个服务管理类，但是使用它需要注意的一点就是实现类是反射创建的，需要保留一个默认的构造方法，同时反射可能会影响一点性能。

## 服务管理类

```
package com.ezbuy.core.helper;

import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;

/**
* 服务管理类
*
* @author Yutianran
*/
public class ServiceFactory {


    //服务类 -> 实现类
    private static Map<Class<?>, Class<?>> router = new HashMap<>();


    //服务类 -> 实现对象的弱引用,资源不足时,GC会主动回收对象
    private static Map<Class<?>, WeakReference<Object>> implMap = new HashMap<>();


    //在这里静态注册所有服务
    static {
//        router.put(CartService.class, CartServiceRxImpl.class);
//        router.put(ErrorConsumer.class, ErrorConsumerImpl.class);
    }


    //在这里动态注册服务,不直接注册实现类的对象,是为了懒加载,在需要时再创建
    public static void registerService(Class<?> service, Class<?> impl) {
        router.put(service, impl);
    }


    //反注册服务
    public static void unRegisterService(Class<?> service) {
        router.remove(service);
    }


    public static <T> T getService(Class<T> serverClass) {
        WeakReference<Object> reference = implMap.get(serverClass);
        Object obj = null;
        //缓存没有被清除掉
        if (reference != null) {
            obj = reference.get();
            if(obj!=null){
                return (T) obj;
            }
        }
        //缓存被清除掉了,或者是还没有创建缓存
        try {
            if (obj == null) {
                Class<?> implClass = router.get(serverClass);
                obj = implClass.newInstance();
                implMap.put(serverClass, new WeakReference<>(obj));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return (T) obj;
    }

}

```

## 使用示例

```
package com.daigou.sg.app;


import com.daigou.sg.manager.LanguageServiceImpl;
import com.ezbuy.core.error.ErrorConsumer;
import com.ezbuy.core.helper.ServiceFactory;
import com.ezbuy.core.language.LanguageService;
import com.ezbuy.dto.impl.CartPublicServiceImpl;
import com.ezbuy.dto.service.CartPublicService;


/**
* 初始化ServiceFactory，动态注册所有Service
*/
public class ServiceFactoryManager {


    public static void init() {
        ServiceFactory.registerService(CartPublicService.class, CartPublicServiceImpl.class);
        ServiceFactory.registerService(ErrorConsumer.class, ErrorConsumerImpl.class);
        ServiceFactory.registerService(LanguageService.class, LanguageServiceImpl.class);
    }
}
```