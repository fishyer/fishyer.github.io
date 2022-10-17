tags: 代码

```
protected String getAbsoluteImagePath(Uri uri){  
// can post image
       String [] proj={MediaStore.Images.Media.DATA};  
       Cursor cursor = managedQuery( uri,  
                       proj,                 // Which columns to return
null,       // WHERE clause; which rows to return (all rows)
null,       // WHERE clause selection arguments (none)
null);                 // Order-by clause (ascending by name)
int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);  
       cursor.moveToFirst();  
return cursor.getString(column_index);  
}  
```