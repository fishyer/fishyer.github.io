---
link: https://www.notion.so/ProtoBuf-Java-f13e5c93a78240deaaf2111d650a23ca
notionID: f13e5c93-a782-40de-aaf2-111d650a23ca
---

#Android

### 1.背景

在我们日常的开发中，前后端之间的接口联调很麻烦，经常出现后端加了字段，前端还不知道，所谓接口文档，经常和代码是不同步的。

好在现在有了grpc，它可以定义好ProtoBuf接口文件后，自动生成代码。原理就是RPC，在客户端生成一个远程服务的代理，可以像访问访问本地方法一样，访问远程方法。

但是，在客户端使用grpc的实践中，我们发现了grpc有几个弊端：

1. 生成的实体类太大，很占内存，所以，我们最好只是用grpc的实体类来传输，但是在业务层，还是使用自己写的实体类更方便一点

2. 自动生成的同步方法和异步方法，都不够好用，使用起来还是有一点点麻烦的

3. grpc生成的类都是final类，不便修改和继承

4. grpc生成的类没有实现Parcelable和Serializable接口，没法通过Intent传递，这在不同页面之间传递数据比较麻烦

为了解决grpc的弊端，我们最好在业务层自己封装一套实体类，grpc实体类只负责传输层，但是这又带来了一个新的问题：两套实体类之间互相转换的问题。

在我们的应用中，实体类的数量已经有接近800个，服务也有100多个。因为历史遗留问题，现在这些grpc的类还是广泛存在于业务层，迁移的话，非常麻烦。

经过一段时间的研究，我终于想到了一个方案：利用ProtoBuf接口文件，一键生成Java代码。

实现过程中，遇到了几个问题：

1. 如何解析ProtoBuf文件？

&ensp;&ensp;&ensp;&ensp;因为我主要是玩Java的，所以还是想用Java代码来解析，但是在网上找了半天，好像都没有直接用Java解析ProtoBuf的方案。好在有一个替代方案，先将proto文件编译成desc文件，然后再来解析desc文件。

&ensp;&ensp;&ensp;&ensp;编译的话，就用Java调用一个cmd指令就好了

&ensp;&ensp;&ensp;&ensp;解析的话，就有不少坑了：

&ensp;&ensp;&ensp;&ensp;第1坑：List<int>里的int需要额外处理

&ensp;&ensp;&ensp;&ensp;第2坑：map字段需要额外处理

&ensp;&ensp;&ensp;&ensp;第3坑：message嵌套message需要额外处理

&ensp;&ensp;&ensp;&ensp;第4坑：类名重复问题，因为我之前都是直接生成到一个包里面的，这就难免重复了，所以protobuf里面定义的package字段也要用上，

&ensp;&ensp;&ensp;&ensp;其它的小坑就略过不提了~~~

2. 如何生成Java代码？

&ensp;&ensp;&ensp;&ensp;这肯定要用到模板引擎来做代码自动生成了，这里我使用的是FreeMaker。因为之前没玩过它，在写ftl模板文件时，经常运行失败。后来才知道这个坑：FreeMaker的数据模型必须有get方法，哪怕你的字段是public的也必须要有。

&ensp;&ensp;&ensp;&ensp;了解了FreeMaker的语法之后，再来写的话，就方便多了，后来而遇到了一个坑：Class里面嵌套Class的问题。这种内部类该怎么生成？这就需要用到FreeMaker的宏来做递归了。

### 2. 案例

#### ProtoBuf定义

文件名：`user.proto`，这里仅是一个示例，其实这个定义文件也不规范，更好的定义规范，还需要实践探索，和自己的项目结合

```Java
syntax = "proto3";
package crm.usercenter;

message UserMessage {
    string name = 1;
    int32 id = 2;
    string message = 3;
    MessageType type=4;
}

message FindUserMessageByIdReq {
    int32 id = 1;
}

message Result {
    string msg = 4;
    int32 code = 5;
}

enum MessageType {
    SYSTEM = 0;
    CUSTOMER = 1;
    OTHER = 2;
}

service UserPublic {
    rpc FindUserMessageById (FindUserMessageByIdReq) returns (UserMessage);
    rpc AddUserMessage (UserMessage) returns (Result);
}
```


