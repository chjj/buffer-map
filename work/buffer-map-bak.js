/*!
 * buffer-map.js - buffer map for javascript
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/buffer-map
 */

'use strict';

/*
 * Constants
 */

const DUMMY = Buffer.allocUnsafe(1);
const HAS_PARENT = DUMMY.buffer && typeof DUMMY.buffer.byteLength === 'number';
const HAS_POOL = typeof Buffer.poolSize === 'number';

let AUGMENTABLE = false;

try {
  Buffer.prototype._bstr = undefined;
  Object.defineProperty(DUMMY, '_bstr', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: true
  });
  AUGMENTABLE = DUMMY._bstr === true;
} catch (e) {
  ;
}

const NO_CACHE = true;
const NO_COPY = true;

/**
 * Buffer Map
 */

class BufferMap {
  constructor() {
    this.map = new Map();
  }

  get size() {
    return this.map.size;
  }

  get(key) {
    const item = this.map.get(toKey(key));

    if (!item)
      return undefined;

    return item[1];
  }

  has(key) {
    return this.map.has(toKey(key));
  }

  set(key, value) {
    this.map.set(toKey(key), [copyKey(key), value]);
    return this;
  }

  delete(key) {
    return this.map.delete(toKey(key));
  }

  clear() {
    this.map.clear();
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  entries() {
    return this.map.values();
  }

  *keys() {
    for (const [key] of this.map.values())
      yield key;
  }

  *values() {
    for (const [, value] of this.map.values())
      yield value;
  }
}

/**
 * Buffer Set
 */

class BufferSet {
  constructor() {
    this.map = new Map();
  }

  get size() {
    return this.map.size;
  }

  has(key) {
    return this.map.has(toKey(key));
  }

  add(key) {
    this.map.set(toKey(key), copyKey(key));
    return this;
  }

  delete(key) {
    return this.map.delete(toKey(key));
  }

  clear() {
    this.map.clear();
  }

  [Symbol.iterator]() {
    return this.keys();
  }

  *entries() {
    for (const key of this.map.values())
      yield [key, key];
  }

  keys() {
    return this.map.values();
  }

  values() {
    return this.map.values();
  }
}

/*
 * Helpers
 */

function define(obj, key, value) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value
  });
}

function toKey(key) {
  return key.toString('binary');
}

function toKey_(key) {
  if (!Buffer.isBuffer(key))
    throw new Error('Non-buffer passed as map/set key.');

  if (!NO_CACHE && AUGMENTABLE && key.length <= 64) {
    if (!key._bstr)
      define(key, '_bstr', key.toString('binary'));
    return key._bstr;
  }

  return key.toString('binary');
}

function isSlice(data) {
  if (!HAS_PARENT)
    return false;

  if (data.buffer.byteLength === data.length)
    return false;

  if (HAS_POOL) {
    if (data.buffer.byteLength === Buffer.poolSize)
      return false;
  }

  return true;
}

function copyKey(key) {
  return key;
}

function copyKey_(key) {
  if (!NO_COPY && isSlice(key) && key.length <= 64) {
    const out = Buffer.allocUnsafeSlow(key.length);

    key.copy(out, 0);

    if (AUGMENTABLE && key._bstr)
      define(out, '_bstr', key._bstr);

    return out;
  }

  return key;
}

/*
 * POST
 */

{
  const assert = (ok) => {
    if (!ok)
      throw new Error('BufferMap: POST failed.');
  };

  if (HAS_PARENT) {
    assert(!isSlice(Buffer.alloc(64)));
    assert(!isSlice(Buffer.allocUnsafeSlow(64)));
    assert(!isSlice(Buffer.allocUnsafe(64)));

    if (HAS_POOL)
      assert(!isSlice(Buffer.allocUnsafe(Buffer.poolSize + 1)));

    assert(isSlice(Buffer.alloc(64).slice(0, 32)));
    assert(isSlice(Buffer.allocUnsafeSlow(64).slice(0, 32)));

    if (HAS_POOL) {
      assert(!isSlice(Buffer.allocUnsafe(64).slice(0, 32)));
      assert(isSlice(Buffer.allocUnsafe(Buffer.poolSize + 1).slice(0, 32)));
    }
  }

  {
    const map = new BufferMap();
    const key = Buffer.allocUnsafe(256);

    for (let i = 0; i < 256; i++)
      key[i] = i;

    const copy = Buffer.from(key);

    map.set(key, true);

    assert(map.get(key) === true);
    assert(map.get(copy) === true);
  }

  {
    const map = new BufferMap();
    const key = Buffer.allocUnsafe(64);

    for (let i = 0; i < 64; i++)
      key[i] = i;

    const copy = Buffer.from(key);

    map.set(key, true);

    assert(map.get(key) === true);
    assert(map.get(copy) === true);
  }
}

/*
 * Expose
 */

exports.BufferMap = BufferMap;
exports.BufferSet = BufferSet;

