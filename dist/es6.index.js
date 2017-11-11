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
}
const instance = Object.freeze(new ObservableDispatcher());

class Observable {
    trigger(event, newValue, isReassigned, oldValue) {
        instance.trigger(this, event, newValue, isReassigned, oldValue);
    }
    on(event, fn) {
        instance.on(this, event, fn);
        return fn;
    }
    off(event, fn) {
        instance.off(event, fn);
    }
}
class ObservableMapped extends Observable {
    constructor(dependencies, fn) {
        super();
        this._value = fn(...dependencies.map(obs => obs.value));
        instance.onAnyUpdate(dependencies, () => {
            const oldValue = this._value;
            this._value = fn(...dependencies.map(obs => obs.value));
            this.trigger('update', this._value, true, oldValue);
        });
    }
    get value() {
        return this._value;
    }
}
class ObservableMappedPromise extends Observable {
    constructor(dependencies, initial, fn) {
        super();
        this._value = initial;
        fn(...dependencies.map(obs => obs.value)).then(value => {
            this._value = value;
        });
        instance.onAnyUpdate(dependencies, () => {
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
}
class Pub$1 extends Observable {
    constructor(value) {
        super();
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
    static create(value, flag) {
        const mutable = flag && flag.mutable;
        const contributable = flag && flag.contributable;
        if (mutable) {
            return contributable ? new PubMutableContributable(value) : new PubMutable(value);
        }
        else {
            return contributable ? new PubImmutableContributable(value) : new PubImmutable(value);
        }
    }
}
class PubImmutable extends Pub$1 {
    constructor() {
        super(...arguments);
        this.isMutable = false;
        this.isContributable = false;
    }
}
class PubMutable extends Pub$1 {
    constructor() {
        super(...arguments);
        this.isMutable = true;
        this.isContributable = false;
    }
    mutate(fn) {
        fn(this.value);
        this.trigger('update', this.value, false);
    }
}
class PubWithProps$1 extends PubMutable {
    constructor(value) {
        super(value);
    }
    createProperty(valueProvider, mutable) {
        return new NestedProperty(this, valueProvider);
    }
}
class NestedProperty extends Observable {
    constructor(parent, provider) {
        super();
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
class PubImmutableContributable extends Pub$1 {
    constructor() {
        super(...arguments);
        this.isMutable = false;
        this.isContributable = true;
    }
    contribute(newValue) {
        const oldValue = this._value;
        if (newValue === oldValue) {
            return;
        }
        this._value = newValue;
        this.trigger('contribute', newValue, true, oldValue);
    }
}
class PubMutableContributable extends Pub$1 {
    constructor() {
        super(...arguments);
        this.isMutable = true;
        this.isContributable = true;
    }
    contribute(newValue) {
        const oldValue = this._value;
        this._value = newValue;
        this.trigger('contribute', newValue, true, oldValue);
    }
    mutate(fn) {
        fn(this.value);
        this.trigger('update', this.value, false);
    }
    contributeMutation(fn) {
        fn(this.value);
        this.trigger('contribute', this.value, false);
    }
}

function subscribe(context, prop, name) {
    context.update({ [name]: prop.value });
    prop.on('update', (newValue) => {
        context.update({ [name]: newValue });
    });
}
const mixin = {
    sub(map) {
        for (const key in map) {
            subscribe(this, map[key], key);
        }
    },
    imitate(model) {
        for (const key in model) {
            const prop = model[key];
            if (prop && (typeof prop.on === 'function')) {
                subscribe(this, prop, key);
            }
        }
    }
};

const Pub = Pub$1;
const PubWithProps = PubWithProps$1;
const internals = Object.freeze({
    Observable: Observable,
    ObservableMapped: ObservableMapped,
    PubImmutable: PubImmutable,
    PubMutable: PubMutable,
    NestedProperty: NestedProperty,
    PubImmutableContributable: PubImmutableContributable,
    PubMutableContributable: PubMutableContributable,
    ObservableDispatcher: ObservableDispatcher,
    instanceObservableDispatcher: instance
});
const subMixin = mixin;
function reactive(dependencies, fn) {
    return new ObservableMapped(dependencies, fn);
}
function reactivePromise(dependencies, initial, fn) {
    return new ObservableMappedPromise(dependencies, initial, fn);
}

export { Pub, PubWithProps, internals, subMixin, reactive, reactivePromise };
//# sourceMappingURL=es6.index.js.map
