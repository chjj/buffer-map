/*!
 * buffer-map.js - buffer map for javascript
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/buffer-map
 */

'use strict';

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
    return this.map.get(toKey(key));
  }

  has(key) {
    return this.map.has(toKey(key));
  }

  set(key, value) {
    this.map.set(toKey(key), value);
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

  *entries() {
    for (const [key, value] of this.map)
      yield [Buffer.from(key, 'binary'), value];
  }

  *keys() {
    for (const key of this.map.keys())
      yield Buffer.from(key, 'binary');
  }

  values() {
    return this.map.values();
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
    this.map.set(toKey(key), key);
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

function toKey(key) {
  if (!Buffer.isBuffer(key))
    throw new TypeError('Non-buffer passed to buffer map/set.');

  return key.toString('binary');
}

/*
 * POST
 */

{
  const assert = (ok) => {
    if (!ok)
      throw new Error('BufferMap: POST failed.');
  };

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
