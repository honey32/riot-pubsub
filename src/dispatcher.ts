import observable from 'riot-observable'
import { Pub } from './pub'

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

    onAnyUpdate(
        objects: Pub<any>[],
        fn: (
            propName: string,
            newValue: any,
            isReassign: boolean,
            oldValue?: any
        ) => any
    ) {
        this.observable.on(event, (anotherObj, newValue, ...rest) => {
            const found = objects.find((_, e) => anotherObj === e)
            if (found) {
                (<(...args: any[]) => any>fn)(found.name, found.value, ...rest)
            }
        })
    }
}

export const instance = Object.freeze(new ObservableDispatcher())