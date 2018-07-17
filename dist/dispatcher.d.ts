import { Observable, ObservableMapped, ObservableMappedPromise, Pub, PubContributable } from './pub';
export declare type Listener<A> = (obj: Observable<A>, newValue: A, isReassign: boolean, oldValue?: A) => void;
export declare class ObservableDispatcher {
    private observable;
    updateListeners: Listener<any>[];
    contributeListeners: Listener<any>[];
    trigger<V>(object: Observable<V>, event: 'update' | 'contribute', newValue: V, isReassign: boolean, oldValue?: V): void;
    on<V>(object: Observable<V>, event: 'update' | 'contribute', fn: (newValue: V, isReassign: boolean, oldValue?: V) => any): Listener<V>;
    off(event: 'update' | 'contribute', fn: Listener<any>): void;
    onAnyUpdate(objects: Observable<any>[], fn: (obj: any, newValue: any, isReassign: boolean, oldValue?: any) => any): Listener<any>;
    pub<V>(value: V, isMutable?: boolean): Pub<V>;
    contributable<V>(value: V, isMutable?: boolean): PubContributable<V>;
    reactive<A1, A2, A3, V>(dependencies: [Observable<A1>, Observable<A2>, Observable<A3>], fn: (v1: A1, v2: A2, v3: A3) => V): ObservableMapped<V>;
    reactive<A1, A2, V>(dependencies: [Observable<A1>, Observable<A2>], fn: (v1: A1, v2: A2) => V): ObservableMapped<V>;
    reactive<A1, V>(dependencies: [Observable<A1>], fn: (v1: A1) => V): ObservableMapped<V>;
    reactivePromise<A1, A2, A3, V>(dependencies: [Observable<A1>, Observable<A2>, Observable<A3>], initial: V, fn: (v1: A1, v2: A2, v3: A3) => V): ObservableMappedPromise<V>;
    reactivePromise<A1, A2, V>(dependencies: [Observable<A1>, Observable<A2>], initial: V, fn: (v1: A1, v2: A2) => V): ObservableMappedPromise<V>;
    reactivePromise<A1, V>(dependencies: [Observable<A1>], initial: V, fn: (v1: A1) => V): ObservableMappedPromise<V>;
}
