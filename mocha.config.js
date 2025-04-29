export default {
  require: ['ts-node/register', 'tsconfig-paths/register'],
  extension: ['ts'],
  spec: 'src/**/*.spec.ts',
  loader: 'ts-node/esm',
};
