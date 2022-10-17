#1.字符串资源里变量替换
---
在android中有这样一个东西，那就是 XLIFF，全称叫 XML **本地化数据交换格式**，英文全称 XML Localization Interchange File Format。
用例：
```java
<string name="welcome">你好%1$s，欢迎使用我们的App。</string>

String welcome = getString(R.string.welcome, "小丸子");
```
把字符串打印出来如下:
![](http://upload-images.jianshu.io/upload_images/1458573-97b8405090183c20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里的1代表第一个变量，多个变量的话依次递增即可。

#2.通过SpannableString实现富文本
---
>SpannableString属性：
1. BackgroundColorSpan 背景色  
2. ClickableSpan 文本可点击，有点击事件 
3. ForegroundColorSpan 文本颜色（前景色） 
4. MaskFilterSpan 修饰效果，如模糊(BlurMaskFilter)、浮雕(EmbossMaskFilter) 
5. MetricAffectingSpan 父类，一般不用 
6. RasterizerSpan 光栅效果 
7. StrikethroughSpan 删除线（中划线） 
8. SuggestionSpan 相当于占位符 
9. UnderlineSpan 下划线 
10. AbsoluteSizeSpan 绝对大小（文本字体）
11. DynamicDrawableSpan 设置图片，基于文本基线或底部对齐。 
12. ImageSpan 图片 
13. RelativeSizeSpan 相对大小（文本字体） 
14. ReplacementSpan 父类，一般不用 
15. ScaleXSpan 基于x轴缩放 
16. StyleSpan 字体样式：粗体、斜体等 
17. SubscriptSpan 下标（数学公式会用到） 
18. SuperscriptSpan 上标（数学公式会用到） 
19. TextAppearanceSpan 文本外貌（包括字体、大小、样式和颜色） 
20. TypefaceSpan 文本字体
21. URLSpan 文本超链接

用例-显示多种字体的文字
```java
String text = "您已经连续走了5963步";
int start = text.indexOf('5');
int end = text.length();
Spannable textSpan = new SpannableStringBuilder(text);
textSpan.setSpan(new AbsoluteSizeSpan(16), 0, start, Spannable.SPAN_INCLUSIVE_INCLUSIVE);
textSpan.setSpan(new AbsoluteSizeSpan(26), start, end - 1, Spannable.SPAN_INCLUSIVE_INCLUSIVE);
textSpan.setSpan(new AbsoluteSizeSpan(16), end - 1, end, Spannable.SPAN_INCLUSIVE_INCLUSIVE);
TextView textView = (TextView) findViewById(R.id.text);
textView.setText(textSpan);
```
![](http://upload-images.jianshu.io/upload_images/1458573-0a62dc03f208086c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#3.通过Html标签实现富文本
---
Textview只支持部分的html标签。具体如下：
```java
<a href="...">  //定义链接内容
<b> //定义粗体文字   b 是blod的缩写
<big> //定义大字体的文字
<blockquote> //引用块标签 
<br> //定义换行
<cite> //表示引用的URI
<dfn> //定义标签  dfn 是defining instance的缩写
<div align="...">
<em> //强调标签  em 是emphasis的缩写
<font size="..." color="..." face="...">
<h1>
<h2>
<h3>
<h4>
<h5>
<h6>
<i> //定义斜体文字
<img src="...">
<p> // 段落标签,里面可以加入文字,列表,表格等
<small> //定义小字体的文字
<strike> // 定义删除线样式的文字   不符合标准网页设计的理念,不赞成使用.   strike是strikethrough的缩写
<strong> //重点强调标签
<sub> //下标标签   sub 是subscript的缩写
<sup> //上标标签   sup 是superscript的缩写
<tt> //定义monospaced字体的文字  不赞成使用.  此标签对中文没意义  tt是teletype or monospaced text style的意思
<u> //定义带有下划线的文字  u是underlined text style的意思
```

用例-显示多种颜色的字
```java
TextView textth = (TextView) findViewById(R.id.textth);
String textStr1 = "<font color=\"#123569\">如果有一天，</font>";
String textStr2 = "<font color=\"#00ff00\">我悄然离去</font>";
textth.setText(Html.fromHtml(textStr1 + textStr2));
```
![](http://upload-images.jianshu.io/upload_images/1458573-959c670941880370.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#4.阴影
---
```java
android:shadowColor //指定文本阴影的颜色
android:shadowDx //设置阴影横向坐标开始位置
android:shadowDy //设置阴影纵向坐标开始位置
android:shadowRadius //设置阴影的半径。设置为0.1会变成字体的颜色
```
用例：
```java
android:shadowColor="#ffffff"
android:shadowDx="15.0"
android:shadowDy="5.0"
android:shadowRadius="2.5"
```
![](http://upload-images.jianshu.io/upload_images/1458573-b270d0ad262e39c7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#5.字体
我们可以通过设置android:typeface属性来控制字体，可以设置为normal, sans, serif, monospace四种。具体如下：
![](http://upload-images.jianshu.io/upload_images/1458573-28e54c13910fc140.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
Android自定义字体非常简单，能够从assets和SD卡两处加载标准的ttf字体。要实现自定义字体，只需借助工具类Typeface即可。
```java
// 加载assets中的字体
TextView textView1 = (TextView) findViewById(R.id.textView1);
Typeface typeface = Typeface.createFromAsset(getAssets(), "fonts/1.ttf");
textView1.setTypeface(typeface);
```

```java
// 加载SD卡中的字体
TextView textView2 = (TextView) findViewById(R.id.textView2);
Typeface typeface2 = Typeface.createFromFile(Environment.getExternalStorageDirectory() + "/2.ttf");
textView2.setTypeface(typeface2);
```
![](http://upload-images.jianshu.io/upload_images/1458573-7f6acdb01c2a3fbd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
>但是需要注意的是，不要大量使用这种自定义字体，因为自定义字体会消耗更多的性能。