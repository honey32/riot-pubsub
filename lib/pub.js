import observable from 'riot-observable'

const _value = Symbol()

class Observable {

    /**
     * 
     * @param {*} value 
     */
    constructor(value) {
        this[_value] = value

        observable(this)
    }
}

Observable.symbols._value = _value

export default {
    Observable
}
