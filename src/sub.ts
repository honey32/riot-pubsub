import { Pub, Observable } from './pub'

export class Mixin {
    constructor (public action: (_this: any) => any) {}

    sub(map: {[name: string]: Observable<any>}) {
        for (const key in map) {
            (<any>this)[key] = map[key].value
            this.action(<any>this)
            map[key].on('update', () => {
                (<any>this)[key] = map[key].value
                this.action(<any>this)
            })
        }
    }

    imitate(model: object) {
        for (const key in model) {
            const prop = model[key]
            if (prop && (typeof prop.on === 'function')) {
                (<any>this)[key] = prop.value
                this.action(<any>this)
                prop.on('update', () => {
                    (<any>this)[key] = prop.value
                    this.action(<any>this)
                })
            }
        }
    }
}