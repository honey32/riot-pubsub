import { Pub } from './pub'

const mixin = {
    subscribe<T>(prop: Pub<T>) {
        console.log(prop.value)
    }
}

export default {
    mixin
}