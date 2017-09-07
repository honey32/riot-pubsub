export declare abstract class Observable<V> {
    readonly value: V;
    trigger(event: 'update' | 'contribute', newValue: V, isReassigned: boolean, oldValue?: V): void;
    on(event: 'update' | 'contribute', fn: (newValue: V, isReassigned: boolean, oldValue?: V) => any): void;
    bind<B>(fn: (V) => B): MappedObs<B, V>;
}
export declare class MappedObs<V, B> extends Observable<V> {
    private _value;
    constructor(fn: (B) => V, base: Observable<B>);
    readonly value: V;
}
export declare class Pub<V> extends Observable<V> {
    name: string;
    isMutable: boolean;
    private _value;
    constructor(value: V, name: string, isMutable?: boolean);
    value: V;
}
declare const _default: {
    Pub: typeof Pub;
};
export default _default;
