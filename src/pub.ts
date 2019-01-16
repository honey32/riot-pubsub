import { ObservableDispatcher, Listener, UpdateEvent } from "./dispatcher";
import { on } from "cluster";

export abstract class Observable<V> {
    readonly value: V

    constructor (public dispatcher: ObservableDispatcher) {}

    trigger(event: UpdateEvent<V>) {
        this.dispatcher.trigger(this, event)
    }

    on(event: 'update' | 'contribute', fn: (event: UpdateEvent<V>) => any): Listener<V> {
        return this.dispatcher.on(this, event, fn)
    }

    off(event: 'update' | 'contribute', fn: Listener<V>) {
        this.dispatcher.off(event, fn)
    }
}

export class ObservableSubscribing<V, T> extends Observable<V> {
    _value: V

    constructor(public dispatcher: ObservableDispatcher, 
            private target: Observable<T>, 
            initial: V, 
            private action: (self: ObservableSubscribing<V, T>, event: UpdateEvent<T>) => void) {
        super(dispatcher)
        this.value = initial
    }

    get value() {
        return this._value
    }

    set value(v: V) {
        this._value = v
        this.target.on('update', (e) => this.action(this, e))
    }
}

export class ObservableMapped<V> extends Observable<V> {
    private _value: V

    constructor(dispatcher: ObservableDispatcher, private dependencies: Observable<any>[], private fn: (...args: any[]) => V) {
        super(dispatcher)
        this._value = fn(...dependencies.map(obs => obs.value))
        this.dispatcher.onAnyUpdate(dependencies, () => {
            const oldValue = this._value
            this._value = fn(...dependencies.map(obs => obs.value))
            this.trigger({ type: 'update', newValue: this._value, isReassigned: true, oldValue } )
        })
    }

    get value(): V {
        return this._value
    }

    sync(): void {
        const oldValue = this._value
        this._value = this.fn(...this.dependencies.map(obs => obs.value))
        this.trigger({ type: 'update', newValue: this._value, isReassigned: true, oldValue})
    }
}

export class ObservableMappedPromise<V> extends Observable<V> {
    private _value: V

    constructor(dispatcher: ObservableDispatcher, private dependencies: Observable<any>[], initial: V, private fn: (...args: any[]) => Promise<V>) {
        super(dispatcher)
        this._value = initial
        fn(...dependencies.map(obs => obs.value)).then(value => {
            this._value = value
        })
        this.dispatcher.onAnyUpdate(dependencies, () => {
            const oldValue = this._value
            fn(...dependencies.map(obs => obs.value)).then(newValue => {
                this._value = newValue
                this.trigger({ type: 'update', newValue, isReassigned: true, oldValue })
            })
        })
    }

    get value(): V {
        return this._value
    }

    sync(): void {
        const oldValue = this._value
        this.fn(...this.dependencies.map(obs => obs.value)).then(newValue => {
            this._value = newValue
            this.trigger({ type: 'update', newValue, isReassigned: true, oldValue })
        })
    }
}

export class Pub<V> extends Observable<V> {
    protected _value: V

    constructor(dispatcher: ObservableDispatcher, value: V, public isMutable: boolean = true) {
        super(dispatcher)
        this._value = value
    }

    get value(): V {
        return this._value
    }

    set value(newValue: V) {
        const oldValue = this._value

        if (!this.isMutable && newValue === oldValue) {
            return
        }

        this._value = newValue
        this.trigger({ type: 'update', newValue, isReassigned: true, oldValue })
    }

    mutate(fn: (value: V) => any): void {
        fn(this.value)
        this.trigger({ type: 'update', newValue: this.value, isReassigned: false })
    }
}

export class PubWithProps<V> extends Pub<V> {
    constructor(dispatcher: ObservableDispatcher, value: V) { 
        super(dispatcher, value, false)
    }

    createProperty<A>(valueProvider: (value: V) => Pub<A>, mutable?: boolean) {
        return new NestedProperty<V, A>(this, valueProvider)
    }
}

export class NestedProperty<P, V> extends Observable<V> {
    private _value: V

    get value() { return this._value }

    constructor(parent: PubWithProps<P>, provider: (parentValue: P) => Observable<V>) {
        super(parent.dispatcher)

        function safeValue(p?: P): V {
            if (!p) { return null }
            if (!provider(p)) { return null }
            return provider(p).value
        }

        this._value = safeValue(parent.value)

        const listener = (_: never, event: UpdateEvent<V>) => {
            this._value = event.newValue
            this.trigger(event)
        }

        if (parent.value) {
            provider(parent.value).on('update', listener.bind(undefined, null))
        }
        
        parent.on('update', ({newValue, isReassigned, oldValue}) => {
            if (isReassigned) {
                if (oldValue) {
                    provider(oldValue).off('update', listener)
                }

                this._value = safeValue(newValue)
                if (newValue) {
                    provider(newValue).on('update', listener.bind(undefined, null))
                }
            }
        })
    }
}

export class PubContributable<V> extends Pub<V> {
    contribute(newValue: V): void {
        const oldValue = this._value

        if (!this.isMutable && newValue === oldValue) {
            return
        }
        
        this._value = newValue
        this.trigger({ type: 'contribute', newValue, isReassigned: true, oldValue })
    }

    contributeMutation(fn: (value: V) => any): void {
        fn(this.value)
        this.trigger({ type: 'contribute', newValue: this.value, isReassigned: false })
    }
}