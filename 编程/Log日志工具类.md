tags: 工具类

## 使用说明
使用超简单：
```
    private void testLog() {
        LogUtil.print("");

        LogUtil.print("你好");
        LogUtil.print("net", "baidu.com");

        LogUtil.print(Log.VERBOSE, "你好啊");
        LogUtil.print(Log.DEBUG, "你好啊");
        LogUtil.print(Log.INFO, "你好啊");
        LogUtil.print(Log.WARN, "你好啊");
        LogUtil.print(Log.ERROR, "你好啊");
        LogUtil.print(Log.ASSERT, "你好啊");
    }
```
![](http://upload-images.jianshu.io/upload_images/1458573-06ccda884f31c2f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
提供的信息： 
>1. 线程的信息 
2. 类的信息 
3. 方法的信息 
4. 可跳转到源码处

## 工具类代码
```
public class LogUtil {

    private static int LEVEL = Log.DEBUG;//默认level
    private static String TAG = "print";//默认tag
    private static boolean IS_DEBUG = true;//默认显示log

    //设置默认的Level
    public static void setDefaultLevel(int level) {
        LogUtil.LEVEL = level;
    }

    //设置默认的TAG
    public static void setDefaultTag(String tag) {
        LogUtil.TAG = tag;
    }

    //设置是否是Debug模式
    public static void setIsDebug(boolean isDebug) {
        LogUtil.IS_DEBUG = isDebug;
    }

    //打印
    public static void print(String msg) {
        performPrint(LEVEL, TAG, msg);
    }

    //打印-自定义Tag
    public static void print(String tag, String msg) {
        performPrint(LEVEL, tag, msg);
    }

    //打印-自定义Level
    public static void print(int level, String msg) {
        performPrint(level, TAG, msg);
    }

    //打印-自定义Tag,自定义Level
    public static void print(int level, String tag, String msg) {
        performPrint(level, tag, msg);
    }

    //执行打印
    private static void performPrint(int level, String tag, String msg) {
        //非Debug版本，则不打印日志
        if (!IS_DEBUG) {
            return;
        }
        String threadName = Thread.currentThread().getName();
        String lineIndicator = getLineIndicator();
        Log.println(level, tag, threadName + " " + lineIndicator + " " + msg);
    }

    //获取行所在的方法指示
    //获取行所在的方法指示
    private static String getLineIndicator() {
        //3代表方法的调用深度：0-getLineIndicator，1-performPrint，2-print，3-调用该工具类的方法位置
        StackTraceElement element = ((new Exception()).getStackTrace())[3];
        StringBuffer sb = new StringBuffer("(")
                .append(element.getFileName()).append(":")
                .append(element.getLineNumber()).append(").")
                .append(element.getMethodName()).append(":");
        return sb.toString();
    }
}
```