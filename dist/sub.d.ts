import { Pub } from './pub';
export declare const mixin: {
    sub<T>(prop: Pub<T>, name?: string): void;
    subAll(...props: Pub<any>[]): void;
    imitate(model: object): void;
};
