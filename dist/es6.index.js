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
    static create(fn) {
        return (dispatcher, ...d) => new ObservableMapped(dispatcher, d, fn);
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
    static create() {
        return (dispacher, d) => new ObservablePromise(dispacher, [d]);
    }
    action(event) {
        event.newValue.then(newValue => {
            this.updateValue(newValue);
        });
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
    subscribing(...dependencies) {
        return (fn) => fn(this, ...dependencies);
    }
}

export { Observable, ObservableSubscribing, ObservableMapped, ObservablePromise, Pub, PubContributable, Mixin, ObservableDispatcher };
