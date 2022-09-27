---
link: https://www.notion.so/Flutter-Android-ef9402c6bbb9449f80bd3f39bdffbca1
notionID: ef9402c6-bbb9-449f-80bd-3f39bdffbca1
---
本文主要解决3个问题：
1. 集成Flutter到Android项目,可以打开Flutter的默认页面
2. 可以跳转到Flutter的指定页面
3. 可以将Flutter的指定组件嵌入到原生页面，并传递参数

#Flutter

## 1.集成Flutter到Android

这里，我们以Flutter Module创建一个Flutter工程(flutter)，然后run起来，就可以在.android/Flutter/build/outouts/aar文件夹下面得到这个aar
![](https://upload-images.jianshu.io/upload_images/1458573-908bcbd4caf4385d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 这里之所以以Flutter Module模式开发，而不是Flutter Application，就是为了得到这个aar。
Flutter Module模式下自动生成的.android文件夹下，才会有这个Flutter文件夹，Flutter Application则没有。
这样的话，我们才可以借用Flutter已经有的生成aar的gradle脚本，不然还得自己去写gradle打包脚本，很容易踩到坑里就爬不起来了。

然后我们再另开一个窗口，新建一个Android工程(flutter_container)，将这个aar复制过去
![](https://upload-images.jianshu.io/upload_images/1458573-6de384941d864a58.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 这里需要注意的一个问题，因为Flutter本身原因，导致复制出来的aar里面缺少icudtl.dat文件，需要我们自己手动复制这个icudtl.dat文件到assets/flutter_shared目录下。

怎么得到这个icudtl.dat文件呢，很简单，解压Flutter工程生成的默认apk即可得到
![](https://upload-images.jianshu.io/upload_images/1458573-b948c1cc417a90b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后，我们就需要在宿主Android工程里面，建立接收Flutter的Activity了。这里可以借鉴Flutter工程的.android/app目录，核心就是两个：
1. Application：初始化Flutter
```
public class App extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        FlutterMain.startInitialization(this);
    }
}
```

2. Activity：继承FlutterActivity
```
/**
 * debug模式原生跳转到flutter界面会出现白屏，release包就不会出现白屏了
 */
public class MainFlutterActivity extends FlutterActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    GeneratedPluginRegistrant.registerWith(this);
  }
}
```

这样以后，我们就可以跳转这个MainFlutterActivity，实现在Android工程里面进入Flutter工程的默认页面了。

## 2. 跳转指定页面

上面只是简单集成了Flutter，但是我们知道，我们从Android工程里面跳转Flutter，肯定是需要选择性的跳转指定页面的，不可能只是简单的跳转默认页面就完了，所以，这里需要用到Flutter的静态路由了。

修改Flutter工程的main.dart，定义了两个指定页面的路由：homePage、channelPage
```
void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: TestPage(),
      //这种方式不能传递参数，主要是方便原生调用
      routes: <String, WidgetBuilder> {
        'homePage': (BuildContext context) => new HomePage(),
        'channelPage': (BuildContext context) => new ChannelPage(),
      },
    );

  }
}
```

然后在宿主Android工程下，添加指定页面的容器Activity，通过Flutter.createView来获取指定页面的View

> 注意，这里的HomeFlutterActivity只需要继承AppCompatActivity 即可，不需要继承FlutterActivity了。

```
public class HomeFlutterActivity extends AppCompatActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FlutterView homePage = Flutter.createView(
                this,
                getLifecycle(),
                "homePage"
        );
        setContentView(homePage);
    }
}
```

这样以后，我们就可以跳转这个HomeFlutterActivity，实现在Android工程里面进入Flutter工程的指定页面了。

## 3. 嵌入View并传递参数

上面虽然能够跳转指定页面了，但是很显然，有一个很大的问题：不能传递参数。

这是Flutter的静态路由的一个很大的弊端，虽然通过动态路由可以传递参数和接收返回值，但是动态路由没法给原生调用。
```
 Navigator.of(context)
                .push<String>(new MaterialPageRoute(builder: (context) {
              return new NextPage(params);
            })).then((String value) {
              setState(() {
                params = value;
              });
            });
```

有一个Flutter的路由库：[Fluro](https://github.com/theyakka/fluro)，可以实现静态路由传参，例如这样：

传参
```
var bodyJson = '{"user":1281,"pass":3041}';
router.navigateTo(context, '/home/$bodyJson');
```

接收
```
Router router = new Router();

void main() {
  router.define('/home/:data', handler: new Handler(
      handlerFunc: (BuildContext context, Map<String, dynamic> params) {
        return new FluroHomePage(params['data'][0]);
      }));
  runApp(MyApp());
}
```

但是，这种方式在Flutter内部还行，却无法给原生调用，在原生里面通过Flutter.createView的时候，是没法使用Fluro的，只能是默认的路由。

调研了很多方案，最后，没有办法了，只好采用最笨的方法：通过MethodChannel来传递参数。

> 这里需要注意的是MethodChannel的调用，应该FlutterView已经创建完成，所以需要通过flutterView.post（new Runnable()）来执行了，直接执行是不会传参给Flutter的。

### 原生传参给Flutter

原生调用
```
MethodChannel channel = new MethodChannel(flutterView, CHANNEL);
channel.invokeMethod("invokeFlutterMethod", "hello,flutter", new MethodChannel.Result() {
    @Override
    public void success(@Nullable Object o) {
        Log.i("flutter","1.原生调用invokeFlutterMethod-success:"+o.toString());
    }
    @Override
    public void error(String s, @Nullable String s1, @Nullable Object o) {
        Log.i("flutter","1.原生调用invokeFlutterMethod-error");
    }
    @Override
    public void notImplemented() {
        Log.i("flutter","1.原生调用invokeFlutterMethod-notImplemented");
    }
});
```
Flutter执行
```
platform.setMethodCallHandler((handler) {
      Future<String> future=Future((){
        switch (handler.method) {
          case "invokeFlutterMethod":
            String args = handler.arguments;
            print("2.Flutter执行invokeFlutterMethod:${args}");
            return "this is flutter result";
        }
      });
      return future;
    });
```

### Flutter传参给原生

Flutter调用
```
print("3.Flutter调用invokeNativeMethod");
int result =
    await platform.invokeMethod("invokeNativeMethod", "hello,native");
print("5.收到原生执行结果：${result}");
```

原生执行
```
channel.setMethodCallHandler(new MethodChannel.MethodCallHandler() {
    @Override
    public void onMethodCall(MethodCall call, MethodChannel.Result result) {
        switch (call.method) {
            case "invokeNativeMethod":
                String args = (String) call.arguments;
                Log.i("flutter","4.原生执行invokeNativeMethod："+args);
                result.success(200);
                break;
            default:
        }
    }
});
```

最后贴一下这个传参页面的完整代码吧，主要就是跑了一下：
1. 原生调用invokeFlutterMethod
2. Flutter执行invokeFlutterMethod
3. Flutter调用invokeNativeMethod
4. 原生执行invokeNativeMethod

Android：
```
public class ChannelFlutterActivity extends AppCompatActivity {

    private static final String CHANNEL = "com.ezbuy.flutter";

    FlutterView flutterView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_channel);
        FrameLayout frFlutter = findViewById(R.id.fr_flutter);
        flutterView = getFlutterView("channelPage");
        frFlutter.addView(flutterView);
        flutterView.post(new Runnable() {
            @Override
            public void run() {
                initMethodChannel(flutterView);
            }
        });
    }

    public FlutterView initMethodChannel(FlutterView flutterView) {
        MethodChannel channel = new MethodChannel(flutterView, CHANNEL);
        //1.原生调用Flutter方法
        channel.invokeMethod("invokeFlutterMethod", "hello,flutter", new MethodChannel.Result() {
            @Override
            public void success(@Nullable Object o) {
                Log.i("flutter","1.原生调用invokeFlutterMethod-success:"+o.toString());
            }

            @Override
            public void error(String s, @Nullable String s1, @Nullable Object o) {
                Log.i("flutter","1.原生调用invokeFlutterMethod-error");
            }

            @Override
            public void notImplemented() {
                Log.i("flutter","1.原生调用invokeFlutterMethod-notImplemented");
            }
        });
        Log.i("flutter","1.原生调用invokeFlutterMethod");
        //4.Flutter调用原生方法的监听
        channel.setMethodCallHandler(new MethodChannel.MethodCallHandler() {
            @Override
            public void onMethodCall(MethodCall call, MethodChannel.Result result) {
                switch (call.method) {
                    case "invokeNativeMethod":
                        String args = (String) call.arguments;
                        Log.i("flutter","4.原生执行invokeNativeMethod："+args);
                        result.success(200);
                        break;
                    default:
                }
            }
        });
        return flutterView;
    }

    public FlutterView getFlutterView(String initialRoute) {
        return Flutter.createView(
                this,
                getLifecycle(),
                initialRoute
        );
    }
}
```

Flutter
```
class ChannelPage extends StatefulWidget {

  ChannelPage();

  @override
  _ChannelPageState createState() => _ChannelPageState();
}

class _ChannelPageState extends State<ChannelPage> {
  static const platform = const MethodChannel('com.ezbuy.flutter');

  String data;

  @override
  void initState() {
    super.initState();
    data ="默认data";
    initChannel();
  }

  @override
  Widget build(BuildContext context) {
    //必须用Scaffold包裹
    return Scaffold(body: new Center(child: new Text(data)));
  }

  void initChannel() {
    platform.setMethodCallHandler((handler) {
      Future<String> future=Future((){
        switch (handler.method) {
          case "invokeFlutterMethod":
            String args = handler.arguments;
            print("2.Flutter执行invokeFlutterMethod:${args}");
            setState(() {
              data = "2.Flutter执行invokeFlutterMethod:${args}";
            });
            invokeNativeMethod();
            return "this is flutter result";
        }
      });
      return future;
    });
  }

  void invokeNativeMethod() async {
    print("3.Flutter调用invokeNativeMethod");
    int result =
        await platform.invokeMethod("invokeNativeMethod", "hello,native");
    print("5.收到原生执行结果：${result}");
  }

}
```

对啦，我们这节说的是将Flutter以View级别嵌套在一个Android的Activity里面，其实很简单了啊，因为我们通过Flutter.createView创建出来的View和普通的View并没有什么太大的区别，直接addView就可以了，没啥特别操作，比如这个ChannelFlutterActivity,我用的布局文件就是如下所示：

![](https://upload-images.jianshu.io/upload_images/1458573-bab4f989a9522966.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

最后的执行效果就是：
![](https://upload-images.jianshu.io/upload_images/1458573-be71f56bfc22df3d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 其它坑

### 1. Flutter工程依赖了插件时，宿主Android工程会报找不到插件的原生代码的错误

我的Flutter工程依赖了shared_preferences插件，导致报错：

![](https://upload-images.jianshu.io/upload_images/1458573-eab1a541f2ebc095.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

原因是：Flutter工程导出成aar的时候，没有包含插件里面的原生代码。

解决方案有2种，网上说是不用默认的生成aar的方式，用[fataar-gradle-plugin](https://github.com/Mobbeel/fataar-gradle-plugin)来让生成的flutter.aar直接包含嵌套的插件工程的aar，这就需要修改Flutter工程的.android/Flutter/build.gradle文件了。我试过，结果报了循环依赖的错误，就放弃了，大家如果这个方案走通了，欢迎告知我具体步骤。

我的解决方案：这里我采取了一个简单粗暴直接的方案，直接找到插件的aar，将它也复制到宿主Android工程了。这个插件的aar在这里：
![](https://upload-images.jianshu.io/upload_images/1458573-c9bf19f22c969c3f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

复制到这里：
![](https://upload-images.jianshu.io/upload_images/1458573-c80390cef2041373.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是这个方案的弊端就是，以后每一个插件，你都需要复制一下，后期的维护成本是有点高的。不像fataar是一劳永逸，只有flutter.aar这一份aar的。尤其是后期肯定会将aar做成远程依赖，而不再是直接发复制过去，那维护成本就更高了些。

## 结语

通过上文可以看到，其实Flutter集成到Android项目还是挺方便的（除了FlutterView传参有点麻烦）。至于Flutter如何集成到ios项目，我还没有实践过，还需要和ios的同事探索，如果你在集成到ios项目的过程中，填了哪些坑，有哪些经验总结，欢迎和我们交流。