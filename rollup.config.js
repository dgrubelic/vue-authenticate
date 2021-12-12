import { uglify } from 'rollup-plugin-uglify';
import pkg from './package.json';

export default {
    input: 'src/index.js',
    plugins: [
        uglify({
            sourcemap: true
        })
    ],
    output: [
        {
            name: 'vue-authenticate',
            file: pkg.browser,
            format: 'umd',
            sourcemap: true
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }
    ]
};