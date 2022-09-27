---
link: https://www.notion.so/Guava-669eefcada1845d9ab0c97dca56580b0
notionID: 669eefca-da18-45d9-ab0c-97dca56580b0
---

#工具类

>这里，Guava将常用的字符串处理设计了4种角色：连接器、拆分器、匹配器、格式器，很方便我们自己拓展，强大！

感觉Guava采用的Fluent风格还是不错的，和RxJava的使用有点像，链式调用，阅读性很好，可以好好学习下。

---
废话少说了，上代码：

```
package com.che.baseutil.guava.string;

import com.google.common.base.CaseFormat;
import com.google.common.base.CharMatcher;
import com.google.common.base.Joiner;
import com.google.common.base.Splitter;
import com.google.common.collect.Lists;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static com.google.common.truth.Truth.assertThat;

/**
 * Guava字符串处理：分割，连接，匹配，格式
 *
 * @gradle testCompile 'com.google.truth:truth:0.27' [794]
 * @gradle compile 'com.google.guava:guava:19.0' [15076]
 * 作者：余天然 on 16/9/16 上午11:09
 */
public class StringTestClient {

    /**
     * 测试连接器-Joiner
     */
    @Test
    public void testJoiner() {
        Joiner joiner = Joiner.on(";").skipNulls();
        String result1 = joiner.join("Harry", null, "Ron", "Hermione");
        assertThat(result1).isEqualTo("Harry;Ron;Hermione");

        String result2 = Joiner.on(",").join(Arrays.asList(1, 5, 7));
        assertThat(result2).isEqualTo("1,5,7");
    }

    /**
     * 测试拆分器-Splitter
     */
    @Test
    public void testSplitter() {
        List<String> list1 = Splitter.on(';')
                .trimResults()//移除结果字符串的前导空白和尾部空白
                .omitEmptyStrings()//从结果中自动忽略空字符串
                .splitToList("foo;bar;;  ; qux;");
        assertThat(list1).isEqualTo(Lists.newArrayList("foo", "bar", "qux"));

        List<String> list2 = Splitter.fixedLength(3)//限制拆分出的字符串数量
                .splitToList("这使得splitter实例都是线程安全的");
        assertThat(list2).isEqualTo(Lists.newArrayList("这使得", "spl", "itt", "er实", "例都是", "线程安", "全的"));
    }

    /**
     * 测试字符匹配器-CharMatcher
     */
    @Test
    public void testCharMatcher() {
        //只保留数字字符
        String theDigits = CharMatcher.DIGIT.retainFrom("今天是2016年9月16日");
        assertThat(theDigits).isEqualTo("2016916");

        //去除两端的空格，并把中间的连续空格替换成单个空格
        String spaced = CharMatcher.WHITESPACE.trimAndCollapseFrom("  一个 CharMatcher   代表 一类 字符 ", ' ');
        assertThat(spaced).isEqualTo("一个 CharMatcher 代表 一类 字符");

        //用*号替换所有数字
        String noDigits = CharMatcher.JAVA_DIGIT.replaceFrom("我的手机号是13400001234", "*");
        assertThat(noDigits).isEqualTo("我的手机号是***********");

        // 只保留数字和小写字母
        String lowerAndDigit = CharMatcher.JAVA_DIGIT.or(CharMatcher.JAVA_LOWER_CASE).retainFrom("yutianran1314@gmail.COM");
        assertThat(lowerAndDigit).isEqualTo("yutianran1314gmail");


    }

    /**
     * 测试变量格式器-CaseFormat
     */
    @Test
    public void testCaseFormat() {
        //userName -> user-name
        String lowerHyphen = CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_HYPHEN, "userName");
        assertThat(lowerHyphen).isEqualTo("user-name");

        //userName -> user_name
        String lowerUnderscore = CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, "userName");
        assertThat(lowerUnderscore).isEqualTo("user_name");

        //userName -> UserName
        String upperCamel = CaseFormat.LOWER_CAMEL.to(CaseFormat.UPPER_CAMEL, "userName");
        assertThat(upperCamel).isEqualTo("UserName");

        //userName -> USER_NAME
        String upperUnderscore = CaseFormat.LOWER_CAMEL.to(CaseFormat.UPPER_UNDERSCORE, "userName");
        assertThat(upperUnderscore).isEqualTo("USER_NAME");
    }
}
```