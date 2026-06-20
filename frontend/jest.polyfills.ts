/**
 * @fileoverview Jest polyfills — Web APIs jsdom omits but our dependencies expect.
 *
 * Loaded via Jest `setupFiles`, before the test environment's modules evaluate.
 * react-router references TextEncoder, which jsdom does not provide.
 */
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextEncoder, TextDecoder });
