import { Observable, Pub, PubContributable, ObservableSubscribing } from './pub'

export type Listener<A> = (obj: Observable<A>, event: UpdateEvent<A>) => void

export interface UpdateEvent<V> {
    type: 'update' | 'contribute'
    newValue: V
    isReassigned: boolean
    oldValue?: V
}

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

    create<V>(value: V): Pub<V>
    create<V>(value: V, cont: 'contributable'): PubContributable<V>
    create<V>(value: V, cont?: 'contributable'): Pub<V> {
        return cont === 'contributable' ? new PubContributable(this, value) : new Pub(this, value)
    }
}