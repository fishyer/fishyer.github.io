#1、下划线
```
textView.getPaint().setFlags(Paint. UNDERLINE_TEXT_FLAG ); 
```

#2、抗锯齿
```
textView.getPaint().setAntiAlias(true);
```

#3、中划线
```
textview.getPaint().setFlags(Paint. STRIKE_THRU_TEXT_FLAG); 
```

#4、设置中划线并加清晰 
```
setFlags(Paint. STRIKE_THRU_TEXT_FLAG|Paint.ANTI_ALIAS_FLAG); 
```

#5、取消设置的的划线
```
textView.getPaint().setFlags(0);
```