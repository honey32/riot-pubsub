import observable from 'riot-observable'
import { Observable, ObservableMapped, ObservableMappedPromise, Pub, PubContributable } from './pub'

export class ObservableDispatcher {
    private observable: any
    
    constructor() {
        this.observable = observable()
    }

    trigger<V>(
        object: object,
        event: 'update' | 'contribute',
        newValue: V,
        isReassign: boolean,
        oldValue?: V
    ) {
        this.observable.trigger(event, object, newValue, isReassign, oldValue)
    }

    on<V>(
        object: object,
        event: 'update' | 'contribute',
        fn: (
            newValue: V,
            isReassign: boolean,
            oldValue?: V
        ) => any
    ) {
        this.observable.on(event, (anotherObj, ...args) => {
            if (anotherObj === object) {    
                (<(...args: any[]) => any>fn)(...args)
            }
        })
    }

    off(
        event: 'update' | 'contribute',
        fn:  (
            newValue: any,
            isReassign: boolean,
            oldValue?: any
        ) => any
    ) {
        this.observable.off(event, fn)
    }

    onAnyUpdate(
        objects: Observable<any>[],
        fn: (...args: any[]) => any
    ) {
        this.observable.on('update', (anotherObj, newValue, ...rest) => {
            const found = objects.find((e) => anotherObj === e)
            if (found) {
                fn(...rest)
            }
        })
    }

    pub<V>(value: V, isMutable: boolean = true) {
        return new Pub(this, value, isMutable)
    }

    contributable<V>(value: V, isMutable: boolean = true) {
        return new PubContributable(this, value, isMutable)
    }

    reactive<A1, A2, A3, V>(dependencies: [Observable<A1>, Observable<A2>, Observable<A3>], fn: (v1: A1, v2: A2, v3: A3) => V)
    reactive<A1, A2, V>(dependencies: [Observable<A1>, Observable<A2>], fn: (v1: A1, v2: A2) => V)
    reactive<A1, V>(dependencies: [Observable<A1>], fn: (v1: A1) => V)
    reactive<V>(dependencies: Observable<any>[], fn: (...values: any[]) => V) {
        return new ObservableMapped(this, dependencies, fn)
    }
    
    reactivePromise<A1, A2, A3, V>(dependencies: [Observable<A1>, Observable<A2>, Observable<A3>], initial: V, fn: (v1: A1, v2: A2, v3: A3) => V)
    reactivePromise<A1, A2, V>(dependencies: [Observable<A1>, Observable<A2>], initial: V, fn: (v1: A1, v2: A2) => V)
    reactivePromise<A1, V>(dependencies: [Observable<A1>], initial: V, fn: (v1: A1) => V)
    reactivePromise<V>(dependencies: Observable<any>[], initial: V, fn: (...values: any[]) => Promise<V>) {
        return new ObservableMappedPromise(this, dependencies, initial, fn)
    }
}