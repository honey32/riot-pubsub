(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global['riot-pubsub'] = {}));
}(this, function (exports) { 'use strict';

    class Observable {
        constructor(dispatcher) {
            this.dispatcher = dispatcher;
        }
        trigger(event) {
            this.dispatcher.trigger(this, event);
        }
        on(event, fn) {
            return this.dispatcher.on(this, event, fn);
        }
        off(event, fn) {
            this.dispatcher.off(event, fn);
        }
    }
    class ObservableSubscribing extends Observable {
        constructor(dispatcher, target) {
            super(dispatcher);
            this.dependencies = target;
            this.dispatcher.onAnyUpdate(target, (e) => this.action(e));
        }
        get value() {
            return this._value;
        }
        updateValue(newValue) {
            const oldValue = this._value;
            this._value = newValue;
            this.trigger({ type: 'update', newValue, isReassigned: true, oldValue });
        }
    }
    class ObservableMapped extends ObservableSubscribing {
        constructor(dispatcher, _dependencies, fn) {
            super(dispatcher, _dependencies);
            this.fn = fn;
            this._value = fn(...this.dependencies.map(obs => obs.value));
        }
        static create(d, ...dependencies) {
            return (fn) => new ObservableMapped(d, dependencies, fn);
        }
        action(event) {
            this.updateValue(this.fn(...this.dependencies.map(obs => obs.value)));
        }
        sync() {
            const oldValue = this._value;
            this._value = this.fn(...this.dependencies.map(obs => obs.value));
            this.trigger({ type: 'update', newValue: this._value, isReassigned: true, oldValue });
        }
    }
    class ObservablePromise extends ObservableSubscribing {
        action(event) {
            this.updateValue({ state: 'pending' });
            event.newValue.then(result => { this.updateValue({ state: 'done', result }); }, reason => { this.updateValue({ state: 'error', reason }); });
        }
    }
    class Pub extends Observable {
        constructor(dispatcher, value) {
            super(dispatcher);
            this._value = value;
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            const oldValue = this._value;
            if (newValue === oldValue) {
                return;
            }
            this._value = newValue;
            this.trigger({ type: 'update', newValue, isReassigned: true, oldValue });
        }
        mutate(fn) {
            fn(this.value);
            this.trigger({ type: 'update', newValue: this.value, isReassigned: false });
        }
    }
    class PubContributable extends Pub {
        contribute(newValue) {
            const oldValue = this._value;
            if (newValue === oldValue) {
                return;
            }
            this._value = newValue;
            this.trigger({ type: 'contribute', newValue, isReassigned: true, oldValue });
        }
        contributeMutation(fn) {
            fn(this.value);
            this.trigger({ type: 'contribute', newValue: this.value, isReassigned: false });
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
        trigger(object, event) {
            const listeners = event.type === 'update' ? this.updateListeners : this.contributeListeners;
            for (const listener of listeners) {
                listener(object, event);
            }
        }
        on(object, event, fn) {
            const listeners = event === 'update' ? this.updateListeners : this.contributeListeners;
            const listener = (obj, event) => {
                if (obj === object) {
                    fn(event);
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
            const listener = (obj, event) => {
                const found = objects.find((e) => obj === e);
                if (found) {
                    fn(event);
                }
            };
            this.updateListeners.push(listener);
            return listener;
        }
        create(value, cont) {
            return cont === 'contributable' ? new PubContributable(this, value) : new Pub(this, value);
        }
    }

    exports.Observable = Observable;
    exports.ObservableSubscribing = ObservableSubscribing;
    exports.ObservableMapped = ObservableMapped;
    exports.ObservablePromise = ObservablePromise;
    exports.Pub = Pub;
    exports.PubContributable = PubContributable;
    exports.Mixin = Mixin;
    exports.ObservableDispatcher = ObservableDispatcher;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
