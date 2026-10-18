import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';

const videoId = '11111111-1111-4111-8111-111111111111';
const source = readFileSync(new URL('../lib/video/providers/bunny-provider.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
} }).outputText;

function fixture({ metadata = {}, httpStatus = 200, networkError = false, invalidJson = false } = {}) {
  const calls = []; const exports = {};
  vm.runInNewContext(compiled, {
    exports, require: (name) => { assert.equal(name, 'crypto'); return crypto; },
    process: { env: { BUNNY_STREAM_LIBRARY_ID: '42', BUNNY_STREAM_API_KEY: 'private-api-key', BUNNY_STREAM_TOKEN_KEY: 'private-token' } },
    URL, Buffer, AbortSignal,
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (networkError) throw new Error('network failure');
      return { ok: httpStatus === 200, status: httpStatus, json: async () => {
        if (invalidJson) throw new SyntaxError('Invalid JSON');
        return { guid: videoId, videoLibraryId: 42, length: 30, status: 3, encodeProgress: 100, ...metadata };
      } };
    },
  });
  return { provider: new exports.BunnyStreamProvider(), calls };
}

test('Bunny allows a playable resolution and fully encoded video using their authoritative duration', async () => {
  for (const status of [3, 4]) {
    const f = fixture({ metadata: { status, length: 29.96, encodeProgress: 0 } });
    const details = await f.provider.getVideoDetails(videoId);
    assert.equal(details.status, 'ready'); assert.equal(details.durationSeconds, 29.96);
    assert.equal(details.encodingProgress, 0);
    assert.equal(f.calls[0].url, `https://video.bunnycdn.com/library/42/videos/${videoId}`);
    assert.equal(f.calls[0].options.cache, 'no-store');
    assert.equal(f.calls[0].options.headers.AccessKey, 'private-api-key');
    assert.ok(f.calls[0].options.signal instanceof AbortSignal);
  }
});

test('Bunny queued, encoding and upload states stay pending; encoding/upload failures stay failed', async () => {
  for (const status of [0, 1, 2, 6, 7]) {
    const details = await fixture({ metadata: { status, length: 0, encodeProgress: 0 } }).provider.getVideoDetails(videoId);
    assert.equal(details.status, 'processing'); assert.equal(details.durationSeconds, 0);
  }
  for (const status of [5, 8]) {
    assert.equal((await fixture({ metadata: { status } }).provider.getVideoDetails(videoId)).status, 'failed');
  }
});

test('Bunny metadata errors never masquerade as a ready video', async () => {
  for (const options of [{ httpStatus: 401 }, { httpStatus: 404 }, { httpStatus: 503 }, { networkError: true },
    { invalidJson: true }, { metadata: { status: 99 } }, { metadata: { status: 'toString' } },
    { metadata: { guid: 'different-video' } }, { metadata: { videoLibraryId: 99 } }]) {
    const f = fixture(options);
    await assert.rejects(() => f.provider.getVideoDetails(videoId), (error) => {
      assert.match(error.message, /Bunny video metadata/);
      assert.doesNotMatch(error.message, /private-api-key|private-token/);
      return true;
    });
  }
});

test('Bunny does not invent a duration for invalid or missing metadata', async () => {
  for (const length of [undefined, null, '30', -1, Infinity, NaN]) {
    assert.equal((await fixture({ metadata: { length } }).provider.getVideoDetails(videoId)).durationSeconds, 0);
  }
});
