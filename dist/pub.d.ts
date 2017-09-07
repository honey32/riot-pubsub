export declare abstract class Observable<V> {
    readonly value: V;
    trigger(event: 'update' | 'contribute', newValue: V, isReassigned: boolean, oldValue?: V): void;
    on(event: 'update' | 'contribute', fn: (newValue: V, isReassigned: boolean, oldValue?: V) => any): void;
    map<B>(fn: (V) => B): ObservableMapped<B, V>;
}
export declare class ObservableMapped<V, B> extends Observable<V> {
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
    static create<V>(value: V, name: string): Pub<V>;
    static create<V>(value: V, name: string, flag1: 'mutable'): Observable<V>;
}
