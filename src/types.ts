import { Observable } from "./pub";

export type ObservableValue<T> = T extends Observable<infer V> ? V : never
export type ObservableValueTuple<D> = {[P in keyof D]: ObservableValue<D[P]>}
type TupleToUnion<T> = T extends Array<infer E> ? E : never
export type ObservableValueUnion<D> = TupleToUnion<ObservableValueTuple<D>>

export type PromiseState<V> = {
    state: 'pending'
} | {
    state: 'done'
    result: V
} | {
    state: 'error'
    reason: any
}