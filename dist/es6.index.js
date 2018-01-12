class Observable {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    trigger(event, newValue, isReassigned, oldValue) {
        this.dispatcher.trigger(this, event, newValue, isReassigned, oldValue);
    }
    on(event, fn) {
        this.dispatcher.on(this, event, fn);
        return fn;
    }
    off(event, fn) {
        this.dispatcher.off(event, fn);
    }
}
class ObservableMapped extends Observable {
    constructor(dispatcher, dependencies, fn) {
        super(dispatcher);
        this.dependencies = dependencies;
        this.fn = fn;
        this._value = fn(...dependencies.map(obs => obs.value));
        this.dispatcher.onAnyUpdate(dependencies, () => {
            const oldValue = this._value;
            this._value = fn(...dependencies.map(obs => obs.value));
            this.trigger('update', this._value, true, oldValue);
        });
    }
    get value() {
        return this._value;
    }
    sync() {
        const oldValue = this._value;
        this._value = this.fn(...this.dependencies.map(obs => obs.value));
        this.trigger('update', this._value, true, oldValue);
    }
}
class ObservableMappedPromise extends Observable {
    constructor(dispatcher, dependencies, initial, fn) {
        super(dispatcher);
        this.dependencies = dependencies;
        this.fn = fn;
        this._value = initial;
        fn(...dependencies.map(obs => obs.value)).then(value => {
            this._value = value;
        });
        this.dispatcher.onAnyUpdate(dependencies, () => {
            const oldValue = this._value;
            fn(...dependencies.map(obs => obs.value)).then(value => {
                this._value = value;
                this.trigger('update', value, true, oldValue);
            });
        });
    }
    get value() {
        return this._value;
    }
    sync() {
        const oldValue = this._value;
        this.fn(...this.dependencies.map(obs => obs.value)).then(value => {
            this._value = value;
            this.trigger('update', value, true, oldValue);
        });
    }
}
class Pub extends Observable {
    constructor(dispatcher, value, isMutable = true) {
        super(dispatcher);
        this.isMutable = isMutable;
        this._value = value;
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        const oldValue = this._value;
        if (!this.isMutable && newValue === oldValue) {
            return;
        }
        this._value = newValue;
        this.trigger('update', newValue, true, oldValue);
    }
    mutate(fn) {
        fn(this.value);
        this.trigger('update', this.value, false);
    }
}
class PubWithProps extends Pub {
    constructor(dispatcher, value) {
        super(dispatcher, value);
    }
    createProperty(valueProvider, mutable) {
        return new NestedProperty(this, valueProvider);
    }
}
class NestedProperty extends Observable {
    constructor(parent, provider) {
        super(parent.dispatcher);
        function safeValue(p) {
            if (!p) {
                return null;
            }
            if (!provider(p)) {
                return null;
            }
            return provider(p).value;
        }
        this._value = safeValue(parent.value);
        const listener = (newValue, isReassigned, oldValue) => {
            this._value = newValue;
            this.trigger('update', newValue, isReassigned, oldValue);
        };
        if (parent.value) {
            provider(parent.value).on('update', listener);
        }
        parent.on('update', (newValue, isReassigned, oldValue) => {
            if (isReassigned) {
                if (oldValue) {
                    provider(oldValue).off('update', listener);
                }
                this._value = safeValue(newValue);
                if (newValue) {
                    provider(newValue).on('update', listener);
                }
            }
        });
    }
    get value() { return this._value; }
}
class PubContributable extends Pub {
    contribute(newValue) {
        const oldValue = this._value;
        if (!this.isMutable && newValue === oldValue) {
            return;
        }
        this._value = newValue;
        this.trigger('contribute', newValue, true, oldValue);
    }
    contributeMutation(fn) {
        fn(this.value);
        this.trigger('contribute', this.value, false);
    }
}

class Mixin {
    constructor(action) {
        this.action = action;
    }
    sub(map) {
        for (const key in map) {
            this[key] = map[key].value;
            this.action(this);
            map[key].on('update', () => {
                this[key] = map[key].value;
                this.action(this);
            });
        }
    }
    imitate(model) {
        for (const key in model) {
            const prop = model[key];
            if (prop && (typeof prop.on === 'function')) {
                this[key] = prop.value;
                this.action(this);
                prop.on('update', () => {
                    this[key] = prop.value;
                    this.action(this);
                });
            }
        }
    }
}

var observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {};

  /**
   * Private variables
   */
  var callbacks = {},
    slice = Array.prototype.slice;

  /**
   * Public Api
   */

  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given `event` ands
     * execute the `callback` each time an event is triggered.
     * @param  { String } event - event id
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(event, fn) {
        if (typeof fn == 'function')
          (callbacks[event] = callbacks[event] || []).push(fn);
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given `event` listeners
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(event, fn) {
        if (event == '*' && !fn) callbacks = {};
        else {
          if (fn) {
            var arr = callbacks[event];
            for (var i = 0, cb; cb = arr && arr[i]; ++i) {
              if (cb == fn) arr.splice(i--, 1);
            }
          } else delete callbacks[event];
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Listen to the given `event` and
     * execute the `callback` at most once
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(event, fn) {
        function on() {
          el.off(event, on);
          fn.apply(el, arguments);
        }
        return el.on(event, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given `event`
     * @param   { String } event - event id
     * @returns { Object } el
     */
    trigger: {
      value: function(event) {

        // getting the arguments
        var arglen = arguments.length - 1,
          args = new Array(arglen),
          fns,
          fn,
          i;

        for (i = 0; i < arglen; i++) {
          args[i] = arguments[i + 1]; // skip first argument
        }

        fns = slice.call(callbacks[event] || [], 0);

        for (i = 0; fn = fns[i]; ++i) {
          fn.apply(el, args);
        }

        if (callbacks['*'] && event != '*')
          el.trigger.apply(el, ['*', event].concat(args));

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  });

  return el

};

class ObservableDispatcher {
    constructor() {
        this.observable = observable();
    }
    trigger(object, event, newValue, isReassign, oldValue) {
        this.observable.trigger(event, object, newValue, isReassign, oldValue);
    }
    on(object, event, fn) {
        this.observable.on(event, (anotherObj, ...args) => {
            if (anotherObj === object) {
                fn(...args);
            }
        });
    }
    off(event, fn) {
        this.observable.off(event, fn);
    }
    onAnyUpdate(objects, fn) {
        this.observable.on('update', (anotherObj, newValue, ...rest) => {
            const found = objects.find((e) => anotherObj === e);
            if (found) {
                fn(...rest);
            }
        });
    }
    pub(value, isMutable = true) {
        return new Pub(this, value, isMutable);
    }
    contributable(value, isMutable = true) {
        return new PubContributable(this, value, isMutable);
    }
    reactive(dependencies, fn) {
        return new ObservableMapped(this, dependencies, fn);
    }
    reactivePromise(dependencies, initial, fn) {
        return new ObservableMappedPromise(this, dependencies, initial, fn);
    }
}

export { Observable, ObservableMapped, ObservableMappedPromise, Pub, PubWithProps, NestedProperty, PubContributable, Mixin, ObservableDispatcher };
//# sourceMappingURL=es6.index.js.map
