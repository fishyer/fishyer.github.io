---
link: https://www.notion.so/2-xml-e687e175e0394614980defb425f9f3c5
notionID: e687e175-e039-4614-980d-efb425f9f3c5
---
#Android

第一发：[分组悬停列表-1：简单的Text](http://www.jianshu.com/p/be8eb10cf96a)

这是分组悬停列表效果的第二发，在第一发里面，我们已经利用RecyclerView.ItemDecoration实现了分组悬停列表的简单Text。第二发里面，主要是实现分组悬停列表的复杂xml

## 一、效果图

![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070646076.gif)


![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070647209.png)



之前我们使用onDraw(),onDrawOver()，都是用canvas的方法活生生的绘制出一个View，这对于很多人（包括我）来说都并不容易，xy坐标的确认，尺寸都较难把握，基本上调UI效果时间都很长。

尤其是canvas.drawText()方法的y坐标，特别是baseLine的位置，不了解的童鞋肯定要踩很多坑。

如果当我们想要绘制的分类title、悬停头部复杂一点时，我都不敢想象要调试多久了，这个时候我们还敢用ItemDecoration吗？

有没有一种方法，就像我们平时使用的那样，在Layout布局xml里画好View，然后inflate出来就可以了呢？

因为ItemDecoration并不是一个View，没法直接addView,那么怎么才能添加一个xml画好的View呢？

最后，看到了别人的解决方案：**直接调用这个view的measure、layout、draw方法，将它绘制出来即可。**

## 二、实现代码
>思路分析：
1. ItemDecoration会依次调用getItemOffsets、onDraw、onDrawOver
2. 在第一次调用getItemOffsets时，加载xml，执行measure、layout，并创建viewHolder，避免重复的inflate和findViewById
3. 在实际绘制时，加了一个dispatchDraw，根据ShowType，显示Text或XML
4. 在显示XML时，通过接口回调，调用了tagDisplayer.showData(viewholder,item)
5. 在决定view的显示位置时，普通的layout、offsetTopAndBottom等方式貌似无效，最后我只好通过canvas的位移来决定view的显示位置

```
/**
 * 分组悬停视图
 * <p>
 * 1、显示简单Text
 * 2、显示复杂的xml
 * <p>
 * 当设置了xml时，简单的Text会失效
 * 作者：余天然 on 2016/12/21 下午6:51
 */
public class PinnedDivider<T extends Pinnable> extends RecyclerView.ItemDecoration {

    private Paint paint;//画笔
    private Rect rect = new Rect();//用于存放测量文字Rect
    private Drawable divider;//分割线颜色

    private Builder<T> builder;
    private BaseViewHolder viewHolder;

    private ShowType type;//1-简单Text,2-复杂xml

    private PinnedDivider(Builder builder) {
        this.builder = builder;
        if (builder.displayer != null) {
            type = ShowType.XML;
        } else {
            type = ShowType.TEXT;
        }
        this.paint = new Paint();
        this.paint.setTextSize(builder.tagTextSize);
        this.paint.setAntiAlias(true);
        this.divider = new ColorDrawable(builder.dividerColor);
    }

    /**
     * 设置分组悬停视图的显示区域
     */
    @Override
    public void getItemOffsets(Rect outRect, View view, RecyclerView parent, RecyclerView.State state) {
        if (type == ShowType.XML && viewHolder == null) {
            viewHolder = createViewHolder(parent);
        }

        RecyclerView.LayoutParams params = (RecyclerView.LayoutParams) view.getLayoutParams();
        int position = params.getViewLayoutPosition() - builder.headerCount;

        //防止越界
        if (position > builder.data.size() - 1 || position < 0) {
            return;
        }
        //第1项肯定要有tag
        if (position == 0) {
            outRect.set(0, builder.tagHeight, 0, 0);
        }
        //其余项，不为空且跟前一个tag不一样了，说明是新的分类，也要tag
        else if (!builder.data.get(position).getPinnedTag().equals(builder.data.get(position - 1).getPinnedTag())) {
            outRect.set(0, builder.tagHeight, 0, 0);
        }
        //和下一项一样的，都需要分割线
        for (int i = 0; i < builder.data.size() - 1; i++) {
            String tag1 = builder.data.get(i).getPinnedTag();
            String tag2 = builder.data.get(i + 1).getPinnedTag();
            if (tag1.equals(tag2)) {
                int top = outRect.top;
                outRect.set(0, top, 0, builder.dividerHeight);
            }
        }
    }

    /**
     * 绘制最底层-跟随滚动的tag
     */
    @Override
    public void onDraw(Canvas c, RecyclerView parent, RecyclerView.State state) {
        int childCount = parent.getChildCount();

        //绘制随着滚动的分组视图
        for (int i = 0; i < childCount; i++) {
            View child = parent.getChildAt(i);
            RecyclerView.LayoutParams params = (RecyclerView.LayoutParams) child.getLayoutParams();
            int position = params.getViewLayoutPosition() - builder.headerCount;

            //防止越界
            if (position > builder.data.size() - 1 || position < 0) {
                continue;
            }

            String tag = builder.data.get(position).getPinnedTag();

            int top = child.getTop() - params.topMargin - builder.tagHeight;
            int bottom = child.getTop() - params.topMargin;

            //等于0肯定要有title的
            if (position == 0) {
                dispatchDraw(c, position, parent, top, bottom);
            }
            //不为空 且跟前一个tag不一样了，说明是新的分类，也要title
            else if (null != tag && !tag.equals(builder.data.get(position - 1).getPinnedTag())) {


                dispatchDraw(c, position, parent, top, bottom);
            }
        }

        //和下一项一样的，都需要分割线
        int left, top, right, bottom;
        for (int i = 0; i < childCount - 1; i++) {
            View child = parent.getChildAt(i);
            int position = parent.getChildAdapterPosition(child);
            String tag1 = builder.data.get(position).getPinnedTag();
            String tag2 = builder.data.get(position + 1).getPinnedTag();
            if (tag1.equals(tag2)) {
                RecyclerView.LayoutParams params = (RecyclerView.LayoutParams) child.getLayoutParams();
                left = parent.getPaddingLeft();
                right = parent.getWidth() - parent.getPaddingRight();
                top = child.getBottom() + params.bottomMargin;
                bottom = top + builder.dividerHeight;
                divider.setBounds(left, top, right, bottom);
                divider.draw(c);
            }
        }
    }

    /**
     * 绘制最上层-绘制悬停的tag
     */
    @Override
    public void onDrawOver(Canvas c, RecyclerView parent, RecyclerView.State state) {
        LogUtil.print("");

        int position = ((LinearLayoutManager) (parent.getLayoutManager())).findFirstVisibleItemPosition();
        int next = findNextTagPosition(position);

        //绘制悬停的分组视图
        boolean flag = false;
        if (next != -1) {
            View child = parent.findViewHolderForLayoutPosition(next).itemView;
            int dy = child.getTop() - builder.tagHeight * 2;
            if (dy <= 0) {
                c.save();
                c.translate(0, dy);
                flag = true;
            }
        }
        dispatchDraw(c, position, parent, parent.getPaddingTop(), parent.getPaddingTop() + builder.tagHeight);
        if (flag) {
            c.restore();
        }
    }

    /**
     * 创建ViewHolder
     */
    private BaseViewHolder createViewHolder(RecyclerView parent) {
        LogUtil.print("初始化toDrawView");
        View toDrawView = LayoutInflater.from(builder.context).inflate(builder.displayer.layoutId, parent, false);

        int toDrawWidthSpec;//用于测量的widthMeasureSpec
        int toDrawHeightSpec;//用于测量的heightMeasureSpec
        //拿到复杂布局的LayoutParams，如果为空，就new一个。
        // 后面需要根据这个lp 构建toDrawWidthSpec，toDrawHeightSpec
        ViewGroup.LayoutParams lp = toDrawView.getLayoutParams();
        if (lp == null) {
            LogUtil.print("lp为空");
            lp = new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);//这里是根据复杂布局layout的width height，new一个Lp
            toDrawView.setLayoutParams(lp);
        }
        if (lp.width == ViewGroup.LayoutParams.MATCH_PARENT) {
            //如果是MATCH_PARENT，则用父控件能分配的最大宽度和EXACTLY构建MeasureSpec。
            toDrawWidthSpec = View.MeasureSpec.makeMeasureSpec(parent.getWidth() - parent.getPaddingLeft() - parent.getPaddingRight(), View.MeasureSpec.EXACTLY);
        } else if (lp.width == ViewGroup.LayoutParams.WRAP_CONTENT) {
            //如果是WRAP_CONTENT，则用父控件能分配的最大宽度和AT_MOST构建MeasureSpec。
            toDrawWidthSpec = View.MeasureSpec.makeMeasureSpec(parent.getWidth() - parent.getPaddingLeft() - parent.getPaddingRight(), View.MeasureSpec.AT_MOST);
        } else {
            //否则则是具体的宽度数值，则用这个宽度和EXACTLY构建MeasureSpec。
            toDrawWidthSpec = View.MeasureSpec.makeMeasureSpec(lp.width, View.MeasureSpec.EXACTLY);
        }
        //高度同理
        if (lp.height == ViewGroup.LayoutParams.MATCH_PARENT) {
            toDrawHeightSpec = View.MeasureSpec.makeMeasureSpec(parent.getHeight() - parent.getPaddingTop() - parent.getPaddingBottom(), View.MeasureSpec.EXACTLY);
        } else if (lp.height == ViewGroup.LayoutParams.WRAP_CONTENT) {
            toDrawHeightSpec = View.MeasureSpec.makeMeasureSpec(parent.getHeight() - parent.getPaddingTop() - parent.getPaddingBottom(), View.MeasureSpec.AT_MOST);
        } else {
            toDrawHeightSpec = View.MeasureSpec.makeMeasureSpec(lp.height, View.MeasureSpec.EXACTLY);
        }
        //依次调用 measure,tagDisplayer,draw方法，将复杂头部显示在屏幕上。
        toDrawView.measure(toDrawWidthSpec, toDrawHeightSpec);
        toDrawView.layout(parent.getPaddingLeft(), parent.getPaddingTop(), parent.getPaddingLeft() + toDrawView.getMeasuredWidth(), parent.getPaddingTop() + toDrawView.getMeasuredHeight());
        viewHolder = new BaseViewHolder(toDrawView);
        builder.tagHeight = toDrawView.getMeasuredHeight();
        return viewHolder;
    }

    /**
     * 查找下一个Tag的位置
     */
    private int findNextTagPosition(int position) {
        String curTag = builder.data.get(position).getPinnedTag();
        for (int i = position + 1; i < builder.data.size(); i++) {
            String tag = builder.data.get(i).getPinnedTag();
            if (!tag.equals(curTag)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 分发绘制
     */
    private void dispatchDraw(Canvas c, int position, RecyclerView parent, int top, int bottom) {
        //简单的Text
        if (type == ShowType.TEXT) {
            drawText(c, position, parent, top, bottom);
        }
        //复杂的xml
        else {
            drawXML(c, position, parent, top, bottom);
        }
    }

    /**
     * 绘制xml加载的分组悬停视图
     */
    private void drawXML(Canvas c, int position, RecyclerView parent, int top, int bottom) {
        builder.displayer.showData(viewHolder, builder.data.get(position));
        c.save();
        c.translate(0, top);
        viewHolder.getRootView().draw(c);
        c.restore();
    }

    /**
     * 绘制手动绘制的分组悬停视图
     */
    private void drawText(Canvas c, int position, RecyclerView parent, int top, int bottom) {
        //绘制背景
        paint.setColor(builder.tagBgColor);
        c.drawRect(parent.getPaddingLeft(), top, parent.getRight() - parent.getPaddingRight(), bottom, paint);
        //绘制文字
        String tag = builder.data.get(position).getPinnedTag();
        paint.setColor(builder.tagTextColor);
        paint.getTextBounds(tag, 0, tag.length(), rect);
        c.drawText(tag, parent.getPaddingLeft() + builder.tagTextLeftPadding, bottom - (builder.tagHeight - rect.height()) / 2, paint);
    }


    public static class Builder<BT extends Pinnable> {
        //必填部分
        private Context context;
        private Resources resources;
        private List<BT> data;

        //可选部分
        private int headerCount;//其余的HeaderView数量

        //复杂xml
        private TagDisplayer displayer;

        //普通Text
        private int tagBgColor = 0xFFFFEBCD;
        private int tagHeight = 300;
        private int tagTextColor = 0xFF000000;
        private int tagTextSize = 42;
        private int tagTextLeftPadding = 30;

        //分割线
        private int dividerColor = 0xFF20B2AA;
        private int dividerHeight = 3;

        public Builder(Context context, @NonNull List<BT> data) {
            this.context = context;
            this.resources = context.getResources();
            this.data = data;
            if (data == null || data.isEmpty()) {
                throw new RuntimeException("data can not be empty");
            }
        }

        public Builder<BT> tagBgColor(@ColorRes int tagBgColor) {
            this.tagBgColor = resources.getColor(tagBgColor);
            return this;
        }

        public Builder<BT> tagHeight(@DimenRes int tagHeight) {
            this.tagHeight = resources.getDimensionPixelSize(tagHeight);
            return this;
        }

        public Builder<BT> tagTextColor(@ColorRes int tagTextColor) {
            this.tagTextColor = resources.getColor(tagTextColor);
            return this;
        }

        public Builder<BT> tagTextSize(@DimenRes int tagTextSize) {
            this.tagTextSize = resources.getDimensionPixelSize(tagTextSize);
            return this;
        }

        public Builder<BT> tagTextLeftPadding(@DimenRes int tagTextLeftPadding) {
            this.tagTextLeftPadding = resources.getDimensionPixelSize(tagTextLeftPadding);
            return this;
        }

        public Builder<BT> dividerColor(@ColorRes int dividerColor) {
            this.dividerColor = resources.getColor(dividerColor);
            return this;
        }

        public Builder<BT> dividerHeight(@DimenRes int dividerHeight) {
            this.dividerHeight = resources.getDimensionPixelSize(dividerHeight);
            return this;
        }

        public Builder<BT> tagDisplayer(@NonNull TagDisplayer<BT> displayer) {
            this.displayer = displayer;
            if (displayer == null) {
                throw new RuntimeException("displayer can not be null");
            }
            return this;
        }

        public PinnedDivider<BT> build() {
            return new PinnedDivider<>(this);
        }

    }

    public static abstract class TagDisplayer<DT extends Pinnable> {
        private int layoutId;

        public TagDisplayer(@LayoutRes int layoutId) {
            this.layoutId = layoutId;
        }

        public abstract void showData(BaseViewHolder viewHolder, DT item);
    }

    public enum ShowType {
        TEXT,
        XML
    }

}
```

## 三、使用方式

>1. 先传入xml的Id，创建一个TagDisplayer，在这里处理tag的具体显示逻辑
2. 调用pinnedDivider.tagDisplayer()，将上面的displayer传入即可。

```
public class MainActivity extends AppCompatActivity {

    private SingleAdapter<Bean> adapter;
    private RecyclerView rv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        initView();
        initData();
    }

    private void initView() {
        rv = (RecyclerView) findViewById(R.id.rv);
        rv.setLayoutManager(new LinearLayoutManager(this));
        adapter = new SingleAdapter<Bean>(this, R.layout.item_tv) {
            @Override
            protected void bindData(BaseViewHolder holder, Bean item, int position) {
                TextView tv = holder.getView(R.id.tv);
                tv.setText(item.getCity());
            }
        };
        rv.setAdapter(adapter);
    }

    private void initData() {
        List<Bean> list = new ArrayList<>();
        list.add(new Bean("A", "安达"));
        list.add(new Bean("A", "安化"));
        list.add(new Bean("A", "安康"));
        list.add(new Bean("A", "安陆"));

        list.add(new Bean("B", "包头"));
        list.add(new Bean("B", "保山"));
        list.add(new Bean("B", "宝兴"));
        list.add(new Bean("B", "北京"));
        list.add(new Bean("B", "本溪"));
        list.add(new Bean("B", "宾阳"));

        list.add(new Bean("C", "茶陵"));
        list.add(new Bean("C", "朝阳"));
        list.add(new Bean("C", "昌黎"));
        list.add(new Bean("C", "常德"));
        list.add(new Bean("C", "常州"));
        list.add(new Bean("C", "郴州"));
        list.add(new Bean("C", "成都"));
        list.add(new Bean("C", "承德"));
        list.add(new Bean("C", "赤壁"));
        list.add(new Bean("C", "崇阳"));
        list.add(new Bean("C", "滁州"));
        list.add(new Bean("C", "长春"));
        list.add(new Bean("C", "长春"));
        list.add(new Bean("C", "长春"));
        list.add(new Bean("C", "长春"));
        list.add(new Bean("C", "长春"));
        list.add(new Bean("C", "长春"));

        PinnedDivider.TagDisplayer<Bean> displayer = new PinnedDivider.TagDisplayer<Bean>(R.layout.header_complex) {
            @Override
            public void showData(BaseViewHolder viewHolder, Bean item) {
                TextView tv = viewHolder.getView(R.id.tv);
                tv.setText(item.getPinnedTag());
            }
        };
        PinnedDivider pinnedDivider = new PinnedDivider.Builder<>(this, list)
                .dividerColor(R.color.divider)
                .dividerHeight(R.dimen.divider_1)
                .tagDisplayer(displayer)
//                .tagBgColor(R.color.colorPrimary)
//                .tagHeight(R.dimen.tag_height)
//                .tagTextColor(R.color.black)
//                .tagTextSize(R.dimen.text_14)
//                .tagTextLeftPadding(R.dimen.text_padding_10)
                .build();
        rv.addItemDecoration(pinnedDivider);
        adapter.setData(list);
    }
}
```
最后奉上源码：[Github](https://github.com/fishyer/PinnedRecyclerView)

## 参考目录

1. [Android 仿微信通讯录 导航分组列表](http://www.infocool.net/kb/Android/201609/186924.html)
2. [深入理解 RecyclerView 系列之一：ItemDecoration](http://blog.piasy.com/2016/03/26/Insight-Android-RecyclerView-ItemDecoration/)
3. [深入浅出 RecyclerView – 张涛](http://www.liuhaihua.cn/archives/389271.html)