import { Pub, Observable } from './pub'

export class Mixin {
    constructor (public dispatcher: () => any) {}

    sub(map: {[name: string]: Observable<any>}) {
        for (const key in map) {
            (<any>this)[key] = map[key].value
            this.dispatcher()
            map[key].on('update', () => {
                (<any>this)[key] = map[key].value
                this.dispatcher()
            })
        }
    }

    imitate(model: object) {
        for (const key in model) {
            const prop = model[key]
            if (prop && (typeof prop.on === 'function')) {
                (<any>this)[key] = prop.value
                this.dispatcher()
                prop.on('update', () => {
                    (<any>this)[key] = prop.value
                    this.dispatcher()
                })
            }
        }
    }
}