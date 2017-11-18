import { instance as dispatcher } from './dispatcher'


export abstract class Observable<V> {
    readonly value: V

    trigger(event: 'update' | 'contribute', newValue: V, isReassigned: boolean, oldValue?: V) {
        dispatcher.trigger(this, event, newValue, isReassigned, oldValue)
    }

    on(event: 'update' | 'contribute', fn: (newValue: V, isReassigned: boolean, oldValue?: V) => any): ((newValue: V, isReassigned: boolean, oldValue?: V) => any) {
        dispatcher.on(this, event, fn)
        return fn
    }

    off(event: 'update' | 'contribute', fn: (newValue: V, isReassigned: boolean, oldValue?: V) => any) {
        dispatcher.off(event, fn)
    }
}

export class ObservableMapped<V> extends Observable<V> {
    private _value: V

    constructor(private dependencies: Observable<any>[], private fn: (...args: any[]) => V) {
        super()
        this._value = fn(...dependencies.map(obs => obs.value))
        dispatcher.onAnyUpdate(dependencies, () => {
            const oldValue = this._value
            this._value = fn(...dependencies.map(obs => obs.value))
            this.trigger('update', this._value, true, oldValue)
        })
    }

    get value(): V {
        return this._value
    }

    sync(): void {
        const oldValue = this._value
        this._value = this.fn(...this.dependencies.map(obs => obs.value))
        this.trigger('update', this._value, true, oldValue)
    }
}

export class ObservableMappedPromise<V> extends Observable<V> {
    private _value: V

    constructor(private dependencies: Observable<any>[], initial: V, private fn: (...args: any[]) => Promise<V>) {
        super()
        this._value = initial
        fn(...dependencies.map(obs => obs.value)).then(value => {
            this._value = value
        })
        dispatcher.onAnyUpdate(dependencies, () => {
            const oldValue = this._value
            fn(...dependencies.map(obs => obs.value)).then(value => {
                this._value = value
                this.trigger('update', value, true, oldValue)
            })
        })
    }

    get value(): V {
        return this._value
    }

    sync(): void {
        const oldValue = this._value
        this.fn(...this.dependencies.map(obs => obs.value)).then(value => {
            this._value = value
            this.trigger('update', value, true, oldValue)
        })
    }
}


export interface Flag {
    muatable?: boolean
    contributable?: boolean
}

export interface FlagMutable {
    mutable: true
    contributable?: boolean
}

export interface FlagContributable {
    mutable?: boolean
    contributable: true
}

export abstract class Pub<V> extends Observable<V> {
    protected _value: V
    readonly isMutable: boolean
    readonly isContributable: boolean

    constructor(value: V) {
        super()
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
        this.trigger('update', newValue, true, oldValue)
    }

    static create<V>(value: V, flag: FlagMutable & FlagContributable): PubMutableContributable<V>
    static create<V>(value: V, flag: FlagMutable): PubMutable<V>
    static create<V>(value: V, flag: FlagContributable): PubImmutableContributable<V>
    static create<V>(value: V, flag?: Flag): PubImmutable<V>
    static create<V>(value: V, flag?: any): Pub<V> {
        const mutable = flag && flag.mutable
        const contributable = flag && flag.contributable
        
        if (mutable) { 
            return contributable ? new PubMutableContributable(value) : new PubMutable(value)
        } else {
            return contributable ? new PubImmutableContributable(value) : new PubImmutable(value)
        }
    }
}

export interface Mutable<V> extends Pub<V> {
    mutate(fn: (value: V) => any): void
    readonly isMutable: true
}

export interface Contributable<V> extends Pub<V> {
    contribute(newValue: V): void
    readonly isContributable: true
}

export class PubImmutable<V> extends Pub<V> {
    readonly isMutable: false = false
    readonly isContributable: false = false
}

export class PubMutable<V> extends Pub<V> implements Mutable<V> {
    readonly isMutable: true = true
    readonly isContributable: false = false

    mutate(fn: (value: V) => any): void {
        fn(this.value)
        this.trigger('update', this.value, false)
    }
}

export class PubWithProps<V> extends PubMutable<V> {
    constructor(value: V) { 
        super(value)
    }

    createProperty<A>(valueProvider: (value: V) => Pub<A>, mutable?: boolean) {
        return new NestedProperty(this, valueProvider)
    }
}

export class NestedProperty<P, V> extends Observable<V> {
    private _value: V

    get value() { return this._value }

    constructor(parent: PubWithProps<P>, provider: (parentValue: P) => Observable<V>) {
        super()

        function safeValue(p?: P): V {
            if (!p) { return null }
            if (!provider(p)) { return null }
            return provider(p).value
        }

        this._value = safeValue(parent.value)

        const listener = (newValue, isReassigned, oldValue) => {
            this._value = newValue
            this.trigger('update', newValue, isReassigned, oldValue)
        }

        if (parent.value) {
            provider(parent.value).on('update', listener)
        }
        
        parent.on('update', (newValue, isReassigned, oldValue) => {
            if (isReassigned) {
                if (oldValue) {
                    provider(oldValue).off('update', listener)
                }

                this._value = safeValue(newValue)
                if (newValue) {
                    provider(newValue).on('update', listener)
                }
            }
        })
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

    mutate(fn: (value: V) => any): void {
        fn(this.value)
        this.trigger('update', this.value, false)
    }

    contributeMutation(fn: (value: V) => any): void {
        fn(this.value)
        this.trigger('contribute', this.value, false)
    }
}