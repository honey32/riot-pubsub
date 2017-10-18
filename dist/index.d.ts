import * as pub from './pub';
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
export declare const subMixin: {
    sub(map: {
        [name: string]: pub.Observable<any>;
    }): void;
    imitate(model: object): void;
};
export declare function reactive<V>(dependencies: pub.Observable<any>[], fn: () => V): pub.ObservableMapped<V, any>;
export declare function reactivePromise<V>(dependencies: pub.Observable<any>[], initial: V, fn: () => Promise<V>): pub.ObservableMappedPromise<V, any>;
