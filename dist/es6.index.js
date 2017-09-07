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

class Observable$1 {
    trigger(event, newValue, isReassigned, oldValue) {
        instance.trigger(this, event, newValue, isReassigned, oldValue);
    }
    on(event, fn) {
        instance.on(this, event, fn);
    }
    bind(fn) {
        return new ObservableMapped$1(fn, this);
    }
}
class ObservableMapped$1 extends Observable$1 {
    constructor(fn, base) {
        super();
        base.on('update', (n, ...args) => {
            this._value = fn(n);
            this.trigger('update', this._value, ...args);
        });
    }
    get value() {
        return this._value;
    }
}
class Pub$1 extends Observable$1 {
    constructor(value, name, isMutable = false) {
        super();
        this.name = name;
        this.isMutable = isMutable;
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
}
function create$1(value, name, ...flags) {
    const mutable = flags.indexOf('mutable') >= 0;
    const contributable = flags.indexOf('contributable') >= 0;
    if (mutable) {
        return null;
    }
    else {
        if (contributable) {
            return null;
        }
        else {
            return new Pub$1(value, name);
        }
    }
}


var pub = Object.freeze({
	Observable: Observable$1,
	ObservableMapped: ObservableMapped$1,
	Pub: Pub$1,
	create: create$1
});

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


var sub = Object.freeze({
	mixin: mixin
});

const Observable = Pub$1;
const Pub = Pub$1;
const ObservableMapped = ObservableMapped$1;
const create = create$1;

export { Observable, Pub, ObservableMapped, create, pub, sub };
//# sourceMappingURL=es6.index.js.map
