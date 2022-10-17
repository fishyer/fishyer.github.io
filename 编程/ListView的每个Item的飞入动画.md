#1、在ListView设置LayoutAnimation
```
list_car = (ListView) findViewById(R.id.list_car);
		adapter = new CollectCarAdapter(this);
		list_car.setAdapter(adapter);
		list_car.setLayoutAnimation(getListAnim());
```

```
/**
	 * ListView的飞入动画
	 * @return
	 */
	private LayoutAnimationController getListAnim() {  
        AnimationSet set = new AnimationSet(true);  
        Animation animation = new AlphaAnimation(0.0f, 1.0f);  
        animation.setDuration(300);  
        set.addAnimation(animation);  
  
        animation = new TranslateAnimation(Animation.RELATIVE_TO_SELF, -1.0f,  
        Animation.RELATIVE_TO_SELF, 0.0f, Animation.RELATIVE_TO_SELF,  
        0.0f, Animation.RELATIVE_TO_SELF, 0.0f);  
        animation.setDuration(500);  
        set.addAnimation(animation);  
        LayoutAnimationController controller = new LayoutAnimationController(  
        set, 0.5f);  
        return controller;  
        } 
```
#2、在Adapter.getView中设置item的动画
```
convertView.startAnimation(getAnim());
return convertView;
```
```
/**
	 * Item的飞入动画
	 * 
	 * @return
	 */
	private AnimationSet getAnim() {
		AnimationSet set = new AnimationSet(true);
		Animation animation = new AlphaAnimation(0.0f, 1.0f);
		animation.setDuration(300);
		set.addAnimation(animation);
		animation = new TranslateAnimation(Animation.RELATIVE_TO_SELF, -1.0f,
				Animation.RELATIVE_TO_SELF, 0.0f, Animation.RELATIVE_TO_SELF,
				0.0f, Animation.RELATIVE_TO_SELF, 0.0f);
		animation.setDuration(500);
		set.addAnimation(animation);
		return set;
	}
```