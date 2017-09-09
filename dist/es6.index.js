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
    onAnyUpdate(objects, fn) {
        this.observable.on(event, (anotherObj, newValue, ...rest) => {
            const found = objects.find((_, e) => anotherObj === e);
            if (found) {
                fn(found.name, found.value, ...rest);
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
    }
    map(fn) {
        return new ObservableMapped(fn, this);
    }
}
class ObservableMapped extends Observable {
    constructor(fn, base) {
        super();
        this._value = fn(base.value);
        base.on('update', (n, ...args) => {
            this._value = fn(n);
            this.trigger('update', this._value, ...args);
        });
    }
    get value() {
        return this._value;
    }
}
class Pub$1 extends Observable {
    constructor(value, name) {
        super();
        this.name = name;
        this._value = value;
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        const oldValue = this._value;
        this._value = newValue;
        this.trigger('update', newValue, true, oldValue);
    }
    static create(value, name, ...flags) {
        const mutable = flags.indexOf('mutable') >= 0;
        const contributable = flags.indexOf('contributable') >= 0;
        if (mutable) {
            return contributable ? new PubMutableContributable(value, name) : new PubMutable(value, name);
        }
        else {
            return contributable ? new PubImmutableContributable(value, name) : new PubImmutable(value, name);
        }
    }
}
class PubImmutable extends Pub$1 {
    constructor() {
        super(...arguments);
        this.isMutable = false;
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

function updateTag(tag, propName, value) {
    tag.update({ [propName]: value });
}
const mixin = {
    sub(prop, name = '') {
        updateTag(this, name || prop.name, prop.value);
        prop.on('update', (newValue) => {
            updateTag(this, name || prop.name, prop.value);
        });
    },
    subAll(...props) {
        props.forEach(prop => {
            this.sub(prop);
        });
    },
    imitate(model) {
        for (const key in model) {
            const prop = model[key];
            if (prop && (typeof prop.on === 'function')) {
                this.sub(prop, prop.name || key);
            }
        }
    }
};

const Pub = Pub$1;
const internals = Object.freeze({
    Observable: Observable,
    ObservableMapped: ObservableMapped,
    PubImmutable: PubImmutable,
    PubMutable: PubMutable,
    PubImmutableContributable: PubImmutableContributable,
    PubMutableContributable: PubMutableContributable,
    ObservableDispatcher: ObservableDispatcher,
    instanceObservableDispatcher: instance
});
const subMixin = mixin;

export { Pub, internals, subMixin };
//# sourceMappingURL=es6.index.js.map
