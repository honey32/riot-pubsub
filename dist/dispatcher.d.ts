import { Observable } from './pub';
export declare class ObservableDispatcher {
    observable: any;
    constructor();
    trigger<V>(object: object, event: 'update' | 'contribute', newValue: V, isReassign: boolean, oldValue?: V): void;
    on<V>(object: object, event: 'update' | 'contribute', fn: (newValue: V, isReassign: boolean, oldValue?: V) => any): void;
    off(event: 'update' | 'contribute', fn: (newValue: any, isReassign: boolean, oldValue?: any) => any): void;
    onAnyUpdate(objects: Observable<any>[], fn: (...args: any[]) => any): void;
}
export declare const instance: Readonly<ObservableDispatcher>;
