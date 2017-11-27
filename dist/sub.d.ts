import { Observable } from './pub';
export declare class Mixin {
    dispatcher: () => any;
    constructor(dispatcher: () => any);
    sub(map: {
        [name: string]: Observable<any>;
    }): void;
    imitate(model: object): void;
}
