import * as pub from './pub';
import * as sub from './sub';
import * as dispatcher from './dispatcher';
export declare const Pub: typeof pub.Pub;
export declare const PubWithProps: typeof pub.PubWithProps;
export declare const internals: Readonly<{
    Observable: typeof pub.Observable;
    ObservableMapped: typeof pub.ObservableMapped;
    PubImmutable: typeof pub.PubImmutable;
    PubMutable: typeof pub.PubMutable;
    NestedProperty: typeof pub.NestedProperty;
    PubImmutableContributable: typeof pub.PubImmutableContributable;
    PubMutableContributable: typeof pub.PubMutableContributable;
    ObservableDispatcher: typeof dispatcher.ObservableDispatcher;
    instanceObservableDispatcher: Readonly<dispatcher.ObservableDispatcher>;
}>;
export declare const SubMixin: typeof sub.Mixin;
export declare function reactive<V>(dependencies: pub.Observable<any>[], fn: (...values: any[]) => V): pub.ObservableMapped<V>;
export declare function reactivePromise<V>(dependencies: pub.Observable<any>[], initial: V, fn: (...values: any[]) => Promise<V>): pub.ObservableMappedPromise<V>;
