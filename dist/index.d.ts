import * as pub from './pub';
import * as dispatcher from './dispatcher';
declare const _default: {
    Pub: typeof pub.Pub;
    internals: Readonly<{
        Observable: typeof pub.Observable;
        ObservableMapped: typeof pub.ObservableMapped;
        PubImmutable: typeof pub.PubImmutable;
        PubMutable: typeof pub.PubMutable;
        PubImmutableContributable: typeof pub.PubImmutableContributable;
        PubMutableContributable: typeof pub.PubMutableContributable;
        ObservableDispatcher: typeof dispatcher.ObservableDispatcher;
        instanceObservableDispatcher: Readonly<dispatcher.ObservableDispatcher>;
    }>;
    onAnyUpdate: any;
    subMixin: {
        sub<T>(prop: pub.Pub<T>, name?: string): void;
        subAll(...props: pub.Pub<any>[]): void;
        imitate(model: object): void;
    };
};
export default _default;
