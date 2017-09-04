import pub from './pub.js'

const mixin = {
    /**
     * 
     * @param { Observable } prop 
     */
    subscribe(prop) {
        console.log(prop[pub.Observable.symbols._value])
    }
}

export default {
    mixin
}