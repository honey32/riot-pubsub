const {Pub} = require('../dist/index.js')

const {testAll, test, assert} = require('./util')

testAll(
    test('Pub#value property works')
        .expectsSuccess(() => {
            const pub = Pub.create('a', '')
            pub.value = 'b'
            assert.eq(pub.value, 'b')
        }),
    test('event fired correctly')
        .promisesTruth(() => new Promise((resolve, reject) => {
            const pub = Pub.create('a', '')
            pub.on('update', (newValue) => resolve(newValue === 'b'))
            pub.trigger('update', 'b')
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
        .expectsSuccess(() => {
            const pub = Pub.create([], '', 'mutable')
            pub.mutate(value => {
                value.push('a')
            })
            assert.eq(pub.value[0], 'a')
        })
)

 


