// rollup.config.js
import typescript from '@rollup/plugin-typescript';

import { readFileSync } from 'fs';

const pluginHeader = readFileSync('src/plugin_header.ts');

export default {
  external: ['rmmz-types'],
  input: 'src/KC_Mirrors.ts',
  output: {
    name: 'KCDev.Mirrors',
    format: 'iife',
    sourcemap: true,
    interop: 'esModule',
    banner: pluginHeader,
    dir: 'build',
    generatedCode: {
      constBindings: true,
      arrowFunctions: true
    },
    globals: {
      'rmmz-types': 'window'
    }
  },
  plugins: [typescript()]
};

