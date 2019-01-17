import { Observable, ObservableSubscribing, Pub } from "./pub";
import { ObservableDispatcher } from "./dispatcher";

export type ObservableValue<T> = T extends Observable<infer V> ? V : never
export type ObservableValueTuple<D> = {[P in keyof D]: ObservableValue<D[P]>}
type TupleToUnion<T> = T extends Array<infer E> ? E : never
export type ObservableValueUnion<D> = TupleToUnion<ObservableValueTuple<D>>

export type SubscribingProvider<V, D extends any[], R extends ObservableSubscribing<V, D>>
    = (dispatcher: ObservableDispatcher, ...dependencies: D) => R