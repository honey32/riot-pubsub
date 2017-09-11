class TestUnit {
    /**
     * 
     * @param {string} description 
     */
    constructor(description) {
        this.description = description
        this.promise = Promise.resolve()
        this.sets = [null]
    }

    /**
     * 
     * @param {any[]} sets 
     */
    for(...sets) {
        this.sets = sets
        return this
    }

    /**
     * 
     * @param {function} fn 
     */
    expectsSuccess(fn) {
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

    /**
     * 
     * @param {function} fn 
     */
    promisesTruth(fn) {
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

/**
 * 
 * @param {TestUnit[]} tests 
 * @return {Promise}
 */
function waitForEnd(tests) {
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

/**
 * 
 * @param {TestUnit} test 
 */
function print(test) {
    test.promise.then(() =>
        console.log(test.description + ' : SUCCESS')
    ).catch(err => {
        console.log(test.description + ' : FAILED')    
        console.error(err)
    })
}

/**
 * 
 * @param {string} description 
 */
function test(description) {
    return new TestUnit(description)
}

/**
 * 
 * @param {TestUnit[]} tests 
 */
function testAll(...tests) {
    waitForEnd(tests).then(countSuccess => {
        console.log('TEST RESULT:')
        console.log(`${countSuccess} of ${tests.length}  SUCCESSFUL.`)
        tests.forEach(test => print(test))
    })
}

const assert = {
    truth(bool) {
        console.assert(bool, `expected to be true, but actually ${bool} `)
    },
    false(bool) {
        console.assert(!bool, `expected to br false, but actually ${bool}`)
    },
    eq(left, right) {
        console.assert(left === right, `expected equality, but ${left} !== ${right}`)
    }
}

module.exports = {
    test, testAll, assert
}