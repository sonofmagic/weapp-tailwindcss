export function ProxyUtils(data: Object) {
  if (typeof data === 'object' && data != null) {
    // console.log(data, 3)
    data = new Proxy(data, {
      get: function (target, p) {
        return Reflect.get(target, p);
      },
      set: function (target, p, value) {
        if (target.hasOwnProperty(p) && value === target[p]) return true;
        const temp = ProxyUtils(value);
        if (Reflect.set(target, p, temp)) {
          data.notify();
          return true;
        } else {
          return false;
        }
      },
    });
    Object.defineProperties(data, {
      subs: {
        enumerable: false,
        value: [],
      },
      notify: {
        enumerable: false,
        value: function () {
          data.subs.forEach((watcher) => {
            watcher(this);
          });
        },
      },
      watch: {
        enumerable: false,
        value: function (fn) {
          data.subs.push(fn);
          fn(this);
          return {
            destory: function () {
              data.subs.splice(data.subs.indexOf(fn), 1);
            },
          };
        },
      },
    });
  }
  return data;
}
