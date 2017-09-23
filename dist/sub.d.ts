import { Pub, Observable } from './pub';
export declare const mixin: {
    subAll(...props: Pub<any>[]): void;
    sub(map: {
        [name: string]: Observable<any>;
    }): void;
    imitate(model: object): void;
};