#### 生成的实体类

这里就只贴一个message了，其它类似

```Java
package dest.bean.crm.usercenter;

import dest.bean.crm.usercenter.MessageType;

public class UserMessage {
    public String name;
    public int id;
    public String message;
    public MessageType type;

}
```


#### 生成的枚举类

```Java
package dest.bean.crm.usercenter;

public enum MessageType {
    SYSTEM,
    CUSTOMER,
    OTHER,
}
```


#### 生成的接口类

```Java
package dest.bean.crm.usercenter;

import dest.bean.crm.usercenter.FindUserMessageByIdReq;
import dest.bean.crm.usercenter.UserMessage;
import dest.bean.crm.usercenter.Result;

public interface UserPublic {

    UserMessage findUserMessageById(FindUserMessageByIdReq findUserMessageByIdReq);

    Result addUserMessage(UserMessage userMessage);

}
```


### 3. 异步封装

上面只是最基本的封装而已，其实用处不是很大，存在问题：

1. 实体类自动生成，虽然减轻了一点工作量，不用自己再写那么多字段了，但是和Grpc生产的实体类之间的转换还是问题

2. 生成的接口是同步的，但是我们在Android端用的话，肯定是要异步的接口的

下面，好戏开始上演了~~~

#### 生成的异步接口

这里的异步接口，涉及到了我自己封装的网络层框架的几个接口了，

ResourceObserver是基于观察者模式实现的，类似于一个Rx的Disposable，用于取消网络请求，需要注册到ResourceSubject上。我们最好是将BaseActivity和BaseFragment都实现ResourceSubject接口，然后在退出Activity就可以自动取消网络请求了。

然后Consumer是我自己封装的函数式接口，之所以不用Rx和Java8的，主要是这种接口定义本来很简单，没必要过度依赖第三方，万一哪一天，我们不想用Rx了的话，用到这个接口的地方都得改，很蛋疼的。类似的我还封装了Mapper、Provider等几个函数式接口。

```Java
package dest.bean.crm.usercenter;

import com.ezbuy.functions.Consumer;
import com.ezbuy.web.ResourceObserver;

import dest.bean.crm.usercenter.FindUserMessageByIdReq;
import dest.bean.crm.usercenter.UserMessage;
import dest.bean.crm.usercenter.Result;

public interface UserPublicWebService {

    ResourceObserver findUserMessageById(FindUserMessageByIdReq findUserMessageByIdReq, Consumer<UserMessage> consumer);

    ResourceObserver addUserMessage(UserMessage userMessage, Consumer<Result> consumer);

}
```


#### 生成异步接口的实现类

这里的异步接口的实现类是Rx的方式，返回的观察者是RxResourceObserver。但是实际上，我们完全可以将这里改成任何自己想要的方式。比如我们应用里面有GRPC和RPC两种方式，我们完全可以定义另外两种ResourceObserver。

```Java
package dest.bean.crm.usercenter;

import com.ezbuy.functions.Consumer;
import com.ezbuy.functions.Mapper;
import com.ezbuy.web.ResourceObserver;
import com.ezbuy.web.helper.RxExecuter;
import com.ezbuy.web.observer.RxResourceObserver;
import io.reactivex.disposables.Disposable;

public class UserPublicWebServiceImpl implements UserPublicWebService {

    @Override
    public ResourceObserver findUserMessageById(FindUserMessageByIdReq req, Consumer<UserMessage> consumer) {
        Disposable disposable = RxExecuter.execute(req, consumer, new Mapper<FindUserMessageByIdReq, UserMessage>() {
            @Override
            public UserMessage map(FindUserMessageByIdReq req) {
                UserOuterClass.UserMessage resp = UserPublicGrpc.newBlockingStub(null).findUserMessageById(new FindUserMessageByIdReqMapper().toGrpc(req));
                return new UserMessageMapper().fromGrpc(resp);
            }
        });
        return new RxResourceObserver(disposable);
    }
    
    @Override
    public ResourceObserver addUserMessage(UserMessage req, Consumer<Result> consumer) {
        Disposable disposable = RxExecuter.execute(req, consumer, new Mapper<UserMessage, Result>() {
            @Override
            public Result map(UserMessage req) {
                UserOuterClass.Result resp = UserPublicGrpc.newBlockingStub(null).addUserMessage(new UserMessageMapper().toGrpc(req));
                return new ResultMapper().fromGrpc(resp);
            }
        });
        return new RxResourceObserver(disposable);
    }
    
}
```


