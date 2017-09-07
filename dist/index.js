(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['riot-pubsub'] = {})));
}(this, (function (exports) { 'use strict';

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
    bind(fn) {
        return new MappedObs(fn, this);
    }
}
class MappedObs extends Observable {
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
class Pub extends Observable {
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
var pub = {
    Pub
};


var pub$1 = Object.freeze({
	Observable: Observable,
	MappedObs: MappedObs,
	Pub: Pub,
	default: pub
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
var sub = {
    mixin
};


var sub$1 = Object.freeze({
	mixin: mixin,
	default: sub
});

exports.pub = pub$1;
exports.sub = sub$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
