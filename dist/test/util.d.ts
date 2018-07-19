export declare class TestUnit<V> {
    description: string;
    promise: Promise<any>;
    sets: V[];
    /**
     *
     * @param {string} description
     */
    constructor(description: string);
    for(...sets: V[]): this;
    /**
     *
     * @param {function} fn
     */
    expectsSuccess(fn: (v: V) => any): this;
    promisesTruth(fn: (v: V) => Promise<boolean>): this;
}
export declare function test<A>(description: string): TestUnit<A>;
/**
 *
 * @param {TestUnit[]} tests
 */
export declare function testAll(...tests: TestUnit<any>[]): void;
export declare const assert: {
    truth(bool: boolean): void;
    false(bool: boolean): void;
    eq<A>(left: A, right: A): void;
};