这是返回的RxResourceObserver，这里为了强行和Observer的官方接口保证一致，把`cancel()`命名为`update()`其实不好，以后再改回来吧。

```Java
package com.ezbuy.web.observer;

import com.ezbuy.web.ResourceObserver;
import com.ezbuy.web.ResourceSubject;
import io.reactivex.disposables.Disposable;

public class RxResourceObserver implements ResourceObserver {

    private Disposable disposable;

    public RxResourceObserver(Disposable disposable) {
        this.disposable = disposable;
    }

    @Override
    public void update() {
        System.out.println("请求反注册:" + disposable);
        if (isRelease()) {
            System.out.println("请求已取消,无须反注册");
        } else {
            System.out.println("请求未取消,执行反注册");
            disposable.dispose();
        }

    }

    @Override
    public void register(ResourceSubject manager) {
        System.out.println("请求注册:" + disposable);
        manager.attach(this);
    }

    @Override
    public boolean isRelease() {
        return disposable.isDisposed();
    }
}
```


这里是我们定义的其它的ResourceObserver，只以GRPC为例子吧，RPC的类似

```Java
package com.ezbuy.web.observer;

import com.daigou.model.grpc.GrpcRequest;
import com.ezbuy.web.ResourceSubject;

public class GrpcRequestObserver implements ResourceObserver {

    private GrpcRequest request;

    public GrpcRequestObserver(GrpcRequest request) {
        this.request = request;
    }

    @Override
    public void update() {
        request.cancel();
    }

    @Override
    public void register(ResourceSubject subject) {
        subject.attach(this);
    }

    @Override
    public boolean isRelease() {
        return request.isCanceled();
    }

}
```


#### 生成的异步接口的测试类

为了方便测试接口通没通，我这里会自动根据protobuf生成测试类，每个接口方法都有

```Java
package dest.bean.crm.usercenter;

import com.ezbuy.functions.Consumer;
import com.ezbuy.web.ResourceSubject;
import com.ezbuy.web.ServiceFactory;
import com.ezbuy.web.observer.ResourceSubjectImpl;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.concurrent.TimeUnit;

public class UserPublicWebServiceTest {

    @Before
    public void setUp() throws Exception {
        //注册服务,建议放在Application,UserPublicWebServiceImpl的实例会在需要时才初始化,并有弱引用的缓存,防止内存泄露
        ServiceFactory.registerService(UserPublicWebService.class, UserPublicWebServiceImpl.class);
    }

    @After
    public void tearDown() throws Exception {
        //反注册服务
        ServiceFactory.unRegisterService(UserPublicWebService.class);
    }

    @Test
    public void testFindUserMessageById() throws Exception {
        System.out.println("开始执行:testFindUserMessageById");
        long time = System.currentTimeMillis();
        //模拟Activity,我们最好在BaseActivity和BaseFragment实现此接口
        ResourceSubject activity = new ResourceSubjectImpl();
        //模拟网络请求
        FindUserMessageByIdReq req = new FindUserMessageByIdReq();
        ServiceFactory.getService(UserPublicWebService.class).findUserMessageById(req, new Consumer<UserMessage>() {
            @Override
            public void consume(UserMessage resp) {
                System.out.println("请求成功:" + resp);
            }
        }).register(activity);
        //其实不register也可以,但是那就不会自动取消了,回来时如果Activity退出了,Consumer的回调里面可能抛出空指针异常
        //模拟3秒之后,退出Activity
        TimeUnit.SECONDS.sleep(3);
        System.out.println("退出Activity");
        activity.notifyAllObservers();
        System.out.println("结束执行:testFindUserMessageById" + ",耗时:" + (System.currentTimeMillis() - time));
    }

    @Test
    public void testAddUserMessage() throws Exception {
        System.out.println("开始执行:testAddUserMessage");
        long time = System.currentTimeMillis();
        //模拟Activity,我们最好在BaseActivity和BaseFragment实现此接口
        ResourceSubject activity = new ResourceSubjectImpl();
        //模拟网络请求
        UserMessage req = new UserMessage();
        ServiceFactory.getService(UserPublicWebService.class).addUserMessage(req, new Consumer<Result>() {
            @Override
            public void consume(Result resp) {
                System.out.println("请求成功:" + resp);
            }
        }).register(activity);
        //其实不register也可以,但是那就不会自动取消了,回来时如果Activity退出了,Consumer的回调里面可能抛出空指针异常
        //模拟3秒之后,退出Activity
        TimeUnit.SECONDS.sleep(3);
        System.out.println("退出Activity");
        activity.notifyAllObservers();
        System.out.println("结束执行:testAddUserMessage" + ",耗时:" + (System.currentTimeMillis() - time));
    }

}
```


