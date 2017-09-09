import * as pub from './pub';
import * as dispatcher from './dispatcher';
export declare const Pub: typeof pub.Pub;
export declare const internals: Readonly<{
    Observable: typeof pub.Observable;
    ObservableMapped: typeof pub.ObservableMapped;
    PubImmutable: typeof pub.PubImmutable;
    PubMutable: typeof pub.PubMutable;
    PubImmutableContributable: typeof pub.PubImmutableContributable;
    PubMutableContributable: typeof pub.PubMutableContributable;
    ObservableDispatcher: typeof dispatcher.ObservableDispatcher;
    instanceObservableDispatcher: Readonly<dispatcher.ObservableDispatcher>;
}>;
export declare const subMixin: {
    sub<T>(prop: pub.Pub<T>, name?: string): void;
    subAll(...props: pub.Pub<any>[]): void;
    imitate(model: object): void;
};
