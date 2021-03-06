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
export interface Flag {
    muatable?: boolean;
    contributable?: boolean;
}
export interface FlagMutable {
    mutable: true;
    contributable?: boolean;
}
export interface FlagContributable {
    mutable?: boolean;
    contributable: true;
}
export declare abstract class Pub<V> extends Observable<V> {
    name: string;
    protected _value: V;
    readonly isMutable: boolean;
    readonly isContributable: boolean;
    constructor(value: V, name: string);
    value: V;
    static create<V>(value: V, name: string, flag: FlagMutable & FlagContributable): PubMutableContributable<V>;
    static create<V>(value: V, name: string, flag: FlagMutable): PubMutable<V>;
    static create<V>(value: V, name: string, flag: FlagContributable): PubImmutableContributable<V>;
    static create<V>(value: V, name: string, flag?: Flag): PubImmutable<V>;
}
export interface Mutable<V> extends Pub<V> {
    mutate(fn: (value: V) => any): void;
    readonly isMutable: true;
}
export interface Contributable<V> extends Pub<V> {
    contribute(newValue: V): void;
    readonly isContributable: true;
}
export declare class PubImmutable<V> extends Pub<V> {
    readonly isMutable: false;
    readonly isContributable: false;
}
export declare class PubMutable<V> extends Pub<V> implements Mutable<V> {
    readonly isMutable: true;
    readonly isContributable: false;
    mutate(fn: (value: V) => any): void;
}
export declare class PubImmutableContributable<V> extends Pub<V> implements Contributable<V> {
    readonly isMutable: false;
    readonly isContributable: true;
    contribute(newValue: V): void;
}
export declare class PubMutableContributable<V> extends Pub<V> implements Mutable<V>, Contributable<V> {
    readonly isMutable: true;
    readonly isContributable: true;
    contribute(newValue: V): void;
    mutate(fn: (value: V) => any): void;
    contributeMutation(fn: (value: V) => any): void;
}
