import { Observable } from './pub';
export declare class Mixin {
    action: (_this: any) => any;
    constructor(action: (_this: any) => any);
    sub(map: {
        [name: string]: Observable<any>;
    }): void;
    imitate(model: object): void;
}
