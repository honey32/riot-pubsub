import { Pub } from './pub';
export declare class ObservableDispatcher {
    observable: any;
    constructor();
    trigger<V>(object: object, event: 'update' | 'contribute', newValue: V, isReassign: boolean, oldValue?: V): void;
    on<V>(object: object, event: 'update' | 'contribute', fn: (newValue: V, isReassign: boolean, oldValue?: V) => any): void;
    onAnyUpdate(objects: Pub<any>[], fn: (propName: string, newValue: any, isReassign: boolean, oldValue?: any) => any): void;
}
export declare const instance: Readonly<ObservableDispatcher>;
