---
link: https://www.notion.so/RPC-b38ebd33e436464ebf4cfa437f09c408
notionID: b38ebd33-e436-464e-bf4c-fa437f09c408
---

#RPC

## RPC简介

&ensp;&ensp;&ensp;&ensp;**进程间通信（IPC）** ：是在多任务操作系统或联网的计算机之间运行的程序和进程所用的通信技术。有两种类型的进程间通信（IPC）。

1. 本地过程调用（LPC）：LPC用在多任务操作系统中，使得同时运行的任务能互相会话。这些任务共享内存空间使任务同步和互相发送信息。

2. 远程过程调用（RPC）：RPC类似于LPC，只是在网上工作RPC开始是出现在Sun微系统公司和HP公司的运行UNIX操作系统的计算机中。

现在互联网公司的系统都由许多大大小小的服务组成，各服务部署在不同的机器上，由不同的团队负责。这时就会遇到两个问题：

1. 要搭建一个新服务，免不了需要依赖他人的服务，而现在他人的服务都在远端，怎么调用？

2. 其它团队要使用我们的服务，我们的服务该怎么发布以便他人调用？

假如现在有这样一个接口，需要你实现后，提供给他人使用，如何提供给他呢？

```Java
package rpc;

/**
 * 客户端和服务端公共的接口
 * <p>
 * 作者：余天然 on 2017/1/4 下午6:00
 */
public interface HelloService {
    String sayHello(String msg);
}
```


我们希望可以这样

服务端实现接口：

```Java
package rpc;

/**
 * 作者：余天然 on 2017/1/4 下午10:30
 */
public class Server {

    /**
     * 服务端对接口的具体实现
     */
    public static class HelloServiceImpl implements HelloService {
        @Override
        public String sayHello(String msg) {
            String result = "hello world " + msg;
            System.out.println(result);
            return result;
        }
    }
}

```


然后客户端直接调用接口：

```Java
package rpc;

/**
 * 作者：余天然 on 2017/1/4 下午10:30
 */
public class Client {

    public static void main(String[] args) {
        HelloService service = new Server.HelloServiceImpl();
        service.sayHello("直接调用");
    }
}
```


然而，这样客户端就直接依赖了服务端的HelloServiceImpl这个具体实现类，太耦合了！

客户端和服务端之间应该是依赖于接口，而不必依赖于具体的实现的。而且，客户端和服务端往往在不同的机器上，这样直接依赖肯定是不行的。那么，怎么办呢？

下面该我们的RPC登场了！

## 1、RPC服务端

```Java
package rpc;

import java.io.IOException;

/**
 * 服务端
 * <p>
 * 作者：余天然 on 2017/1/4 下午6:27
 */
public class RpcServer {

    public static void main(String[] args) {
        try {
            //暴露服务
            HelloService service = new HelloServiceImpl();
            RpcFramework.export(service, 8989);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 服务端对接口的具体实现
     */
    private static class HelloServiceImpl implements HelloService {
        @Override
        public String sayHello(String msg) {
            String result = "hello world " + msg;
            System.out.println(result);
            return result;
        }
    }
}

```


## 2、RPC客户端

```Java
package rpc;

/**
 * 客户端
 * <p>
 * 作者：余天然 on 2017/1/4 下午6:02
 */
public class RpcClient {

    public static void main(String[] args) {
        try {
            //引用服务
            HelloService service = RpcFramework.refer(HelloService.class, "127.0.0.1", 8989);
            for (int i = 0; i < Integer.MAX_VALUE; i++) {
                String hello = service.sayHello("rpc" + i);
                System.out.println(hello);
                Thread.sleep(1000);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}

```


## 3、运行结果

服务端输出：

