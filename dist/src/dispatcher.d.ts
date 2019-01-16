import { Observable, ObservableMapped, ObservableMappedPromise, Pub, PubContributable } from './pub';
export declare type Listener<A> = (obj: Observable<A>, newValue: A, isReassign: boolean, oldValue?: A) => void;
export declare type EventArgs<A> = [A, boolean, A];
declare type ObservableValue<T> = T extends Observable<infer V> ? V : never;
declare type ObservableValueTuple<D> = {
    [P in keyof D]: ObservableValue<D[P]>;
};
export declare class ObservableDispatcher {
    private observable;
    updateListeners: Listener<any>[];
    contributeListeners: Listener<any>[];
    trigger<V>(object: Observable<V>, event: 'update' | 'contribute', newValue: V, isReassign: boolean, oldValue?: V): void;
    on<V>(object: Observable<V>, event: 'update' | 'contribute', fn: (newValue: V, isReassign: boolean, oldValue?: V) => any): Listener<V>;
    off(event: 'update' | 'contribute', fn: Listener<any>): void;
    onAnyUpdate(objects: Observable<any>[], fn: (obj: Observable<any>, newValue: any, isReassign: boolean, oldValue?: any) => any): Listener<any>;
    pub<V>(value: V, isMutable?: boolean): Pub<V>;
    contributable<V>(value: V, isMutable?: boolean): PubContributable<V>;
    reactive<V, D extends Observable<any>[]>(...dependencies: D): (fn: (...values: ObservableValueTuple<D>) => V) => ObservableMapped<V>;
    reactivePromise<V, D extends Observable<any>[]>(...dependencies: D): (initial: V, fn: (...values: ObservableValueTuple<D>) => Promise<V>) => ObservableMappedPromise<V>;
}
export {};
