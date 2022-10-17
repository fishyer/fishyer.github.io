#1、支付宝支付:
我这里用的jar包版本是:
![](2016-10-24-18-24-35.jpg)
##1、在AndroidManifest.xml文件里面添加声明：
```
<activity
            android:name="com.alipay.sdk.app.H5PayActivity"
            android:configChanges="orientation|keyboardHidden|navigation"
            android:exported="false"
            android:screenOrientation="behind" >
</activity>
<activity
            android:name="com.alipay.sdk.auth.AuthActivity"
            android:configChanges="orientation|keyboardHidden|navigation"
            android:exported="false"
            android:screenOrientation="behind" >
 </activity>
```
##2、权限声明：
```
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```
##3、封装的支付宝辅助类
因为这里我们的payInfo由自己的服务器端生成了，所以，直接封装了下面的一个辅助类:
```
public class AliHelper {

    //阿里支付
    public static Observable<String> pay(Activity activity, String payInfo) {
        return Observable.create(subscriber -> {
            if (subscriber.isUnsubscribed()) return;
            try {
                PayTask task = new PayTask(activity);
                String result = task.pay(payInfo, true);
                PayResult payResult = new PayResult(result);
                String resultStatus = payResult.getResultStatus();
                subscriber.onNext(resultStatus);
                subscriber.onCompleted();
            } catch (Exception e) {
                subscriber.onError(e);
            }
        });
    }
}
```
这里的PayResult是支付宝的demo中的:
```
public class PayResult {
	private String resultStatus;
	private String result;
	private String memo;

	public PayResult(String rawResult) {

		if (TextUtils.isEmpty(rawResult))
			return;

		String[] resultParams = rawResult.split(";");
		for (String resultParam : resultParams) {
			if (resultParam.startsWith("resultStatus")) {
				resultStatus = gatValue(resultParam, "resultStatus");
			}
			if (resultParam.startsWith("result")) {
				result = gatValue(resultParam, "result");
			}
			if (resultParam.startsWith("memo")) {
				memo = gatValue(resultParam, "memo");
			}
		}
	}

	@Override
	public String toString() {
		return "resultStatus={" + resultStatus + "};memo={" + memo
				+ "};result={" + result + "}";
	}

	private String gatValue(String content, String key) {
		String prefix = key + "={";
		return content.substring(content.indexOf(prefix) + prefix.length(),
				content.lastIndexOf("}"));
	}

	/**
	 * @return the resultStatus
	 */
	public String getResultStatus() {
		return resultStatus;
	}

	/**
	 * @return the memo
	 */
	public String getMemo() {
		return memo;
	}

	/**
	 * @return the result
	 */
	public String getResult() {
		return result;
	}
}
```

##4、在项目中调用支付宝支付:
这里的aliPay()的我调用的一个网络接口，返回服务端的payInfo信息，然而根据该payInfo信息，去调用AliHelper.pay()
```
BaseApplication.getWebInterface()
        .aliPay(new AliPayRequest(1, moneyNum))
        .flatMap(response -> AliHelper.pay(getActivity(), response.getPayInfo()))
        .compose(new WebTransformer<>())
        .subscribe(new WebSubscriber<String>() {
            @Override
            public void onSuccess(String status) {
                LogUtil.print("status:" + status);
                SkipHelper.gotoPayResult(getActivity(), status);
            }
        });
```
这里的SkipHelper.gotoPayResult()只是我封装的一个应用跳转管理类而已:
```
    public static void gotoPayResult(Context context, String status) {
        Intent intent = new Intent();
        intent.setAction(IntentAction.ACTIVITY_PAYRESULT);
        intent.setPackage(context.getPackageName());
        intent.putExtra(IntentKey.TOPUP_STATUS, status);
        context.startActivity(intent);
    }
```
支付结果页就没什么可以说的了:
```
public class PayResultActivity extends BaseActivity {

    public final static String TAG = IntentAction.ACTIVITY_PAYRESULT;

    @BindView(R.id.view_success)
    LinearLayout viewSuccess;
    @BindView(R.id.view_failure)
    LinearLayout viewFailure;

    private String status = "";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_topupresult);
        ButterKnife.bind(this);
        status = getIntent().getStringExtra(IntentKey.TOPUP_STATUS);
        LogUtil.print("status=" + status);
        switch (status) {
            case PayStatus.ALI_SUCCESS:
                viewSuccess.setVisibility(View.VISIBLE);
                viewFailure.setVisibility(View.GONE);
                break;
            case PayStatus.ALI_CONFIRMING:
                AppHelper.show("支付结果确认中");
                viewSuccess.setVisibility(View.VISIBLE);
                viewFailure.setVisibility(View.GONE);
                break;
            default:
                viewSuccess.setVisibility(View.GONE);
                viewFailure.setVisibility(View.VISIBLE);
                break;
        }
    }

    @OnClick({R.id.iv_back, R.id.tv_confirm, R.id.tv_cancel, R.id.tv_repeat})
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.iv_back:
                finish();
                break;
            case R.id.tv_confirm:
                SkipHelper.gotoMain(getActivity());
                finish();
                break;
            case R.id.tv_cancel:
                SkipHelper.gotoMain(getActivity());
                finish();
                break;
            case R.id.tv_repeat:
                finish();
                break;
        }
    }
}
```


