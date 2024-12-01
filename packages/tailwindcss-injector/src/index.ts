export function bar() {
  return 'foo'
}
// import __cjs_url__ from 'url';
// import __cjs_path__ from 'path';
// import __cjs_mod__ from 'module';
// const __filename = __cjs_url__.fileURLToPath(import.meta.url);
// const __dirname = __cjs_path__.dirname(__filename);
// const require = __cjs_mod__.createRequire(import.meta.url);
export function getDirname() {
  return __dirname
}

export enum xx {
  id,
  dd,
}
