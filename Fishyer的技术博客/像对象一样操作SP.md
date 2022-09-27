---
link: https://www.notion.so/SP-4fc5399411024dfa8b6134ddd14021f5
notionID: 4fc53994-1102-4dfa-8b61-34ddd14021f5
---
#工具类 

## 一、使用示例

1.在PreferenceManager中添加需要存进SP的字段
```
class PreferenceManager {

    //用户id,
    var userId: String by PreferenceProxy("")

    var age: Int by PreferenceProxy(0)

    var isMan: Boolean  by PreferenceProxy(false)

    var floatValue: Float  by PreferenceProxy(0.0f)

    var doubleValue: Double by PreferenceProxy(0.0)

    var bean: Bean  by PreferenceProxy(Bean.empty())
}
```

2.存值
```
App.preferenceManager .userId = "default userId"
```

3.取值
```
val value=App.preferenceManager .userId
```

## 二、原理

1.使用属性代理，将PreferenceManager的字段的set/get方法托管给PreferenceProxy
```
var bean: Bean  by PreferenceProxy(Bean.empty())
```

2.PreferenceProxy实现ReadWriteProperty接口,重写setValue/getValue方法
```
/**
 * SP的属性代理
 */
class PreferenceProxy<T>(private val default: T) : ReadWriteProperty<Any?, T> {

    companion object {
        val context: Context by lazy {
            App.instance
        }
    }

    private val prefs by lazy {
        context.getSharedPreferences("xxxx", Context.MODE_PRIVATE)
    }

    private val gson by lazy {
        Gson()
    }

    private val map by lazy {
        HashMap<String, Any?>()
    }

    override fun getValue(thisRef: Any?, property: KProperty<*>): T = with(prefs) {
        val key = property.name
        //先取Map
        val mapValue = map[key]
        mapValue?.let {
            LogUtils.print("取Map:$key -> $it")
            return@with it as T
        }
        //Map没有，才去取SP
        when (default) {
            is Long -> {
                var it = getLong(key, default) as T
                LogUtils.print("取SP-Long：$key -> $it")
                //退出应用后，再次进来时，SP还有值，但是Map没有值了，所以需要在第一次取SP后，存到Map，以后就不用再取SP了
                map[key] = it
                return@with it
            }
            is String -> {
                var it = getString(key, default) as T
                LogUtils.print("取SP-String：$key -> $it")
                map[key] = it
                return@with it
            }
            is Float -> {
                var it = getFloat(key, default) as T
                LogUtils.print("取SP-Float：$key -> $it")
                map[key] = it
                return@with it
            }
            is Int -> {
                var it = getInt(key, default) as T
                LogUtils.print("取SP-Int：$key -> $it")
                map[key] = it
                return@with it
            }
            is Boolean -> {
                var it = getBoolean(key, default) as T
                LogUtils.print("取SP-Boolean：$key -> $it")
                map[key] = it
                return@with it
            }
            else -> {
                val jsonString = getString(key, null)
                if (jsonString != null) {
                    LogUtils.print("取SP-Object：$key -> $jsonString")
                    val clazz = ClassUtil.getClazz(default)
                    var it = gson.fromJson(jsonString, clazz) as T
                    map[key] = it
                    return@with it
                } else {
                    LogUtils.print("取默认值：$key -> $default")
                    return@with default
                }
            }
        }
    }

    override fun setValue(thisRef: Any?, property: KProperty<*>, value: T) = with(prefs.edit()) {
        val key = property.name
        //先存SP
        val commit = when (value) {
            is Long -> {
                LogUtils.print("存SP-Long：$key -> $value")
                putLong(key, value)
            }
            is String -> {
                LogUtils.print("存SP-String：$key -> $value")
                putString(key, value)
            }
            is Float -> {
                LogUtils.print("存SP-Float：$key -> $value")
                putFloat(key, value)
            }
            is Int -> {
                LogUtils.print("存SP-Int：$key -> $value")
                putInt(key, value)
            }
            is Boolean -> {
                LogUtils.print("存SP-Boolean：$key -> $value")
                putBoolean(key, value)
            }
            else -> {
                var jsonString = gson.toJson(value)
                LogUtils.print("存SP-Object：$key -> $jsonString")
                putString(key, jsonString)
            }
        }.commit()
        //SP存成功了，再存Map
        if (commit) {
            LogUtils.print("存Map:$key -> $value")
            map[key] = value
        }
    }
}
```

之后再在自己的Application的伴生对象中，定义一个全局的静态PreferenceManager即可
```
val preferenceManager: PreferenceManager by lazy {
            PreferenceManager()
        }
```

## 三、特别提醒

为了防止Map和SP不一致，以后所有的SP操作，都必须通过PreferenceManager，禁止直接使用SharedPreferences！！！