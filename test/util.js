class TestUnit {
    /**
     * 
     * @param {string} description 
     */
    constructor(description) {
        this.description = description
        this.promise = Promise.resolve()
    }

    /**
     * 
     * @param {function} fn 
     */
    expectsSuccess(fn) {
        this.promise = new Promise((resolve, reject) => {
            try {
                fn()
                resolve()
            } catch(e) {
                reject(e)
            }
        })
        return this
    }

    /**
     * 
     * @param {function} fn 
     */
    promisesTruth(fn) {
        this.promises = fn().then(bool => new Promise((resolve, reject) => {
            if (bool) {
                resolve()
            } else {
                reject()
            }
        }))
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

module.exports = {
    test, testAll
}