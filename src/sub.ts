import { Pub, Observable } from './pub'

function subscribe(context: any, prop: Observable<any>, name: string) {
    context.update({[name]: prop.value})
    prop.on('update', (newValue) => {
        context.update({[name]: newValue})
    })
}

export const mixin = {
    subAll(...props: Pub<any>[]) {
        props.forEach(prop => {
            subscribe(this, prop, prop.name)
        })
    },
    sub(map: {[name: string]: Observable<any>}) {
        for (const key in map) {
            subscribe(this, map[key], key)
        }
    },
    imitate(model: object) {
        for (const key in model) {
            const prop = model[key]
            if (prop && (typeof prop.on === 'function')) {
                subscribe(this, <Observable<any>>prop, prop.name || key)
            }
        }
    }
}