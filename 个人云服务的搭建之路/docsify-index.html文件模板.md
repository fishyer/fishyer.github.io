docsify-index.html文件模板
```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>测试Docsify</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="Description">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
</head>

<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: '',
      repo: '',
      //loadNavbar: true,默认加载：_nav.md
      loadNavbar: 'MyNavBar.md',
      // loadSidebar: true,默认加载：_sidebar.md
      loadSidebar: 'MySideBar.md',
      // subMaxLevel: 2,
    }
  </script>
  <!-- Docsify Plugins -->
  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-sidebar-collapse/dist/docsify-sidebar-collapse.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/emoji.min.js"></script>
</body>

</html>
```
