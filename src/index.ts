import * as pub from './pub'
import * as sub from './sub'
import * as dispatcher from './dispatcher'

export const Pub = pub.Pub

export const internals = Object.freeze({
    Observable: pub.Observable,
    ObservableMapped: pub.ObservableMapped,
    PubImmutable: pub.PubImmutable,
    PubMutable: pub.PubMutable,
    PubImmutableContributable: pub.PubImmutableContributable,
    PubMutableContributable: pub.PubMutableContributable,
    ObservableDispatcher: dispatcher.ObservableDispatcher,
    instanceObservableDispatcher: dispatcher.instance
})

export const subMixin = sub.mixin

export function reactive<V>(dependencies: pub.Observable<any>[], fn: () => V) {
    return new pub.ObservableMapped(dependencies, fn)
}

export function reactivePromise<V>(dependencies: pub.Observable<any>[], initial: V, fn: () => Promise<V>) {
    return new pub.ObservableMappedPromise(dependencies, initial, fn)
}