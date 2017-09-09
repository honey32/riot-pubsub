import { instance as dispatcher } from './dispatcher'


export abstract class Observable<V> {
    readonly value: V

    trigger(event: 'update' | 'contribute', newValue: V, isReassigned: boolean, oldValue?: V) {
        dispatcher.trigger(this, event, newValue, isReassigned, oldValue)
    }

    on(event: 'update' | 'contribute', fn: (newValue: V, isReassigned: boolean, oldValue?: V) => any) {
        dispatcher.on(this, event, fn)
    }

    map<B>(fn: (V) => B) {
        return new ObservableMapped<B, V>(fn, this)
    }
}

export class ObservableMapped<V, B> extends Observable<V> {
    private _value: V

    constructor(fn: (B) => V, base: Observable<B>) {
        super()
        this._value = fn(base.value)
        base.on('update', (n, ...args) => {
            this._value = fn(n);
            (<(e: 'update', v: V, ...rest: any[]) => any>this.trigger)('update', this._value, ...args)
        })
    }

    get value(): V {
        return this._value
    }
}

export abstract class Pub<V> extends Observable<V> {
    protected _value: V
    readonly isMutable: boolean
    readonly isContributable: boolean

    constructor(value: V, public name: string) {
        super()
        this._value = value
    }

    get value(): V {
        return this._value
    }

    set value(newValue: V) {
        const oldValue = this._value
        this._value = newValue
        this.trigger('update', newValue, true, oldValue)
    }

    static create<V>(value: V, name: string): Pub<V>
    static create<V>(value: V, name: string, flag1: 'mutable'): Observable<V>
    static create<V>(value: V, name: string, ...flags: ('mutable' | 'contributable')[]): Observable<V> {
        const mutable = flags.indexOf('mutable') >= 0
        const contributable = flags.indexOf('contributable') >= 0
        
        if (mutable) { 
            return null
        } else {
            if (contributable) {
                return null
            } else {
                return new PubImmutable<V>(value, name)
            }
        }
    }
}

export interface Mutable<V> extends Pub<V> {
    mutate(fn: (V) => any): void
    readonly isMutable: true
}

export interface Contributable<V> extends Pub<V> {
    contribute(newValue: V): void
    readonly isContributable: true
}

export class PubImmutable<V> extends Pub<V> {
    readonly isMutable: false = false
}

export class PubMutable<V> extends Pub<V> implements Mutable<V> {
    readonly isMutable: true = true
    readonly isContributable: false = false

    mutate(fn: (V) => any): void {
        fn(this.value)
        this.trigger('update', this.value, false)
    }
}

export class PubImmutableContributable<V> extends Pub<V> implements Contributable<V> {
    readonly isMutable: false = false
    readonly isContributable: true = true

    contribute(newValue: V): void {
        const oldValue = this._value

        if (newValue === oldValue) {
            return
        }
        
        this._value = newValue
        this.trigger('contribute', newValue, true, oldValue)
    }
}

export class PubMutableContributable<V> extends Pub<V> implements Mutable<V>, Contributable<V> {
    readonly isMutable: true = true
    readonly isContributable: true = true

    contribute(newValue: V): void {
        const oldValue = this._value
        this._value = newValue
        this.trigger('contribute', newValue, true, oldValue)
    }

    mutate(fn: (V) => any): void {
        fn(this.value)
        this.trigger('update', this.value, false)
    }

    contributeMutation(fn: (V) => any): void {
        fn(this.value)
        this.trigger('contribute', this.value, false)
    }
}