import { Pub } from './pub';
export declare const mixin: {
    sub<T>(prop: Pub<T>, name?: string): void;
    subAll(...props: Pub<any>[]): void;
    imitate(model: object): void;
};
declare const _default: {
    mixin: {
        sub<T>(prop: Pub<T>, name?: string): void;
        subAll(...props: Pub<any>[]): void;
        imitate(model: object): void;
    };
};
export default _default;