以`testFindUserMessageById()`方法为例，我们可以看看输出，基本是和预期一致的。

```Java
registerService:dest.bean.crm.usercenter.UserPublicWebService
开始执行:testFindUserMessageById
请求注册:io.reactivex.internal.operators.observable.ObservableMap$MapObserver@52af6cff
请求成功:dest.bean.crm.usercenter.UserMessage@37670c36
退出Activity
请求反注册:DISPOSED
请求已取消,无须反注册
结束执行:testFindUserMessageById,耗时:3365
unRegisterService:dest.bean.crm.usercenter.UserPublicWebService
```


test里面的`ServiceFactory.getService(UserPublicWebService.class)`是根据工厂模式，自己写的一个简单的服务工厂类，我们只需要将每一个接口类和实现类一一注册到这个工厂类就好了，使用它的好处就是，我可以很方便切换一个服务的具体实现方式，只需要改一下注册类就好了，具体使用的地方都不用动。

```Java
package com.ezbuy.web;

import com.ezbuy.web.error.ErrorConsumer;
import com.ezbuy.web.error.ErrorConsumerImpl;
import com.ezbuy.web.impl.CartServiceRxImpl;

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
        router.put(CartService.class, CartServiceRxImpl.class);
        router.put(ErrorConsumer.class, ErrorConsumerImpl.class);
    }

    //在这里动态注册服务,不直接注册实现类的对象,是为了懒加载,在需要时再创建
    public static void registerService(Class<?> service, Class<?> impl) {
        System.out.println("registerService:"+service.getName());
        router.put(service, impl);
    }

    //反注册服务
    public static void unRegisterService(Class<?> service) {
        System.out.println("unRegisterService:"+service.getName());
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


### 4. 兼容GRPC

上面其实故意漏了一个，就是具体是怎么将request变成response的呢，其实就在是异步接口实现类的map操作里面做的。

```Java
Disposable disposable = RxExecuter.execute(req, consumer, new Mapper<FindUserMessageByIdReq, UserMessage>() {
    @Override
    public UserMessage map(FindUserMessageByIdReq req) {
        UserOuterClass.UserMessage resp = UserPublicGrpc.newBlockingStub(null).findUserMessageById(new FindUserMessageByIdReqMapper().toGrpc(req));
        return new UserMessageMapper().fromGrpc(resp);
    }
});
```


这里涉及到了一个`RxExecuter.execute`，这个只是封装了Rx的subscribeOn和observeOn这些操作的工具类而已，等下会贴，现在我们的重点是：

```Java
UserOuterClass.UserMessage resp = UserPublicGrpc.newBlockingStub(null).findUserMessageById(new FindUserMessageByIdReqMapper().toGrpc(req));
```


这个才是test的时候实现request -> response的核心。

涉及到了两个类：`UserOuterClass`数据类、`UserPublicGrpc`请求执行类

#### 生成的GRPC数据类-模拟

其实，这是只是模拟的GRPC数据类，真正的GRPC数据类是由`protobuf-gradle-plugin`插件自动生成的，但是因为我这个电脑没安装，就只好先用我自己生成的类来模拟了。

```Java
package dest.bean.crm.usercenter;

public class UserOuterClass {

    public static class UserMessage {
        public String name;

        public String getName() {
            return name;
        }
        public int id;

        public int getId() {
            return id;
        }
        public String message;

