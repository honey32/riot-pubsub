const {Pub} = require('../dist/index.js')

const {testAll, test} = require('./util')

testAll(
    test('Pub#value property works')
        .expectsSuccess(() => {
            const pub = Pub.create('a', 'publisherA')
            pub.value = 'b'
            console.assert(pub.value === 'b')
        }),
    test('event fired correctly')
        .promisesTruth(() => new Promise((resolve, reject) => {
            const pub = Pub.create('a', 'publisherA')
            pub.on('update', (newValue) => resolve(newValue === 'b'))
            pub.trigger('update', 'b')
        })),
    test('Observable#bind')
        .expectsSuccess(() => {
            const pub = Pub.create('a', 'publisherA')
            const mapped = pub.bind(s => s + 'b')
            console.assert(mapped.value === 'ab', `mismatch before change ${mapped.value} === ${'ab'}`)
            pub.value = 'b'
            console.assert(mapped.value === 'bb', 'mismatch after change')
        }),
    test('unimplemented feature')
        .expectsSuccess(() => {
            const pub = Pub.create([], 'publisherA')
            pub.mutate(value => {
                value.push('a')
            })
            console.assert(pub.value[0] === 'a')
        })
)

 


