tags: 工具类

```

public class PopupUtil {
    enum PopupType {
        Center,//居中显示
        Drop,//在锚点下面
    }

    public interface ShowListener {
        void onShow(View view, PopupWindow popupWindow);
    }

    public static void showInCenter(Activity activity, int resourcesId, ShowListener showListener) {
        View popupView = LayoutInflater.from(activity).inflate(resourcesId, null);
        PopupWindow popupWindow = createPopupWindow(activity, popupView, PopupType.Center);
        popupWindow.showAtLocation(getRootView(activity), Gravity.CENTER, 0, 0);
        showListener.onShow(popupView, popupWindow);
    }

    public static void showInDrop(Activity activity, int resourcesId, View anchor,ShowListener showListener) {
        View popupView = LayoutInflater.from(activity).inflate(resourcesId, null);
        PopupWindow popupWindow = createPopupWindow(activity, popupView, PopupType.Drop);
        popupWindow.showAsDropDown(anchor);
        showListener.onShow(popupView, popupWindow);
    }

    /**
     * 获取Activity的根视图
     */
    private static View getRootView(Activity context) {
        return ((ViewGroup) context.findViewById(android.R.id.content))
                .getChildAt(0);
    }

    private static PopupWindow createPopupWindow(final Activity activity, View popupView, PopupType type) {
        PopupWindow mPopupWindow;
        switch (type) {
            case Center:
                mPopupWindow = new PopupWindow(popupView,
                        activity.getResources().getDisplayMetrics().widthPixels * 5 / 6,
                        WindowManager.LayoutParams.WRAP_CONTENT, true);
                break;
            case Drop:
                mPopupWindow = new PopupWindow(popupView,
                        WindowManager.LayoutParams.MATCH_PARENT,
                        WindowManager.LayoutParams.WRAP_CONTENT, true);
                break;
            default:
                mPopupWindow = new PopupWindow(popupView,
                        WindowManager.LayoutParams.MATCH_PARENT,
                        WindowManager.LayoutParams.WRAP_CONTENT, true);
                break;
        }
        // 配置pop
        mPopupWindow.setTouchable(true);
        mPopupWindow.setOutsideTouchable(true);
        mPopupWindow.setBackgroundDrawable(new BitmapDrawable(activity.getResources(),
                (Bitmap) null));
        mPopupWindow.setInputMethodMode(PopupWindow.INPUT_METHOD_NEEDED);
        mPopupWindow
                .setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        mPopupWindow.setOnDismissListener(new PopupWindow.OnDismissListener() {
            @Override
            public void onDismiss() {
                WindowManager.LayoutParams params = activity.getWindow()
                        .getAttributes();
                params.alpha = 1.0f;
                activity.getWindow().setAttributes(params);
            }
        });
        WindowManager.LayoutParams params = activity.getWindow().getAttributes();
        params.alpha = 0.3f;
        activity.getWindow().setAttributes(params);
        return mPopupWindow;
    }


}
```