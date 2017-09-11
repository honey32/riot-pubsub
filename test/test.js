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
    test('Immutable Pub prevents update correctly')
        .promisesTruth(() => {
            const cases = [Pub.create('a', ''), Pub.create('a', '', {contributable: true})]
                .map(pub => 
                    new Promise((resolve, reject) => {
                        pub.on('update', () => reject('update'))
                        pub.value = 'a'
                        setTimeout(() => resolve(), 1000)
                    })
                )
            cases.push(new Promise((resolve, reject) => {
                const pub = [Pub.create('a', '', {contributable: true})]
                pub.on('contribute', () => reject('contribute'))
                setTimeout(() => resolve(), 1000)
            }))
            return Promise.all(cases).then(() => true)
        }),
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
            const pub = Pub.create([], '', {mutable: true, contributable: false})            
            pub.mutate(value => {
                value.push('a')
            })
            assert.eq(pub.value[0], 'a')
        })
)

 


