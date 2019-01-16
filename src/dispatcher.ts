import { Observable, ObservableMapped, ObservableMappedPromise, Pub, PubContributable } from './pub'

export type Listener<A> = (obj: Observable<A>, newValue: A, isReassign: boolean, oldValue?: A) => void
export type EventArgs<A> = [A, boolean, A]

type ObservableValue<T> = T extends Observable<infer V> ? V : never
type ObservableValueTuple<D> = {[P in keyof D]: ObservableValue<D[P]>}

export class ObservableDispatcher {
    private observable: any
    updateListeners: Listener<any>[] = []
    contributeListeners: Listener<any>[] = []

    trigger<V>(
        object: Observable<V>,
        event: 'update' | 'contribute',
        newValue: V,
        isReassign: boolean,
        oldValue?: V
    ) {
        const listeners = event === 'update' ? this.updateListeners: this.contributeListeners
        for (const listener of listeners) {
            listener(object, newValue, isReassign, oldValue)
        }
    }

    on<V>(
        object: Observable<V>,
        event: 'update' | 'contribute',
        fn: (
            newValue: V,
            isReassign: boolean,
            oldValue?: V
        ) => any
    ): Listener<V> {
        const listeners = event === 'update' ? this.updateListeners: this.contributeListeners
        const listener: Listener<V> = (obj, newValue, isReassign, oldValue) => {
            if (obj === object) {    
                fn(newValue, isReassign, oldValue)
            }
        }
        
        listeners.push(listener)
        return listener
    }

    off(
        event: 'update' | 'contribute',
        fn: Listener<any>
    ) {
        const listeners = event === 'update' ? this.updateListeners: this.contributeListeners
        const idx = listeners.indexOf(fn)
        if (idx >= 0) {
            listeners.splice(idx, 1)
        }
    }

    onAnyUpdate(
        objects: Observable<any>[],
        fn: (obj: Observable<any>, newValue: any, isReassign: boolean, oldValue?: any) => any
    ): Listener<any> {
        const listener: Listener<any> = (obj, newValue, isReassign, oldValue) => {
            const found = objects.find((e) => obj === e)
            if (found) {    
                fn(obj, newValue, isReassign, oldValue)
            }
        }
        
        this.updateListeners.push(listener)
        return listener
    }

    pub<V>(value: V, isMutable: boolean = true) {
        return new Pub(this, value, isMutable)
    }

    contributable<V>(value: V, isMutable: boolean = true) {
        return new PubContributable(this, value, isMutable)
    }

    // reactive<A1, A2, A3, V>(dependencies: [Observable<A1>, Observable<A2>, Observable<A3>], fn: (v1: A1, v2: A2, v3: A3) => V): ObservableMapped<V>
    // reactive<A1, A2, V>(dependencies: [Observable<A1>, Observable<A2>], fn: (v1: A1, v2: A2) => V): ObservableMapped<V>
    // reactive<A1, V>(dependencies: [Observable<A1>], fn: (v1: A1) => V): ObservableMapped<V>
    reactive<V, D extends Observable<any>[]>(...dependencies: D) {
        return (fn: (...values: ObservableValueTuple<D>) => V) => 
            new ObservableMapped(this, dependencies, fn)
    }
    
    // reactivePromise<A1, A2, A3, V>(dependencies: [Observable<A1>, Observable<A2>, Observable<A3>], initial: V, fn: (v1: A1, v2: A2, v3: A3) => V) : ObservableMappedPromise<V>
    // reactivePromise<A1, A2, V>(dependencies: [Observable<A1>, Observable<A2>], initial: V, fn: (v1: A1, v2: A2) => V) : ObservableMappedPromise<V>
    // reactivePromise<A1, V>(dependencies: [Observable<A1>], initial: V, fn: (v1: A1) => V) : ObservableMappedPromise<V>
    reactivePromise<V, D extends Observable<any>[]>(...dependencies: D) {
        return (initial: V, fn: (...values: ObservableValueTuple<D>) => Promise<V>) => 
            new ObservableMappedPromise(this, dependencies, initial, fn)
    }
}