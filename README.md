# Watch-in-depth

This library can watch any properties from nested objects, json files and even objects with property of executable function , such as.

```js
var obj = {
  prop1: {
    prop2: ["a", "b", "c"],
  },
  prop3: [{ a: 1 }, { b: 2 }],
  prop4: {
    prop5: {
      prop6: {
        value: "value",
      },
    },
  },
  prop7: () => {
    console.log("running");
  },
};
```

As you know, in Javascript, Array is an instance of Object. That means the library can watch Array as well, such as

```js
var arr = [
    [1, 2, 3],
    ['a', 'b', {c:3}]
    {a:1},
]
```

Basically the data structure mixed with all kinds of Object and Array can be watched, so as to watch the whole json file.

## Download

```js
npm install watch-in-depth
```

## Usage in Browser

Find `watch-in-depth.js` in folder of `dist`

```js
<script src="watch-in-depth.js"></script>
<script>
      let watchable = watchInDepth();
       // watch a new empty object
      let newObj = watchable.createProxy();
      //watch an existing object
      let obj = {a:{b:1}};
      obj = watchable.createProxy(obj);
      //or watch an existing object but don't pollute it.
      let objProxy = watchable.createProxy(obj);
      //add listener
      watchable.on('updated', ()=> console.log('updated'));
      //trigger the event.
      objProxy.a.b = 2 //'updated' in console panel.

</script>
```

## Usage in Node

```js
let watchInDepth = require("./watch-in-depth.js");
let watchable = watchInDepth();
//codes below are same with usage in browser
```

## Events

There are 8 kinds of events that trigger the listener.

| Events          | Description                                                                                                                                                                                                                                                                                                                                       | Triggered by                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `beforeRead`    | emit events before property being read                                                                                                                                                                                                                                                                                                            | `obj.prop`                                          |
| `read`          | emit events after property being read                                                                                                                                                                                                                                                                                                             | `obj.prop`                                          |
| `beforeUpdated` | emit events before value of property being updated                                                                                                                                                                                                                                                                                                | `obj.prop ="newValue"`                              |
| `updated`       | emit events after value of property being updated                                                                                                                                                                                                                                                                                                 | `obj.prop = "newValue"`                             |
| `beforeChanged` | emit events before value of property being changed, pls note that once `beforeChanged` triggered, the old value and new value of property is different for sure, while `beforeUpdated` triggered, it only means value is updated, not sure if old value and new value is the same or different. it is the same for `update` and `changed` as well | `obj.prop = "newValue" && "newValue" != "oldValue"` |
| `changed`       | emit events after value of property being changed.                                                                                                                                                                                                                                                                                                | `obj.prop = "newValue" && "newValue" != "oldValue"` |
| `beforeRun`     | if property value is a function, emit events before function property being executed                                                                                                                                                                                                                                                              | `obj.fn()`                                          |
| `run`           | if property value is a function, emit events after function property being executed                                                                                                                                                                                                                                                               | `obj.fn()`                                          |

## Watch multiple objects

```js
let watchable1 = watchInDepth();
let watchable2 = watchInDepth();

let obj1 = watchable1.createProxy();
let obj2 = watchable2.createProxy();

watchable1.on("updated", callback1);
watchable2.on("updated", callback2);

obj1.a = 1; //callback1 executed
obj2.b = 2; //callback2 executed
```

## Event object (e) in callback

In order to make sure that browser and node use the same event object. so all properties are defined in `e.detail`

| Property               | Description                                                           | Comments                                       |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| `eTarget`              | `createProxy(obj)`                                                    | proxy target                                   |
| `fnTriggered`          | `{ctx: context, args:[], fn: ƒ}`                                      | currently triggred by function execution       |
| `fnTriggeredPrevious`  | `{ctx: context, args: Array(0), fn: ƒ}`                               | previously triggered by function execution     |
| `setTriggered`         | `{property: "propertyName", oldValue: "oldValue", value: "newValue"}` | currently triggered by property value setting  |
| `setTriggeredPrevious` | `{property: "propertyName", oldValue: "oldValue", value: "newValue"}` | previously triggered by property value setting |
| `getTriggered`         | `{property: "propertyName"}`                                          | currently triggered by property get operation  |
| `getTriggeredPrevious` | `{property: "propertyName"}`                                          | previously triggered by property get operation |

For example

```js
let watchable = watchInDepth();
let obj = { b: {a: 1} };
obj = watchable.createProxy(obj);
watchable.on("updated", (e) => {
  console.log(e.detail.setTriggered);
  console.log(e.detail.setTriggeredPrevious);
});

obj.b.a = 2;
// {"property":"a","value":2,"oldValue":1}
// "undefined"
obj.b.a = 3;
// {"property":"a","value":3,"oldValue":2}
// {"property":"a","value":2,"oldValue":1}
```

## Another way to write listener

You also can write listener in this way below for esay usage if you want, so that you don't have to write so many `watchable.on` functions. 

```js
let fn1 = () =>console.log('updatedCallback');
let fn2 = () =>console.log('readCallback');
let fn3 = () =>console.log('changedCallback'); 
watchable.on('updated, read, changed', fn1, fn2, fn3)
```
## Revoke watch-in-depth
You can stop the watch so that no events trigger any more.

```js
obj = watchable.revoke(obj)
```


