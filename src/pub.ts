import { instance as dispatcher } from './dispatcher'


export abstract class Observable<V> {
    readonly value: V

    trigger(event: 'update' | 'contribute', newValue: V, isReassigned: boolean, oldValue?: V) {
        dispatcher.trigger(this, event, newValue, isReassigned, oldValue)
    }

    on(event: 'update' | 'contribute', fn: (newValue: V, isReassigned: boolean, oldValue?: V) => any) {
        dispatcher.on(this, event, fn)
    }

    bind<B>(fn: (V) => B) {
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

export class Pub<V> extends Observable<V> {
    private _value: V

    constructor(value: V, public name: string, public isMutable: boolean = false) {
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
}

export function create<V>(value: V, name: string): Pub<V>
export function create<V>(value: V, name: string, flag1: 'mutable'): Observable<V>
export function create<V>(value: V, name: string, ...flags: ('mutable' | 'contributable')[]): Observable<V> {
    const mutable = flags.indexOf('mutable') >= 0
    const contributable = flags.indexOf('contributable') >= 0
    
    if (mutable) { 
        return null
    } else {
        if (contributable) {
            return null
        } else {
            return new Pub<V>(value, name)
        }
    }
}