const {Pub, PubWithProps, SubMixin, reactive, internals } = require('../dist/index.js')

const {testAll, test, assert} = require('./util')

testAll(
    test('factory method works')
        .for([true, true], [true, false], [false, true], [false, false])
        .expectsSuccess(pair => {
            const [mutable, contributable] = pair
            const pub = Pub.create(0, { mutable, contributable })

            assert.eq(pub.isMutable, mutable)
            assert.eq(pub.isContributable, contributable)
        }),
    test('Pub#value property works')
        .for(Pub.create('a'), Pub.create('b'))
        .expectsSuccess(pub => {
            pub.value = 'b'
            assert.eq(pub.value, 'b')
        }),
    test('event fired correctly')
        .for(Pub.create('a'))
        .promisesTruth(pub => new Promise((resolve, reject) => {
            pub.on('update', (newValue) => resolve(newValue === 'b'))
            pub.trigger('update', 'b')
        })),
    test('onAnyUpdate works')
        .for([Pub.create('a'), Pub.create('b'), 'pubA', 'A'])
        .promisesTruth(set =>
            new Promise((resolve, reject) => {
                const [a, b, changeName, changeValue] = set
                internals.instanceObservableDispatcher
                    .onAnyUpdate([a, b], (name, newValue) => 
                        resolve(true)
                    )
                a.value = changeValue
                setTimeout(() => reject(), 1000)
            })
        ),
    test('Immutable Pub prevents update correctly')
        .for(Pub.create('a'), Pub.create('a', {contributable: true}))
        .promisesTruth(pub => 
            new Promise((resolve, reject) => {
                pub.on('update', () => reject('update'))
                pub.value = 'a'
                setTimeout(() => resolve(true), 1000)
            })  
        ),
    test('Immutable Pub prevent contribution')
        .for(Pub.create('a', {contributable: true}))
        .promisesTruth(pub => new Promise((resolve, reject) => {
            pub.on('contribute', () => reject('contribute'))
            setTimeout(() => resolve(true), 1000)
        })),
    test('reactive')
        .expectsSuccess(() => {
            const pub = Pub.create('a')
            const mapped = reactive([pub], (value) => value + 'b')
            assert.eq(mapped.value, 'ab')
            pub.value = 'b'
            assert.eq(mapped.value, 'bb')
        }),
    test('reactivePromise')
        .promisesTruth(() => new Promise((resolve, reject) => {
            const pub = Pub.create('a')
            const mapped = reactive([pub], () => pub.value + 'b')
            mapped.on('update', newValue => {
                resolve(mapped.value === 'bb')
            })
            pub.value = 'b'

            setTimeout(() => reject(), 1000)
        })),
    test('mutable pub')
        .for(true, false)
        .expectsSuccess(contributable => {
            const pub = Pub.create([], {mutable: true, contributable})            
            pub.mutate(value => {
                value.push('a')
            })
            assert.eq(pub.value[0], 'a')
        }),
    test('mixin')
        .for(['a', 'b', 'prop'])
        .expectsSuccess(set => {
            const [prev, newValue, propName] = set
            const pub = Pub.create(prev)
            let dispatched = false
            const mixin = new SubMixin(() => { dispatched = true })
            mixin.sub({[propName]: pub})
            assert.eq(prev, mixin[propName])
            assert.eq(true, dispatched)
            pub.value = newValue
            assert.eq(newValue, mixin[propName])
        }),
    test('nesting of property')
        .for(['A', 'AA', 'B', 'BB'])
        .expectsSuccess(([v1, v2, v3, v4]) => {
            function assertValue(v) {
                assert.eq(pub.a.value, v)
            }
            class HasA {
                constructor(a) { this.a = Pub.create(a) }
            }
            const A = new HasA(v1)
            const B = new HasA(v3)
            
            const pub = new PubWithProps(null)
            
            pub.a = pub.createProperty(value => value.a)
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

 