![](http://upload-images.jianshu.io/upload_images/1458573-e13fc44503b8a10f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

客户端输出：

![](http://upload-images.jianshu.io/upload_images/1458573-616d945c94aad1ca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里，客户端并没有依赖HelloServiceImpl这个类，为什么同样也可以输出“hello world rpc0”呢？
这就是我的这个简单的RpcFramework的功劳了。

## 4、简单的RPC框架

核心就是：**动态代理+Socket** 

思路分析：

1. 服务端暴露服务，绑定一个端口，利用Socket轮询，等待接受客户端的请求。

2. 客户端引用服务，利用动态代理，隐藏掉每个接口方法的实际调用。

3. 客户端将方法名、参数类型、方法所需参数传给服务端，服务端接受到客户端传过来的方法名、参数类型、方法所需参数之后，利用反射，执行具体的接口方法，然后将执行结果返回给客户端

```Java
package rpc;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 简单的RPC框架
 * <p>
 * 动态代理+Socket
 * <p>
 * 作者：余天然 on 2017/1/4 下午5:59
 */
public class RpcFramework {

    private static ExecutorService executorService = Executors.newFixedThreadPool(20);

    /**
     * 服务端暴露服务
     *
     * @param service 服务实现
     * @param port    服务端口
     */
    public static void export(final Object service, int port) throws IOException {
        if (service == null) {
            throw new IllegalArgumentException("service instance == null");
        }
        if (port <= 0 || port > 65535) {
            throw new IllegalArgumentException("Invalid port " + port);
        }
        System.out.println("Export service " + service.getClass().getName() + " on port " + port);
        ServerSocket server = new ServerSocket(port);
        while (true) {
            final Socket socket = server.accept();
            executorService.submit(new Runnable() {
                @Override
                public void run() {
                    try {
                        try {
                            //服务端接受客户端传过来的方法名、参数类型、方法所需参数，然后执行方法
                            ObjectInputStream input = new ObjectInputStream(socket.getInputStream());
                            try {
                                String methodName = input.readUTF();
                                Class<?>[] parameterTypes = (Class<?>[]) input.readObject();
                                Object[] arguments = (Object[]) input.readObject();
                                ObjectOutputStream output = new ObjectOutputStream(socket.getOutputStream());
                                try {
                                    Method method = service.getClass().getMethod(methodName, parameterTypes);
                                    Object result = method.invoke(service, arguments);
                                    output.writeObject(result);
                                } catch (Throwable t) {
                                    output.writeObject(t);
                                } finally {
                                    output.close();
                                }
                            } finally {
                                input.close();
                            }
                        } finally {
                            socket.close();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }

    /**
     * 客户端引用服务
     *
     * @param <T>            接口泛型
     * @param interfaceClass 接口类型
     * @param host           服务器主机名
     * @param port           服务器端口
     * @return 远程服务
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public static <T> T refer(final Class<T> interfaceClass, final String host, final int port) throws Exception {
        if (interfaceClass == null)
            throw new IllegalArgumentException("Interface class == null");
        if (!interfaceClass.isInterface())
            throw new IllegalArgumentException("The " + interfaceClass.getName() + " must be interface class!");
        if (host == null || host.length() == 0)
            throw new IllegalArgumentException("Host == null!");
        if (port <= 0 || port > 65535)
            throw new IllegalArgumentException("Invalid port " + port);
        System.out.println("Get remote service " + interfaceClass.getName() + " from server " + host + ":" + port);

        //利用动态代理，对每个接口类的方法调用进行的隐藏
        return (T) Proxy.newProxyInstance(interfaceClass.getClassLoader(), new Class<?>[]{interfaceClass}, new InvocationHandler() {
            public Object invoke(Object proxy, Method method, Object[] arguments) throws Throwable {
                Socket socket = new Socket(host, port);
                try {
                    //客户端将方法名、参数类型、方法所需参数传给服务端
                    ObjectOutputStream output = new ObjectOutputStream(socket.getOutputStream());
                    try {
                        output.writeUTF(method.getName());
                        output.writeObject(method.getParameterTypes());
                        output.writeObject(arguments);
                        ObjectInputStream input = new ObjectInputStream(socket.getInputStream());
                        try {
                            Object result = input.readObject();
                            if (result instanceof Throwable) {
                                throw (Throwable) result;
                            }
                            return result;
                        } finally {
                            input.close();
                        }
                    } finally {
                        output.close();
                    }
                } finally {
                    socket.close();
                }
            }
        });
    }
}

```


这里呢，我只是简单的传递了方法名、参数类型、方法所需参数。

当需要完成更复杂的交互时，我们可以指定一个协议,然后由Server和Client根据该协议对数据的进行编码解码，根据协议内容做出相应的决策。

总而言之，RPC的核心是动态代理 。

客户端看到的是接口的行为（这个行为没有被实现），
服务端放的是接口行为的具体实现。

客户端把行为和行为入参提供给服务端，然后服务端的接口实现执行这个行为，最后再把执行结果返回给客户端。 

看起来是客户端执行了行为，但其实是通过动态代理交给服务端执行的。其中，行为和入参这些数据通过socket由客户端传给了服务端。


