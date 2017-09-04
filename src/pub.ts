import observable from 'riot-observable'

interface Observable {
    on(name: String, fn: Function): void

    trigger(name: String, ...params: any[]): void
}

function unsafeCast<V>(p: Pub<V>): Observable {
    return ((p as any) as Observable)
}


export class Pub<V> {
    private _value: V
    private readonly _delegate: Observable

    constructor(value: V) {
        this._value = value
        observable(this)
        this._delegate = (<Observable><any>this)
    }

    get value(): V {
        return this._value
    }

    set value(newValue: V) {
        const oldValue = this._value
        this._value = newValue
        this._delegate.trigger('update', newValue, true, oldValue)
    }
}

export default {
    Pub
}