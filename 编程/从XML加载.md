# 从XML加载

```.ignore
// //从XML加载
// constructor(context: Context, attrs: AttributeSet? = null) : super(context, attrs) {
// LayoutInflater.from(context).inflate(createLayoutId(), this, true);
// }
//
// //从ViewHolder自己创建的，需要传入parent，保持布局参数
// constructor(parent: ViewGroup) : super(parent.context) {
// val view = LayoutInflater.from(context).inflate(createLayoutId(), parent, false)
// addView(view)
// }
```