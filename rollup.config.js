import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));

export default {
    input: 'src/index.js',
    plugins: [],
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