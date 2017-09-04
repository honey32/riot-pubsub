import typescript from 'rollup-plugin-typescript2'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
    input: 'src/index.ts',
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
    sourcemap: true,
    plugins: [
        nodeResolve({ jsnext: true }),
        typescript(),
    ],
}