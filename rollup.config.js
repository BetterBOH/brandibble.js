import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/brandibble.js',
  external: Object.keys(pkg.dependencies),
  output: {
    file: pkg.main,
    format: 'cjs',
  },
  plugins: [
    resolve({
      module: true,
      main: true,
    }),
    babel({
      babelrc: false,
      presets: [['env', { modules: false }]],
      plugins: [
        'transform-class-properties',
        'transform-object-rest-spread',
        'external-helpers',
        '@babel/plugin-transform-object-assign',
      ],
      exclude: 'node_modules/**',
    }),
  ],
};
