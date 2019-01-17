import { Observable } from "./pub";
export declare type ObservableValue<T> = T extends Observable<infer V> ? V : never;
export declare type ObservableValueTuple<D> = {
    [P in keyof D]: ObservableValue<D[P]>;
};
declare type TupleToUnion<T> = T extends Array<infer E> ? E : never;
export declare type ObservableValueUnion<D> = TupleToUnion<ObservableValueTuple<D>>;
export {};
