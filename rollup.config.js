// rollup.config.js
import typescript from '@rollup/plugin-typescript';

import externalGlobals from 'rollup-plugin-external-globals';

import { readFileSync } from 'fs';

const pluginHeader = readFileSync('src/plugin_header.ts');

export default {
  input: 'src/KC_Mirrors.ts',
  output: {
    format: 'cjs',
    sourcemap: true,
    interop: 'esModule',
    banner: pluginHeader,
    dir: 'build'
  },
  plugins: [typescript(), externalGlobals({ 'rmmz-types': 'window' })]
};

