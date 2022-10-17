tags: android

## 1、效果图

![](2016-10-29-11-13-00.jpg)

## 2、代码
```
package extra.view;

import extra.util.L;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.drawable.GradientDrawable;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

/**
 * 作者：余天然 on 2015/7/14 10:00
 * 邮箱：yutianran1993@qq.com
 * 博客：http://my.oschina.net/u/2345676/blog
 * 座右铭:知识来自积累,经验源于总结
 */
public class StepView extends View {
    Context context;

    Paint paint;
    int viewWidth, viewHeight;//视图的宽、高


    int mWidth,mHeight,mInRadius,mOutRadius;

    int stepNumber=4;//总步数

    int step=0;//开始的步数
    float percentage=0.0f;//拖动的百分比

    int minDistance;//最小移动间距（0.5倍间距）
    float distance;//实际移动距离

    // 颜色
    int[] colors=new int[]{0xFF02FF02,0xFF02A7F5,0xFFFF144E,0xFFFBAB06};
    int[] colorBgs=new int[]{0x7702FF02,0x7702A7F5,0x77FF144E,0x77FBAB06};
    int lineColor=0xFF878787;

    public StepView(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        initView();
    }

    private void initView() {
        viewWidth = getWidth();
        viewHeight = getHeight();

        mWidth=viewWidth-50-50;
        mHeight=10;
        mInRadius=20;
        mOutRadius=30;

        L.e("viewWidth=" + viewWidth + "\tviewHeight=" + viewHeight);

        paint = new Paint();

        minDistance=mWidth/(stepNumber-1)/2;


    }


    @Override
    protected void onDraw(Canvas canvas) {
        //移动画布到中间
        canvas.translate(50,viewHeight/2);

        drawLine(canvas);

        drawCircle(canvas);

        drawGriend(canvas);
    }

    /**
     * 绘制背景的横线和圆圈
     * @param canvas
     */
    private void drawLine(Canvas canvas) {
        canvas.save();
        paint.setColor(lineColor);
        //绘制横线
        canvas.drawRect(0,0,mWidth,mHeight,paint);
        //绘制未选择的圆圈
        for(int i=0;i<stepNumber;i++){
            canvas.drawCircle(0+mWidth/(stepNumber-1)*i, 0, mInRadius, paint);
        }
        canvas.restore();
    }

    /**
     * 绘制有颜色的圆圈
     * @param canvas
     */
    private void drawCircle(Canvas canvas) {
        for(int i=0;i<stepNumber;i++){
            if(i==step){
                //绘制有色的横线
                paint.setColor(colors[i]);
                canvas.drawRect(0,0,mWidth/(stepNumber-1)*i,mHeight,paint);

                //绘制外圆
                paint.setColor(colorBgs[i]);
                canvas.drawCircle(0 + mWidth / (stepNumber - 1) * i, 0, mOutRadius, paint);

                //绘制内圆
                for(int j=0;j<=i;j++){
                    paint.setColor(colors[i]);
                    canvas.drawCircle(0+mWidth/(stepNumber-1)*j, 0, mInRadius, paint);
                }

            }
        }
    }

    /**
     * 绘制移动时的颜色渐变
     */
    private void drawGriend(Canvas canvas) {
        GradientDrawable gr = new GradientDrawable(GradientDrawable.Orientation.LEFT_RIGHT, new int[]{colors[step],colors[(step+1)%stepNumber]});
        gr.setShape(GradientDrawable.RECTANGLE);//设置形状为矩形

        int startW=0+mWidth/(stepNumber-1)*step;
        gr.setBounds(startW, 0, (int)(startW+distance), mHeight);
        gr.draw(canvas);
    }




    float startX,startY,moveX,moveY,endX,endY;
    @Override
    public boolean onTouchEvent(MotionEvent event) {

        switch (event.getAction()){
            case MotionEvent.ACTION_DOWN:
                startX=event.getX();
                startY=event.getY();
                L.e( "ACTION_DOWN：startX="+startX+"\tstartY="+startY);
                break;

            case MotionEvent.ACTION_MOVE:
                moveX=event.getX();
                moveY=event.getY();
                L.e( "ACTION_MOVE：moveX="+moveX+"\tmoveY="+moveY);
                doMove();
                break;

            case MotionEvent.ACTION_UP:
                endX=event.getX();
                endY=event.getY();
                L.e( "ACTION_UP：endX="+endX+"\tendY="+endY);
                doUp();
                break;

        }
        return true;
    }

    private void doUp() {
        distance=endX-startX;
        percentage=distance/(minDistance*2);

        if(percentage>0.5f){
            addStep();
        }else if (percentage<-0.5f){
            reduceStep();
        }
        distance=0;
        invalidate();
        iStepListener.currentStep(step);
    }

    private void doMove() {
        distance=moveX-startX;

        if(distance>=minDistance*2){
            distance=minDistance*2;
        }
        invalidate();
    }

    private void addStep() {
        step++;
        step=(step%stepNumber+stepNumber)%stepNumber;
    }

    private void reduceStep() {
        step--;
        step=(step%stepNumber+stepNumber)%stepNumber;
    }



    public interface IStepListener{
        void currentStep(int step);
    }

    IStepListener iStepListener;

    public void setiStepListener(IStepListener iStepListener) {
        this.iStepListener = iStepListener;
    }
}




```