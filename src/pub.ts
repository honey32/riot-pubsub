import { ObservableDispatcher, Listener, UpdateEvent} from "./dispatcher";
import { ObservableValueUnion, ObservableValueTuple } from "./types";

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

export abstract class ObservableSubscribing<V, D extends Observable<any>[]> extends Observable<V> {
    protected _value: V
    protected dependencies: D

    get value(): V {
        return this._value
    }

    protected updateValue(newValue: V) {
        const oldValue = this._value
        this._value = newValue
        this.trigger({ type: 'update', newValue, isReassigned: true, oldValue } )
    }

    constructor(dispatcher: ObservableDispatcher, target: D) {
        super(dispatcher)
        this.dependencies = target
        this.dispatcher.onAnyUpdate(target, (e) => this.action(e))
    }

    abstract action(event: UpdateEvent<ObservableValueUnion<D>>): void
}

export namespace ObservableSubscribing {
    export type Provider<V, D extends any[], R extends ObservableSubscribing<V, D>>
        = (dispatcher: ObservableDispatcher, ...dependencies: D) => R
}

export class ObservableMapped<V, D extends Observable<any>[]> extends ObservableSubscribing<V, D> {
    constructor(dispatcher: ObservableDispatcher, _dependencies: D, private fn: (...args: ObservableValueTuple<D>) => V) {
        super(dispatcher, _dependencies)
        this._value = fn(...this.dependencies.map(obs => obs.value) as any)
    }

    
    static create<V, D extends Observable<any>[]>(
            fn: (...args: ObservableValueTuple<D>) => V)
    : ObservableSubscribing.Provider<V, D, ObservableMapped<V, D>> {
        return (dispatcher: ObservableDispatcher, ...d: D) => new ObservableMapped<V, D>(dispatcher, d, fn)
    }

    action(event: UpdateEvent<ObservableValueUnion<D>>): void {
        this.updateValue(this.fn(...this.dependencies.map(obs => obs.value) as any))
    }

    sync(): void {
        const oldValue = this._value
        this._value = this.fn(...this.dependencies.map(obs => obs.value) as any)
        this.trigger({ type: 'update', newValue: this._value, isReassigned: true, oldValue})
    }
}

export class ObservablePromise<V, O extends Observable<Promise<V>>> extends ObservableSubscribing<V, [O]> {
    static create<V, O extends Observable<Promise<V>>>(): ObservableSubscribing.Provider<V, [O], ObservablePromise<V, O>> {
        return (dispacher: ObservableDispatcher, d: O) => new ObservablePromise(dispacher, [d])
    }

    action(event: UpdateEvent<Promise<V>>) {
        event.newValue.then(newValue => {
            this.updateValue(newValue)
        })
    }
}

export class Pub<V> extends Observable<V> {
    protected _value: V

    constructor(dispatcher: ObservableDispatcher, value: V) {
        super(dispatcher)
        this._value = value
    }

    get value(): V {
        return this._value
    }

    set value(newValue: V) {
        const oldValue = this._value

        if (newValue === oldValue) {
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


export class PubContributable<V> extends Pub<V> {
    contribute(newValue: V): void {
        const oldValue = this._value

        if (newValue === oldValue) {
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