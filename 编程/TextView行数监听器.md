>其实代码很简单，只是一个简单的封装而已，方便自己以后遇到类似的问题可以快速复用。看一个程序员溜不溜，我觉得主要看两点:一是他踩的坑多不多，二是他积累的轮子多不多。以后，我要努力积累更多的小轮子。

#1.业务需求:
TextView单行时右对齐，多行左对齐
![](2016-11-04-20-43-37.jpg)
#2.TextView行数监听器
其实就是简单的对addOnPreDrawListener和removeOnPreDrawListener做了一下封装而已
```
/**
 * 监听TextView的行数变化
 * <p>
 * 作者：余天然 on 2016/11/4 下午8:20
 */
public class TextLineListener {

    public interface Callback {
        void onLineCount(int lineNum);
    }

    public static void addListener(TextView textView, Callback callback) {
        if (callback != null) {
            textView.getViewTreeObserver().addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener() {
                @Override
                public boolean onPreDraw() {
                    textView.getViewTreeObserver().removeOnPreDrawListener(this);
                    callback.onLineCount(textView.getLineCount());
                    return true;
                }
            });
        }
    }
}
```
#3.实现代码
```
//单行时右对齐，多行左对齐
TextLineListener.addListener(tvDesc, new TextLineListener.Callback() {
    @Override
    public void onLineCount(int lineNum) {
        if (lineNum > 1) {
            //左对齐
            tvDesc.setGravity(Gravity.LEFT);
        } else {
            //右对齐
            tvDesc.setGravity(Gravity.RIGHT);
        }
    }
});
```