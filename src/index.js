if (typeof window != "undefined") {
  // browser
  var doc = document;
  var listen = addEventListener.bind(doc);
} else {
  // node
  var events = require("events");
  var emitter = new events.EventEmitter();
  var listen = emitter.on.bind(emitter);
}

class WatchInDepth {
  constructor() {
    this.customEventData = { detail: {} };
    this.targetObj = {};
  }

  createProxy(obj) {
    if (!obj) var obj = {};
    let detail = this.customEventData.detail;
    detail.eTarget = this.targetObj = obj;
    let _this = this;

    const emitEvent = (event, e) => {
      if (typeof window != "undefined")
        dispatchEvent.call(doc, new CustomEvent(event, e));
      else emitter.emit.call(emitter, event, e);
    };

    const isPureObject = (object) => {
      if (typeof object !== "object") return false;
      for (let prop in object)
        if (
          typeof object[prop] == "object" ||
          typeof object[prop] == "function"
        )
          return false;
      return true;
    };

    const addSubProxy = (object, handler) => {
      for (let prop in object) {
        if (
          typeof object[prop] == "object" ||
          typeof object[prop] == "function"
        ) {
          if (!isPureObject(object[prop])) addSubProxy(object[prop], handler);
          object[prop] = new Proxy(object[prop], handler);
        }
      }
      object = new Proxy(object, handler);
    };

    const toDeepProxy = (object, handler) => {
      if (!isPureObject(object)) addSubProxy(object, handler);
      return new Proxy(object, handler);
    };

    const handler = {
      get(target, property) {
        if (detail.getTriggered)
          detail.getTriggeredPrevious = detail.getTriggered;
        detail.getTriggered = { property };
        emitEvent("beforeRead", _this.customEventData);
        let result = Reflect.get(target, property);
        emitEvent("read", _this.customEventData);
        return result;
      },
      set(target, property, value) {
        let oldValue = target[property];
        if (detail.setTriggered)
          detail.setTriggeredPrevious = detail.setTriggered;
        detail.setTriggered = { property, value, oldValue };
        emitEvent("beforeUpdated", _this.customEventData);
        if (oldValue != value)
          emitEvent("beforeChanged", _this.customEventData);
        let result = Reflect.set(target, property, value);
        emitEvent("updated", _this.customEventData);
        if (oldValue != value) emitEvent("changed", _this.customEventData);
        if (typeof value == "object" || typeof value == "function")
          target[property] = toDeepProxy(target[property], handler);
        return result;
      },
      apply(fn, ctx, args) {
        if (detail.fnTriggered) detail.fnTriggeredPrevious = detail.fnTriggered;
        detail.fnTriggered = { fn, ctx, args };
        emitEvent("beforeRun", _this.customEventData);
        let result = Reflect.apply(fn, ctx, args);
        emitEvent("run", _this.customEventData);
        return result;
      },
    };
    return toDeepProxy(_this.targetObj, handler);
  }

  on(eventStr, ...callback) {
    let eventStrArr = eventStr.split(",");
    for (let i = 0, len = eventStrArr.length; i < len; i++) {
      listen(eventStrArr[i].trim(), (e) => {
        if (callback.length > i) callback[i](e);
      });
    }
  }
 
  revoke(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

export default function deepWatch() {
  return new WatchInDepth();
}

