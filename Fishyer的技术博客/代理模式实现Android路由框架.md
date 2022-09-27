---
link: https://www.notion.so/Android-bedf062baf13430dab9e4a36e204c0bf
notionID: bedf062b-af13-430d-ab9e-4a36e204c0bf
---

#Android

在项目的开发过程中，我们可能会遇到一些很重的App，涉及到很多业务线，N个团队的共同开发。这个时候，如果还是单app的开发方式的话，可能会导致开发中的编译时间很长，每个团队之间的代码互相存在干扰。这个时候，可以考虑组件化开发。

所谓组件化开发，其实主要就是将一个module拆分成多个module，每个团队负责自己的module，在发布时再将所有的module合并到一起发布。

这种分module的方式比起普通的分模块的方式的好处就在于：不同的module之间是互相隔离的，只能通过接口访问，能更好的保证：高内聚低耦合。开发时，每个module都可以独立打包安装，编译时间短。各个module的res资源是隔离的，不像以前都是混在一起，一旦哪个module不需要了，很方便将代码和资源文件一起干掉，避免代码腐烂。

上面说了组件化开发，那路由框架和组件化开发有什么关系呢？上面我们知道，不同的组件之间是互相隔离的，那当需要从一个组件的页面跳转到另一个组件的页面时，该怎么办呢？这个时候就需要路由框架了，组件之间不直接打交道，而是通过路由来转发。这样方便我们实行动态跳转、拦截、统一转发等额外操作。

