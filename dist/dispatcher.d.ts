import { Observable, Pub, PubContributable } from './pub';
export declare class ObservableDispatcher {
    observable: any;
    constructor();
    trigger<V>(object: object, event: 'update' | 'contribute', newValue: V, isReassign: boolean, oldValue?: V): void;
    on<V>(object: object, event: 'update' | 'contribute', fn: (newValue: V, isReassign: boolean, oldValue?: V) => any): void;
    off(event: 'update' | 'contribute', fn: (newValue: any, isReassign: boolean, oldValue?: any) => any): void;
    onAnyUpdate(objects: Observable<any>[], fn: (...args: any[]) => any): void;
    pub<V>(value: V, isMutable?: boolean): Pub<V>;
    contributable<V>(value: V, isMutable?: boolean): PubContributable<V>;
    reactive<A1, A2, A3, V>(dependencies: [Observable<A1>, Observable<A2>, Observable<A3>], fn: (v1: A1, v2: A2, v3: A3) => V): any;
    reactive<A1, A2, V>(dependencies: [Observable<A1>, Observable<A2>], fn: (v1: A1, v2: A2) => V): any;
    reactive<A1, V>(dependencies: [Observable<A1>], fn: (v1: A1) => V): any;
    reactivePromise<A1, A2, A3, V>(dependencies: [Observable<A1>, Observable<A2>, Observable<A3>], initial: V, fn: (v1: A1, v2: A2, v3: A3) => V): any;
    reactivePromise<A1, A2, V>(dependencies: [Observable<A1>, Observable<A2>], initial: V, fn: (v1: A1, v2: A2) => V): any;
    reactivePromise<A1, V>(dependencies: [Observable<A1>], initial: V, fn: (v1: A1) => V): any;
}
