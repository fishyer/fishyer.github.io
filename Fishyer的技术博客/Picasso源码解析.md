---
link: https://www.notion.so/Picasso-e9f867509dcc4c26a34eedea07c6d480
notionID: e9f86750-9dcc-4c26-a34e-edea07c6d480
---

#源码解析

## 1.使用
Picasso.with(context).load(url).into(imageView);

## 2.源码解析
![](https://yupic.oss-cn-shanghai.aliyuncs.com/Pasted image 20220916052409.png)

1. 先使用Picasso.Builder生成一个单例Picasso
2. 1. load的时候生成一个RequestCreator
3. into的时候由RequestCreator生成一个Request,再将Request和Target组合成Action
4. 由Picasso交给Dispatcher后台执行
5. Dispatcher用Action生成BitmapHunter，交于PicassoExecutorService执行，Future获取结果
6. BitmapHunter根据Action获取图片后，将结果交给Diapatcher
7. Dispatcher通知Picasso执行complete
8. Picasso调用Action.complete()方法

****
### （1）先使用Picasso.Builder生成一个单例Picasso
Picasso.with--->Bulider.build--->new Picasso(……),这里使用了单例模式和建造者模式
```
public static Picasso with(Context context) {
if (singleton == null) {
synchronized (Picasso.class) {
if (singleton == null) {
singleton = new Builder(context).build();
}
    }
  }
return singleton;
}
```

```
public Picasso build() {
    Context context = this.context;

    if (downloader == null) {
downloader = Utils.createDefaultDownloader(context);
}
if (cache == null) {
cache = new LruCache(context);
}
if (service == null) {
service = new PicassoExecutorService();
}
if (transformer == null) {
transformer = RequestTransformer.IDENTITY;
}

    Stats stats = new Stats(cache);

Dispatcher dispatcher = new Dispatcher(context, service, HANDLER, downloader, cache, stats);

    return new Picasso(context, dispatcher, cache, listener, transformer, requestHandlers, stats,
defaultBitmapConfig, indicatorsEnabled, loggingEnabled);
}
}
```

```
Picasso(Context context, Dispatcher dispatcher, Cache cache, Listener listener,
RequestTransformer requestTransformer, List<RequestHandler> extraRequestHandlers, Stats stats,
Bitmap.Config defaultBitmapConfig, boolean indicatorsEnabled, boolean loggingEnabled) {
this.context = context;
  this.dispatcher = dispatcher;
  this.cache = cache;
  this.listener = listener;
  this.requestTransformer = requestTransformer;
  this.defaultBitmapConfig = defaultBitmapConfig;

  int builtInHandlers = 7; // Adjust this as internal handlers are added or removed.
int extraCount = (extraRequestHandlers != null ? extraRequestHandlers.size() : 0);
List<RequestHandler> allRequestHandlers =
new ArrayList<RequestHandler>(builtInHandlers + extraCount);

// ResourceRequestHandler needs to be the first in the list to avoid
  // forcing other RequestHandlers to perform null checks on request.uri
  // to cover the (request.resourceId != 0) case.
allRequestHandlers.add(new ResourceRequestHandler(context));
  if (extraRequestHandlers != null) {
    allRequestHandlers.addAll(extraRequestHandlers);
}
  allRequestHandlers.add(new ContactsPhotoRequestHandler(context));
allRequestHandlers.add(new MediaStoreRequestHandler(context));
allRequestHandlers.add(new ContentStreamRequestHandler(context));
allRequestHandlers.add(new AssetRequestHandler(context));
allRequestHandlers.add(new FileRequestHandler(context));
allRequestHandlers.add(new NetworkRequestHandler(dispatcher.downloader, stats));
requestHandlers = Collections.unmodifiableList(allRequestHandlers);

  this.stats = stats;
  this.targetToAction = new WeakHashMap<Object, Action>();
  this.targetToDeferredRequestCreator = new WeakHashMap<ImageView, DeferredRequestCreator>();
  this.indicatorsEnabled = indicatorsEnabled;
  this.loggingEnabled = loggingEnabled;
  this.referenceQueue = new ReferenceQueue<Object>();
  this.cleanupThread = new CleanupThread(referenceQueue, HANDLER);
  this.cleanupThread.start();
}
```

### （2）load的时候生成一个RequestCreator
```
picasso.load()--->new RequestCreator()
public RequestCreator load(String path) {
if (path == null) {
return new RequestCreator(this, null, 0);
}
if (path.trim().length() == 0) {
throw new IllegalArgumentException("Path must not be empty.");
}
return load(Uri.parse(path));
}
```

```
public RequestCreator load(Uri uri) {
return new RequestCreator(this, uri, 0);
}
```

```
RequestCreator(Picasso picasso, Uri uri, int resourceId) {
if (picasso.shutdown) {
throw new IllegalStateException(
"Picasso instance already shut down. Cannot submit new requests.");
}
this.picasso = picasso;
  this.data = new Request.Builder(uri, resourceId, picasso.defaultBitmapConfig);
}
```

### （3）into的时候由RequestCreator生成一个Request,再将Request和Target组合成Action

这里,Dispatcher做为任务分发器，存在着两个Handler：
this.handler = new DispatcherHandler(dispatcherThread.getLooper(), this);//后台线程的Handler
this.mainThreadHandler = mainThreadHandler;//主线程的Handler
```
public void into(ImageView target) {
  into(target, null);
}
```

```
public void into(ImageView target, Callback callback) {
long started = System.nanoTime();
checkMain();

  if (target == null) {
throw new IllegalArgumentException("Target must not be null.");
}

if (!data.hasImage()) {
picasso.cancelRequest(target);
    if (setPlaceholder) {
setPlaceholder(target, getPlaceholderDrawable());
}
return;
}

if (deferred) {
if (data.hasSize()) {
throw new IllegalStateException("Fit cannot be used with resize.");
}
int width = target.getWidth();
    int height = target.getHeight();
    if (width == 0 || height == 0) {
if (setPlaceholder) {
setPlaceholder(target, getPlaceholderDrawable());
}
picasso.defer(target, new DeferredRequestCreator(this, target, callback));
      return;
}
data.resize(width, height);
}

  Request request = createRequest(started);
String requestKey = createKey(request);

  if (shouldReadFromMemoryCache(memoryPolicy)) {
    Bitmap bitmap = picasso.quickMemoryCacheCheck(requestKey);
    if (bitmap != null) {
picasso.cancelRequest(target);
setBitmap(target, picasso.context, bitmap, MEMORY, noFade, picasso.indicatorsEnabled);
      if (picasso.loggingEnabled) {
log(OWNER_MAIN, VERB_COMPLETED, request.plainId(), "from " + MEMORY);
}
if (callback != null) {
        callback.onSuccess();
}
return;
}
  }

if (setPlaceholder) {
setPlaceholder(target, getPlaceholderDrawable());
}

  Action action =
new ImageViewAction(picasso, target, request, memoryPolicy, networkPolicy, errorResId,
errorDrawable, requestKey, tag, callback, noFade);

picasso.enqueueAndSubmit(action);
}
```

### （4）由Picasso交给Dispatcher后台执行
```
void enqueueAndSubmit(Action action) {
  Object target = action.getTarget();
  if (target != null && targetToAction.get(target) != action) {
// This will also check we are on the main thread.
cancelExistingRequest(target);
targetToAction.put(target, action);
}
  submit(action);
}
```
```
void submit(Action action) {
dispatcher.dispatchSubmit(action);
}
```

### （5）Dispatcher用Action生成BitmapHunter，交于PicassoExecutorService执行，Future获取结果
```
void dispatchSubmit(Action action) {
handler.sendMessage(handler.obtainMessage(REQUEST_SUBMIT, action));
}
```

```
@Override public void handleMessage(final Message msg) {
switch (msg.what) {
case REQUEST_SUBMIT: {
      Action action = (Action) msg.obj;
dispatcher.performSubmit(action);
      break;
}
```

dispatchSubmit运行在主线程上，通过Handle传递之后，performSubmit已经运行在dispatcherThread线程上
```
void performSubmit(Action action) {
  performSubmit(action, true);
}
```
```
void performSubmit(Action action, boolean dismissFailed) {
if (pausedTags.contains(action.getTag())) {
pausedActions.put(action.getTarget(), action);
    if (action.getPicasso().loggingEnabled) {
log(OWNER_DISPATCHER, VERB_PAUSED, action.request.logId(),
"because tag '" + action.getTag() + "' is paused");
}
return;
}

  BitmapHunter hunter = hunterMap.get(action.getKey());
  if (hunter != null) {
    hunter.attach(action);
    return;
}

if (service.isShutdown()) {
if (action.getPicasso().loggingEnabled) {
log(OWNER_DISPATCHER, VERB_IGNORED, action.request.logId(), "because shut down");
}
return;
}

  hunter = forRequest(action.getPicasso(), this, cache, stats, action);
hunter.future = service.submit(hunter);
hunterMap.put(action.getKey(), hunter);
  if (dismissFailed) {
failedActions.remove(action.getTarget());
}

if (action.getPicasso().loggingEnabled) {
log(OWNER_DISPATCHER, VERB_ENQUEUED, action.request.logId());
}
}
```
### （6）BitmapHunter根据Action获取图片后，将结果交给Diapatcher
```
static BitmapHunter forRequest(Picasso picasso, Dispatcher dispatcher, Cache cache, Stats stats,
Action action) {
  Request request = action.getRequest();
List<RequestHandler> requestHandlers = picasso.getRequestHandlers();

// Index-based loop to avoid allocating an iterator.
  //noinspection ForLoopReplaceableByForEach
for (int i = 0, count = requestHandlers.size(); i < count; i++) {
    RequestHandler requestHandler = requestHandlers.get(i);
    if (requestHandler.canHandleRequest(request)) {
return new BitmapHunter(picasso, dispatcher, cache, stats, action, requestHandler);
}
  }

return new BitmapHunter(picasso, dispatcher, cache, stats, action, ERRORING_HANDLER);
}
```
BitmapHunter为后台执行下载的线程，继承了Runnable
```
@Override public void run() {
try {
updateThreadName(data);

    if (picasso.loggingEnabled) {
log(OWNER_HUNTER, VERB_EXECUTING, getLogIdsForHunter(this));
}

result = hunt();

    if (result == null) {
dispatcher.dispatchFailed(this);
} else {
dispatcher.dispatchComplete(this);
}
  } catch (Downloader.ResponseException e) {
if (!e.localCacheOnly || e.responseCode != 504) {
exception = e;
}
dispatcher.dispatchFailed(this);
} catch (NetworkRequestHandler.ContentLengthException e) {
exception = e;
dispatcher.dispatchRetry(this);
} catch (IOException e) {
exception = e;
dispatcher.dispatchRetry(this);
} catch (OutOfMemoryError e) {
    StringWriter writer = new StringWriter();
stats.createSnapshot().dump(new PrintWriter(writer));
exception = new RuntimeException(writer.toString(), e);
dispatcher.dispatchFailed(this);
} catch (Exception e) {
exception = e;
dispatcher.dispatchFailed(this);
} finally {
    Thread.currentThread().setName(Utils.THREAD_IDLE_NAME);
}
}
```
获取图片的主要逻辑
```
Bitmap hunt() throws IOException {
  Bitmap bitmap = null;

  if (shouldReadFromMemoryCache(memoryPolicy)) {
    bitmap = cache.get(key);
    if (bitmap != null) {
stats.dispatchCacheHit();
loadedFrom = MEMORY;
      if (picasso.loggingEnabled) {
log(OWNER_HUNTER, VERB_DECODED, data.logId(), "from cache");
}
return bitmap;
}
  }

data.networkPolicy = retryCount == 0 ? NetworkPolicy.OFFLINE.index : networkPolicy;
RequestHandler.Result result = requestHandler.load(data, networkPolicy);
  if (result != null) {
loadedFrom = result.getLoadedFrom();
exifOrientation = result.getExifOrientation();
bitmap = result.getBitmap();

// If there was no Bitmap then we need to decode it from the stream.
if (bitmap == null) {
      InputStream is = result.getStream();
      try {
        bitmap = decodeStream(is, data);
} finally {
        Utils.closeQuietly(is);
}
    }
  }

if (bitmap != null) {
if (picasso.loggingEnabled) {
log(OWNER_HUNTER, VERB_DECODED, data.logId());
}
stats.dispatchBitmapDecoded(bitmap);
    if (data.needsTransformation() || exifOrientation != 0) {
synchronized (DECODE_LOCK) {
if (data.needsMatrixTransform() || exifOrientation != 0) {
          bitmap = transformResult(data, bitmap, exifOrientation);
          if (picasso.loggingEnabled) {
log(OWNER_HUNTER, VERB_TRANSFORMED, data.logId());
}
        }
if (data.hasCustomTransformations()) {
          bitmap = applyCustomTransformations(data.transformations, bitmap);
          if (picasso.loggingEnabled) {
log(OWNER_HUNTER, VERB_TRANSFORMED, data.logId(), "from custom transformations");
}
        }
      }
if (bitmap != null) {
stats.dispatchBitmapTransformed(bitmap);
}
    }
  }

return bitmap;
}
```
### （7）Diapatcher添加缓存，通知Picasso执行complete
```
void dispatchComplete(BitmapHunter hunter) {
handler.sendMessage(handler.obtainMessage(HUNTER_COMPLETE, hunter));
}
```
```
case HUNTER_COMPLETE: {
  BitmapHunter hunter = (BitmapHunter) msg.obj;
dispatcher.performComplete(hunter);
  break;
}
```
下载完成后，添加进缓存
```
void performComplete(BitmapHunter hunter) {
if (shouldWriteToMemoryCache(hunter.getMemoryPolicy())) {
cache.set(hunter.getKey(), hunter.getResult());
}
hunterMap.remove(hunter.getKey());
batch(hunter);
  if (hunter.getPicasso().loggingEnabled) {
log(OWNER_DISPATCHER, VERB_BATCHED, getLogIdsForHunter(hunter), "for completion");
}
}
```

```
private void batch(BitmapHunter hunter) {
if (hunter.isCancelled()) {
return;
}
batch.add(hunter);
  if (!handler.hasMessages(HUNTER_DELAY_NEXT_BATCH)) {
handler.sendEmptyMessageDelayed(HUNTER_DELAY_NEXT_BATCH, BATCH_DELAY);
}
}
```
```
case HUNTER_DELAY_NEXT_BATCH: {
dispatcher.performBatchComplete();
  break;
}
```
```
void performBatchComplete() {
  List<BitmapHunter> copy = new ArrayList<BitmapHunter>(batch);
batch.clear();
mainThreadHandler.sendMessage(mainThreadHandler.obtainMessage(HUNTER_BATCH_COMPLETE, copy));
logBatch(copy);
}
```

### （8）Picasso调用Action.complete()方法，显示图片

```
static final Handler HANDLER = new Handler(Looper.getMainLooper()) {
@Override public void handleMessage(Message msg) {
switch (msg.what) {
case HUNTER_BATCH_COMPLETE: {
@SuppressWarnings("unchecked") List<BitmapHunter> batch = (List<BitmapHunter>) msg.obj;
//noinspection ForLoopReplaceableByForEach
for (int i = 0, n = batch.size(); i < n; i++) {
          BitmapHunter hunter = batch.get(i);
hunter.picasso.complete(hunter);
}
break;
}
```

```
void complete(BitmapHunter hunter) {
  Action single = hunter.getAction();
List<Action> joined = hunter.getActions();

  boolean hasMultiple = joined != null && !joined.isEmpty();
  boolean shouldDeliver = single != null || hasMultiple;

  if (!shouldDeliver) {
return;
}

  Uri uri = hunter.getData().uri;
Exception exception = hunter.getException();
Bitmap result = hunter.getResult();
LoadedFrom from = hunter.getLoadedFrom();

  if (single != null) {
    deliverAction(result, from, single);
}

if (hasMultiple) {
//noinspection ForLoopReplaceableByForEach
for (int i = 0, n = joined.size(); i < n; i++) {
      Action join = joined.get(i);
deliverAction(result, from, join);
}
  }

if (listener != null && exception != null) {
listener.onImageLoadFailed(this, uri, exception);
}
}
```

```
private void deliverAction(Bitmap result, LoadedFrom from, Action action) {
if (action.isCancelled()) {
return;
}
if (!action.willReplay()) {
targetToAction.remove(action.getTarget());
}
if (result != null) {
if (from == null) {
throw new AssertionError("LoadedFrom cannot be null.");
}
    action.complete(result, from);
    if (loggingEnabled) {
log(OWNER_MAIN, VERB_COMPLETED, action.request.logId(), "from " + from);
}
  } else {
    action.error();
    if (loggingEnabled) {
log(OWNER_MAIN, VERB_ERRORED, action.request.logId());
}
  }
}
```

ImageViewAction,继承至Action
```
@Override public void complete(Bitmap result, Picasso.LoadedFrom from) {
if (result == null) {
throw new AssertionError(
        String.format("Attempted to complete action with no result!\n%s", this));
}

  ImageView target = this.target.get();
  if (target == null) {
return;
}

  Context context = picasso.context;
  boolean indicatorsEnabled = picasso.indicatorsEnabled;
PicassoDrawable.setBitmap(target, context, result, from, noFade, indicatorsEnabled);

  if (callback != null) {
callback.onSuccess();
}
}
```

```
static void setBitmap(ImageView target, Context context, Bitmap bitmap,
Picasso.LoadedFrom loadedFrom, boolean noFade, boolean debugging) {
  Drawable placeholder = target.getDrawable();
  if (placeholder instanceof AnimationDrawable) {
    ((AnimationDrawable) placeholder).stop();
}
  PicassoDrawable drawable =
new PicassoDrawable(context, bitmap, placeholder, loadedFrom, noFade, debugging);
target.setImageDrawable(drawable);
}
```

## 参考
1. [Picasso源码分析](http://blog.csdn.net/qq373432361/article/details/44495305)
2. [picasso的源码分析（一）](http://www.mamicode.com/info-detail-623596.html)