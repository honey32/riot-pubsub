const lib = require('../dist/index.js')

const {testAll, test} = require('./util')

testAll(
    test('Pub#value property works')
        .expectsSuccess(() => {
            const pub = new lib.pub.Pub('a', 'publisherA')
            pub.value = 'b'
            console.assert(pub.value === 'b')
        }),
    test('event fired correctly')
        .promisesTruth(() => new Promise((resolve, reject) => {
            const pub = new lib.pub.Pub('a', 'publisherA')
            pub.on('update', (newValue) => resolve(newValue))
            pub.trigger('update', 'b')
        })),
    test('unimplemented feature')
        .expectsSuccess(() => {
            const pub = new lib.pub.Pub([], 'publisherA')
            pub.mutate(value => {
                value.push('a')
            })
            console.assert(pub.value[0] === 'a')
        })
)

 


