import observable from 'riot-observable'
import { Observable } from './pub'

export class ObservableDispatcher {
    observable: any
    
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
}

export const instance = Object.freeze(new ObservableDispatcher())