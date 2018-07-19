(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['riot-pubsub'] = {})));
}(this, (function (exports) { 'use strict';

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
        super(dispatcher, value, false);
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

class ObservableDispatcher {
    constructor() {
        this.updateListeners = [];
        this.contributeListeners = [];
    }
    trigger(object, event, newValue, isReassign, oldValue) {
        const listeners = event === 'update' ? this.updateListeners : this.contributeListeners;
        for (const listener of listeners) {
            listener(object, newValue, isReassign, oldValue);
        }
    }
    on(object, event, fn) {
        const listeners = event === 'update' ? this.updateListeners : this.contributeListeners;
        const listener = (obj, newValue, isReassign, oldValue) => {
            if (obj === object) {
                fn(newValue, isReassign, oldValue);
            }
        };
        listeners.push(listener);
        return listener;
    }
    off(event, fn) {
        const listeners = event === 'update' ? this.updateListeners : this.contributeListeners;
        const idx = listeners.indexOf(fn);
        if (idx >= 0) {
            listeners.splice(idx, 1);
        }
    }
    onAnyUpdate(objects, fn) {
        const listener = (obj, newValue, isReassign, oldValue) => {
            const found = objects.find((e) => obj === e);
            if (found) {
                fn(obj, newValue, isReassign, oldValue);
            }
        };
        this.updateListeners.push(listener);
        return listener;
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

exports.Observable = Observable;
exports.ObservableMapped = ObservableMapped;
exports.ObservableMappedPromise = ObservableMappedPromise;
exports.Pub = Pub;
exports.PubWithProps = PubWithProps;
exports.NestedProperty = NestedProperty;
exports.PubContributable = PubContributable;
exports.Mixin = Mixin;
exports.ObservableDispatcher = ObservableDispatcher;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
