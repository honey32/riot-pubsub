import { ObservableDispatcher, Listener, UpdateEvent } from "./dispatcher";
import { ObservableValueUnion, ObservableValueTuple } from "./types";
export declare abstract class Observable<V> {
    dispatcher: ObservableDispatcher;
    readonly value: V;
    constructor(dispatcher: ObservableDispatcher);
    trigger(event: UpdateEvent<V>): void;
    on(event: 'update' | 'contribute', fn: (event: UpdateEvent<V>) => any): Listener<V>;
    off(event: 'update' | 'contribute', fn: Listener<V>): void;
}
export declare abstract class ObservableSubscribing<V, D extends Observable<any>[]> extends Observable<V> {
    protected _value: V;
    protected dependencies: D;
    readonly value: V;
    protected updateValue(newValue: V): void;
    constructor(dispatcher: ObservableDispatcher, target: D);
    abstract action(event: UpdateEvent<ObservableValueUnion<D>>): void;
}
export declare namespace ObservableSubscribing {
    type Provider<V, D extends any[], R extends ObservableSubscribing<V, D>> = (dispatcher: ObservableDispatcher, ...dependencies: D) => R;
}
export declare class ObservableMapped<V, D extends Observable<any>[]> extends ObservableSubscribing<V, D> {
    private fn;
    constructor(dispatcher: ObservableDispatcher, _dependencies: D, fn: (...args: ObservableValueTuple<D>) => V);
    static create<V, D extends Observable<any>[]>(fn: (...args: ObservableValueTuple<D>) => V): ObservableSubscribing.Provider<V, D, ObservableMapped<V, D>>;
    action(event: UpdateEvent<ObservableValueUnion<D>>): void;
    sync(): void;
}
export declare class ObservablePromise<V, O extends Observable<Promise<V>>> extends ObservableSubscribing<V, [O]> {
    static create<V, O extends Observable<Promise<V>>>(): ObservableSubscribing.Provider<V, [O], ObservablePromise<V, O>>;
    action(event: UpdateEvent<Promise<V>>): void;
}
export declare class Pub<V> extends Observable<V> {
    protected _value: V;
    constructor(dispatcher: ObservableDispatcher, value: V);
    value: V;
    mutate(fn: (value: V) => any): void;
}
export declare class PubContributable<V> extends Pub<V> {
    contribute(newValue: V): void;
    contributeMutation(fn: (value: V) => any): void;
}
