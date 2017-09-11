const {Pub} = require('../dist/index.js')

const {testAll, test, assert} = require('./util')

testAll(
    test('factory method works')
        .for([true, true], [true, false], [false, true], [false, false])
        .expectsSuccess(pair => {
            const pub = Pub.create(0, '', {mutable: pair[0], contributable: pair[1]})
            const {isMutable, isContributable} = pub
            assert.eq(pair[0], isMutable)
            assert.eq(pair[1], isContributable)
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
        .expectsSuccess(() => {
            const pub = Pub.create([], '', {mutable: true, contributable: false})            
            pub.mutate(value => {
                value.push('a')
            })
            assert.eq(pub.value[0], 'a')
        })
)

 


