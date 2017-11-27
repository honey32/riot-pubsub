import { Observable } from './pub';
export declare class Mixin {
    dispatcher: (_this: any) => any;
    constructor(dispatcher: (_this: any) => any);
    sub(map: {
        [name: string]: Observable<any>;
    }): void;
    imitate(model: object): void;
}