下面是我模仿Retrofit的代理模式来实现的一套简单的Android路由框架。主要是参考的[Android轻量级路由框架LiteRouter](http://www.jianshu.com/p/79e9a54e85b2)，不过个别地方根据自己的习惯做了点改动。虽然是模仿，但在自己敲的过程中，对Retrofit的代理模式又有了更深的理解，同时，LiteRouter的拦截器很简单，只有一个，我这里又模仿OkHttp的责任链模式对它的拦截器做了简单的拓展，支持多个拦截器，在实现的过程中，又过了一遍OkHttp的源码，受益匪浅。不得不说，多看源码真的挺有好处的，大家不妨也去看一看，第一次看不懂很正常，多看几次就有感觉了，码读百遍，其意自现。

## 使用方法

### 1、定义接口

```Java
/**
 * 定义Intent之间跳转的协议
 * <p>
 * 作者：余天然 on 2017/5/25 上午11:21
 */
public interface IntentService {

    @ClassName("com.soubu.routerdemo.Demo1Activity")
    void gotoDemo1(Context context);

    @ClassName("com.soubu.routerdemo2.Demo2Activity")
    void gotoDemo2(Context context, @Key("request") String request, @Key("response") String response);

}
```


### 2、创建Router实例，可以按需要添加拦截器

```Java
package com.soubu.routerhost;

import com.soubu.router.IntentRouter;

/**
 * 作者：余天然 on 2017/5/25 下午5:43
 */
public class IntentClient {

    public static IntentClient instance;

    private IntentRouter intentRouter;

    /**
     * 单例
     */
    public static IntentClient getInstance() {
        if (instance == null) {
            instance = new IntentClient();
        }
        return instance;
    }

    /**
     * 创建页面跳转辅助类
     */
    private IntentClient() {
        //通过动态代理，获得具体的跳转协议实现类，可自定义拦截器
        intentRouter = new IntentRouter.Builder()
                .addInterceptor(new Interceptor1())
                .addInterceptor(new Interceptor2())
                .addInterceptor(new Interceptor3())
                .build();
    }

    /**
     * 创建各个模块的页面接口
     */
    public IntentService intentService() {
        return intentRouter.create(IntentService.class);
    }

}
```


拦截器，可以统一对Intent做一些额外的处理

```Java
/**
 * Intent拦截器
 * 
 * 作者：余天然 on 2017/5/25 下午4:05
 */
public class Interceptor1 implements Interceptor {
    @Override
    public IntentWrapper intercept(Chain chain) {
        IntentWrapper request = chain.request();
        LogUtil.print("处理请求-1");
        Bundle reqExtras = request.getIntent().getExtras();
        reqExtras.putString("request", "1");
        request.getIntent().putExtras(reqExtras);
        IntentWrapper response = chain.process(request);
        LogUtil.print("处理响应-1");
        Bundle respExtras = response.getIntent().getExtras();
        respExtras.putString("response", "1");
        response.getIntent().putExtras(respExtras);
        return response;
    }
}
```


### 3、在每个module中，通过Router进行跳转

```Java
IntentClient.getInstance()
        .intentService()
        .gotoDemo1(activity);
```


## 源码流程

在创建Router实例时，通过动态代理创建了我们定义的跳转接口的实现类。

```Java
/**
 * 作者：余天然 on 2017/5/25 上午11:06
 */
public class IntentRouter {

    private List<Interceptor> interceptors;

    IntentRouter(List<Interceptor> interceptors) {
        this.interceptors = interceptors;
    }

    /**
     * create router class service
     *
     * @param service router class
     * @param <T>
     * @return
     */
    public <T> T create(final Class<T> service) {
        return (T) Proxy.newProxyInstance(service.getClassLoader(), new Class<?>[]{service},
                new InvocationHandler() {
                    @Override
                    public Object invoke(Object proxy, final Method method, final Object... args) throws Throwable {
                        //责任链模式，方便定制拦截器
                        Parser parser = new Parser();
                        IntentWrapper request = parser.parse(method, args);
                        Interceptor.Chain chain = new RealInterceptorChain(request, interceptors, 0);
                        IntentWrapper response = chain.process(request);
                        response.start();
                        //设置返回值，不过感觉没卵用
                        Class returnTYpe = method.getReturnType();
                        if (returnTYpe == void.class) {
                            return null;
                        } else if (returnTYpe == IntentWrapper.class) {
                            return response;
                        }
                        throw new RuntimeException("method return type only support 'void' or 'IntentWrapper'");
                    }
                });
    }

    public static final class Builder {
        private List<Interceptor> interceptors;

        public Builder() {
            this.interceptors = new ArrayList<>();
        }

        public Builder addInterceptor(Interceptor interceptor) {
            this.interceptors.add(interceptor);
            return this;
        }

        public IntentRouter build() {
            interceptors.add(new DefaultInterceptor());
            return new IntentRouter(interceptors);
        }
    }
}
```


在动态代理的invoke方法中，通过一个反射解析器来获取接口的方法的注解信息，根据这些注解自动帮其创建Intent，避免重复的体力活。

```Java
/**
 * 作者：余天然 on 2017/5/25 上午11:56
 */
public class Parser {

    private int requestCode;

    private String className;
    private int mFlags;
    private Bundle bundleExtra;

    private Context context;

    public Parser() {

    }

    public Parser addFlags(int flags) {
        mFlags |= flags;
        return this;
    }

    public IntentWrapper parse(Method method, Object... args) {
        // 解析方法注解
        parseMethodAnnotations(method);
        // 解析参数注解
        parseParameterAnnotations(method, args);
        //创建Intent
        Intent intent = new Intent();
        intent.setClassName(context, className);
        intent.putExtras(bundleExtra);
        intent.addFlags(mFlags);
        requestCode = method.isAnnotationPresent(RequestCode.class) ? requestCode : -1;
        return new IntentWrapper(context, intent, requestCode);
    }

    /**
     * 解析参数注解
     */
    private void parseParameterAnnotations(Method method, Object[] args) {
        //参数类型
        Type[] types = method.getGenericParameterTypes();
        // 参数名称
        Annotation[][] parameterAnnotationsArray = method.getParameterAnnotations();
        bundleExtra = new Bundle();
        for (int i = 0; i < types.length; i++) {
            // key
            String key = null;
            Annotation[] parameterAnnotations = parameterAnnotationsArray[i];
            for (Annotation annotation : parameterAnnotations) {
                if (annotation instanceof Key) {
                    key = ((Key) annotation).value();
                    break;
                }
            }
            parseParameter(bundleExtra, types[i], key, args[i]);
        }
        if (context == null) {
            throw new RuntimeException("Context不能为空");
        }
    }

    /**
     * 解析方法注解
     */
    void parseMethodAnnotations(Method method) {
        Annotation[] methodAnnotations = method.getAnnotations();
        for (Annotation annotation : methodAnnotations) {
            if (annotation instanceof ClassName) {
                ClassName className = (ClassName) annotation;
                this.className = className.value();
            } else if (annotation instanceof RequestCode) {
                RequestCode requestCode = (RequestCode) annotation;
                this.requestCode = requestCode.value();
            }
        }
        if (className == null) {
            throw new RuntimeException("JumpTo annotation is required.");
        }
    }

    /**
     * 解析参数注解
     *
     * @param bundleExtra 存储的Bundle
     * @param type        参数类型
     * @param key         参数名称
     * @param arg         参数值
     */
    void parseParameter(Bundle bundleExtra, Type type, String key, Object arg) {
        Class<?> rawParameterType = getRawType(type);
        if (rawParameterType == Context.class) {
            context = (Context) arg;
        }
        if (rawParameterType == String.class) {
            bundleExtra.putString(key, arg.toString());
        } else if (rawParameterType == String[].class) {
            bundleExtra.putStringArray(key, (String[]) arg);
        } else if (rawParameterType == int.class || rawParameterType == Integer.class) {
            bundleExtra.putInt(key, Integer.parseInt(arg.toString()));
        } else if (rawParameterType == int[].class || rawParameterType == Integer[].class) {
            bundleExtra.putIntArray(key, (int[]) arg);
        } else if (rawParameterType == short.class || rawParameterType == Short.class) {
            bundleExtra.putShort(key, Short.parseShort(arg.toString()));
        } else if (rawParameterType == short[].class || rawParameterType == Short[].class) {
            bundleExtra.putShortArray(key, (short[]) arg);
        } else if (rawParameterType == long.class || rawParameterType == Long.class) {
            bundleExtra.putLong(key, Long.parseLong(arg.toString()));
        } else if (rawParameterType == long[].class || rawParameterType == Long[].class) {
            bundleExtra.putLongArray(key, (long[]) arg);
        } else if (rawParameterType == char.class) {
            bundleExtra.putChar(key, arg.toString().toCharArray()[0]);
        } else if (rawParameterType == char[].class) {
            bundleExtra.putCharArray(key, arg.toString().toCharArray());
        } else if (rawParameterType == double.class || rawParameterType == Double.class) {
            bundleExtra.putDouble(key, Double.parseDouble(arg.toString()));
        } else if (rawParameterType == double[].class || rawParameterType == Double[].class) {
            bundleExtra.putDoubleArray(key, (double[]) arg);
        } else if (rawParameterType == float.class || rawParameterType == Float.class) {
            bundleExtra.putFloat(key, Float.parseFloat(arg.toString()));
        } else if (rawParameterType == float[].class || rawParameterType == Float[].class) {
            bundleExtra.putFloatArray(key, (float[]) arg);
        } else if (rawParameterType == byte.class || rawParameterType == Byte.class) {
            bundleExtra.putByte(key, Byte.parseByte(arg.toString()));
        } else if (rawParameterType == byte[].class || rawParameterType == Byte[].class) {
            bundleExtra.putByteArray(key, (byte[]) arg);
        } else if (rawParameterType == boolean.class || rawParameterType == Boolean.class) {
            bundleExtra.putBoolean(key, Boolean.parseBoolean(arg.toString()));
        } else if (rawParameterType == boolean[].class || rawParameterType == Boolean[].class) {
            bundleExtra.putBooleanArray(key, (boolean[]) arg);
        } else if (rawParameterType == Bundle.class) {
            if (TextUtils.isEmpty(key)) {
                bundleExtra.putAll((Bundle) arg);
            } else {
                bundleExtra.putBundle(key, (Bundle) arg);
            }
        } else if (rawParameterType == SparseArray.class) {
            if (type instanceof ParameterizedType) {
                ParameterizedType parameterizedType = (ParameterizedType) type;
                Type[] actualTypeArguments = parameterizedType.getActualTypeArguments();
                Type actualTypeArgument = actualTypeArguments[0];

                if (actualTypeArgument instanceof Class) {
                    Class<?>[] interfaces = ((Class) actualTypeArgument).getInterfaces();
                    for (Class<?> interfaceClass : interfaces) {
                        if (interfaceClass == Parcelable.class) {
                            bundleExtra.putSparseParcelableArray(key, (SparseArray<Parcelable>) arg);
                            return;
                        }
                    }
                    throw new RuntimeException("SparseArray的泛型必须实现Parcelable接口");
                }
            } else {
                throw new RuntimeException("SparseArray的泛型必须实现Parcelable接口");
            }
        } else if (rawParameterType == ArrayList.class) {
            if (type instanceof ParameterizedType) {
                ParameterizedType parameterizedType = (ParameterizedType) type;
                Type[] actualTypeArguments = parameterizedType.getActualTypeArguments(); // 泛型类型数组
                if (actualTypeArguments == null || actualTypeArguments.length != 1) {
                    throw new RuntimeException("ArrayList的泛型必须实现Parcelable接口");
                }

                Type actualTypeArgument = actualTypeArguments[0]; // 获取第一个泛型类型
                if (actualTypeArgument == String.class) {
                    bundleExtra.putStringArrayList(key, (ArrayList<String>) arg);
                } else if (actualTypeArgument == Integer.class) {
                    bundleExtra.putIntegerArrayList(key, (ArrayList<Integer>) arg);
                } else if (actualTypeArgument == CharSequence.class) {
                    bundleExtra.putCharSequenceArrayList(key, (ArrayList<CharSequence>) arg);
                } else if (actualTypeArgument instanceof Class) {
                    Class<?>[] interfaces = ((Class) actualTypeArgument).getInterfaces();
                    for (Class<?> interfaceClass : interfaces) {
                        if (interfaceClass == Parcelable.class) {
                            bundleExtra.putParcelableArrayList(key, (ArrayList<Parcelable>) arg);
                            return;
                        }
                    }
                    throw new RuntimeException("ArrayList的泛型必须实现Parcelable接口");
                }
            } else {
                throw new RuntimeException("ArrayList的泛型必须实现Parcelable接口");
            }
        } else {
            if (rawParameterType.isArray()) // Parcelable[]
            {
                Class<?>[] interfaces = rawParameterType.getComponentType().getInterfaces();
                for (Class<?> interfaceClass : interfaces) {
                    if (interfaceClass == Parcelable.class) {
                        bundleExtra.putParcelableArray(key, (Parcelable[]) arg);
                        return;
                    }
                }
                throw new RuntimeException("Object[]数组中的对象必须全部实现了Parcelable接口");
            } else // 其他接口
            {
                Class<?>[] interfaces = rawParameterType.getInterfaces();
                for (Class<?> interfaceClass : interfaces) {
                    if (interfaceClass == Serializable.class) {
                        bundleExtra.putSerializable(key, (Serializable) arg);
                    } else if (interfaceClass == Parcelable.class) {
                        bundleExtra.putParcelable(key, (Parcelable) arg);
                    } else {
                        throw new RuntimeException("Bundle不支持的类型, 参数: " + key);
                    }
                }
            }

        }
    }

    
}
```


```Java
    /**
     * 获取返回类型
     *
     * @param type
     * @return
     */
    Class<?> getRawType(Type type) {
        if (type == null) throw new NullPointerException("type == null");

        if (type instanceof Class<?>) {
            // Type is a normal class.
            return (Class<?>) type;
        }
        if (type instanceof ParameterizedType) {
            ParameterizedType parameterizedType = (ParameterizedType) type;

            // I'm not exactly sure why getRawType() returns Type instead of Class. Neal isn't either but
            // suspects some pathological case related to nested classes exists.
            Type rawType = parameterizedType.getRawType();
            if (!(rawType instanceof Class)) throw new IllegalArgumentException();
            return (Class<?>) rawType;
        }
        if (type instanceof GenericArrayType) {
            Type componentType = ((GenericArrayType) type).getGenericComponentType();
            return Array.newInstance(getRawType(componentType), 0).getClass();
        }
        if (type instanceof TypeVariable) {
            // We could use the variable's bounds, but that won't work if there are multiple. Having a raw
            // type that's more general than necessary is okay.
            return Object.class;
        }
        if (type instanceof WildcardType) {
            return getRawType(((WildcardType) type).getUpperBounds()[0]);
        }

        throw new IllegalArgumentException("Expected a Class, ParameterizedType, or "
                + "GenericArrayType, but <" + type + "> is of type " + type.getClass().getName());
    }
```


这里的Intent我是用一个IntentWrapper包装了一下，主要就是传入了context对象，方便startActivity等方法的统一调用

```Java
public class IntentWrapper {

    private Context context;
    private Intent intent;
    private int requestCode = -1;

    public IntentWrapper(Context context, Intent intent, int requestCode) {
        this.context = context;
        this.intent = intent;
        this.requestCode = requestCode;
    }

    public Intent getIntent() {
        return intent;
    }

    public Context getContext() {
        return context;
    }

    public int getRequestCode() {
        return requestCode;
    }

    public void start() {
        if (requestCode == -1) {
            startActivity();
        } else {
            startActivityForResult(requestCode);
        }
    }

    public void startActivity() {
        if (!(context instanceof Activity)) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        }
        context.startActivity(intent);
    }

    public void startActivityForResult(int requestCode) {
        if (!(context instanceof Activity)) {
            throw new RuntimeException("startActivityForResult only works for activity context");
        }
        ((Activity) context).startActivityForResult(intent, requestCode);
    }

}
```


其实不要拦截器，也是完全可以的。但是为了拥抱变化（其实是为了装逼），我们对Parser创建的IntenWrapper又做了一点点加工，在中间添加了一道责任链，虽然这里输入的是IntenWrapper，输出的也是IntenWrapper，但是，这中间我们是可以自己做一点额外的处理的，比如给每个Intent添加一个额外的参数、统一修改Intent的信息。

为了大家更对OkHttp中的责任链有一个更直观的感受，我这里插播一张图

![](http://upload-images.jianshu.io/upload_images/1458573-32b70857ad94c37e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看上图，我们可以定义多个拦截器：RetryAndFollowupInterceptor来负责失败重试和重定向、BridgeInterceptor来处理request和response的header里面的信息、CacheInterceptor来实现各种缓存策略、ConnectInterceptor来建立与服务器的连接、CallServerInterceptor来与服务器交互数据。这几个其实是OkHttp自带的拦截器，其实我们在开发时，通常会额外的加几个自定义的拦截器，比如对token的统一处理啊、网络日志的打印啊等等。

拦截器的设计，可以像工厂流水线一样，传递用户发起的请求 Request，每一个拦截器完成相应的功能，从失败重试和重定向实现、请求头的修改和Cookie 的处理，缓存的处理，建立 TCP 和 SSH 连接，发送 Request 和读取 Response，每一个环节由专门的 Interceptor 负责。

定义Interceptor和Chain的接口。

```Java
public interface Interceptor {
    IntentWrapper intercept(Chain chain);

    interface Chain {
        IntentWrapper request();

        IntentWrapper process(IntentWrapper request);
    }
}
```


自定义RealInterceptorChain实现Chain接口，其实就是内部维护了一个List<Interceptor>,源码比较简单，主要功能就是将多个Interceptor合并成一串。
	

```Java
/**
 * 作者：余天然 on 2017/5/25 下午4:35
 */
public class RealInterceptorChain implements Interceptor.Chain {

    private IntentWrapper originalRequest;
    private List<Interceptor> interceptors;
    private int index;

    public RealInterceptorChain(IntentWrapper request, List<Interceptor> interceptors, int index) {
        this.originalRequest = request;
        this.interceptors = interceptors;
        this.index = index;
    }

    @Override
    public IntentWrapper request() {
        return originalRequest;
    }

    @Override
    public IntentWrapper process(IntentWrapper request) {
        Interceptor interceptor = interceptors.get(index);
        RealInterceptorChain next = new RealInterceptorChain(request, interceptors, index + 1);
        IntentWrapper response = interceptor.intercept(next);
        return response;
    }
}
```


默认的拦截器，其实啥都没做，主要就是方便RealInterceptorChain中至少有一个拦截器可以传输数据，但是总觉得这里有点怪，大家要是有更好的方法的话可以省掉这个类的话，欢迎提出来。

```Java
public class DefaultInterceptor implements Interceptor {

    @Override
    public IntentWrapper intercept(Chain chain) {
        return chain.request();
    }

}
```


在我们定义接口的时候，其实还用到了几个注解：@ClassName、@Key、@RequestCode。

```Java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ClassName {
    String value();
}
```


这里只发一个吧，另外两个和它除了名字不一样都是一样的，就不发了，免得大家说我凑字数。

以上就是这个路由框架的实现思路了，其实这个框架的实用性不是很大，因为现在阿里巴巴已经开源了一个[ARouter](https://github.com/alibaba/ARouter)，这个比我们这个更好一点，它没有反射，也没有接口定义类，而是在每个Activity上添加注解，然后通过apt在编译时获取这些注解信息，动态创建一个辅助类来实现路由的。我们这个框架是用的运行时注解+反射，性能上比不上编译时注解，并且，我们的接口定义类不知道放在哪个module比较好，它依赖了router框架，同时又被所有的module都依赖。

---
 <sub>本文档由[瓦雀](https://www.yuque.com/waquehq)创建</sub>