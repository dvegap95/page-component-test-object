const { TextDecoder, TextEncoder } = require('node:util');
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');

globalThis.TextDecoder = TextDecoder;
globalThis.TextEncoder = TextEncoder;
globalThis.ReadableStream = ReadableStream;
globalThis.WritableStream = WritableStream;
globalThis.TransformStream = TransformStream;

globalThis.BroadcastChannel = class BroadcastChannel {
  constructor(_name) {}
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
};

const { fetch, Headers, Request, Response } = require('undici');

Object.assign(globalThis, { fetch, Headers, Request, Response });