#2、微信支付:
添加jar包:
![](2016-10-24-19-04-27.jpg)
##1、后台设置
Android端必须要设置应用的签名和应用包名，签名工具下载地址:https://open.weixin.qq.com/zh_CN/htmledition/res/dev/download/sdk/Gen_Signature_Android.apk
![](2016-10-24-18-31-07.png)

##2、添加权限:
```
<uses-permission android:name="android.permission.INTERNET"/> 
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/> 
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/> 
<uses-permission android:name="android.permission.READ_PHONE_STATE"/> 
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```
##3、封装的微信辅助类:
支持支付、分享到微信好友、分享到微信朋友圈
```
public class WXHelper {

    public static IWXAPI wxApi;

    public static void initApi(Context context, String wxAppId) {
        wxApi = WXAPIFactory.createWXAPI(context, wxAppId, false);
        wxApi.registerApp(wxAppId);
    }

    /**
     * 微信支付
     */
    public static void pay(Map<String, String> map) {
        PayReq wxPayReq = new PayReq();
        wxPayReq.appId = map.get("appid");
        wxPayReq.partnerId = map.get("partnerid");
        wxPayReq.prepayId = map.get("prepayid");
        wxPayReq.packageValue = map.get("package");
        wxPayReq.nonceStr = map.get("noncestr");
        wxPayReq.timeStamp = map.get("timestamp");
        wxPayReq.sign = map.get("sign");
        WXHelper.wxApi.sendReq(wxPayReq);
    }

    /**
     * 分享到微信
     *
     * @param cover  封面图片
     * @param target 链接地址
     * @param title  标题
     * @param desc   内容
     */
    public static void shareToWeixin(String cover, String target, String title, String desc) {
        if (checkWeixinApp()) return;
        if (checkShareFiled(cover, target, title, desc)) return;
        requestShare(cover, target, title, desc, true);
    }

    /**
     * 分享到朋友圈
     */
    public static void shareToPengyouQuan(String cover, String target, String title, String desc) {
        if (checkWeixinApp()) return;
        if (checkShareFiled(cover, target, title, desc)) return;
        requestShare(cover, target, title, desc, false);
    }

    //发送分享的请求
    private static void requestShare(String cover, String target, String title, String desc, boolean isWeixin) {
        Observable<SendMessageToWX.Req> observable = Observable.create(subscriber -> {
            if (subscriber.isUnsubscribed()) return;
            try {
                WXWebpageObject webObj = new WXWebpageObject();
                webObj.webpageUrl = target;

                WXMediaMessage msg = new WXMediaMessage(webObj);
                msg.title = title;
                msg.description = desc;
                Bitmap bmp = loadBitmap(cover);
                msg.thumbData = getBitmapBytes(bmp);
                bmp.recycle();

                SendMessageToWX.Req req = new SendMessageToWX.Req();
                req.transaction = buildTransaction("webpage");
                req.message = msg;
                req.scene = isWeixin ? SendMessageToWX.Req.WXSceneSession : SendMessageToWX.Req.WXSceneTimeline;

                subscriber.onNext(req);
                subscriber.onCompleted();
            } catch (Exception e) {
                subscriber.onError(e);
            }
        });
        observable.subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(req -> wxApi.sendReq(req));
    }

    //检查分享的字段
    private static boolean checkShareFiled(String cover, String target, String title, String desc) {
        if (TextUtils.isEmpty(cover)) {
            AppHelper.show("预览图不能为空！");
            return true;
        }
        if (TextUtils.isEmpty(target)) {
            AppHelper.show("链接地址不能为空！");
            return true;
        }
        if (TextUtils.isEmpty(title)) {
            AppHelper.show("分享标题不能为空");
            return true;
        }
        if (TextUtils.isEmpty(desc)) {
            AppHelper.show("分享描述不能为空");
            return true;
        }
        return false;
    }

    //检查微信App
    private static boolean checkWeixinApp() {
        if (!wxApi.isWXAppInstalled()) {
            AppHelper.show("没有安装微信客户端");
            return true;
        }
        if (!wxApi.isWXAppSupportAPI()) {
            AppHelper.show("当前微信版本过低");
            return true;
        }
        return false;
    }

    //根据图片的url路径获得Bitmap对象
    private static Bitmap loadBitmap(String url) {
        URL fileUrl = null;
        Bitmap bitmap = null;
        try {
            fileUrl = new URL(url);
            HttpURLConnection conn = (HttpURLConnection) fileUrl.openConnection();
            conn.setDoInput(true);
            conn.connect();
            InputStream is = conn.getInputStream();
            bitmap = BitmapFactory.decodeStream(is);
            is.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return bitmap;
    }

    //Bitmap -> byte[]
    private static byte[] getBitmapBytes(Bitmap sourceBitmap) {
        Bitmap bitmap = Bitmap.createScaledBitmap(sourceBitmap, (int) DensityUtil.dp2px(80), (int) DensityUtil.dp2px(60), true);
        byte[] bytes = compressBitmap(bitmap, 30);
        sourceBitmap.recycle();
        bitmap.recycle();
        return bytes;
    }

    //压缩图片到指定大小
    private static byte[] compressBitmap(Bitmap image, int maxSize) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        image.compress(Bitmap.CompressFormat.PNG, 100, baos);// 质量压缩方法，这里100表示不压缩，把压缩后的数据存放到baos中
        int options = 100;
        while (baos.toByteArray().length / 1024 > maxSize) { // 循环判断如果压缩后图片是否大于maxSize kb,大于继续压缩
            baos.reset();// 重置baos即清空baos
            image.compress(Bitmap.CompressFormat.JPEG, options, baos);// 这里压缩options%，把压缩后的数据存放到baos中
            options -= 10;// 每次都减少10
        }
        return baos.toByteArray();
    }

    //创建事务描述
    private static String buildTransaction(final String type) {
        return (type == null) ? String.valueOf(System.currentTimeMillis()) : type + System.currentTimeMillis();
    }

}

```
##4、在项目中调用微信支付:
在Application创建时中初始化微信API:
```
WXHelper.initApi(this, "yourWXAppId");
```
调用微信支付:
这里的tenPay()的一个网络接口，返回服务端的支付信息map
```
BaseApplication.getWebInterface()
        .tenPay(new TenPayRequest(1, moneyNum))
        .compose(new WebTransformer<>())
        .subscribe(new WebSubscriber<TenPayResponse>() {
            @Override
            public void onSuccess(TenPayResponse response) {
                WXHelper.pay(response.getParams());
            }
        });
```
然后在包名下新建一个包:wxapi，在wxapi包下新建WXPayEntryActivity。
这里为了和支付宝的支付结果统一，我在WXPayEntryActivity中没有setContentView,而是直接处理支付的返回值，然后跳转到和支付宝支付结果一样的Activity
```
public class WXPayEntryActivity extends BaseActivity implements IWXAPIEventHandler {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ButterKnife.bind(this);
        WXHelper.wxApi.handleIntent(getIntent(), this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        WXHelper.wxApi.handleIntent(intent, this);
    }

    @Override
    public void onReq(BaseReq baseReq) {
    }

    @Override
    public void onResp(BaseResp baseResp) {
        if (baseResp.getType() == ConstantsAPI.COMMAND_PAY_BY_WX) {
            switch (baseResp.errCode) {
                case BaseResp.ErrCode.ERR_OK:
                    SkipHelper.gotoPayResult(getActivity(), PayStatus.ALI_SUCCESS);
                    finish();
                    break;
                default:
                    SkipHelper.gotoPayResult(getActivity(), PayStatus.ALI_FAILURE);
                    finish();
                    break;
            }
        }
    }
}
```
别忘记了，在AndroidManifest.xml文件里面添加声明:
尤其是android:exported="true"属性，千万别忘记!否则无法收到微信的返回结果。
```
<activity
    android:name="com.che.lovecar.wxapi.WXPayEntryActivity"
    android:exported="true"
    android:launchMode="singleTop"
    android:screenOrientation="portrait"/>
```
##5、在项目中调用微信分享:
在Application创建时中初始化微信API，已经初始化过就不用了:
```
WXHelper.initApi(this, "yourWXAppId");
```
调用微信分享:
弹出微信分享弹窗:
```
    private void share() {
        ShareDialog dialog = new ShareDialog(this);
        dialog.show();
        String cover = H5Urls.logo;//预览图
        String target = url;//链接地址
        String title = getTitle(url);//标题
        String desc = getDesc(url);//描述
        dialog.setData(cover, target, title, desc);
    }
```
弹窗样式如下:
![](34F5C60D84E9C4D9E030739694841CBB.jpg)
这是一个自定义的底部显示的宽度占据全屏的Dialog:
```
public class ShareDialog extends Dialog {

    private String cover = "";//预览图
    private String target = "";//链接地址
    private String title = "";//标题
    private String desc = "";//描述

    public ShareDialog(Context context) {
        super(context, R.style.DarkDialog);
        Window window = getWindow();
        window.setGravity(Gravity.BOTTOM);
        window.setWindowAnimations(R.style.dialogAnim);
        //默认的Dialog只有5/6左右的宽度
        window.getDecorView().setPadding(0, 0, 0, 0);
        WindowManager.LayoutParams lp = window.getAttributes();
        lp.width = WindowManager.LayoutParams.MATCH_PARENT;
        lp.height = WindowManager.LayoutParams.WRAP_CONTENT;
        window.setAttributes(lp);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dialog_share);
        ButterKnife.bind(this);
    }

    public void setData(String cover, String target, String title, String desc) {
        this.cover = cover;
        this.target = target;
        this.title = title;
        this.desc = desc;
    }

    @OnClick({R.id.tv_weixin, R.id.tv_pengyouquan, R.id.tv_cancel})
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.tv_weixin:
                dismiss();
                WXHelper.shareToWeixin(cover, target, title, desc);
                break;
            case R.id.tv_pengyouquan:
                dismiss();
                WXHelper.shareToPengyouQuan(cover, target, title, desc);
                break;
            case R.id.tv_cancel:
                dismiss();
                break;
        }
    }
}
```
样式如下:
```
    <!-- 标准的dialog的样式 -->
    <style name="BaseDialog" parent="@android:style/Theme.Dialog">
        <item name="android:windowFrame">@null</item><!-- 窗框 -->
        <item name="android:windowIsFloating">true</item><!-- 窗口浮动 -->
        <item name="android:windowIsTranslucent">@null</item><!-- 窗口半透明 -->
        <item name="android:windowNoTitle">true</item><!-- 窗口没有标题 -->
        <item name="android:windowBackground">@android:color/transparent</item><!-- 背景的颜色 -->
        <item name="android:backgroundDimEnabled">true</item><!--activity变暗-->
        <item name="android:windowContentOverlay">@null</item><!-- 窗口内容覆盖 -->
    </style>

    <style name="LightDialog" parent="BaseDialog">
        <item name="android:backgroundDimEnabled">false</item><!--activity不变暗-->
    </style>

    <style name="DarkDialog" parent="BaseDialog">
        <item name="android:backgroundDimEnabled">true</item><!--activity变暗-->
    </style>
```
底部弹出动画如下:
```
    <!-- 用于弹出底部弹窗的样式 -->
    <style name="dialogAnim" parent="android:Animation">
        <item name="android:windowEnterAnimation">@anim/bottom_in</item>
        <item name="android:windowExitAnimation">@anim/bottom_out</item>
    </style>
```
底部进入动画:
```
<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android">

    <translate
        android:fromYDelta="100%"
        android:toYDelta="0%"
        android:duration="300"
        android:fillAfter="true"
        />
</set>
```
底部退出动画:
```
<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:duration="300"
        android:fillAfter="true"
        android:fromYDelta="0"
        android:toYDelta="100%"
    />
</set>

```
在上面Dialog的点击事件中，分享调用了WXHelper.shareToWeixin()和WXHelper.shareToPengyouQuan()
然后在包名下新建一个包:wxapi，在wxapi包下新建WXEntryActivity。
```
public class WXEntryActivity extends Activity implements IWXAPIEventHandler {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WXHelper.wxApi.handleIntent(getIntent(), this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        WXHelper.wxApi.handleIntent(intent, this);
    }

    @Override
    public void onReq(BaseReq req) {

    }


    @Override
    public void onResp(BaseResp resp) {
        if (resp.errCode == BaseResp.ErrCode.ERR_OK) {
            finish();
            AppHelper.show("分享成功");
        } else if (resp.errCode == BaseResp.ErrCode.ERR_USER_CANCEL) {
            finish();
            AppHelper.show("取消成功");
        } else {
            finish();
            AppHelper.show("分享失败");
        }
        EventBus.getDefault().post(new HideShareEvent());
    }
}
```
别忘记了，在AndroidManifest.xml文件里面添加声明:
尤其是android:exported="true"属性，千万别忘记!否则无法收到微信的返回结果。
```
<activity
    android:name="com.che.lovecar.wxapi.WXEntryActivity"
    android:exported="true"
    android:launchMode="singleTop"
    android:screenOrientation="portrait"/>
```