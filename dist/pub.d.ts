export declare abstract class Observable<V> {
    readonly value: V;
    trigger(event: 'update' | 'contribute', newValue: V, isReassigned: boolean, oldValue?: V): void;
    on(event: 'update' | 'contribute', fn: (newValue: V, isReassigned: boolean, oldValue?: V) => any): ((newValue: V, isReassigned: boolean, oldValue?: V) => any);
    off(event: 'update' | 'contribute', fn: (newValue: V, isReassigned: boolean, oldValue?: V) => any): void;
}
export declare class ObservableMapped<V> extends Observable<V> {
    private _value;
    constructor(dependencies: Observable<any>[], fn: (...args: any[]) => V);
    readonly value: V;
}
export declare class ObservableMappedPromise<V> extends Observable<V> {
    private _value;
    constructor(dependencies: Observable<any>[], initial: V, fn: (...args: any[]) => Promise<V>);
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
    protected _value: V;
    readonly isMutable: boolean;
    readonly isContributable: boolean;
    constructor(value: V);
    value: V;
    static create<V>(value: V, flag: FlagMutable & FlagContributable): PubMutableContributable<V>;
    static create<V>(value: V, flag: FlagMutable): PubMutable<V>;
    static create<V>(value: V, flag: FlagContributable): PubImmutableContributable<V>;
    static create<V>(value: V, flag?: Flag): PubImmutable<V>;
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
export declare class PubWithProps<V> extends PubMutable<V> {
    constructor(value: V);
    createProperty<A>(valueProvider: (value: V) => Pub<A>, mutable?: boolean): any;
}
export declare class NestedProperty<P, V> extends Observable<V> {
    private _value;
    readonly value: V;
    constructor(parent: PubWithProps<P>, provider: (parentValue: P) => Observable<V>);
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
