---
link: https://www.notion.so/FAQ-chrome-http-https-a3cbee2cc8ab469db0c93f00d24fd633
notionID: a3cbee2c-c8ab-469d-b0c9-3f00d24fd633
---
1.  地址栏输入： chrome://net-internals/#hsts.
2.  找到底部Delete domain security policies一栏，输入想处理的域名，点击delete。要全域名，不要只填一级域名。
3.  搞定了，再次访问**http**域名不再**自动跳转https**了。