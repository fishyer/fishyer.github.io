## EditText焦点监听
focusable：能否获取焦点
focusableInTouchMode：触屏（例如点击）时能否获取焦点
```
mEditText.setOnFocusChangeListener(new android.view.View.OnFocusChangeListener() { 
 
                @Override 
                public void onFocusChange(View v, boolean hasFocus) { 
 
                    if (hasFocus) { 
 
                        // 获得焦点 
 
                    } else { 
 
                        // 失去焦点 
 
                    } 
 
                } 
 
 
            }); 
```

## 让EditText不自动获取焦点
在EidtText的上级控件中，设置：
```
android:focusable="true"
android:focusableInTouchMode="true"
```

## 获取字符高度
```
float textHeight = mTextPaint.descent() - mTextPaint.ascent();
```

## 获取字符宽度
```
float textWidth = mTextPaint.measureText(mTextContent + "");
```

## 确定字符的基准坐标
```
float textBaseX =  getPaddingLeft() + (size - getPaddingLeft() - getPaddingRight()) / 2;
float textBaseY = size / 2 - (mTextPaint.descent() + mTextPaint.ascent()) / 2 + delta;
```