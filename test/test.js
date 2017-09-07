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
    test('Observable#bind')
        .expectsSuccess(() => {
            const pub = Pub.create('a', '')
            const mapped = pub.bind(s => s + 'b')
            assert.eq(mapped.value, 'ab')
            pub.value = 'b'
            assert.eq(mapped.value, 'bb')
        }),
    test('unimplemented feature')
        .expectsSuccess(() => {
            const pub = Pub.create([], '')
            pub.mutate(value => {
                value.push('a')
            })
            assert.eq(pub.value[0], 'a')
        })
)

 


