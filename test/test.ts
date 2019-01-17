import { Pub, Mixin, ObservableDispatcher, ObservableMapped, PubContributable, ObservablePromise } from '../src/index'

import { testAll, test, assert } from './util'

const dispatcher = new ObservableDispatcher()

testAll(
    test('factory method works')
        .expectsSuccess(() => {
            const pub = dispatcher.create(0)
            if(pub['contribute']) {
                throw 'Happeningly Contributable'
            }
            const pub2 = dispatcher.create(0, 'contributable')
            pub2.contribute(1)
        }),
    test<Pub<string>>('Pub#value property works')
        .for(dispatcher.create('a'), dispatcher.create('b'))
        .expectsSuccess(pub => {
            pub.value = 'b'
            assert.eq(pub.value, 'b')
        }),
    test<Pub<string>>('event fired correctly')
        .for(dispatcher.create('a'))
        .promisesTruth(pub => new Promise((resolve, reject) => {
            pub.on('update', ({newValue}) => resolve(newValue === 'b'))
            pub.trigger({ type: 'update', newValue: 'b', isReassigned: true })
        })),
    test<[Pub<string>, Pub<string>, string, string]>('onAnyUpdate works')
        .for([dispatcher.create('a'), dispatcher.create('b'), 'pubA', 'A'])
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
    test<Pub<string>>('prevents update if no change')
        .for(dispatcher.create('a'), dispatcher.create('a', 'contributable'))
        .promisesTruth(pub => 
            new Promise((resolve, reject) => {
                pub.on('update', () => reject('update'))
                pub.value = 'a'
                setTimeout(() => resolve(true), 1000)
            })  
        ),
    test<Pub<string>>('Pub prevent contribution if no change')
        .for(dispatcher.create('a', 'contributable'))
        .promisesTruth(pub => new Promise((resolve, reject) => {
            pub.on('contribute', () => reject('contribute'))
            setTimeout(() => resolve(true), 1000)
        })),
    test('reactive')
        .expectsSuccess(() => {
            const pub = dispatcher.create('a')
            const pub2 = dispatcher.create(1)
            const mapped = dispatcher.subscribing(pub, pub2)(ObservableMapped.create((v1, v2) => v1 + 'b'))
            assert.eq(mapped.value, 'ab')
            pub.value = 'b'
            assert.eq(mapped.value, 'bb')
        }),
    test('promise')
        .promisesTruth(() => new Promise((resolve, reject) => {
            const pub = dispatcher.create(Promise.resolve('a'))
            const mapped = dispatcher.subscribing(pub)(ObservablePromise.create())

            mapped.on('update', e => {
                resolve(mapped.value === 'b')
            })
            pub.value = Promise.resolve('b')

            setTimeout(() => reject(), 1000)
        })),
    test('mutable pub')
        .expectsSuccess(() => {
            const pub = dispatcher.create([])            
            pub.mutate(value => {
                value.push('a')
            })
            assert.eq(pub.value[0], 'a')
        }),
    test<string[]>('mixin')
        .for(['a', 'b', 'prop'])
        .expectsSuccess(set => {
            const [prev, newValue, propName] = set
            const pub = dispatcher.create(prev)
            let dispatched = false
            const mixin = new Mixin(() => { dispatched = true })
            mixin.sub({[propName]: pub})
            assert.eq(prev, mixin[propName])
            assert.eq(true, dispatched)
            pub.value = newValue
            assert.eq(newValue, mixin[propName])
        }),
)

 


