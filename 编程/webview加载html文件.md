```
WebView mywebview;

    @SuppressLint("JavascriptInterface")
    private void initWebView() {
        mywebview = (WebView) findViewById(R.id.webview);

        WebSettings settings = mywebview.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        mywebview.setHorizontalScrollBarEnabled(false);
        mywebview.setBackgroundColor(Color.TRANSPARENT); // 设置背景色

        String html = readAssest(this, "html/address.html");


        String baseurl = "file:///android_asset/";

        mywebview.loadDataWithBaseURL(baseurl, html, "text/html", "UTF-8", null);
        mywebview.getSettings().setJavaScriptEnabled(true);
        mywebview.addJavascriptInterface(this, "js");
        mywebview.setWebViewClient(new MyWebViewClient());
    }


    /**
     * 读取assest文件
     *
     * @param context
     * @param fileName
     * @return
     */
    public static String readAssest(Context context, String fileName) {
        String result = "";
        InputStream input = null;
        try {
            input = context.getAssets().open(fileName);
            int length = input.available();
            byte[] buffer = new byte[length];
            input.read(buffer);

//            result = EncodingUtils.getString(buffer, "UTF-8");

            result = new String(buffer);

        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (input != null)
                    input.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return result;
    }

    /**
     * 自定义WebViewClient
     */
    private class MyWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return true;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
//            web_help.loadUrl("file:///android_asset/html/address.html");
        }
    }
```