        public String getMessage() {
            return message;
        }
        public MessageType type;

        public MessageType getType() {
            return type;
        }

        private UserMessage(Builder builder) {
            name = builder.name;
            id = builder.id;
            message = builder.message;
            type = builder.type;
        }

        public static Builder newBuilder() {
            return new Builder();
        }

        public static final class Builder {
            private String name;
            private int id;
            private String message;
            private MessageType type;

            public Builder() {
            }

            public Builder setName(String name) {
                this.name = name;
                return this;
            }
            public Builder setId(int id) {
                this.id = id;
                return this;
            }
            public Builder setMessage(String message) {
                this.message = message;
                return this;
            }
            public Builder setType(MessageType type) {
                this.type = type;
                return this;
            }

            public UserMessage build() {
                return new UserMessage(this);
            }
        }
    }
    public static class FindUserMessageByIdReq {
        public int id;

        public int getId() {
            return id;
        }

        private FindUserMessageByIdReq(Builder builder) {
            id = builder.id;
        }

        public static Builder newBuilder() {
            return new Builder();
        }

        public static final class Builder {
            private int id;

            public Builder() {
            }

            public Builder setId(int id) {
                this.id = id;
                return this;
            }

            public FindUserMessageByIdReq build() {
                return new FindUserMessageByIdReq(this);
            }
        }
    }
    public static class Result {
        public String msg;

        public String getMsg() {
            return msg;
        }
        public int code;

        public int getCode() {
            return code;
        }

        private Result(Builder builder) {
            msg = builder.msg;
            code = builder.code;
        }

        public static Builder newBuilder() {
            return new Builder();
        }

        public static final class Builder {
            private String msg;
            private int code;

            public Builder() {
            }

            public Builder setMsg(String msg) {
                this.msg = msg;
                return this;
            }
            public Builder setCode(int code) {
                this.code = code;
                return this;
            }

            public Result build() {
                return new Result(this);
            }
        }
    }
}
```


这个模拟类和真实的GRPC类一样，都是用建造者模式来创建对象的。怎么说呢，建造者模式，有好用的地方，也有不好用的地方，好用在于控制对象的创建过程，不好用在于有的时候，只有一两个字段的时候，其实直接new可能更方便，而且，grpc的建造者模式，修改数据真的有点蛋疼。

#### 生成的GRPC请求执行类-模拟

这个类同样也只是模拟类，真正的类是由protobuf-gradle-plugin插件自动生成。grpc的插件其实也就主要为我们自动生成了这两个类而已。

```Java
package dest.bean.crm.usercenter;

public class UserPublicGrpc {

    public static UserPublicGrpc newBlockingStub(Object channel) {
        return new UserPublicGrpc();
    }

    public UserOuterClass.UserMessage findUserMessageById(UserOuterClass.FindUserMessageByIdReq findUserMessageByIdReq) {
        return UserOuterClass.UserMessage.newBuilder().build();
    }

    public UserOuterClass.Result addUserMessage(UserOuterClass.UserMessage userMessage) {
        return UserOuterClass.Result.newBuilder().build();
    }

}
```


#### 生成的GRPC数据转换类

这个类不是模拟类，grpc不会给我们生成这个类，这个类很重要，功能也很简单，就是实现GRPC数据类和自定义实体类之间的互相转换。

有了这个类，我们就真的可以实现，在业务层用自定义实体类，在传输层用GRPC数据类了。额，其实这里还有几个坑，还没有填，比如：

1. 现在grpc和自定义的枚举类是同一个类，这是有问题，还需要优化

2. 涉及到字段的类型也是自定义类的时候，这种简单的转换方式就有问题了，需要将字段的值也用它的类的Mapper转换以便才行，这样的话，我们自动生成的机制就更复杂了，后续优化！！！

```Java
package dest.bean.crm.usercenter;

import com.ezbuy.web.GrpcMapper;

public class UserMessageMapper implements GrpcMapper<UserOuterClass.UserMessage, UserMessage> {

    @Override
    public UserOuterClass.UserMessage toGrpc(UserMessage entity) {
        return UserOuterClass.UserMessage.newBuilder()
                .setName(entity.name)
                .setId(entity.id)
                .setMessage(entity.message)
                .setType(entity.type)
                .build();
    }

