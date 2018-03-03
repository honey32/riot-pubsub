import { ObservableDispatcher, Listener } from "./dispatcher";
export declare abstract class Observable<V> {
    dispatcher: ObservableDispatcher;
    readonly value: V;
    constructor(dispatcher: ObservableDispatcher);
    trigger(event: 'update' | 'contribute', newValue: V, isReassigned: boolean, oldValue?: V): void;
    on(event: 'update' | 'contribute', fn: (newValue: V, isReassigned: boolean, oldValue?: V) => any): ((newValue: V, isReassigned: boolean, oldValue?: V) => any);
    off(event: 'update' | 'contribute', fn: Listener<V>): void;
}
export declare class ObservableMapped<V> extends Observable<V> {
    private dependencies;
    private fn;
    private _value;
    constructor(dispatcher: ObservableDispatcher, dependencies: Observable<any>[], fn: (...args: any[]) => V);
    readonly value: V;
    sync(): void;
}
export declare class ObservableMappedPromise<V> extends Observable<V> {
    private dependencies;
    private fn;
    private _value;
    constructor(dispatcher: ObservableDispatcher, dependencies: Observable<any>[], initial: V, fn: (...args: any[]) => Promise<V>);
    readonly value: V;
    sync(): void;
}
export declare class Pub<V> extends Observable<V> {
    isMutable: boolean;
    protected _value: V;
    constructor(dispatcher: ObservableDispatcher, value: V, isMutable?: boolean);
    value: V;
    mutate(fn: (value: V) => any): void;
}
export declare class PubWithProps<V> extends Pub<V> {
    constructor(dispatcher: ObservableDispatcher, value: V);
    createProperty<A>(valueProvider: (value: V) => Pub<A>, mutable?: boolean): NestedProperty<V, A>;
}
export declare class NestedProperty<P, V> extends Observable<V> {
    private _value;
    readonly value: V;
    constructor(parent: PubWithProps<P>, provider: (parentValue: P) => Observable<V>);
}
export declare class PubContributable<V> extends Pub<V> {
    contribute(newValue: V): void;
    contributeMutation(fn: (value: V) => any): void;
}
