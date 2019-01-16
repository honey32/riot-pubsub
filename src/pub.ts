import { ObservableDispatcher, Listener, UpdateEvent, ObservableValueUnion } from "./dispatcher";

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
    constructor(dispatcher: ObservableDispatcher, ...target: D) {
        super(dispatcher)
        this.dispatcher.onAnyUpdate(target, (e) => this.action(e))
    }

    abstract action(event: UpdateEvent<ObservableValueUnion<D>>): void
}



export class ObservableMapped<V, D extends Observable<any>[]> extends ObservableSubscribing<V, D> {
    private _value: V

    constructor(dispatcher: ObservableDispatcher, private dependencies: D, private fn: (...args: any[]) => V) {
        super(dispatcher, ...dependencies)
        this._value = fn(...dependencies.map(obs => obs.value))
    }

    action(event: UpdateEvent<keyof D>): void {
        const oldValue = this._value
        this._value = this.fn(...this.dependencies.map(obs => obs.value))
        this.trigger({ type: 'update', newValue: this._value, isReassigned: true, oldValue } )
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