    @Override
    public UserMessage fromGrpc(UserOuterClass.UserMessage grpc) {
        UserMessage entity = new UserMessage();
        entity.name=grpc.getName();
        entity.id=grpc.getId();
        entity.message=grpc.getMessage();
        entity.type=grpc.getType();
        return entity;
    }
}
```


这个自动生成的类，实现了我定义的一个接口:`GrpcMapper`，其实这个接口的作用主要就是一个规范，保证所有的数据转换的方法都是`toGrpc`和`fromGrpc `,保证统一。同时也方便后期拓展。

```Java
package com.ezbuy.web;

public interface GrpcMapper<Grpc,Entity> {

    Grpc toGrpc(Entity entity);

    Entity fromGrpc(Grpc grpc);
}
```


之前提到的RxExecuter辅助类，我这里屏蔽掉了`AndroidSchedulers.main()`，是为了方便在测试时能跑，后续得想个办法测试和正式时，自动决定要不要切换回主线程

```Java
package com.ezbuy.web.helper;

import com.ezbuy.functions.Consumer;
import com.ezbuy.functions.Mapper;
import com.ezbuy.web.ServiceFactory;
import com.ezbuy.web.error.BaseConsumer;
import com.ezbuy.web.error.ErrorConsumer;
import io.reactivex.Observable;
import io.reactivex.annotations.NonNull;
import io.reactivex.disposables.Disposable;
import io.reactivex.functions.Function;
import io.reactivex.schedulers.Schedulers;

/**
 * yutianran 2018/12/1 下午12:15
 */
public class RxExecuter {

    public static <Request, Response> Disposable execute(Request request, final Consumer<Response> consumer, Mapper<Request, Response> mapper) {
        return Observable.just(request)
                .subscribeOn(Schedulers.io())
                .map(new Function<Request, Response>() {
                    @Override
                    public Response apply(@NonNull Request request) throws Exception {
                        return mapper.map(request);
                    }
                })
                //.observeOn(AndroidSchedulers.main())
                .subscribe(new io.reactivex.functions.Consumer<Response>() {
                    @Override
                    public void accept(Response response) throws Exception {
                        //这里将rx的Consumer接口,转换成我们自己的Consumer接口,是因为我们的Consumer接口可以兼容RpcRequest和GrpcRequest的请求方式
                        if (consumer != null) {
                            consumer.consume(response);
                        }
                    }
                }, new io.reactivex.functions.Consumer<Throwable>() {
                    @Override
                    public void accept(Throwable throwable) throws Exception {
                        //如果有处理onError的BaseConsumer,就用BaseConsumer的onError处理
                        if (consumer != null && consumer instanceof BaseConsumer) {
                            System.out.println("自定义错误处理:" + throwable.getMessage());
                            BaseConsumer baseConsumer = (BaseConsumer) consumer;
                            baseConsumer.onError(throwable);
                            return;
                        }
                        //否则,就用注册在公共服务里面的ErrorConsumer的实现类处理
                        System.out.println("公共错误处理:" + throwable.getMessage());
                        ServiceFactory.getService(ErrorConsumer.class).onError(throwable);
                    }
                });
    }
}
```


### 总结

好了，总结一下，我们利用ProtoBuf文件，一共生成了几种文件

1. 基本的解析类：Message、Enum、Service

2. 异步方式的类：WebService、WebServiceImpl、WebServiceTest

3. 兼容GRPC的类：GrpcMapper、GRPC数据模拟类、GRPC请求模拟类

从上面我们可以看到，代码自动生成还是很有用的，尤其是配合我们自己定义的框架和规范来的时候，就更强大的。虽然我们有泛型和反射，可以实现一定的动态性，但是，在实际编写代码的过程中，还是有很多的模式代码的，想要学会偷懒的话，一定得能从日常的开发中，发现模式，然后利用模式来简化日常的开发。泛型是一种运行时的模式，代码自动生成则是一种运行前的模式。

好了，案例篇介绍完毕，敬请期待下一篇：`原理篇：利用ProtoBuf文件，一键生成Java代码`，看看我们究竟是如何解析ProtoBuf文件，又是如何生成Java代码的。