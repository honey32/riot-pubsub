import * as pub from './pub'
import * as sub from './sub'
import * as dispatcher from './dispatcher'

const internals = Object.freeze({
    Observable: pub.Observable,
    ObservableMapped: pub.ObservableMapped,
    PubImmutable: pub.PubImmutable,
    PubMutable: pub.PubMutable,
    PubImmutableContributable: pub.PubImmutableContributable,
    PubMutableContributable: pub.PubMutableContributable,
    ObservableDispatcher: dispatcher.ObservableDispatcher,
    instanceObservableDispatcher: dispatcher.instance
})

export default {
    Pub: pub.Pub,
    internals,
    onAnyUpdate: dispatcher.instance.onAnyUpdate,
    subMixin: sub.mixin
}