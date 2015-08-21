# NumberEditor
简单的数字控制插件

<br />

## 用法

```html
<input value="100" id="ipt" />
```

```javascript
new NumberEditor('#ipt')
```

带配置的用法:

```javascript
new NumberEditor('#ipt', {
  readonly: false,
  min: 0,
  max: 100,
  ...
})
```

<br />

## Config 

配置项 | 默认值 | 说明
---- | ---- | ----
min | - | 最小值
max | - | 最大值
readonly | true | 是否只读
step | 1 | 加减的最小单位
remote | null | 远程请求配置项
beforeChange | 空函数 | 改动值之前执行回调，回调方法返回`false`则阻止改动
onChange | 空函数 | 改动值之后执行回调
afterRender | 空函数 | 插件初始化完成后执行回调

<br />

## NumberEditor对象

属性与方法 | 参数 | 说明
---- | ---- | ----
cfg | - | 当前对象的配置
value | - | 对象当前值
jIpt | - | 对象的输入元素（不一定是input，插件可接受div、textarea等元素作初始化）
check() | value | 尝试设置对象的值为value
destroy() | - | 销毁对象
enable() | - | 启用插件
disable() | - | 禁用插件
getPostStatus() | - | 获取对象是否在异步请求中
setPostStatus() | - | 获取对象的异步请求状态

## remote配置详解

待续


