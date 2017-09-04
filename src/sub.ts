import { Pub, Observable } from './pub'

function updateTag(tag: any, propName: string, value: any) {
    tag.update({[propName]: value})
}

const mixin = {
    sub<T>(prop: Pub<T>, name: string | null = '') {
        updateTag(this, name || prop.name, prop.value)
        prop.on('update', (newValue) => {
            updateTag(this, name || prop.name, prop.value)
        })
    },
    subAll(...props: Pub<any>[]) {
        props.forEach(prop => {
            this.sub(prop)
        })
    },
    imitate(model: object) {
        for (const key in model) {
            const prop = model[key]
            if (prop && (typeof prop.on === 'function')) {
                this.sub(<Observable<any>>prop, prop.name || key)
            }
        }
    }
}

export default {
    mixin
}