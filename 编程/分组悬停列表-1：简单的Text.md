# 分组悬停列表-1：简单的Text

#Android 

## 一、效果图
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070645537.gif)


网上关于实现带悬停分组头部的列表的方法有很多：
1. 有人用自定义ExpandListView实现
2. 有人用一个额外的父布局里面套 RecyclerView/ListView+一个头部View（位置固定在父布局上方）实现的。

对于以上解决方案，有以下几点个人觉得不好的地方：
1. 现在RecyclerView是主流，ExpandListView很少有人用了
2. 在RecyclerView外套一个父布局总归是**增加布局层级，容易overdraw**，显得不够优雅。
3. item布局实现带这种分类头部的方法有两种，

一种是把分类头部当做一种itemViewtype（麻烦），
另一种是每个Item布局都包含了分类头部的布局，代码里根据postion等信息动态Visible，Gone头部（布局冗余，item效率降低）。

况且Google为我们提供了**ItemDecoration**，它本身就是用来修饰RecyclerView里的Item的，它的getItemOffsets() 方法用于为Item分类头部留出空间和绘制（解决缺点3），它的onDraw()、onDrawOver()方法用于绘制滚动以及悬停的头部View（解决缺点2）。

本文就利用ItemDecoration 打造分组悬停列表，你会发现，使用ItemDecoration之后，分组悬停列表是如此简单的一件事了。

## 二、实现代码：
思路分析：
1. 继承ItemDecoration，重写三个方法：getItemOffsets、onDraw、onDrawOver
2. getItemOffsets是给Item添加额外的Padding，以便有地方显示Divider
3. onDraw是绘制在Item的下面的，可能会被Item覆盖
4. onDrawOver是绘制在Item的上面的，可能会覆盖掉Item
5. 实现分组悬停效果，就是在onDraw中绘制跟随滚动的Tag,在onDrawOver中绘制悬停在第一项那里的Tag

```
public class PinnedDivider extends RecyclerView.ItemDecoration {

    private Paint paint;//画笔
    private Rect rect = new Rect();//用于存放测量文字Rect
    private Drawable divider;//分割线颜色

    private Builder builder;

    private PinnedDivider(Builder builder) {
        this.builder = builder;
        this.paint = new Paint();
        this.paint.setAntiAlias(true);
        this.paint.setTextSize(builder.tagTextSize);
        this.divider = new ColorDrawable(builder.dividerColor);
    }

    /**
     * 设置分组悬停视图的显示区域
     */
    @Override
    public void getItemOffsets(Rect outRect, View view, RecyclerView parent, RecyclerView.State state) {
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
     * 绘制最底层
     *
     * @param c
     * @param parent
     * @param state
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
                drawView(c, position, parent, top, bottom);
            }
            //不为空 且跟前一个tag不一样了，说明是新的分类，也要title
            else if (null != tag && !tag.equals(builder.data.get(position - 1).getPinnedTag())) {
                drawView(c, position, parent, top, bottom);
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
     * 绘制最上层
     *
     * @param c
     * @param parent
     * @param state
     */
    @Override
    public void onDrawOver(Canvas c, RecyclerView parent, RecyclerView.State state) {
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
        drawView(c, position, parent, parent.getPaddingTop(), parent.getPaddingTop() + builder.tagHeight);
        if (flag) {
            c.restore();
        }
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
     * 绘制分组悬停视图
     */
    private void drawView(Canvas c, int position, RecyclerView parent, int top, int bottom) {
        //绘制背景
        paint.setColor(builder.tagBgColor);
        c.drawRect(parent.getPaddingLeft(), top, parent.getRight() - parent.getPaddingRight(), bottom, paint);
        //绘制文字
        String tag = builder.data.get(position).getPinnedTag();
        paint.setColor(builder.tagTextColor);
        paint.getTextBounds(tag, 0, tag.length(), rect);
        c.drawText(tag, parent.getPaddingLeft() + builder.tagTextLeftPadding, bottom - (builder.tagHeight - rect.height()) / 2, paint);
    }

    public static class Builder {
        //必填部分
        private Resources resources;
        private List<? extends Pinnable> data;

        //可选部分
        private int headerCount;//其余的HeaderView数量

        //Tag
        private int tagBgColor = 0xFFFFEBCD;
        private int tagHeight = 300;
        private int tagTextColor = 0xFF000000;
        private int tagTextSize = 42;
        private int tagTextLeftPadding = 30;

        //分割线
        private int dividerColor = 0xFF20B2AA;
        private int dividerHeight = 3;

        public Builder(Context context, List<? extends Pinnable> data) {
            this.resources = context.getResources();
            this.data = data;
            if (data == null || data.isEmpty()) {
                throw new RuntimeException("data can not be empty");
            }
        }

        public Builder tagBgColor(@ColorRes int tagBgColor) {
            this.tagBgColor = resources.getColor(tagBgColor);
            return this;
        }

        public Builder tagHeight(@DimenRes int tagHeight) {
            this.tagHeight = resources.getDimensionPixelSize(tagHeight);
            return this;
        }

        public Builder tagTextColor(@ColorRes int tagTextColor) {
            this.tagTextColor = resources.getColor(tagTextColor);
            return this;
        }

        public Builder tagTextSize(@DimenRes int tagTextSize) {
            this.tagTextSize = resources.getDimensionPixelSize(tagTextSize);
            return this;
        }

        public Builder tagTextLeftPadding(@DimenRes int tagTextLeftPadding) {
            this.tagTextLeftPadding = resources.getDimensionPixelSize(tagTextLeftPadding);
            return this;
        }

        public Builder dividerColor(@ColorRes int dividerColor) {
            this.dividerColor = resources.getColor(dividerColor);
            return this;
        }

        public Builder dividerHeight(@DimenRes int dividerHeight) {
            this.dividerHeight = resources.getDimensionPixelSize(dividerHeight);
            return this;
        }

        public PinnedDivider build() {
            return new PinnedDivider(this);
        }

    }

}
```

## 三、使用方式
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
        //使用建造者模式，创建悬停的Divider
        PinnedDivider pinnedDivider = new PinnedDivider.Builder(this, list)
                .dividerColor(R.color.divider)
                .dividerHeight(R.dimen.divider_1)
                .tagHeight(R.dimen.tag_height)
                .tagBgColor(R.color.tag)
                .build();
        rv.addItemDecoration(pinnedDivider);
        adapter.setData(list);
    }
}
```

这里的Bean需要实现一个接口：
```
public class Bean implements Pinnable {

    private String tag;
    private String city;

    public Bean(String tag, String city) {
        this.tag = tag;
        this.city = city;
    }

    public String getCity() {
        return city;
    }

    @Override
    public boolean isPanned() {
        return true;
    }

    @Override
    public String getPinnedTag() {
        return tag;
    }
}
```
接口如下：
```
public interface Pinnable {

    //是否需要显示悬停title
    boolean isPanned();

    //悬停的tag
    String getPinnedTag();
}
```
最后奉上源码：[Github](https://github.com/fishyer/PinnedRecyclerView)

## 参考目录
1. [Android 仿微信通讯录 导航分组列表](http://www.infocool.net/kb/Android/201609/186924.html)
2. [深入理解 RecyclerView 系列之一：ItemDecoration](http://blog.piasy.com/2016/03/26/Insight-Android-RecyclerView-ItemDecoration/)
3. [深入浅出 RecyclerView – 张涛](http://www.liuhaihua.cn/archives/389271.html)