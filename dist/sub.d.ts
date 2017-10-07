import { Observable } from './pub';
export declare const mixin: {
    sub(map: {
        [name: string]: Observable<any>;
    }): void;
    imitate(model: object): void;
};
