import * as pub from './pub'
import * as sub from './sub'
import * as dispatcher from './dispatcher'

export const Pub = pub.Pub
export const PubWithProps = pub.PubWithProps

export const internals = Object.freeze({
    Observable: pub.Observable,
    ObservableMapped: pub.ObservableMapped,
    PubImmutable: pub.PubImmutable,
    PubMutable: pub.PubMutable,
    NestedProperty: pub.NestedProperty,
    PubImmutableContributable: pub.PubImmutableContributable,
    PubMutableContributable: pub.PubMutableContributable,
    ObservableDispatcher: dispatcher.ObservableDispatcher,
    instanceObservableDispatcher: dispatcher.instance
})

export const SubMixin = sub.Mixin

export function reactive<V>(dependencies: pub.Observable<any>[], fn: (...values: any[]) => V) {
    return new pub.ObservableMapped(dependencies, fn)
}

export function reactivePromise<V>(dependencies: pub.Observable<any>[], initial: V, fn: (...values: any[]) => Promise<V>) {
    return new pub.ObservableMappedPromise(dependencies, initial, fn)
}