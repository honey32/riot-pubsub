import { Observable, ObservableMapped, ObservableMappedPromise, Pub, PubContributable } from './pub'

export type Listener<A> = (obj: any, newValue: A, isReassign: boolean, oldValue?: A) => void

export class ObservableDispatcher {
    private observable: any
    private updateListeners: Listener<any>[] = []
    private contributeListeners: Listener<any>[] = []

    trigger<V>(
        object: object,
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
        object: object,
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
        fn:  (
            obj: object,
            newValue: any,
            isReassign: boolean,
            oldValue?: any
        ) => any
    ) {
        const listeners = event === 'update' ? this.updateListeners: this.contributeListeners
        const idx = listeners.indexOf(fn)
        if (idx >= 0) {
            listeners.splice(idx, 1)
        }
    }

    onAnyUpdate(
        objects: Observable<any>[],
        fn: (obj: any, newValue: any, isReassign: boolean, oldValue?: any) => any
    ): Listener<any> {
        const listener: Listener<any> = (obj, newValue, isReassign, oldValue) => {
            const found = objects.find((e) => obj === e)
            if (found) {    
                fn(newValue, isReassign, oldValue)
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