import { Observable, Pub, PubContributable, ObservableSubscribing } from './pub';
export declare type Listener<A> = (obj: Observable<A>, event: UpdateEvent<A>) => void;
export interface UpdateEvent<V> {
    type: 'update' | 'contribute';
    newValue: V;
    isReassigned: boolean;
    oldValue?: V;
}
export declare class ObservableDispatcher {
    private observable;
    updateListeners: Listener<any>[];
    contributeListeners: Listener<any>[];
    trigger<V>(object: Observable<V>, event: UpdateEvent<V>): void;
    on<V>(object: Observable<V>, event: 'update' | 'contribute', fn: (event: UpdateEvent<V>) => any): Listener<V>;
    off(event: 'update' | 'contribute', fn: Listener<any>): void;
    onAnyUpdate(objects: Observable<any>[], fn: (event: UpdateEvent<any>) => any): Listener<any>;
    create<V>(value: V): Pub<V>;
    create<V>(value: V, cont: 'contributable'): PubContributable<V>;
    subscribing<D extends Observable<any>[]>(...dependencies: D): <V, R extends ObservableSubscribing<V, D>>(fn: ObservableSubscribing.Provider<V, D, R>) => R;
}
