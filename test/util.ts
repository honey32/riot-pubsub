export class TestUnit<V> {
    description: string
    promise: Promise<any>
    sets: V[]

    /**
     * 
     * @param {string} description 
     */
    constructor(description: string) {
        this.description = description
        this.promise = Promise.resolve()
        this.sets = [null]
    }

    for(...sets: V[]) {
        this.sets = sets
        return this
    }

    /**
     * 
     * @param {function} fn 
     */
    expectsSuccess(fn: (v: V) => any) {
        const cases = this.sets.map(set => new Promise((resolve, reject) => {
            try {
                fn(set)
                resolve()
            } catch(e) {
                reject(e)
            }
        }))
        this.promise = Promise.all(cases)
        return this
    }

    promisesTruth(fn: (v: V) => Promise<boolean>) {
        const cases = this.sets.map(set => 
            fn(set).then(bool => new Promise((resolve, reject) => {
                if (bool) {
                    resolve()
                } else {
                    reject()
                }
            })))
        this.promise = Promise.all(cases)
        return this
    }
}


function waitForEnd(tests: TestUnit<any>[]): Promise<any> {
    const length = tests.length
    let count = 0
    let countSuccess = 0
    if (length === 0) {
        return Promise.resolve([])
    }

    return new Promise((resolve, reject) => {
        function onDone(isSuccess) {
            if (isSuccess){
                countSuccess++
            }
            count++

            if (count === length) {
                resolve(countSuccess)
            }
        } 
    
        tests.forEach(test => {
            test.promise.then(() => onDone(true), () => onDone(false))
        })
    })

    
}


function print(test: TestUnit<any>) {
    test.promise.then(() =>
        console.log(test.description + ' : SUCCESS')
    ).catch(err => {
        console.log(test.description + ' : FAILED')    
        console.error(err)
    })
}

export function test<A>(description: string) {
    return new TestUnit<A>(description)
}

/**
 * 
 * @param {TestUnit[]} tests 
 */
export function testAll(...tests: TestUnit<any>[]) {
    waitForEnd(tests).then(countSuccess => {
        console.log('TEST RESULT:')
        console.log(`${countSuccess} of ${tests.length}  SUCCESSFUL.`)
        tests.forEach(test => print(test))
    })
}

export const assert = {
    truth(bool: boolean) {
        console.assert(bool, `expected to be true, but actually ${bool} `)
    },
    false(bool: boolean) {
        console.assert(!bool, `expected to br false, but actually ${bool}`)
    },
    eq<A>(left: A, right: A) {
        console.assert(left === right, `expected equality, but ${left} !== ${right}`)
    }
}