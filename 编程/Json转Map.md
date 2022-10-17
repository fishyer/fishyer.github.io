#数据源：

```
{
  "多媒体系统": "单碟CD",
  "进气形式": "自然吸气"
}
```
#代码：
```
package com.che.carcheck.ui.test;

import com.alibaba.fastjson.JSON;

import java.util.Map;
import java.util.Set;

/**
 * Json转Map
 *
 * 作者：余天然 on 16/5/12 下午8:27
 */
public class Test_Json {

    public static void main(String[] args) {

        String json= "{\n" +
                "  \"多媒体系统\": \"单碟CD\",\n" +
                "  \"进气形式\": \"自然吸气\"\n" +
                "}";

        System.out.println("json="+json);

        Map<String,String> map= (Map<String,String>) JSON.parse(json);

        Set<Map.Entry<String, String>> entries = map.entrySet();
        for (Map.Entry<String, String> entry : entries) {
            System.out.println(entry.getKey()+":\t"+entry.getValue());
        }
    }
}
```

#输出：

```
json={
  "多媒体系统": "单碟CD",
  "进气形式": "自然吸气"
}
多媒体系统:	单碟CD
进气形式:	自然吸气

```