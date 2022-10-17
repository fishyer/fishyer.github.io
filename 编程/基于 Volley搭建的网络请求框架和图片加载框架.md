#1、导入volley.jar、DiskLruCache.java
#2、在自定义Application中配置volley
```
package com.example.chechengwang.global;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.ImageLoader;
import com.android.volley.toolbox.Volley;
import com.example.chechengwang.R;
import com.example.chechengwang.util.LruImageCache;
import com.example.chechengwang.util.MyImageCache;
import com.lidroid.xutils.BitmapUtils;
import android.app.Application;
import android.view.animation.AlphaAnimation;
public class MyApplication extends Application {
	private static MyApplication singleton;
	private static RequestQueue queue;
	private static ImageLoader imageLoader;
	@Override
	public void onCreate() {
		super.onCreate();
		singleton = this;
		queue = Volley.newRequestQueue(getApplicationContext());//volley网络框架
		imageLoader = new ImageLoader(queue,MyImageCache.getInstance(getApplicationContext())); //设置缓存策略
	}
	public static RequestQueue getHttpQueue() {
		return queue;
	}
	
	public static ImageLoader getImageLoader() {
		return imageLoader;
	}
	public static MyApplication getInstance() {
		return singleton;
	}
}
```
#3、自定义缓存策略类
```
package com.example.chechengwang.util;
import java.io.File;
import java.io.FileDescriptor;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Environment;
import android.support.v4.util.LruCache;
import com.android.volley.toolbox.ImageLoader.ImageCache;
import com.example.chechengwang.util.DiskLruCache.Snapshot;
/**
 * 自定义的图片缓存类
 */
public class MyImageCache implements ImageCache {
	Context context;
	private static MyImageCache myImageCache;
	/**
	 * 单例模式-双重锁定，保证线程安全
	 * 
	 * @return
	 */
	public static MyImageCache getInstance(Context context) {
		if (myImageCache == null) {
			synchronized (LruImageCache.class) {
				if (myImageCache == null) {
					myImageCache = new MyImageCache(context);
				}
			}
		}
		return myImageCache;
	}
	/**
	 * 构造方法
	 * 
	 * @param context
	 */
	private MyImageCache(Context context) {
		this.context=context;
	}
	/**
	 * 获取图片的步骤： 1.先从内存获取 2.内存没有，再从磁盘获取 3.磁盘也没有，再从网络获取
	 */
	@Override
	public Bitmap getBitmap(String url) {
		// 1.先从内存获取
		Bitmap bitmap = LruCacheHelper.getInstance().getBitmap(url);
		if (bitmap == null) {
			// 2.内存没有，再从磁盘获取
			bitmap = DiskLruCacheHelper.getInstance(context).getBitmap(url);
		}
		return null;//3.磁盘也没有，再从网络获取（由Volley实现）
	}
	/**
	 * 存储图片的步骤： 1.当从网络获取到图片后，同步存储到内存和硬盘(先判断非空)
	 */
	@Override
	public void putBitmap(String url, Bitmap bitmap) {
		if(LruCacheHelper.getInstance().getBitmap(url)==null){
			LruCacheHelper.getInstance().putBitmap(url, bitmap);
		}
		if(DiskLruCacheHelper.getInstance(context).getBitmap(url)==null){
			DiskLruCacheHelper.getInstance(context).putBitmap(url, bitmap);
		}
	}
}
```
#4、设置LruCacheHelper和DiskLruCacheHelper
```
package com.example.chechengwang.util;
import android.graphics.Bitmap;
import android.support.v4.util.LruCache;
import com.android.volley.toolbox.ImageLoader.ImageCache;
public class LruCacheHelper implements ImageCache {
	private static LruCache<String, Bitmap> mCache;
	private static LruCacheHelper lruCacheHelper;
	
	/**
	 * 单例模式-双重锁定，保证线程安全
	 * 
	 * @return
	 */
	public static LruCacheHelper getInstance() {
		if (lruCacheHelper == null) {
			synchronized (LruImageCache.class) {
				if (lruCacheHelper == null) {
					lruCacheHelper = new LruCacheHelper();
				}
			}
		}
		return lruCacheHelper;
	}
	/**
	 * 构造方法
	 * 
	 * @param context
	 */
	private LruCacheHelper() {
		// 获取应用程序最大可用内存
		int maxMemory = (int) Runtime.getRuntime().maxMemory();
		// 设置图片缓存大小为程序最大可用内存的1/8
		int cacheSize = maxMemory / 8;
		mCache = new LruCache<String, Bitmap>(cacheSize) {
			@Override
			protected int sizeOf(String url, Bitmap bitmap) {
				 return bitmap.getRowBytes() * bitmap.getHeight();
			}
		};
	}
	@Override
	public void putBitmap(String url, Bitmap bitmap) {
		mCache.put(url, bitmap);
	}
	@Override
	public Bitmap getBitmap(String url) {
		return mCache.get(url);
	}
}
```
```
package com.example.chechengwang.util;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Environment;
import com.android.volley.toolbox.ImageLoader.ImageCache;
public class DiskLruCacheHelper implements ImageCache {
    private static DiskLruCacheHelper diskLruCacheHelper;
    private static DiskLruCache mCache;
	/**
	 * 单例模式-双重锁定，保证线程安全
	 * 
	 * @return
	 */
	public static DiskLruCacheHelper getInstance(Context context) {
		if (diskLruCacheHelper == null) {
			synchronized (LruImageCache.class) {
				if (diskLruCacheHelper == null) {
					diskLruCacheHelper = new DiskLruCacheHelper(context);
				}
			}
		}
		return diskLruCacheHelper;
	}
	/**
	 * 构造方法
	 * 
	 * @param context
	 */
	private DiskLruCacheHelper(Context context) {
		int appVersion=AppUtil.getAppVersion(context);
		long maxSize=10*1024*1024;
		 try {
	            if (Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState())
	                    || !Environment.isExternalStorageRemovable()) {
	                mCache = DiskLruCache.open(context.getExternalCacheDir(),appVersion , 1, maxSize);
	            } else {
	                mCache = DiskLruCache.open(context.getCacheDir(), appVersion, 1, maxSize);
	            }
	        } catch (IOException e) { e.printStackTrace(); }
	}
	@Override
	public void putBitmap(String url, Bitmap bitmap) {
		 if (mCache == null) throw new IllegalStateException("Must call openCache() first!");
	        DiskLruCache.Editor editor;
			try {
				editor = mCache.edit(hashUp(url));
		        if (editor != null) {
		            OutputStream outputStream = editor.newOutputStream(0);
		            boolean success = bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream);
		            if (success) {
		                editor.commit();
		            } else {
		                editor.abort();
		            }
		        }
			} catch (IOException e) {
				e.printStackTrace();
			}		
	}
	@Override
	public Bitmap getBitmap(String url) {
		 if (mCache == null) throw new IllegalStateException("Must call openCache() first!");
	        DiskLruCache.Snapshot snapshot;
			try {
				snapshot = mCache.get(hashUp(url));
				 if (snapshot != null) {
			            InputStream inputStream = snapshot.getInputStream(0);
			            Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
			            return bitmap;
			        }
			} catch (IOException e) {
				e.printStackTrace();
			}
	        return null;
	}
	
	 /**
	  * 同步日志
	  */
    public void syncLog() {
        try {
            mCache.flush();
        } catch (IOException e) { e.printStackTrace(); }
    }
    
    /**
     * 对数据作MD5加密
     */
    public static String hashUp(String src) {
        String hash = null;
        try {
            byte[] md5 = MessageDigest.getInstance("md5").digest(src.getBytes());
            StringBuilder builder = new StringBuilder();
            for (byte b : md5) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    builder.append('0');
                }
                builder.append(hex);
            }
            hash = builder.toString();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return hash;
    }
}
```
#5、自定义基于Volley的网络工具类
```
package com.example.chechengwang.util;
import java.util.HashMap;
import java.util.Map;
import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.view.View;
import android.widget.ImageView;
import com.alibaba.fastjson.JSON;
import com.android.volley.AuthFailureError;
import com.android.volley.Request.Method;
import com.android.volley.Response;
import com.android.volley.Response.Listener;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.ImageLoader;
import com.android.volley.toolbox.ImageLoader.ImageCache;
import com.android.volley.toolbox.ImageLoader.ImageContainer;
import com.android.volley.toolbox.ImageLoader.ImageListener;
import com.android.volley.toolbox.ImageRequest;
import com.android.volley.toolbox.StringRequest;
import com.example.chechengwang.R;
import com.example.chechengwang.global.MyApplication;
/**
 * 基于Volley的网络工具类
 * 
 * @author Administrator
 * 
 */
public class VolleyUtil {
	/**
	 * 显示网络图片
	 * @param view
	 * @param url
	 */
	public static void displayImage(ImageView view, String url) {
		MyApplication.getImageLoader().get(
				url,
				MyApplication.getImageLoader().getImageListener(view,
						R.drawable.isloading, R.drawable.isfaile));
	}
	/**
	 * 获取网络图片
	 * @param url
	 * @param volleyImgListener
	 */
	public static void getImage(String url,
			final VolleyImgListener volleyImgListener) {
		ImageRequest imageRequest = new ImageRequest(url,
				new Response.Listener<Bitmap>() {
					@Override
					public void onResponse(Bitmap response) {
						volleyImgListener.onResponse(response);
					}
				}, 0, 0, Config.RGB_565, new Response.ErrorListener() {
					@Override
					public void onErrorResponse(VolleyError error) {
						volleyImgListener.onErrorResponse(error);
					}
				});
		MyApplication.getHttpQueue().add(imageRequest);
	}
	/**
	 * 发送Post请求
	 * @param url
	 * @param map
	 * @param volleyListener
	 */
	public static void post(String url, final HashMap<String, String> map,
			final VolleyListener volleyListener) {
		
		
		StringRequest request = new StringRequest(Method.POST, url,
				new Listener<String>() {
					@Override
					public void onResponse(String arg0) {
						L.e("response=" + arg0);
						volleyListener.onResponse(arg0);
					}
				}, new Response.ErrorListener() {
					@Override
					public void onErrorResponse(VolleyError arg0) {
						L.e("errorResponse=" + JSON.toJSONString(arg0));
						volleyListener.onErrorResponse(arg0);
					}
				}) {
			@Override
			protected Map<String, String> getParams() throws AuthFailureError {
				return map;
			}
		};
		L.e("url=" + url);
		L.e("params=" + map);
		L.e("ContentType=" + request.getBodyContentType());
		
		request.setTag(url + map);
		MyApplication.getHttpQueue().add(request);
	}
	/**
	 * 网络请求回调接口
	 */
	public interface VolleyListener {
		void onResponse(String string);
		void onErrorResponse(VolleyError volleyError);
	}
	VolleyListener volleyListener;
	public void setVolleyListener(VolleyListener volleyListener) {
		this.volleyListener = volleyListener;
	}
	/**
	 * 网络图片请求回调接口
	 */
	public interface VolleyImgListener {
		void onResponse(Bitmap bitmap);
		void onErrorResponse(VolleyError volleyError);
	}
	VolleyImgListener volleyImgListener;
	public void setVolleyImgListener(VolleyImgListener volleyImgListener) {
		this.volleyImgListener = volleyImgListener;
	}
}
```
#6、用例:
##1.网络请求（POST）
```
	private void getHttpData() {
		String url="http://apis.baidu.com/apistore/mobilephoneservice/mobilephone";
		HashMap<String, String> map=new HashMap<String, String>();
		map.put("apikey", "89e6e191e582ea1503b5536210a585c6");
		VolleyUtil.post(url, map, new VolleyListener() {
			
			@Override
			public void onResponse(String string) {
				T.showShort(getActivity(), string);
			}
			
			@Override
			public void onErrorResponse(VolleyError volleyError) {
				T.showShort(getActivity(), JSON.toJSONString(volleyError));
			}
		});
	}
```
##2.获取网络图片
```
<com.android.volley.toolbox.NetworkImageView
                android:id="@+id/img_show"
                android:layout_width="60dp"
                android:layout_height="60dp"
                android:layout_centerHorizontal="true"
                android:layout_marginTop="30dp" >
            </com.android.volley.toolbox.NetworkImageView>
```
```
	private void showWebImg() {
		String url="https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1929405169,748407936&fm=80";
		networkImageView=(NetworkImageView) mainView.findViewById(R.id.img_show);
		networkImageView.setDefaultImageResId(R.drawable.isloading);  
		networkImageView.setErrorImageResId(R.drawable.isfaile);          
		networkImageView.setImageUrl(url, MyApplication.getImageLoader()); 
	}
```
##3.获取网络图片
```
<ImageView
                android:id="@+id/img_get"
                android:layout_width="60dp"
                android:layout_height="60dp"
                android:layout_centerHorizontal="true"
                android:layout_marginTop="30dp"/>
```
```
	private void getWebImg() {
		tv21=(ImageView) mainView.findViewById(R.id.img_get);
		String url02="http://img.my.csdn.net/uploads/201407/26/1406383299_1976.jpg";
		VolleyUtil.getImage(url02, new VolleyImgListener() {
			
			@Override
			public void onResponse(Bitmap bitmap) {
				tv21.setImageBitmap(bitmap);
			}
			
			@Override
			public void onErrorResponse(VolleyError volleyError) {
				tv21.setImageResource(R.drawable.isfaile);
			}
		});
	}
```