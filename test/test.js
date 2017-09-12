const {Pub, subMixin, onAnyUpdate } = require('../dist/index.js')

const {testAll, test, assert} = require('./util')

testAll(
    test('factory method works')
        .for([true, true], [true, false], [false, true], [false, false])
        .expectsSuccess(pair => {
            const [mutable, contributable] = pair
            const pub = Pub.create(0, '', { mutable, contributable })

            assert.eq(pub.isMutable, mutable)
            assert.eq(pub.isContributable, contributable)
        }),
    test('Pub#value property works')
        .for(Pub.create('a', ''), Pub.create('b', ''))
        .expectsSuccess(pub => {
            pub.value = 'b'
            assert.eq(pub.value, 'b')
        }),
    test('event fired correctly')
        .for(Pub.create('a', ''))
        .promisesTruth(pub => new Promise((resolve, reject) => {
            pub.on('update', (newValue) => resolve(newValue === 'b'))
            pub.trigger('update', 'b')
        })),
    test('onAnyUpdate works')
        .for([Pub.create('a', 'pubA'), Pub.create('b', 'pubB'), 'pubA', 'A'])
        .promisesTruth(set =>
            new Promise((resolve, reject) => {
                const [a, b, changeName, changeValue] = set
                onAnyUpdate([a, b], (name, newValue) => resolve(name === changeName && newValue === changeValue))
                a.value = changeValue
                setTimeout(() => reject(), 1000)
            })
        ),
    test('Immutable Pub prevents update correctly')
        .for(Pub.create('a', ''), Pub.create('a', '', {contributable: true}))
        .promisesTruth(pub => 
            new Promise((resolve, reject) => {
                pub.on('update', () => reject('update'))
                pub.value = 'a'
                setTimeout(() => resolve(true), 1000)
            })  
        ),
    test('Immutable Pub prevent contribution')
        .for(Pub.create('a', '', {contributable: true}))
        .promisesTruth(pub => new Promise((resolve, reject) => {
            pub.on('contribute', () => reject('contribute'))
            setTimeout(() => resolve(true), 1000)
        })),
    test('Observable#map')
        .expectsSuccess(() => {
            const pub = Pub.create('a', '')
            const mapped = pub.map(s => s + 'b')
            assert.eq(mapped.value, 'ab')
            pub.value = 'b'
            assert.eq(mapped.value, 'bb')
        }),
    test('mutable pub')
        .for(true, false)
        .expectsSuccess(contributable => {
            const pub = Pub.create([], '', {mutable: true, contributable})            
            pub.mutate(value => {
                value.push('a')
            })
            assert.eq(pub.value[0], 'a')
        }),
    test('mixin')
        .for(['a', 'b', 'prop'])
        .expectsSuccess(set => {
            const [prev, newValue, propName] = set
            const pub = Pub.create(prev, propName)
            const mixin = {...subMixin, update(obj){ Object.assign(this, obj) }}
            mixin.sub(pub)
            assert.eq(prev, mixin[propName])
            pub.value = newValue
            assert.eq(newValue, mixin[propName])
        })
)

 


