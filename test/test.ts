import { Pub, PubWithProps, Mixin, ObservableDispatcher } from '../src/index'

import { testAll, test, assert } from './util'

const dispatcher = new ObservableDispatcher()

testAll(
    test<boolean>('factory method works')
        .for(true)
        .expectsSuccess(isMutable => {
            const pub = dispatcher.pub(0, isMutable)
            assert.eq(pub.isMutable, isMutable)
        }),
    test<Pub<string>>('Pub#value property works')
        .for(dispatcher.pub('a'), dispatcher.pub('b'))
        .expectsSuccess(pub => {
            pub.value = 'b'
            assert.eq(pub.value, 'b')
        }),
    test<Pub<string>>('event fired correctly')
        .for(dispatcher.pub('a'))
        .promisesTruth(pub => new Promise((resolve, reject) => {
            pub.on('update', ({newValue}) => resolve(newValue === 'b'))
            pub.trigger({ type: 'update', newValue: 'b', isReassigned: true })
        })),
    test<[Pub<string>, Pub<string>, string, string]>('onAnyUpdate works')
        .for([dispatcher.pub('a'), dispatcher.pub('b'), 'pubA', 'A'])
        .promisesTruth(set =>
            new Promise((resolve, reject) => {
                const [a, b, changeName, changeValue] = set
                dispatcher.onAnyUpdate([a, b], (e) => 
                    resolve(true)
                )
                a.value = changeValue
                setTimeout(() => reject(), 1000)
            })
        ),
    test<Pub<string>>('Immutable Pub prevents update correctly')
        .for(dispatcher.pub('a', false), dispatcher.contributable('a', false))
        .promisesTruth(pub => 
            new Promise((resolve, reject) => {
                pub.on('update', () => reject('update'))
                pub.value = 'a'
                setTimeout(() => resolve(true), 1000)
            })  
        ),
    test<Pub<string>>('Immutable Pub prevent contribution')
        .for(dispatcher.contributable('a', false))
        .promisesTruth(pub => new Promise((resolve, reject) => {
            pub.on('contribute', () => reject('contribute'))
            setTimeout(() => resolve(true), 1000)
        })),
    test('reactive')
        .expectsSuccess(() => {
            const pub = dispatcher.pub('a')
            const pub2 = dispatcher.pub(1)
            const mapped = dispatcher.reactive(pub, pub2)((value, value2) => value + 'b')
            assert.eq(mapped.value, 'ab')
            pub.value = 'b'
            assert.eq(mapped.value, 'bb')
        }),
    test('reactivePromise')
        .promisesTruth(() => new Promise((resolve, reject) => {
            const pub = dispatcher.pub('a')
            const mapped = dispatcher.reactivePromise(pub)('a', (s) => Promise.resolve(s + 'b'))
            mapped.on('update', e => {
                resolve(mapped.value === 'bb')
            })
            pub.value = 'b'

            setTimeout(() => reject(), 1000)
        })),
    test('mutable pub')
        .expectsSuccess(() => {
            const pub = dispatcher.pub([])            
            pub.mutate(value => {
                value.push('a')
            })
            assert.eq(pub.value[0], 'a')
        }),
    test<string[]>('mixin')
        .for(['a', 'b', 'prop'])
        .expectsSuccess(set => {
            const [prev, newValue, propName] = set
            const pub = dispatcher.pub(prev)
            let dispatched = false
            const mixin = new Mixin(() => { dispatched = true })
            mixin.sub({[propName]: pub})
            assert.eq(prev, mixin[propName])
            assert.eq(true, dispatched)
            pub.value = newValue
            assert.eq(newValue, mixin[propName])
        }),
    test<string[]>('nesting of property')
        .for(['A', 'AA', 'B', 'BB'])
        .expectsSuccess(([v1, v2, v3, v4]) => {
            function assertValue(v) {
                assert.eq(pub.a.value, v)
            }
            class HasA {
                a: Pub<string>
                constructor(a) { this.a = dispatcher.pub(a) }
            }
            const A = new HasA(v1)
            const B = new HasA(v3)
            
            
            class PubHasA extends PubWithProps<HasA> {
                a = this.createProperty<string>(value => value.a)

                constructor() {
                    super(dispatcher, null)
                }
            }
            const pub = new PubHasA()
            
            assertValue(null)
            pub.value = A
            A.a.value = v2
            assertValue(v2)
            pub.value = B
            assertValue(v3)
            B.a.value = v4
            assertValue(v4)
            A.a.value = v1
            pub.value = A
            assertValue(v1)
            pub.value = null
            assertValue(null)
        })
)

 


