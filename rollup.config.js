import nodeResolve from 'rollup-plugin-node-resolve'

export default {
    input: 'lib/index.js',
    output: [
        {
            file: 'dist/index.js',
            format: 'umd',
            name: 'riot-pubsub'
        },
        {
            file: 'dist/es6.index.js',
            format: 'es'
        },
    ],
    plugins: [
        nodeResolve({ jsnext: true })
    ],
}