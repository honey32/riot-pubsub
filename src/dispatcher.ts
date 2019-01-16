import { Observable, ObservableMapped, ObservableMappedPromise, Pub, PubContributable } from './pub'

export type Listener<A> = (obj: Observable<A>, event: UpdateEvent<A>) => void
export type EventArgs<A> = [A, boolean, A]

export interface UpdateEvent<V> {
    type: 'update' | 'contribute'
    newValue: V
    isReassigned: boolean
    oldValue?: V
}

type ObservableValue<T> = T extends Observable<infer V> ? V : never
type ObservableValueTuple<D> = {[P in keyof D]: ObservableValue<D[P]>}

export class ObservableDispatcher {
    private observable: any
    updateListeners: Listener<any>[] = []
    contributeListeners: Listener<any>[] = []

    trigger<V>(object: Observable<V>, event: UpdateEvent<V>) {
        const listeners = event.type === 'update' ? this.updateListeners: this.contributeListeners
        for (const listener of listeners) {
            listener(object, event)
        }
    }

    on<V>(object: Observable<V>, event: 'update' | 'contribute', fn: (event: UpdateEvent<V>) => any): Listener<V> {
        const listeners = event === 'update' ? this.updateListeners: this.contributeListeners
        const listener: Listener<V> = (obj, event) => {
            if (obj === object) {    
                fn(event)
            }
        }
        
        listeners.push(listener)
        return listener
    }

    off(event: 'update' | 'contribute', fn: Listener<any>) {
        const listeners = event === 'update' ? this.updateListeners: this.contributeListeners
        const idx = listeners.indexOf(fn)
        if (idx >= 0) {
            listeners.splice(idx, 1)
        }
    }

    onAnyUpdate(objects: Observable<any>[], fn: (event: UpdateEvent<any>) => any): Listener<any> {
        const listener: Listener<any> = (obj, event) => {
            const found = objects.find((e) => obj === e)
            if (found) {    
                fn(event)
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

    reactive<V, D extends Observable<any>[]>(...dependencies: D) {
        return (fn: (...values: ObservableValueTuple<D>) => V) => 
            new ObservableMapped(this, dependencies, fn)
    }
    
    reactivePromise<V, D extends Observable<any>[]>(...dependencies: D) {
        return (initial: V, fn: (...values: ObservableValueTuple<D>) => Promise<V>) => 
            new ObservableMappedPromise(this, dependencies, initial, fn)
    }
}