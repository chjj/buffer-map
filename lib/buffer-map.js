/*!
 * buffer-map.js - buffer map for javascript
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/buffer-map
 */

'use strict';

const {custom} = require('./custom');

/**
 * @typedef {Buffer|ArrayBuffer|ArrayBufferView|SharedArrayBuffer} BufferLike
 */

/**
 * Buffer Map
 * @template V
 */

class BufferMap {
  /**
   * @constructor
   * @param {Iterable<[BufferLike, V]>} [iterable]
   */

  constructor(iterable) {
    /** @type {Map<string, BufferItem<V>>} */
    this.map = new Map();

    if (iterable != null) {
      for (const [key, value] of iterable)
        this.set(key, value);
    }
  }

  get size() {
    return this.map.size;
  }

  /**
   * @param {BufferLike} key
   * @returns {V?}
   */

  get(key) {
    const item = this.map.get(toBinary(key));

    if (!item)
      return undefined;

    return item.value;
  }

  /**
   * @param {BufferLike} key
   * @returns {Boolean}
   */

  has(key) {
    return this.map.has(toBinary(key));
  }

  /**
   * @param {BufferLike} key
   * @param {V} value
   * @returns {BufferMap<V>}
   */

  set(key, value) {
    this.map.set(toBinary(key), new BufferItem(key, value));
    return this;
  }

  /**
   * @param {BufferLike} key
   * @returns {Boolean}
   */

  delete(key) {
    return this.map.delete(toBinary(key));
  }

  clear() {
    this.map.clear();
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  *entries() {
    for (const {key, value} of this.map.values())
      yield [key, value];
  }

  *keys() {
    for (const {key} of this.map.values())
      yield key;
  }

  *values() {
    for (const {value} of this.map.values())
      yield value;
  }

  forEach(func, self) {
    if (typeof func !== 'function')
      throw new TypeError(`${typeof func} is not a function`);

    for (const {key, value} of this.map.values())
      func.call(self, value, key, this);
  }

  toKeys() {
    const out = [];

    for (const {key} of this.map.values())
      out.push(key);

    return out;
  }

  toValues() {
    const out = [];

    for (const {value} of this.map.values())
      out.push(value);

    return out;
  }

  toArray() {
    return this.toValues();
  }

  [custom]() {
    const map = new Map();

    for (const {key, value} of this.map.values())
      map.set(toHex(key), value);

    return map;
  }
}

/**
 * Buffer Set
 */

class BufferSet {
  /**
   * @constructor
   * @param {Iterable<BufferLike>} [iterable]
   */

  constructor(iterable) {
    /** @type {Map<string, BufferLike>} */
    this.map = new Map();

    if (iterable != null) {
      for (const key of iterable)
        this.add(key);
    }
  }

  get size() {
    return this.map.size;
  }

  /**
   * @param {BufferLike} key
   * @returns {Boolean}
   */

  has(key) {
    return this.map.has(toBinary(key));
  }

  /**
   * @param {BufferLike} key
   * @returns {BufferSet}
   */

  add(key) {
    this.map.set(toBinary(key), key);
    return this;
  }

  /**
   * @param {BufferLike} key
   * @returns {Boolean}
   */

  delete(key) {
    return this.map.delete(toBinary(key));
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

  forEach(func, self) {
    if (typeof func !== 'function')
      throw new TypeError(`${typeof func} is not a function`);

    for (const key of this.map.values())
      func.call(self, key, key, this);
  }

  toKeys() {
    const out = [];

    for (const key of this.map.values())
      out.push(key);

    return out;
  }

  toValues() {
    return this.toKeys();
  }

  toArray() {
    return this.toKeys();
  }

  [custom]() {
    /** @type {Set<string>} */
    const set = new Set();

    for (const key of this.map.values())
      set.add(toHex(key));

    return set;
  }
}

/**
 * Buffer Item
 * @template V
 */

class BufferItem {
  /**
   * @param {BufferLike} key
   * @param {V} value
   */

  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

/*
 * Helpers
 */

const HAS_SHARED_ARRAY_BUFFER = typeof SharedArrayBuffer === 'function';

/**
 * @param {BufferLike} key
 * @returns {Boolean}
 */

function isArrayBuffer(key) {
  if (key instanceof ArrayBuffer)
    return true;

  if (HAS_SHARED_ARRAY_BUFFER) {
    if (key instanceof SharedArrayBuffer)
      return true;
  }

  return false;
}

/**
 * @param {ArrayBuffer|ArrayBufferView} key
 * @returns {Buffer}
 */

function toBuffer(key) {
  if (ArrayBuffer.isView(key))
    return Buffer.from(key.buffer, key.byteOffset, key.byteLength);

  if (isArrayBuffer(key))
    return Buffer.from(key, 0, key.byteLength);

  throw new TypeError('Non-buffer passed to buffer map/set.');
}

/**
 * @param {Buffer|ArrayBuffer|ArrayBufferView} key
 * @param {BufferEncoding} encoding
 * @returns {string}
 */

function encode(key, encoding) {
  if (!Buffer.isBuffer(key))
    key = toBuffer(key);

  return key.toString(encoding);
}

/**
 * @param {Buffer|ArrayBuffer|ArrayBufferView} key
 * @returns {string}
 */

function toBinary(key) {
  return encode(key, 'binary');
}

/**
 * @param {Buffer|ArrayBuffer|ArrayBufferView} key
 * @returns {string}
 */

function toHex(key) {
  return encode(key, 'hex');
}

/*
 * Expose
 */

exports.BufferMap = BufferMap;
exports.BufferSet = BufferSet;
