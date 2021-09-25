'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = o[Symbol.iterator]();
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
function arrayToString(a) {
    return "[" + a.join(", ") + "]";
}

String.prototype.seed = String.prototype.seed || Math.round(Math.random() * Math.pow(2, 32));

String.prototype.hashCode = function () {
    const key = this.toString();
    let h1b, k1;

    const remainder = key.length & 3; // key.length % 4
    const bytes = key.length - remainder;
    let h1 = String.prototype.seed;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    let i = 0;

    while (i < bytes) {
        k1 =
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
        case 3:
            k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2:
            k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1:
            k1 ^= (key.charCodeAt(i) & 0xff);

            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
};

function standardEqualsFunction(a, b) {
    return a ? a.equals(b) : a==b;
}

function standardHashCodeFunction(a) {
    return a ? a.hashCode() : -1;
}

class Set {
    constructor(hashFunction, equalsFunction) {
        this.data = {};
        this.hashFunction = hashFunction || standardHashCodeFunction;
        this.equalsFunction = equalsFunction || standardEqualsFunction;
    }

    add(value) {
        const hash = this.hashFunction(value);
        const key = "hash_" + hash;
        if (key in this.data) {
            const values = this.data[key];
            for (let i = 0; i < values.length; i++) {
                if (this.equalsFunction(value, values[i])) {
                    return values[i];
                }
            }
            values.push(value);
            return value;
        } else {
            this.data[key] = [value];
            return value;
        }
    }

    contains(value) {
        return this.get(value) != null;
    }

    get(value) {
        const hash = this.hashFunction(value);
        const key = "hash_" + hash;
        if (key in this.data) {
            const values = this.data[key];
            for (let i = 0; i < values.length; i++) {
                if (this.equalsFunction(value, values[i])) {
                    return values[i];
                }
            }
        }
        return null;
    }

    values() {
        let l = [];
        for (const key in this.data) {
            if (key.indexOf("hash_") === 0) {
                l = l.concat(this.data[key]);
            }
        }
        return l;
    }

    toString() {
        return arrayToString(this.values());
    }

    get length(){
        let l = 0;
        for (const key in this.data) {
            if (key.indexOf("hash_") === 0) {
                l = l + this.data[key].length;
            }
        }
        return l;
    }
}


class BitSet {
    constructor() {
        this.data = [];
    }

    add(value) {
        this.data[value] = true;
    }

    or(set) {
        const bits = this;
        Object.keys(set.data).map(function (alt) {
            bits.add(alt);
        });
    }

    remove(value) {
        delete this.data[value];
    }

    contains(value) {
        return this.data[value] === true;
    }

    values() {
        return Object.keys(this.data);
    }

    minValue() {
        return Math.min.apply(null, this.values());
    }

    hashCode() {
        const hash = new Hash$1();
        hash.update(this.values());
        return hash.finish();
    }

    equals(other) {
        if (!(other instanceof BitSet)) {
            return false;
        }
        return this.hashCode() === other.hashCode();
    }

    toString() {
        return "{" + this.values().join(", ") + "}";
    }

    get length(){
        return this.values().length;
    }
}


class Map$1 {
    constructor(hashFunction, equalsFunction) {
        this.data = {};
        this.hashFunction = hashFunction || standardHashCodeFunction;
        this.equalsFunction = equalsFunction || standardEqualsFunction;
    }

    put(key, value) {
        const hashKey = "hash_" + this.hashFunction(key);
        if (hashKey in this.data) {
            const entries = this.data[hashKey];
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                if (this.equalsFunction(key, entry.key)) {
                    const oldValue = entry.value;
                    entry.value = value;
                    return oldValue;
                }
            }
            entries.push({key:key, value:value});
            return value;
        } else {
            this.data[hashKey] = [{key:key, value:value}];
            return value;
        }
    }

    containsKey(key) {
        const hashKey = "hash_" + this.hashFunction(key);
        if(hashKey in this.data) {
            const entries = this.data[hashKey];
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                if (this.equalsFunction(key, entry.key))
                    return true;
            }
        }
        return false;
    }

    get(key) {
        const hashKey = "hash_" + this.hashFunction(key);
        if(hashKey in this.data) {
            const entries = this.data[hashKey];
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                if (this.equalsFunction(key, entry.key))
                    return entry.value;
            }
        }
        return null;
    }

    entries() {
        let l = [];
        for (const key in this.data) {
            if (key.indexOf("hash_") === 0) {
                l = l.concat(this.data[key]);
            }
        }
        return l;
    }

    getKeys() {
        return this.entries().map(function(e) {
            return e.key;
        });
    }

    getValues() {
        return this.entries().map(function(e) {
                return e.value;
        });
    }

    toString() {
        const ss = this.entries().map(function(entry) {
            return '{' + entry.key + ':' + entry.value + '}';
        });
        return '[' + ss.join(", ") + ']';
    }

    get length(){
        let l = 0;
        for (const hashKey in this.data) {
            if (hashKey.indexOf("hash_") === 0) {
                l = l + this.data[hashKey].length;
            }
        }
        return l;
    }
}


class AltDict {
    constructor() {
        this.data = {};
    }

    get(key) {
        key = "k-" + key;
        if (key in this.data) {
            return this.data[key];
        } else {
            return null;
        }
    }

    put(key, value) {
        key = "k-" + key;
        this.data[key] = value;
    }

    values() {
        const data = this.data;
        const keys = Object.keys(this.data);
        return keys.map(function (key) {
            return data[key];
        });
    }
}


class DoubleDict {
    constructor(defaultMapCtor) {
        this.defaultMapCtor = defaultMapCtor || Map$1;
        this.cacheMap = new this.defaultMapCtor();
    }

    get(a, b) {
        const d = this.cacheMap.get(a) || null;
        return d === null ? null : (d.get(b) || null);
    }

    set(a, b, o) {
        let d = this.cacheMap.get(a) || null;
        if (d === null) {
            d = new this.defaultMapCtor();
            this.cacheMap.put(a, d);
        }
        d.put(b, o);
    }
}

class Hash$1 {
    constructor() {
        this.count = 0;
        this.hash = 0;
    }

    update() {
        for(let i=0;i<arguments.length;i++) {
            const value = arguments[i];
            if (value == null)
                continue;
            if(Array.isArray(value))
                this.update.apply(this, value);
            else {
                let k = 0;
                switch (typeof(value)) {
                    case 'undefined':
                    case 'function':
                        continue;
                    case 'number':
                    case 'boolean':
                        k = value;
                        break;
                    case 'string':
                        k = value.hashCode();
                        break;
                    default:
                        if(value.updateHashCode)
                            value.updateHashCode(this);
                        else
                            console.log("No updateHashCode for " + value.toString());
                        continue;
                }
                k = k * 0xCC9E2D51;
                k = (k << 15) | (k >>> (32 - 15));
                k = k * 0x1B873593;
                this.count = this.count + 1;
                let hash = this.hash ^ k;
                hash = (hash << 13) | (hash >>> (32 - 13));
                hash = hash * 5 + 0xE6546B64;
                this.hash = hash;
            }
        }
    }

    finish() {
        let hash = this.hash ^ (this.count * 4);
        hash = hash ^ (hash >>> 16);
        hash = hash * 0x85EBCA6B;
        hash = hash ^ (hash >>> 13);
        hash = hash * 0xC2B2AE35;
        hash = hash ^ (hash >>> 16);
        return hash;
    }
}

function hashStuff() {
    const hash = new Hash$1();
    hash.update.apply(hash, arguments);
    return hash.finish();
}


function escapeWhitespace(s, escapeSpaces) {
    s = s.replace(/\t/g, "\\t")
         .replace(/\n/g, "\\n")
         .replace(/\r/g, "\\r");
    if (escapeSpaces) {
        s = s.replace(/ /g, "\u00B7");
    }
    return s;
}

function titleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1);
    });
}

function equalArrays(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b))
        return false;
    if (a == b)
        return true;
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] == b[i])
            continue;
        if (!a[i].equals || !a[i].equals(b[i]))
            return false;
    }
    return true;
}

var Utils = {
    Hash: Hash$1,
    Set,
    Map: Map$1,
    BitSet,
    AltDict,
    DoubleDict,
    hashStuff,
    escapeWhitespace,
    arrayToString,
    titleCase,
    equalArrays
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
/**
 * A token has properties: text, type, line, character position in the line
 * (so we can ignore tabs), token channel, index, and source from which
 * we obtained this token.
 */
class Token {
	constructor() {
		this.source = null;
		this.type = null; // token type of the token
		this.channel = null; // The parser ignores everything not on DEFAULT_CHANNEL
		this.start = null; // optional; return -1 if not implemented.
		this.stop = null; // optional; return -1 if not implemented.
		this.tokenIndex = null; // from 0..n-1 of the token object in the input stream
		this.line = null; // line=1..n of the 1st character
		this.column = null; // beginning of the line at which it occurs, 0..n-1
		this._text = null; // text of the token.
	}

	getTokenSource() {
		return this.source[0];
	}

	getInputStream() {
		return this.source[1];
	}

	get text(){
		return this._text;
	}

	set text(text) {
		this._text = text;
	}
}

Token.INVALID_TYPE = 0;

/**
 * During lookahead operations, this "token" signifies we hit rule end ATN state
 * and did not follow it despite needing to.
 */
Token.EPSILON = -2;

Token.MIN_USER_TOKEN_TYPE = 1;

Token.EOF = -1;

/**
 * All tokens go to the parser (unless skip() is called in that rule)
 * on a particular "channel". The parser tunes to a particular channel
 * so that whitespace etc... can go to the parser on a "hidden" channel.
 */
Token.DEFAULT_CHANNEL = 0;

/**
 * Anything on different channel than DEFAULT_CHANNEL is not parsed
 * by parser.
 */
Token.HIDDEN_CHANNEL = 1;


class CommonToken extends Token {
	constructor(source, type, channel, start, stop) {
		super();
		this.source = source !== undefined ? source : CommonToken.EMPTY_SOURCE;
		this.type = type !== undefined ? type : null;
		this.channel = channel !== undefined ? channel : Token.DEFAULT_CHANNEL;
		this.start = start !== undefined ? start : -1;
		this.stop = stop !== undefined ? stop : -1;
		this.tokenIndex = -1;
		if (this.source[0] !== null) {
			this.line = source[0].line;
			this.column = source[0].column;
		} else {
			this.column = -1;
		}
	}

	/**
	 * Constructs a new {@link CommonToken} as a copy of another {@link Token}.
	 *
	 * <p>
	 * If {@code oldToken} is also a {@link CommonToken} instance, the newly
	 * constructed token will share a reference to the {@link //text} field and
	 * the {@link Pair} stored in {@link //source}. Otherwise, {@link //text} will
	 * be assigned the result of calling {@link //getText}, and {@link //source}
	 * will be constructed from the result of {@link Token//getTokenSource} and
	 * {@link Token//getInputStream}.</p>
	 *
	 * @param oldToken The token to copy.
	 */
	clone() {
		const t = new CommonToken(this.source, this.type, this.channel, this.start, this.stop);
		t.tokenIndex = this.tokenIndex;
		t.line = this.line;
		t.column = this.column;
		t.text = this.text;
		return t;
	}

	toString() {
		let txt = this.text;
		if (txt !== null) {
			txt = txt.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
		} else {
			txt = "<no text>";
		}
		return "[@" + this.tokenIndex + "," + this.start + ":" + this.stop + "='" +
				txt + "',<" + this.type + ">" +
				(this.channel > 0 ? ",channel=" + this.channel : "") + "," +
				this.line + ":" + this.column + "]";
	}

	get text(){
		if (this._text !== null) {
			return this._text;
		}
		const input = this.getInputStream();
		if (input === null) {
			return null;
		}
		const n = input.size;
		if (this.start < n && this.stop < n) {
			return input.getText(this.start, this.stop);
		} else {
			return "<EOF>";
		}
	}

	set text(text) {
		this._text = text;
	}
}

/**
 * An empty {@link Pair} which is used as the default value of
 * {@link //source} for tokens that do not have a source.
 */
CommonToken.EMPTY_SOURCE = [ null, null ];

var Token_1 = {
	Token,
	CommonToken
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

/**
 * The following images show the relation of states and
 * {@link ATNState//transitions} for various grammar constructs.
 *
 * <ul>
 *
 * <li>Solid edges marked with an &//0949; indicate a required
 * {@link EpsilonTransition}.</li>
 *
 * <li>Dashed edges indicate locations where any transition derived from
 * {@link Transition} might appear.</li>
 *
 * <li>Dashed nodes are place holders for either a sequence of linked
 * {@link BasicState} states or the inclusion of a block representing a nested
 * construct in one of the forms below.</li>
 *
 * <li>Nodes showing multiple outgoing alternatives with a {@code ...} support
 * any number of alternatives (one or more). Nodes without the {@code ...} only
 * support the exact number of alternatives shown in the diagram.</li>
 *
 * </ul>
 *
 * <h2>Basic Blocks</h2>
 *
 * <h3>Rule</h3>
 *
 * <embed src="images/Rule.svg" type="image/svg+xml"/>
 *
 * <h3>Block of 1 or more alternatives</h3>
 *
 * <embed src="images/Block.svg" type="image/svg+xml"/>
 *
 * <h2>Greedy Loops</h2>
 *
 * <h3>Greedy Closure: {@code (...)*}</h3>
 *
 * <embed src="images/ClosureGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Greedy Positive Closure: {@code (...)+}</h3>
 *
 * <embed src="images/PositiveClosureGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Greedy Optional: {@code (...)?}</h3>
 *
 * <embed src="images/OptionalGreedy.svg" type="image/svg+xml"/>
 *
 * <h2>Non-Greedy Loops</h2>
 *
 * <h3>Non-Greedy Closure: {@code (...)*?}</h3>
 *
 * <embed src="images/ClosureNonGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Non-Greedy Positive Closure: {@code (...)+?}</h3>
 *
 * <embed src="images/PositiveClosureNonGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Non-Greedy Optional: {@code (...)??}</h3>
 *
 * <embed src="images/OptionalNonGreedy.svg" type="image/svg+xml"/>
 */
class ATNState {
    constructor() {
        // Which ATN are we in?
        this.atn = null;
        this.stateNumber = ATNState.INVALID_STATE_NUMBER;
        this.stateType = null;
        this.ruleIndex = 0; // at runtime, we don't have Rule objects
        this.epsilonOnlyTransitions = false;
        // Track the transitions emanating from this ATN state.
        this.transitions = [];
        // Used to cache lookahead during parsing, not used during construction
        this.nextTokenWithinRule = null;
    }

    toString() {
        return this.stateNumber;
    }

    equals(other) {
        if (other instanceof ATNState) {
            return this.stateNumber===other.stateNumber;
        } else {
            return false;
        }
    }

    isNonGreedyExitState() {
        return false;
    }

    addTransition(trans, index) {
        if(index===undefined) {
            index = -1;
        }
        if (this.transitions.length===0) {
            this.epsilonOnlyTransitions = trans.isEpsilon;
        } else if(this.epsilonOnlyTransitions !== trans.isEpsilon) {
            this.epsilonOnlyTransitions = false;
        }
        if (index===-1) {
            this.transitions.push(trans);
        } else {
            this.transitions.splice(index, 1, trans);
        }
    }
}

// constants for serialization
ATNState.INVALID_TYPE = 0;
ATNState.BASIC = 1;
ATNState.RULE_START = 2;
ATNState.BLOCK_START = 3;
ATNState.PLUS_BLOCK_START = 4;
ATNState.STAR_BLOCK_START = 5;
ATNState.TOKEN_START = 6;
ATNState.RULE_STOP = 7;
ATNState.BLOCK_END = 8;
ATNState.STAR_LOOP_BACK = 9;
ATNState.STAR_LOOP_ENTRY = 10;
ATNState.PLUS_LOOP_BACK = 11;
ATNState.LOOP_END = 12;

ATNState.serializationNames = [
            "INVALID",
            "BASIC",
            "RULE_START",
            "BLOCK_START",
            "PLUS_BLOCK_START",
            "STAR_BLOCK_START",
            "TOKEN_START",
            "RULE_STOP",
            "BLOCK_END",
            "STAR_LOOP_BACK",
            "STAR_LOOP_ENTRY",
            "PLUS_LOOP_BACK",
            "LOOP_END" ];

ATNState.INVALID_STATE_NUMBER = -1;


class BasicState extends ATNState {
    constructor() {
        super();
        this.stateType = ATNState.BASIC;
    }
}

class DecisionState extends ATNState {
    constructor() {
        super();
        this.decision = -1;
        this.nonGreedy = false;
        return this;
    }
}

/**
 *  The start of a regular {@code (...)} block
 */
class BlockStartState extends DecisionState {
    constructor() {
        super();
        this.endState = null;
        return this;
    }
}

class BasicBlockStartState extends BlockStartState {
    constructor() {
        super();
        this.stateType = ATNState.BLOCK_START;
        return this;
    }
}

/**
 * Terminal node of a simple {@code (a|b|c)} block
 */
class BlockEndState extends ATNState {
    constructor() {
        super();
        this.stateType = ATNState.BLOCK_END;
        this.startState = null;
        return this;
    }
}

/**
 * The last node in the ATN for a rule, unless that rule is the start symbol.
 * In that case, there is one transition to EOF. Later, we might encode
 * references to all calls to this rule to compute FOLLOW sets for
 * error handling
 */
class RuleStopState extends ATNState {
    constructor() {
        super();
        this.stateType = ATNState.RULE_STOP;
        return this;
    }
}

class RuleStartState extends ATNState {
    constructor() {
        super();
        this.stateType = ATNState.RULE_START;
        this.stopState = null;
        this.isPrecedenceRule = false;
        return this;
    }
}

/**
 * Decision state for {@code A+} and {@code (A|B)+}.  It has two transitions:
 * one to the loop back to start of the block and one to exit.
 */
class PlusLoopbackState extends DecisionState {
    constructor() {
        super();
        this.stateType = ATNState.PLUS_LOOP_BACK;
        return this;
    }
}

/**
 * Start of {@code (A|B|...)+} loop. Technically a decision state, but
 * we don't use for code generation; somebody might need it, so I'm defining
 * it for completeness. In reality, the {@link PlusLoopbackState} node is the
 * real decision-making note for {@code A+}
 */
class PlusBlockStartState extends BlockStartState {
    constructor() {
        super();
        this.stateType = ATNState.PLUS_BLOCK_START;
        this.loopBackState = null;
        return this;
    }
}

/**
 * The block that begins a closure loop
 */
class StarBlockStartState extends BlockStartState {
    constructor() {
        super();
        this.stateType = ATNState.STAR_BLOCK_START;
        return this;
    }
}

class StarLoopbackState extends ATNState {
    constructor() {
        super();
        this.stateType = ATNState.STAR_LOOP_BACK;
        return this;
    }
}

class StarLoopEntryState extends DecisionState {
    constructor() {
        super();
        this.stateType = ATNState.STAR_LOOP_ENTRY;
        this.loopBackState = null;
        // Indicates whether this state can benefit from a precedence DFA during SLL decision making.
        this.isPrecedenceDecision = null;
        return this;
    }
}

/**
 * Mark the end of a * or + loop
 */
class LoopEndState extends ATNState {
    constructor() {
        super();
        this.stateType = ATNState.LOOP_END;
        this.loopBackState = null;
        return this;
    }
}

/**
 * The Tokens rule start state linking to each lexer rule start state
 */
class TokensStartState extends DecisionState {
    constructor() {
        super();
        this.stateType = ATNState.TOKEN_START;
        return this;
    }
}

var ATNState_1 = {
    ATNState,
    BasicState,
    DecisionState,
    BlockStartState,
    BlockEndState,
    LoopEndState,
    RuleStartState,
    RuleStopState,
    TokensStartState,
    PlusLoopbackState,
    StarLoopbackState,
    StarLoopEntryState,
    PlusBlockStartState,
    StarBlockStartState,
    BasicBlockStartState
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Set: Set$1, Hash: Hash$2} = Utils;

/**
 * A tree structure used to record the semantic context in which
 * an ATN configuration is valid.  It's either a single predicate,
 * a conjunction {@code p1&&p2}, or a sum of products {@code p1||p2}.
 *
 * <p>I have scoped the {@link AND}, {@link OR}, and {@link Predicate} subclasses of
 * {@link SemanticContext} within the scope of this outer class.</p>
 */
class SemanticContext {
	hashCode() {
		const hash = new Hash$2();
		this.updateHashCode(hash);
		return hash.finish();
	}

	/**
	 * For context independent predicates, we evaluate them without a local
	 * context (i.e., null context). That way, we can evaluate them without
	 * having to create proper rule-specific context during prediction (as
	 * opposed to the parser, which creates them naturally). In a practical
	 * sense, this avoids a cast exception from RuleContext to myruleContext.
	 *
	 * <p>For context dependent predicates, we must pass in a local context so that
	 * references such as $arg evaluate properly as _localctx.arg. We only
	 * capture context dependent predicates in the context in which we begin
	 * prediction, so we passed in the outer context here in case of context
	 * dependent predicate evaluation.</p>
	 */
	evaluate(parser, outerContext) {}

	/**
	 * Evaluate the precedence predicates for the context and reduce the result.
	 *
	 * @param parser The parser instance.
	 * @param outerContext The current parser context object.
	 * @return The simplified semantic context after precedence predicates are
	 * evaluated, which will be one of the following values.
	 * <ul>
	 * <li>{@link //NONE}: if the predicate simplifies to {@code true} after
	 * precedence predicates are evaluated.</li>
	 * <li>{@code null}: if the predicate simplifies to {@code false} after
	 * precedence predicates are evaluated.</li>
	 * <li>{@code this}: if the semantic context is not changed as a result of
	 * precedence predicate evaluation.</li>
	 * <li>A non-{@code null} {@link SemanticContext}: the new simplified
	 * semantic context after precedence predicates are evaluated.</li>
	 * </ul>
	 */
	evalPrecedence(parser, outerContext) {
		return this;
	}

	static andContext(a, b) {
		if (a === null || a === SemanticContext.NONE) {
			return b;
		}
		if (b === null || b === SemanticContext.NONE) {
			return a;
		}
		const result = new AND(a, b);
		if (result.opnds.length === 1) {
			return result.opnds[0];
		} else {
			return result;
		}
	}

	static orContext(a, b) {
		if (a === null) {
			return b;
		}
		if (b === null) {
			return a;
		}
		if (a === SemanticContext.NONE || b === SemanticContext.NONE) {
			return SemanticContext.NONE;
		}
		const result = new OR(a, b);
		if (result.opnds.length === 1) {
			return result.opnds[0];
		} else {
			return result;
		}
	}
}


class Predicate extends SemanticContext {
	constructor(ruleIndex, predIndex, isCtxDependent) {
		super();
		this.ruleIndex = ruleIndex === undefined ? -1 : ruleIndex;
		this.predIndex = predIndex === undefined ? -1 : predIndex;
		this.isCtxDependent = isCtxDependent === undefined ? false : isCtxDependent; // e.g., $i ref in pred
	}

	evaluate(parser, outerContext) {
		const localctx = this.isCtxDependent ? outerContext : null;
		return parser.sempred(localctx, this.ruleIndex, this.predIndex);
	}

	updateHashCode(hash) {
		hash.update(this.ruleIndex, this.predIndex, this.isCtxDependent);
	}

	equals(other) {
		if (this === other) {
			return true;
		} else if (!(other instanceof Predicate)) {
			return false;
		} else {
			return this.ruleIndex === other.ruleIndex &&
					this.predIndex === other.predIndex &&
					this.isCtxDependent === other.isCtxDependent;
		}
	}

	toString() {
		return "{" + this.ruleIndex + ":" + this.predIndex + "}?";
	}
}

/**
 * The default {@link SemanticContext}, which is semantically equivalent to
 * a predicate of the form {@code {true}?}
 */
SemanticContext.NONE = new Predicate();


class PrecedencePredicate extends SemanticContext {
	constructor(precedence) {
		super();
		this.precedence = precedence === undefined ? 0 : precedence;
	}

	evaluate(parser, outerContext) {
		return parser.precpred(outerContext, this.precedence);
	}

	evalPrecedence(parser, outerContext) {
		if (parser.precpred(outerContext, this.precedence)) {
			return SemanticContext.NONE;
		} else {
			return null;
		}
	}

	compareTo(other) {
		return this.precedence - other.precedence;
	}

	updateHashCode(hash) {
		hash.update(31);
	}

	equals(other) {
		if (this === other) {
			return true;
		} else if (!(other instanceof PrecedencePredicate)) {
			return false;
		} else {
			return this.precedence === other.precedence;
		}
	}

	toString() {
		return "{"+this.precedence+">=prec}?";
	}

	static filterPrecedencePredicates(set) {
		const result = [];
		set.values().map( function(context) {
			if (context instanceof PrecedencePredicate) {
				result.push(context);
			}
		});
		return result;
	}
}

class AND extends SemanticContext {
	/**
	 * A semantic context which is true whenever none of the contained contexts
	 * is false
	 */
	constructor(a, b) {
		super();
		const operands = new Set$1();
		if (a instanceof AND) {
			a.opnds.map(function(o) {
				operands.add(o);
			});
		} else {
			operands.add(a);
		}
		if (b instanceof AND) {
			b.opnds.map(function(o) {
				operands.add(o);
			});
		} else {
			operands.add(b);
		}
		const precedencePredicates = PrecedencePredicate.filterPrecedencePredicates(operands);
		if (precedencePredicates.length > 0) {
			// interested in the transition with the lowest precedence
			let reduced = null;
			precedencePredicates.map( function(p) {
				if(reduced===null || p.precedence<reduced.precedence) {
					reduced = p;
				}
			});
			operands.add(reduced);
		}
		this.opnds = operands.values();
	}

	equals(other) {
		if (this === other) {
			return true;
		} else if (!(other instanceof AND)) {
			return false;
		} else {
			return this.opnds === other.opnds;
		}
	}

	updateHashCode(hash) {
		hash.update(this.opnds, "AND");
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>
	 * The evaluation of predicates by this context is short-circuiting, but
	 * unordered.</p>
	 */
	evaluate(parser, outerContext) {
		for (let i = 0; i < this.opnds.length; i++) {
			if (!this.opnds[i].evaluate(parser, outerContext)) {
				return false;
			}
		}
		return true;
	}

	evalPrecedence(parser, outerContext) {
		let differs = false;
		const operands = [];
		for (let i = 0; i < this.opnds.length; i++) {
			const context = this.opnds[i];
			const evaluated = context.evalPrecedence(parser, outerContext);
			differs |= (evaluated !== context);
			if (evaluated === null) {
				// The AND context is false if any element is false
				return null;
			} else if (evaluated !== SemanticContext.NONE) {
				// Reduce the result by skipping true elements
				operands.push(evaluated);
			}
		}
		if (!differs) {
			return this;
		}
		if (operands.length === 0) {
			// all elements were true, so the AND context is true
			return SemanticContext.NONE;
		}
		let result = null;
		operands.map(function(o) {
			result = result === null ? o : SemanticContext.andContext(result, o);
		});
		return result;
	}

	toString() {
		let s = "";
		this.opnds.map(function(o) {
			s += "&& " + o.toString();
		});
		return s.length > 3 ? s.slice(3) : s;
	}
}


class OR extends SemanticContext {
	/**
	 * A semantic context which is true whenever at least one of the contained
	 * contexts is true
	 */
	constructor(a, b) {
		super();
		const operands = new Set$1();
		if (a instanceof OR) {
			a.opnds.map(function(o) {
				operands.add(o);
			});
		} else {
			operands.add(a);
		}
		if (b instanceof OR) {
			b.opnds.map(function(o) {
				operands.add(o);
			});
		} else {
			operands.add(b);
		}

		const precedencePredicates = PrecedencePredicate.filterPrecedencePredicates(operands);
		if (precedencePredicates.length > 0) {
			// interested in the transition with the highest precedence
			const s = precedencePredicates.sort(function(a, b) {
				return a.compareTo(b);
			});
			const reduced = s[s.length-1];
			operands.add(reduced);
		}
		this.opnds = operands.values();
	}

	equals(other) {
		if (this === other) {
			return true;
		} else if (!(other instanceof OR)) {
			return false;
		} else {
			return this.opnds === other.opnds;
		}
	}

	updateHashCode(hash) {
		hash.update(this.opnds, "OR");
	}

	/**
	 * <p>
	 * The evaluation of predicates by this context is short-circuiting, but
	 * unordered.</p>
	 */
	evaluate(parser, outerContext) {
		for (let i = 0; i < this.opnds.length; i++) {
			if (this.opnds[i].evaluate(parser, outerContext)) {
				return true;
			}
		}
		return false;
	}

	evalPrecedence(parser, outerContext) {
		let differs = false;
		const operands = [];
		for (let i = 0; i < this.opnds.length; i++) {
			const context = this.opnds[i];
			const evaluated = context.evalPrecedence(parser, outerContext);
			differs |= (evaluated !== context);
			if (evaluated === SemanticContext.NONE) {
				// The OR context is true if any element is true
				return SemanticContext.NONE;
			} else if (evaluated !== null) {
				// Reduce the result by skipping false elements
				operands.push(evaluated);
			}
		}
		if (!differs) {
			return this;
		}
		if (operands.length === 0) {
			// all elements were false, so the OR context is false
			return null;
		}
		const result = null;
		return result;
	}

	toString() {
		let s = "";
		this.opnds.map(function(o) {
			s += "|| " + o.toString();
		});
		return s.length > 3 ? s.slice(3) : s;
	}
}

var SemanticContext_1 = {
	SemanticContext,
	PrecedencePredicate,
	Predicate
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {DecisionState: DecisionState$1} = ATNState_1;
const {SemanticContext: SemanticContext$1} = SemanticContext_1;
const {Hash: Hash$3} = Utils;


function checkParams(params, isCfg) {
	if(params===null) {
		const result = { state:null, alt:null, context:null, semanticContext:null };
		if(isCfg) {
			result.reachesIntoOuterContext = 0;
		}
		return result;
	} else {
		const props = {};
		props.state = params.state || null;
		props.alt = (params.alt === undefined) ? null : params.alt;
		props.context = params.context || null;
		props.semanticContext = params.semanticContext || null;
		if(isCfg) {
			props.reachesIntoOuterContext = params.reachesIntoOuterContext || 0;
			props.precedenceFilterSuppressed = params.precedenceFilterSuppressed || false;
		}
		return props;
	}
}

class ATNConfig {
    /**
     * @param {Object} params A tuple: (ATN state, predicted alt, syntactic, semantic context).
     * The syntactic context is a graph-structured stack node whose
     * path(s) to the root is the rule invocation(s)
     * chain used to arrive at the state.  The semantic context is
     * the tree of semantic predicates encountered before reaching
     * an ATN state
     */
    constructor(params, config) {
        this.checkContext(params, config);
        params = checkParams(params);
        config = checkParams(config, true);
        // The ATN state associated with this configuration///
        this.state = params.state!==null ? params.state : config.state;
        // What alt (or lexer rule) is predicted by this configuration///
        this.alt = params.alt!==null ? params.alt : config.alt;
        /**
         * The stack of invoking states leading to the rule/states associated
         * with this config.  We track only those contexts pushed during
         * execution of the ATN simulator
         */
        this.context = params.context!==null ? params.context : config.context;
        this.semanticContext = params.semanticContext!==null ? params.semanticContext :
            (config.semanticContext!==null ? config.semanticContext : SemanticContext$1.NONE);
        // TODO: make it a boolean then
        /**
         * We cannot execute predicates dependent upon local context unless
         * we know for sure we are in the correct context. Because there is
         * no way to do this efficiently, we simply cannot evaluate
         * dependent predicates unless we are in the rule that initially
         * invokes the ATN simulator.
         * closure() tracks the depth of how far we dip into the
         * outer context: depth &gt; 0.  Note that it may not be totally
         * accurate depth since I don't ever decrement
         */
        this.reachesIntoOuterContext = config.reachesIntoOuterContext;
        this.precedenceFilterSuppressed = config.precedenceFilterSuppressed;
    }

    checkContext(params, config) {
        if((params.context===null || params.context===undefined) &&
                (config===null || config.context===null || config.context===undefined)) {
            this.context = null;
        }
    }

    hashCode() {
        const hash = new Hash$3();
        this.updateHashCode(hash);
        return hash.finish();
    }

    updateHashCode(hash) {
        hash.update(this.state.stateNumber, this.alt, this.context, this.semanticContext);
    }

    /**
     * An ATN configuration is equal to another if both have
     * the same state, they predict the same alternative, and
     * syntactic/semantic contexts are the same
     */
    equals(other) {
        if (this === other) {
            return true;
        } else if (! (other instanceof ATNConfig)) {
            return false;
        } else {
            return this.state.stateNumber===other.state.stateNumber &&
                this.alt===other.alt &&
                (this.context===null ? other.context===null : this.context.equals(other.context)) &&
                this.semanticContext.equals(other.semanticContext) &&
                this.precedenceFilterSuppressed===other.precedenceFilterSuppressed;
        }
    }

    hashCodeForConfigSet() {
        const hash = new Hash$3();
        hash.update(this.state.stateNumber, this.alt, this.semanticContext);
        return hash.finish();
    }

    equalsForConfigSet(other) {
        if (this === other) {
            return true;
        } else if (! (other instanceof ATNConfig)) {
            return false;
        } else {
            return this.state.stateNumber===other.state.stateNumber &&
                this.alt===other.alt &&
                this.semanticContext.equals(other.semanticContext);
        }
    }

    toString() {
        return "(" + this.state + "," + this.alt +
            (this.context!==null ? ",[" + this.context.toString() + "]" : "") +
            (this.semanticContext !== SemanticContext$1.NONE ?
                    ("," + this.semanticContext.toString())
                    : "") +
            (this.reachesIntoOuterContext>0 ?
                    (",up=" + this.reachesIntoOuterContext)
                    : "") + ")";
    }
}


class LexerATNConfig extends ATNConfig {
    constructor(params, config) {
        super(params, config);

        // This is the backing field for {@link //getLexerActionExecutor}.
        const lexerActionExecutor = params.lexerActionExecutor || null;
        this.lexerActionExecutor = lexerActionExecutor || (config!==null ? config.lexerActionExecutor : null);
        this.passedThroughNonGreedyDecision = config!==null ? this.checkNonGreedyDecision(config, this.state) : false;
        this.hashCodeForConfigSet = LexerATNConfig.prototype.hashCode;
        this.equalsForConfigSet = LexerATNConfig.prototype.equals;
        return this;
    }

    updateHashCode(hash) {
        hash.update(this.state.stateNumber, this.alt, this.context, this.semanticContext, this.passedThroughNonGreedyDecision, this.lexerActionExecutor);
    }

    equals(other) {
        return this === other ||
                (other instanceof LexerATNConfig &&
                this.passedThroughNonGreedyDecision == other.passedThroughNonGreedyDecision &&
                (this.lexerActionExecutor ? this.lexerActionExecutor.equals(other.lexerActionExecutor) : !other.lexerActionExecutor) &&
                super.equals(other));
    }

    checkNonGreedyDecision(source, target) {
        return source.passedThroughNonGreedyDecision ||
            (target instanceof DecisionState$1) && target.nonGreedy;
    }
}


var ATNConfig_2 = ATNConfig;
var LexerATNConfig_1 = LexerATNConfig;

var ATNConfig_1 = {
	ATNConfig: ATNConfig_2,
	LexerATNConfig: LexerATNConfig_1
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$1} = Token_1;

/* stop is not included! */
class Interval {
	constructor(start, stop) {
		this.start = start;
		this.stop = stop;
	}

	contains(item) {
		return item >= this.start && item < this.stop;
	}

	toString() {
		if(this.start===this.stop-1) {
			return this.start.toString();
		} else {
			return this.start.toString() + ".." + (this.stop-1).toString();
		}
	}

	get length(){
		return this.stop - this.start;
	}
}


class IntervalSet {
	constructor() {
		this.intervals = null;
		this.readOnly = false;
	}

	first(v) {
		if (this.intervals === null || this.intervals.length===0) {
			return Token$1.INVALID_TYPE;
		} else {
			return this.intervals[0].start;
		}
	}

	addOne(v) {
		this.addInterval(new Interval(v, v + 1));
	}

	addRange(l, h) {
		this.addInterval(new Interval(l, h + 1));
	}

	addInterval(v) {
		if (this.intervals === null) {
			this.intervals = [];
			this.intervals.push(v);
		} else {
			// find insert pos
			for (let k = 0; k < this.intervals.length; k++) {
				const i = this.intervals[k];
				// distinct range -> insert
				if (v.stop < i.start) {
					this.intervals.splice(k, 0, v);
					return;
				}
				// contiguous range -> adjust
				else if (v.stop === i.start) {
					this.intervals[k].start = v.start;
					return;
				}
				// overlapping range -> adjust and reduce
				else if (v.start <= i.stop) {
					this.intervals[k] = new Interval(Math.min(i.start, v.start), Math.max(i.stop, v.stop));
					this.reduce(k);
					return;
				}
			}
			// greater than any existing
			this.intervals.push(v);
		}
	}

	addSet(other) {
		if (other.intervals !== null) {
			for (let k = 0; k < other.intervals.length; k++) {
				const i = other.intervals[k];
				this.addInterval(new Interval(i.start, i.stop));
			}
		}
		return this;
	}

	reduce(k) {
		// only need to reduce if k is not the last
		if (k < this.intervalslength - 1) {
			const l = this.intervals[k];
			const r = this.intervals[k + 1];
			// if r contained in l
			if (l.stop >= r.stop) {
				this.intervals.pop(k + 1);
				this.reduce(k);
			} else if (l.stop >= r.start) {
				this.intervals[k] = new Interval(l.start, r.stop);
				this.intervals.pop(k + 1);
			}
		}
	}

	complement(start, stop) {
		const result = new IntervalSet();
		result.addInterval(new Interval(start,stop+1));
		for(let i=0; i<this.intervals.length; i++) {
			result.removeRange(this.intervals[i]);
		}
		return result;
	}

	contains(item) {
		if (this.intervals === null) {
			return false;
		} else {
			for (let k = 0; k < this.intervals.length; k++) {
				if(this.intervals[k].contains(item)) {
					return true;
				}
			}
			return false;
		}
	}

	removeRange(v) {
		if(v.start===v.stop-1) {
			this.removeOne(v.start);
		} else if (this.intervals!==null) {
			let k = 0;
			for(let n=0; n<this.intervals.length; n++) {
				const i = this.intervals[k];
				// intervals are ordered
				if (v.stop<=i.start) {
					return;
				}
				// check for including range, split it
				else if(v.start>i.start && v.stop<i.stop) {
					this.intervals[k] = new Interval(i.start, v.start);
					const x = new Interval(v.stop, i.stop);
					this.intervals.splice(k, 0, x);
					return;
				}
				// check for included range, remove it
				else if(v.start<=i.start && v.stop>=i.stop) {
					this.intervals.splice(k, 1);
					k = k - 1; // need another pass
				}
				// check for lower boundary
				else if(v.start<i.stop) {
					this.intervals[k] = new Interval(i.start, v.start);
				}
				// check for upper boundary
				else if(v.stop<i.stop) {
					this.intervals[k] = new Interval(v.stop, i.stop);
				}
				k += 1;
			}
		}
	}

	removeOne(v) {
		if (this.intervals !== null) {
			for (let k = 0; k < this.intervals.length; k++) {
				const i = this.intervals[k];
				// intervals is ordered
				if (v < i.start) {
					return;
				}
				// check for single value range
				else if (v === i.start && v === i.stop - 1) {
					this.intervals.splice(k, 1);
					return;
				}
				// check for lower boundary
				else if (v === i.start) {
					this.intervals[k] = new Interval(i.start + 1, i.stop);
					return;
				}
				// check for upper boundary
				else if (v === i.stop - 1) {
					this.intervals[k] = new Interval(i.start, i.stop - 1);
					return;
				}
				// split existing range
				else if (v < i.stop - 1) {
					const x = new Interval(i.start, v);
					i.start = v + 1;
					this.intervals.splice(k, 0, x);
					return;
				}
			}
		}
	}

	toString(literalNames, symbolicNames, elemsAreChar) {
		literalNames = literalNames || null;
		symbolicNames = symbolicNames || null;
		elemsAreChar = elemsAreChar || false;
		if (this.intervals === null) {
			return "{}";
		} else if(literalNames!==null || symbolicNames!==null) {
			return this.toTokenString(literalNames, symbolicNames);
		} else if(elemsAreChar) {
			return this.toCharString();
		} else {
			return this.toIndexString();
		}
	}

	toCharString() {
		const names = [];
		for (let i = 0; i < this.intervals.length; i++) {
			const v = this.intervals[i];
			if(v.stop===v.start+1) {
				if ( v.start===Token$1.EOF ) {
					names.push("<EOF>");
				} else {
					names.push("'" + String.fromCharCode(v.start) + "'");
				}
			} else {
				names.push("'" + String.fromCharCode(v.start) + "'..'" + String.fromCharCode(v.stop-1) + "'");
			}
		}
		if (names.length > 1) {
			return "{" + names.join(", ") + "}";
		} else {
			return names[0];
		}
	}

	toIndexString() {
		const names = [];
		for (let i = 0; i < this.intervals.length; i++) {
			const v = this.intervals[i];
			if(v.stop===v.start+1) {
				if ( v.start===Token$1.EOF ) {
					names.push("<EOF>");
				} else {
					names.push(v.start.toString());
				}
			} else {
				names.push(v.start.toString() + ".." + (v.stop-1).toString());
			}
		}
		if (names.length > 1) {
			return "{" + names.join(", ") + "}";
		} else {
			return names[0];
		}
	}

	toTokenString(literalNames, symbolicNames) {
		const names = [];
		for (let i = 0; i < this.intervals.length; i++) {
			const v = this.intervals[i];
			for (let j = v.start; j < v.stop; j++) {
				names.push(this.elementName(literalNames, symbolicNames, j));
			}
		}
		if (names.length > 1) {
			return "{" + names.join(", ") + "}";
		} else {
			return names[0];
		}
	}

	elementName(literalNames, symbolicNames, a) {
		if (a === Token$1.EOF) {
			return "<EOF>";
		} else if (a === Token$1.EPSILON) {
			return "<EPSILON>";
		} else {
			return literalNames[a] || symbolicNames[a];
		}
	}

	get length(){
		let len = 0;
		this.intervals.map(function(i) {len += i.length;});
		return len;
	}
}

var IntervalSet_1 = {
	Interval,
	IntervalSet
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$2} = Token_1;
const {IntervalSet: IntervalSet$1} = IntervalSet_1;
const {Predicate: Predicate$1, PrecedencePredicate: PrecedencePredicate$1} = SemanticContext_1;

/**
 * An ATN transition between any two ATN states.  Subclasses define
 * atom, set, epsilon, action, predicate, rule transitions.
 *
 * <p>This is a one way link.  It emanates from a state (usually via a list of
 * transitions) and has a target state.</p>
 *
 * <p>Since we never have to change the ATN transitions once we construct it,
 * we can fix these transitions as specific classes. The DFA transitions
 * on the other hand need to update the labels as it adds transitions to
 * the states. We'll use the term Edge for the DFA to distinguish them from
 * ATN transitions.</p>
 */
class Transition {
    constructor(target) {
        // The target of this transition.
        if (target===undefined || target===null) {
            throw "target cannot be null.";
        }
        this.target = target;
        // Are we epsilon, action, sempred?
        this.isEpsilon = false;
        this.label = null;
    }
}

// constants for serialization

Transition.EPSILON = 1;
Transition.RANGE = 2;
Transition.RULE = 3;
// e.g., {isType(input.LT(1))}?
Transition.PREDICATE = 4;
Transition.ATOM = 5;
Transition.ACTION = 6;
// ~(A|B) or ~atom, wildcard, which convert to next 2
Transition.SET = 7;
Transition.NOT_SET = 8;
Transition.WILDCARD = 9;
Transition.PRECEDENCE = 10;

Transition.serializationNames = [
            "INVALID",
            "EPSILON",
            "RANGE",
            "RULE",
            "PREDICATE",
            "ATOM",
            "ACTION",
            "SET",
            "NOT_SET",
            "WILDCARD",
            "PRECEDENCE"
        ];

Transition.serializationTypes = {
        EpsilonTransition: Transition.EPSILON,
        RangeTransition: Transition.RANGE,
        RuleTransition: Transition.RULE,
        PredicateTransition: Transition.PREDICATE,
        AtomTransition: Transition.ATOM,
        ActionTransition: Transition.ACTION,
        SetTransition: Transition.SET,
        NotSetTransition: Transition.NOT_SET,
        WildcardTransition: Transition.WILDCARD,
        PrecedencePredicateTransition: Transition.PRECEDENCE
    };


// TODO: make all transitions sets? no, should remove set edges

class AtomTransition$1 extends Transition {
    constructor(target, label) {
        super(target);
        // The token type or character value; or, signifies special label.
        this.label_ = label;
        this.label = this.makeLabel();
        this.serializationType = Transition.ATOM;
    }

    makeLabel() {
        const s = new IntervalSet$1();
        s.addOne(this.label_);
        return s;
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return this.label_ === symbol;
    }

    toString() {
        return this.label_;
    }
}


class RuleTransition extends Transition {
    constructor(ruleStart, ruleIndex, precedence, followState) {
        super(ruleStart);
        // ptr to the rule definition object for this rule ref
        this.ruleIndex = ruleIndex;
        this.precedence = precedence;
        // what node to begin computations following ref to rule
        this.followState = followState;
        this.serializationType = Transition.RULE;
        this.isEpsilon = true;
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }
}

class EpsilonTransition extends Transition {
    constructor(target, outermostPrecedenceReturn) {
        super(target);
        this.serializationType = Transition.EPSILON;
        this.isEpsilon = true;
        this.outermostPrecedenceReturn = outermostPrecedenceReturn;
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }

    toString() {
        return "epsilon";
    }
}


class RangeTransition extends Transition {
    constructor(target, start, stop) {
        super(target);
        this.serializationType = Transition.RANGE;
        this.start = start;
        this.stop = stop;
        this.label = this.makeLabel();
    }

    makeLabel() {
        const s = new IntervalSet$1();
        s.addRange(this.start, this.stop);
        return s;
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return symbol >= this.start && symbol <= this.stop;
    }

    toString() {
        return "'" + String.fromCharCode(this.start) + "'..'" + String.fromCharCode(this.stop) + "'";
    }
}


class AbstractPredicateTransition extends Transition {
    constructor(target) {
        super(target);
    }
}

class PredicateTransition extends AbstractPredicateTransition {
    constructor(target, ruleIndex, predIndex, isCtxDependent) {
        super(target);
        this.serializationType = Transition.PREDICATE;
        this.ruleIndex = ruleIndex;
        this.predIndex = predIndex;
        this.isCtxDependent = isCtxDependent; // e.g., $i ref in pred
        this.isEpsilon = true;
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }

    getPredicate() {
        return new Predicate$1(this.ruleIndex, this.predIndex, this.isCtxDependent);
    }

    toString() {
        return "pred_" + this.ruleIndex + ":" + this.predIndex;
    }
}


class ActionTransition extends Transition {
    constructor(target, ruleIndex, actionIndex, isCtxDependent) {
        super(target);
        this.serializationType = Transition.ACTION;
        this.ruleIndex = ruleIndex;
        this.actionIndex = actionIndex===undefined ? -1 : actionIndex;
        this.isCtxDependent = isCtxDependent===undefined ? false : isCtxDependent; // e.g., $i ref in pred
        this.isEpsilon = true;
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }

    toString() {
        return "action_" + this.ruleIndex + ":" + this.actionIndex;
    }
}


// A transition containing a set of values.
class SetTransition extends Transition {
    constructor(target, set) {
        super(target);
        this.serializationType = Transition.SET;
        if (set !==undefined && set !==null) {
            this.label = set;
        } else {
            this.label = new IntervalSet$1();
            this.label.addOne(Token$2.INVALID_TYPE);
        }
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return this.label.contains(symbol);
    }

    toString() {
        return this.label.toString();
    }
}

class NotSetTransition extends SetTransition {
    constructor(target, set) {
        super(target, set);
        this.serializationType = Transition.NOT_SET;
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return symbol >= minVocabSymbol && symbol <= maxVocabSymbol &&
                !super.matches(symbol, minVocabSymbol, maxVocabSymbol);
    }

    toString() {
        return '~' + super.toString();
    }
}

class WildcardTransition extends Transition {
    constructor(target) {
        super(target);
        this.serializationType = Transition.WILDCARD;
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return symbol >= minVocabSymbol && symbol <= maxVocabSymbol;
    }

    toString() {
        return ".";
    }
}

class PrecedencePredicateTransition extends AbstractPredicateTransition {
    constructor(target, precedence) {
        super(target);
        this.serializationType = Transition.PRECEDENCE;
        this.precedence = precedence;
        this.isEpsilon = true;
    }

    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }

    getPredicate() {
        return new PrecedencePredicate$1(this.precedence);
    }

    toString() {
        return this.precedence + " >= _p";
    }
}

var Transition_1 = {
    Transition,
    AtomTransition: AtomTransition$1,
    SetTransition,
    NotSetTransition,
    RuleTransition,
    ActionTransition,
    EpsilonTransition,
    RangeTransition,
    WildcardTransition,
    PredicateTransition,
    PrecedencePredicateTransition,
    AbstractPredicateTransition
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$3} = Token_1;
const {Interval: Interval$1} = IntervalSet_1;
const INVALID_INTERVAL = new Interval$1(-1, -2);

/**
 * The basic notion of a tree has a parent, a payload, and a list of children.
 * It is the most abstract interface for all the trees used by ANTLR.
 */
class Tree {}

class SyntaxTree extends Tree {
	constructor() {
		super();
	}
}

class ParseTree extends SyntaxTree {
	constructor() {
		super();
	}
}

class RuleNode extends ParseTree {
	constructor() {
		super();
	}

	getRuleContext(){
		throw new Error("missing interface implementation")
	}
}

class TerminalNode extends ParseTree {
	constructor() {
		super();
	}
}

class ErrorNode extends TerminalNode {
	constructor() {
		super();
	}
}

class ParseTreeVisitor {
	visit(ctx) {
		 if (Array.isArray(ctx)) {
			return ctx.map(function(child) {
				return child.accept(this);
			}, this);
		} else {
			return ctx.accept(this);
		}
	}

	visitChildren(ctx) {
		if (ctx.children) {
			return this.visit(ctx.children);
		} else {
			return null;
		}
	}

	visitTerminal(node) {
	}

	visitErrorNode(node) {
	}
}

class ParseTreeListener {
	visitTerminal(node) {
	}

	visitErrorNode(node) {
	}

	enterEveryRule(node) {
	}

	exitEveryRule(node) {
	}
}

class TerminalNodeImpl extends TerminalNode {
	constructor(symbol) {
		super();
		this.parentCtx = null;
		this.symbol = symbol;
	}

	getChild(i) {
		return null;
	}

	getSymbol() {
		return this.symbol;
	}

	getParent() {
		return this.parentCtx;
	}

	getPayload() {
		return this.symbol;
	}

	getSourceInterval() {
		if (this.symbol === null) {
			return INVALID_INTERVAL;
		}
		const tokenIndex = this.symbol.tokenIndex;
		return new Interval$1(tokenIndex, tokenIndex);
	}

	getChildCount() {
		return 0;
	}

	accept(visitor) {
		return visitor.visitTerminal(this);
	}

	getText() {
		return this.symbol.text;
	}

	toString() {
		if (this.symbol.type === Token$3.EOF) {
			return "<EOF>";
		} else {
			return this.symbol.text;
		}
	}
}


/**
 * Represents a token that was consumed during resynchronization
 * rather than during a valid match operation. For example,
 * we will create this kind of a node during single token insertion
 * and deletion as well as during "consume until error recovery set"
 * upon no viable alternative exceptions.
 */
class ErrorNodeImpl extends TerminalNodeImpl {
	constructor(token) {
		super(token);
	}

	isErrorNode() {
		return true;
	}

	accept(visitor) {
		return visitor.visitErrorNode(this);
	}
}

class ParseTreeWalker {

	/**
	 * Performs a walk on the given parse tree starting at the root and going down recursively
	 * with depth-first search. On each node, {@link ParseTreeWalker//enterRule} is called before
	 * recursively walking down into child nodes, then
	 * {@link ParseTreeWalker//exitRule} is called after the recursive call to wind up.
	 * @param listener The listener used by the walker to process grammar rules
	 * @param t The parse tree to be walked on
	 */
	walk(listener, t) {
		const errorNode = t instanceof ErrorNode ||
				(t.isErrorNode !== undefined && t.isErrorNode());
		if (errorNode) {
			listener.visitErrorNode(t);
		} else if (t instanceof TerminalNode) {
			listener.visitTerminal(t);
		} else {
			this.enterRule(listener, t);
			for (let i = 0; i < t.getChildCount(); i++) {
				const child = t.getChild(i);
				this.walk(listener, child);
			}
			this.exitRule(listener, t);
		}
	}

	/**
	 * Enters a grammar rule by first triggering the generic event {@link ParseTreeListener//enterEveryRule}
	 * then by triggering the event specific to the given parse tree node
	 * @param listener The listener responding to the trigger events
	 * @param r The grammar rule containing the rule context
	 */
	enterRule(listener, r) {
		const ctx = r.getRuleContext();
		listener.enterEveryRule(ctx);
		ctx.enterRule(listener);
	}

	/**
	 * Exits a grammar rule by first triggering the event specific to the given parse tree node
	 * then by triggering the generic event {@link ParseTreeListener//exitEveryRule}
	 * @param listener The listener responding to the trigger events
	 * @param r The grammar rule containing the rule context
	 */
	exitRule(listener, r) {
		const ctx = r.getRuleContext();
		ctx.exitRule(listener);
		listener.exitEveryRule(ctx);
	}
}

ParseTreeWalker.DEFAULT = new ParseTreeWalker();

var Tree_1 = {
	RuleNode,
	ErrorNode,
	TerminalNode,
	ErrorNodeImpl,
	TerminalNodeImpl,
	ParseTreeListener,
	ParseTreeVisitor,
	ParseTreeWalker,
	INVALID_INTERVAL
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$4} = Token_1;
const {ErrorNode: ErrorNode$1, TerminalNode: TerminalNode$1, RuleNode: RuleNode$1} = Tree_1;

/** A set of utility routines useful for all kinds of ANTLR trees. */
const Trees = {
    /**
     * Print out a whole tree in LISP form. {@link //getNodeText} is used on the
     *  node payloads to get the text for the nodes.  Detect
     *  parse trees and extract data appropriately.
     */
    toStringTree: function(tree, ruleNames, recog) {
        ruleNames = ruleNames || null;
        recog = recog || null;
        if(recog!==null) {
            ruleNames = recog.ruleNames;
        }
        let s = Trees.getNodeText(tree, ruleNames);
        s = Utils.escapeWhitespace(s, false);
        const c = tree.getChildCount();
        if(c===0) {
            return s;
        }
        let res = "(" + s + ' ';
        if(c>0) {
            s = Trees.toStringTree(tree.getChild(0), ruleNames);
            res = res.concat(s);
        }
        for(let i=1;i<c;i++) {
            s = Trees.toStringTree(tree.getChild(i), ruleNames);
            res = res.concat(' ' + s);
        }
        res = res.concat(")");
        return res;
    },

    getNodeText: function(t, ruleNames, recog) {
        ruleNames = ruleNames || null;
        recog = recog || null;
        if(recog!==null) {
            ruleNames = recog.ruleNames;
        }
        if(ruleNames!==null) {
            if (t instanceof RuleNode$1) {
                const context = t.getRuleContext();
                const altNumber = context.getAltNumber();
                // use const value of ATN.INVALID_ALT_NUMBER to avoid circular dependency
                if ( altNumber != 0 ) {
                    return ruleNames[t.ruleIndex]+":"+altNumber;
                }
                return ruleNames[t.ruleIndex];
            } else if ( t instanceof ErrorNode$1) {
                return t.toString();
            } else if(t instanceof TerminalNode$1) {
                if(t.symbol!==null) {
                    return t.symbol.text;
                }
            }
        }
        // no recog for rule names
        const payload = t.getPayload();
        if (payload instanceof Token$4 ) {
            return payload.text;
        }
        return t.getPayload().toString();
    },

    /**
     * Return ordered list of all children of this node
     */
    getChildren: function(t) {
        const list = [];
        for(let i=0;i<t.getChildCount();i++) {
            list.push(t.getChild(i));
        }
        return list;
    },

    /**
     * Return a list of all ancestors of this node.  The first node of
     * list is the root and the last is the parent of this node.
     */
    getAncestors: function(t) {
        let ancestors = [];
        t = t.getParent();
        while(t!==null) {
            ancestors = [t].concat(ancestors);
            t = t.getParent();
        }
        return ancestors;
    },

    findAllTokenNodes: function(t, ttype) {
        return Trees.findAllNodes(t, ttype, true);
    },

    findAllRuleNodes: function(t, ruleIndex) {
        return Trees.findAllNodes(t, ruleIndex, false);
    },

    findAllNodes: function(t, index, findTokens) {
        const nodes = [];
        Trees._findAllNodes(t, index, findTokens, nodes);
        return nodes;
    },

    _findAllNodes: function(t, index, findTokens, nodes) {
        // check this node (the root) first
        if(findTokens && (t instanceof TerminalNode$1)) {
            if(t.symbol.type===index) {
                nodes.push(t);
            }
        } else if(!findTokens && (t instanceof RuleNode$1)) {
            if(t.ruleIndex===index) {
                nodes.push(t);
            }
        }
        // check children
        for(let i=0;i<t.getChildCount();i++) {
            Trees._findAllNodes(t.getChild(i), index, findTokens, nodes);
        }
    },

    descendants: function(t) {
        let nodes = [t];
        for(let i=0;i<t.getChildCount();i++) {
            nodes = nodes.concat(Trees.descendants(t.getChild(i)));
        }
        return nodes;
    }
};

var Trees_1 = Trees;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {RuleNode: RuleNode$2} = Tree_1;
const {INVALID_INTERVAL: INVALID_INTERVAL$1} = Tree_1;


class RuleContext extends RuleNode$2 {
	/** A rule context is a record of a single rule invocation. It knows
	 * which context invoked it, if any. If there is no parent context, then
	 * naturally the invoking state is not valid.  The parent link
	 * provides a chain upwards from the current rule invocation to the root
	 * of the invocation tree, forming a stack. We actually carry no
	 * information about the rule associated with this context (except
	 * when parsing). We keep only the state number of the invoking state from
	 * the ATN submachine that invoked this. Contrast this with the s
	 * pointer inside ParserRuleContext that tracks the current state
	 * being "executed" for the current rule.
	 *
	 * The parent contexts are useful for computing lookahead sets and
	 * getting error information.
	 *
	 * These objects are used during parsing and prediction.
	 * For the special case of parsers, we use the subclass
	 * ParserRuleContext.
	 *
	 * @see ParserRuleContext
	 */
	constructor(parent, invokingState) {
		// What context invoked this rule?
		super();
		this.parentCtx = parent || null;
		/**
		 * What state invoked the rule associated with this context?
		 * The "return address" is the followState of invokingState
		 * If parent is null, this should be -1.
		 */
		this.invokingState = invokingState || -1;
	}

	depth() {
		let n = 0;
		let p = this;
		while (p !== null) {
			p = p.parentCtx;
			n += 1;
		}
		return n;
	}

	/**
	 * A context is empty if there is no invoking state; meaning nobody call
	 * current context.
	 */
	isEmpty() {
		return this.invokingState === -1;
	}

// satisfy the ParseTree / SyntaxTree interface
	getSourceInterval() {
		return INVALID_INTERVAL$1;
	}

	getRuleContext() {
		return this;
	}

	getPayload() {
		return this;
	}

	/**
	 * Return the combined text of all child nodes. This method only considers
	 * tokens which have been added to the parse tree.
	 * <p>
	 * Since tokens on hidden channels (e.g. whitespace or comments) are not
	 * added to the parse trees, they will not appear in the output of this
	 * method.
	 */
	getText() {
		if (this.getChildCount() === 0) {
			return "";
		} else {
			return this.children.map(function(child) {
				return child.getText();
			}).join("");
		}
	}

	/**
	 * For rule associated with this parse tree internal node, return
	 * the outer alternative number used to match the input. Default
	 * implementation does not compute nor store this alt num. Create
	 * a subclass of ParserRuleContext with backing field and set
	 * option contextSuperClass.
	 * to set it.
	 */
	getAltNumber() {
	    // use constant value of ATN.INVALID_ALT_NUMBER to avoid circular dependency
	    return 0;
    }

	/**
	 * Set the outer alternative number for this context node. Default
	 * implementation does nothing to avoid backing field overhead for
	 * trees that don't need it.  Create
	 * a subclass of ParserRuleContext with backing field and set
	 * option contextSuperClass.
	 */
	setAltNumber(altNumber) { }

	getChild(i) {
		return null;
	}

	getChildCount() {
		return 0;
	}

	accept(visitor) {
		return visitor.visitChildren(this);
	}

	/**
	 * Print out a whole tree, not just a node, in LISP format
	 * (root child1 .. childN). Print just a node if this is a leaf.
	 */
	toStringTree(ruleNames, recog) {
		return Trees_1.toStringTree(this, ruleNames, recog);
	}

	toString(ruleNames, stop) {
		ruleNames = ruleNames || null;
		stop = stop || null;
		let p = this;
		let s = "[";
		while (p !== null && p !== stop) {
			if (ruleNames === null) {
				if (!p.isEmpty()) {
					s += p.invokingState;
				}
			} else {
				const ri = p.ruleIndex;
				const ruleName = (ri >= 0 && ri < ruleNames.length) ? ruleNames[ri]
						: "" + ri;
				s += ruleName;
			}
			if (p.parentCtx !== null && (ruleNames !== null || !p.parentCtx.isEmpty())) {
				s += " ";
			}
			p = p.parentCtx;
		}
		s += "]";
		return s;
	}
}

var RuleContext_1 = RuleContext;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Hash: Hash$4, Map: Map$2, equalArrays: equalArrays$1} = Utils;

class PredictionContext {

	constructor(cachedHashCode) {
		this.cachedHashCode = cachedHashCode;
	}

	/**
	 * Stores the computed hash code of this {@link PredictionContext}. The hash
	 * code is computed in parts to match the following reference algorithm.
	 *
	 * <pre>
	 * private int referenceHashCode() {
	 * int hash = {@link MurmurHash//initialize MurmurHash.initialize}({@link
	 * //INITIAL_HASH});
	 *
	 * for (int i = 0; i &lt; {@link //size()}; i++) {
	 * hash = {@link MurmurHash//update MurmurHash.update}(hash, {@link //getParent
	 * getParent}(i));
	 * }
	 *
	 * for (int i = 0; i &lt; {@link //size()}; i++) {
	 * hash = {@link MurmurHash//update MurmurHash.update}(hash, {@link
	 * //getReturnState getReturnState}(i));
	 * }
	 *
	 * hash = {@link MurmurHash//finish MurmurHash.finish}(hash, 2// {@link
	 * //size()});
	 * return hash;
	 * }
	 * </pre>
	 * This means only the {@link //EMPTY} context is in set.
	 */
	isEmpty() {
		return this === PredictionContext.EMPTY;
	}

	hasEmptyPath() {
		return this.getReturnState(this.length - 1) === PredictionContext.EMPTY_RETURN_STATE;
	}

	hashCode() {
		return this.cachedHashCode;
	}

	updateHashCode(hash) {
		hash.update(this.cachedHashCode);
	}
}

/**
 * Represents {@code $} in local context prediction, which means wildcard.
 * {@code//+x =//}.
 */
PredictionContext.EMPTY = null;

/**
 * Represents {@code $} in an array in full context mode, when {@code $}
 * doesn't mean wildcard: {@code $ + x = [$,x]}. Here,
 * {@code $} = {@link //EMPTY_RETURN_STATE}.
 */
PredictionContext.EMPTY_RETURN_STATE = 0x7FFFFFFF;

PredictionContext.globalNodeCount = 1;
PredictionContext.id = PredictionContext.globalNodeCount;


/*
function calculateHashString(parent, returnState) {
	return "" + parent + returnState;
}
*/

/**
 * Used to cache {@link PredictionContext} objects. Its used for the shared
 * context cash associated with contexts in DFA states. This cache
 * can be used for both lexers and parsers.
 */
class PredictionContextCache {

	constructor() {
		this.cache = new Map$2();
	}

	/**
	 * Add a context to the cache and return it. If the context already exists,
	 * return that one instead and do not add a new context to the cache.
	 * Protect shared cache from unsafe thread access.
	 */
	add(ctx) {
		if (ctx === PredictionContext.EMPTY) {
			return PredictionContext.EMPTY;
		}
		const existing = this.cache.get(ctx) || null;
		if (existing !== null) {
			return existing;
		}
		this.cache.put(ctx, ctx);
		return ctx;
	}

	get(ctx) {
		return this.cache.get(ctx) || null;
	}

	get length(){
		return this.cache.length;
	}
}


class SingletonPredictionContext extends PredictionContext {

	constructor(parent, returnState) {
		let hashCode = 0;
		const hash = new Hash$4();
		if(parent !== null) {
			hash.update(parent, returnState);
		} else {
			hash.update(1);
		}
		hashCode = hash.finish();
		super(hashCode);
		this.parentCtx = parent;
		this.returnState = returnState;
	}

	getParent(index) {
		return this.parentCtx;
	}

	getReturnState(index) {
		return this.returnState;
	}

	equals(other) {
		if (this === other) {
			return true;
		} else if (!(other instanceof SingletonPredictionContext)) {
			return false;
		} else if (this.hashCode() !== other.hashCode()) {
			return false; // can't be same if hash is different
		} else {
			if(this.returnState !== other.returnState)
				return false;
			else if(this.parentCtx==null)
				return other.parentCtx==null
			else
				return this.parentCtx.equals(other.parentCtx);
		}
	}

	toString() {
		const up = this.parentCtx === null ? "" : this.parentCtx.toString();
		if (up.length === 0) {
			if (this.returnState === PredictionContext.EMPTY_RETURN_STATE) {
				return "$";
			} else {
				return "" + this.returnState;
			}
		} else {
			return "" + this.returnState + " " + up;
		}
	}

	get length(){
		return 1;
	}

	static create(parent, returnState) {
		if (returnState === PredictionContext.EMPTY_RETURN_STATE && parent === null) {
			// someone can pass in the bits of an array ctx that mean $
			return PredictionContext.EMPTY;
		} else {
			return new SingletonPredictionContext(parent, returnState);
		}
	}
}

class EmptyPredictionContext extends SingletonPredictionContext {

	constructor() {
		super(null, PredictionContext.EMPTY_RETURN_STATE);
	}

	isEmpty() {
		return true;
	}

	getParent(index) {
		return null;
	}

	getReturnState(index) {
		return this.returnState;
	}

	equals(other) {
		return this === other;
	}

	toString() {
		return "$";
	}
}


PredictionContext.EMPTY = new EmptyPredictionContext();

class ArrayPredictionContext extends PredictionContext {

	constructor(parents, returnStates) {
		/**
		 * Parent can be null only if full ctx mode and we make an array
		 * from {@link //EMPTY} and non-empty. We merge {@link //EMPTY} by using
		 * null parent and
		 * returnState == {@link //EMPTY_RETURN_STATE}.
		 */
		const h = new Hash$4();
		h.update(parents, returnStates);
		const hashCode = h.finish();
		super(hashCode);
		this.parents = parents;
		this.returnStates = returnStates;
		return this;
	}

	isEmpty() {
		// since EMPTY_RETURN_STATE can only appear in the last position, we
		// don't need to verify that size==1
		return this.returnStates[0] === PredictionContext.EMPTY_RETURN_STATE;
	}

	getParent(index) {
		return this.parents[index];
	}

	getReturnState(index) {
		return this.returnStates[index];
	}

	equals(other) {
		if (this === other) {
			return true;
		} else if (!(other instanceof ArrayPredictionContext)) {
			return false;
		} else if (this.hashCode() !== other.hashCode()) {
			return false; // can't be same if hash is different
		} else {
			return equalArrays$1(this.returnStates, other.returnStates) &&
				equalArrays$1(this.parents, other.parents);
		}
	}

	toString() {
		if (this.isEmpty()) {
			return "[]";
		} else {
			let s = "[";
			for (let i = 0; i < this.returnStates.length; i++) {
				if (i > 0) {
					s = s + ", ";
				}
				if (this.returnStates[i] === PredictionContext.EMPTY_RETURN_STATE) {
					s = s + "$";
					continue;
				}
				s = s + this.returnStates[i];
				if (this.parents[i] !== null) {
					s = s + " " + this.parents[i];
				} else {
					s = s + "null";
				}
			}
			return s + "]";
		}
	}

	get length(){
		return this.returnStates.length;
	}
}


/**
 * Convert a {@link RuleContext} tree to a {@link PredictionContext} graph.
 * Return {@link //EMPTY} if {@code outerContext} is empty or null.
 */
function predictionContextFromRuleContext(atn, outerContext) {
	if (outerContext === undefined || outerContext === null) {
		outerContext = RuleContext_1.EMPTY;
	}
	// if we are in RuleContext of start rule, s, then PredictionContext
	// is EMPTY. Nobody called us. (if we are empty, return empty)
	if (outerContext.parentCtx === null || outerContext === RuleContext_1.EMPTY) {
		return PredictionContext.EMPTY;
	}
	// If we have a parent, convert it to a PredictionContext graph
	const parent = predictionContextFromRuleContext(atn, outerContext.parentCtx);
	const state = atn.states[outerContext.invokingState];
	const transition = state.transitions[0];
	return SingletonPredictionContext.create(parent, transition.followState.stateNumber);
}
/*
function calculateListsHashString(parents, returnStates) {
	const s = "";
	parents.map(function(p) {
		s = s + p;
	});
	returnStates.map(function(r) {
		s = s + r;
	});
	return s;
}
*/
function merge(a, b, rootIsWildcard, mergeCache) {
	// share same graph if both same
	if (a === b) {
		return a;
	}
	if (a instanceof SingletonPredictionContext && b instanceof SingletonPredictionContext) {
		return mergeSingletons(a, b, rootIsWildcard, mergeCache);
	}
	// At least one of a or b is array
	// If one is $ and rootIsWildcard, return $ as// wildcard
	if (rootIsWildcard) {
		if (a instanceof EmptyPredictionContext) {
			return a;
		}
		if (b instanceof EmptyPredictionContext) {
			return b;
		}
	}
	// convert singleton so both are arrays to normalize
	if (a instanceof SingletonPredictionContext) {
		a = new ArrayPredictionContext([a.getParent()], [a.returnState]);
	}
	if (b instanceof SingletonPredictionContext) {
		b = new ArrayPredictionContext([b.getParent()], [b.returnState]);
	}
	return mergeArrays(a, b, rootIsWildcard, mergeCache);
}

/**
 * Merge two {@link SingletonPredictionContext} instances.
 *
 * <p>Stack tops equal, parents merge is same; return left graph.<br>
 * <embed src="images/SingletonMerge_SameRootSamePar.svg"
 * type="image/svg+xml"/></p>
 *
 * <p>Same stack top, parents differ; merge parents giving array node, then
 * remainders of those graphs. A new root node is created to point to the
 * merged parents.<br>
 * <embed src="images/SingletonMerge_SameRootDiffPar.svg"
 * type="image/svg+xml"/></p>
 *
 * <p>Different stack tops pointing to same parent. Make array node for the
 * root where both element in the root point to the same (original)
 * parent.<br>
 * <embed src="images/SingletonMerge_DiffRootSamePar.svg"
 * type="image/svg+xml"/></p>
 *
 * <p>Different stack tops pointing to different parents. Make array node for
 * the root where each element points to the corresponding original
 * parent.<br>
 * <embed src="images/SingletonMerge_DiffRootDiffPar.svg"
 * type="image/svg+xml"/></p>
 *
 * @param a the first {@link SingletonPredictionContext}
 * @param b the second {@link SingletonPredictionContext}
 * @param rootIsWildcard {@code true} if this is a local-context merge,
 * otherwise false to indicate a full-context merge
 * @param mergeCache
 */
function mergeSingletons(a, b, rootIsWildcard, mergeCache) {
	if (mergeCache !== null) {
		let previous = mergeCache.get(a, b);
		if (previous !== null) {
			return previous;
		}
		previous = mergeCache.get(b, a);
		if (previous !== null) {
			return previous;
		}
	}

	const rootMerge = mergeRoot(a, b, rootIsWildcard);
	if (rootMerge !== null) {
		if (mergeCache !== null) {
			mergeCache.set(a, b, rootMerge);
		}
		return rootMerge;
	}
	if (a.returnState === b.returnState) {
		const parent = merge(a.parentCtx, b.parentCtx, rootIsWildcard, mergeCache);
		// if parent is same as existing a or b parent or reduced to a parent,
		// return it
		if (parent === a.parentCtx) {
			return a; // ax + bx = ax, if a=b
		}
		if (parent === b.parentCtx) {
			return b; // ax + bx = bx, if a=b
		}
		// else: ax + ay = a'[x,y]
		// merge parents x and y, giving array node with x,y then remainders
		// of those graphs. dup a, a' points at merged array
		// new joined parent so create new singleton pointing to it, a'
		const spc = SingletonPredictionContext.create(parent, a.returnState);
		if (mergeCache !== null) {
			mergeCache.set(a, b, spc);
		}
		return spc;
	} else { // a != b payloads differ
		// see if we can collapse parents due to $+x parents if local ctx
		let singleParent = null;
		if (a === b || (a.parentCtx !== null && a.parentCtx === b.parentCtx)) { // ax +
																				// bx =
																				// [a,b]x
			singleParent = a.parentCtx;
		}
		if (singleParent !== null) { // parents are same
			// sort payloads and use same parent
			const payloads = [ a.returnState, b.returnState ];
			if (a.returnState > b.returnState) {
				payloads[0] = b.returnState;
				payloads[1] = a.returnState;
			}
			const parents = [ singleParent, singleParent ];
			const apc = new ArrayPredictionContext(parents, payloads);
			if (mergeCache !== null) {
				mergeCache.set(a, b, apc);
			}
			return apc;
		}
		// parents differ and can't merge them. Just pack together
		// into array; can't merge.
		// ax + by = [ax,by]
		const payloads = [ a.returnState, b.returnState ];
		let parents = [ a.parentCtx, b.parentCtx ];
		if (a.returnState > b.returnState) { // sort by payload
			payloads[0] = b.returnState;
			payloads[1] = a.returnState;
			parents = [ b.parentCtx, a.parentCtx ];
		}
		const a_ = new ArrayPredictionContext(parents, payloads);
		if (mergeCache !== null) {
			mergeCache.set(a, b, a_);
		}
		return a_;
	}
}

/**
 * Handle case where at least one of {@code a} or {@code b} is
 * {@link //EMPTY}. In the following diagrams, the symbol {@code $} is used
 * to represent {@link //EMPTY}.
 *
 * <h2>Local-Context Merges</h2>
 *
 * <p>These local-context merge operations are used when {@code rootIsWildcard}
 * is true.</p>
 *
 * <p>{@link //EMPTY} is superset of any graph; return {@link //EMPTY}.<br>
 * <embed src="images/LocalMerge_EmptyRoot.svg" type="image/svg+xml"/></p>
 *
 * <p>{@link //EMPTY} and anything is {@code //EMPTY}, so merged parent is
 * {@code //EMPTY}; return left graph.<br>
 * <embed src="images/LocalMerge_EmptyParent.svg" type="image/svg+xml"/></p>
 *
 * <p>Special case of last merge if local context.<br>
 * <embed src="images/LocalMerge_DiffRoots.svg" type="image/svg+xml"/></p>
 *
 * <h2>Full-Context Merges</h2>
 *
 * <p>These full-context merge operations are used when {@code rootIsWildcard}
 * is false.</p>
 *
 * <p><embed src="images/FullMerge_EmptyRoots.svg" type="image/svg+xml"/></p>
 *
 * <p>Must keep all contexts; {@link //EMPTY} in array is a special value (and
 * null parent).<br>
 * <embed src="images/FullMerge_EmptyRoot.svg" type="image/svg+xml"/></p>
 *
 * <p><embed src="images/FullMerge_SameRoot.svg" type="image/svg+xml"/></p>
 *
 * @param a the first {@link SingletonPredictionContext}
 * @param b the second {@link SingletonPredictionContext}
 * @param rootIsWildcard {@code true} if this is a local-context merge,
 * otherwise false to indicate a full-context merge
 */
function mergeRoot(a, b, rootIsWildcard) {
	if (rootIsWildcard) {
		if (a === PredictionContext.EMPTY) {
			return PredictionContext.EMPTY; // // + b =//
		}
		if (b === PredictionContext.EMPTY) {
			return PredictionContext.EMPTY; // a +// =//
		}
	} else {
		if (a === PredictionContext.EMPTY && b === PredictionContext.EMPTY) {
			return PredictionContext.EMPTY; // $ + $ = $
		} else if (a === PredictionContext.EMPTY) { // $ + x = [$,x]
			const payloads = [ b.returnState,
					PredictionContext.EMPTY_RETURN_STATE ];
			const parents = [ b.parentCtx, null ];
			return new ArrayPredictionContext(parents, payloads);
		} else if (b === PredictionContext.EMPTY) { // x + $ = [$,x] ($ is always first if present)
			const payloads = [ a.returnState, PredictionContext.EMPTY_RETURN_STATE ];
			const parents = [ a.parentCtx, null ];
			return new ArrayPredictionContext(parents, payloads);
		}
	}
	return null;
}

/**
 * Merge two {@link ArrayPredictionContext} instances.
 *
 * <p>Different tops, different parents.<br>
 * <embed src="images/ArrayMerge_DiffTopDiffPar.svg" type="image/svg+xml"/></p>
 *
 * <p>Shared top, same parents.<br>
 * <embed src="images/ArrayMerge_ShareTopSamePar.svg" type="image/svg+xml"/></p>
 *
 * <p>Shared top, different parents.<br>
 * <embed src="images/ArrayMerge_ShareTopDiffPar.svg" type="image/svg+xml"/></p>
 *
 * <p>Shared top, all shared parents.<br>
 * <embed src="images/ArrayMerge_ShareTopSharePar.svg"
 * type="image/svg+xml"/></p>
 *
 * <p>Equal tops, merge parents and reduce top to
 * {@link SingletonPredictionContext}.<br>
 * <embed src="images/ArrayMerge_EqualTop.svg" type="image/svg+xml"/></p>
 */
function mergeArrays(a, b, rootIsWildcard, mergeCache) {
	if (mergeCache !== null) {
		let previous = mergeCache.get(a, b);
		if (previous !== null) {
			return previous;
		}
		previous = mergeCache.get(b, a);
		if (previous !== null) {
			return previous;
		}
	}
	// merge sorted payloads a + b => M
	let i = 0; // walks a
	let j = 0; // walks b
	let k = 0; // walks target M array

	let mergedReturnStates = [];
	let mergedParents = [];
	// walk and merge to yield mergedParents, mergedReturnStates
	while (i < a.returnStates.length && j < b.returnStates.length) {
		const a_parent = a.parents[i];
		const b_parent = b.parents[j];
		if (equalArrays$1(a.returnStates[i], b.returnStates[j])) {
			// same payload (stack tops are equal), must yield merged singleton
			const payload = a.returnStates[i];
			// $+$ = $
			const bothDollars = payload === PredictionContext.EMPTY_RETURN_STATE &&
					a_parent === null && b_parent === null;
			const ax_ax = (a_parent !== null && b_parent !== null && a_parent === b_parent); // ax+ax
																							// ->
																							// ax
			if (bothDollars || ax_ax) {
				mergedParents[k] = a_parent; // choose left
				mergedReturnStates[k] = payload;
			} else { // ax+ay -> a'[x,y]
				mergedParents[k] = merge(a_parent, b_parent, rootIsWildcard, mergeCache);
				mergedReturnStates[k] = payload;
			}
			i += 1; // hop over left one as usual
			j += 1; // but also skip one in right side since we merge
		} else if (a.returnStates[i] < b.returnStates[j]) { // copy a[i] to M
			mergedParents[k] = a_parent;
			mergedReturnStates[k] = a.returnStates[i];
			i += 1;
		} else { // b > a, copy b[j] to M
			mergedParents[k] = b_parent;
			mergedReturnStates[k] = b.returnStates[j];
			j += 1;
		}
		k += 1;
	}
	// copy over any payloads remaining in either array
	if (i < a.returnStates.length) {
		for (let p = i; p < a.returnStates.length; p++) {
			mergedParents[k] = a.parents[p];
			mergedReturnStates[k] = a.returnStates[p];
			k += 1;
		}
	} else {
		for (let p = j; p < b.returnStates.length; p++) {
			mergedParents[k] = b.parents[p];
			mergedReturnStates[k] = b.returnStates[p];
			k += 1;
		}
	}
	// trim merged if we combined a few that had same stack tops
	if (k < mergedParents.length) { // write index < last position; trim
		if (k === 1) { // for just one merged element, return singleton top
			const a_ = SingletonPredictionContext.create(mergedParents[0],
					mergedReturnStates[0]);
			if (mergeCache !== null) {
				mergeCache.set(a, b, a_);
			}
			return a_;
		}
		mergedParents = mergedParents.slice(0, k);
		mergedReturnStates = mergedReturnStates.slice(0, k);
	}

	const M = new ArrayPredictionContext(mergedParents, mergedReturnStates);

	// if we created same array as a or b, return that instead
	// TODO: track whether this is possible above during merge sort for speed
	if (M === a) {
		if (mergeCache !== null) {
			mergeCache.set(a, b, a);
		}
		return a;
	}
	if (M === b) {
		if (mergeCache !== null) {
			mergeCache.set(a, b, b);
		}
		return b;
	}
	combineCommonParents(mergedParents);

	if (mergeCache !== null) {
		mergeCache.set(a, b, M);
	}
	return M;
}

/**
 * Make pass over all <em>M</em> {@code parents}; merge any {@code equals()}
 * ones.
 */
function combineCommonParents(parents) {
	const uniqueParents = new Map$2();

	for (let p = 0; p < parents.length; p++) {
		const parent = parents[p];
		if (!(uniqueParents.containsKey(parent))) {
			uniqueParents.put(parent, parent);
		}
	}
	for (let q = 0; q < parents.length; q++) {
		parents[q] = uniqueParents.get(parents[q]);
	}
}

function getCachedPredictionContext(context, contextCache, visited) {
	if (context.isEmpty()) {
		return context;
	}
	let existing = visited.get(context) || null;
	if (existing !== null) {
		return existing;
	}
	existing = contextCache.get(context);
	if (existing !== null) {
		visited.put(context, existing);
		return existing;
	}
	let changed = false;
	let parents = [];
	for (let i = 0; i < parents.length; i++) {
		const parent = getCachedPredictionContext(context.getParent(i), contextCache, visited);
		if (changed || parent !== context.getParent(i)) {
			if (!changed) {
				parents = [];
				for (let j = 0; j < context.length; j++) {
					parents[j] = context.getParent(j);
				}
				changed = true;
			}
			parents[i] = parent;
		}
	}
	if (!changed) {
		contextCache.add(context);
		visited.put(context, context);
		return context;
	}
	let updated = null;
	if (parents.length === 0) {
		updated = PredictionContext.EMPTY;
	} else if (parents.length === 1) {
		updated = SingletonPredictionContext.create(parents[0], context
				.getReturnState(0));
	} else {
		updated = new ArrayPredictionContext(parents, context.returnStates);
	}
	contextCache.add(updated);
	visited.put(updated, updated);
	visited.put(context, updated);

	return updated;
}

var PredictionContext_1 = {
	merge,
	PredictionContext,
	PredictionContextCache,
	SingletonPredictionContext,
	predictionContextFromRuleContext,
	getCachedPredictionContext
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Set: Set$2, BitSet: BitSet$1} = Utils;
const {Token: Token$5} = Token_1;
const {ATNConfig: ATNConfig$1} = ATNConfig_1;
const {IntervalSet: IntervalSet$2} = IntervalSet_1;
const {RuleStopState: RuleStopState$1} = ATNState_1;
const {RuleTransition: RuleTransition$1, NotSetTransition: NotSetTransition$1, WildcardTransition: WildcardTransition$1, AbstractPredicateTransition: AbstractPredicateTransition$1} = Transition_1;
const {predictionContextFromRuleContext: predictionContextFromRuleContext$1, PredictionContext: PredictionContext$1, SingletonPredictionContext: SingletonPredictionContext$1} = PredictionContext_1;

class LL1Analyzer {
    constructor(atn) {
        this.atn = atn;
    }

    /**
     * Calculates the SLL(1) expected lookahead set for each outgoing transition
     * of an {@link ATNState}. The returned array has one element for each
     * outgoing transition in {@code s}. If the closure from transition
     * <em>i</em> leads to a semantic predicate before matching a symbol, the
     * element at index <em>i</em> of the result will be {@code null}.
     *
     * @param s the ATN state
     * @return the expected symbols for each outgoing transition of {@code s}.
     */
    getDecisionLookahead(s) {
        if (s === null) {
            return null;
        }
        const count = s.transitions.length;
        const look = [];
        for(let alt=0; alt< count; alt++) {
            look[alt] = new IntervalSet$2();
            const lookBusy = new Set$2();
            const seeThruPreds = false; // fail to get lookahead upon pred
            this._LOOK(s.transition(alt).target, null, PredictionContext$1.EMPTY,
                  look[alt], lookBusy, new BitSet$1(), seeThruPreds, false);
            // Wipe out lookahead for this alternative if we found nothing
            // or we had a predicate when we !seeThruPreds
            if (look[alt].length===0 || look[alt].contains(LL1Analyzer.HIT_PRED)) {
                look[alt] = null;
            }
        }
        return look;
    }

    /**
     * Compute set of tokens that can follow {@code s} in the ATN in the
     * specified {@code ctx}.
     *
     * <p>If {@code ctx} is {@code null} and the end of the rule containing
     * {@code s} is reached, {@link Token//EPSILON} is added to the result set.
     * If {@code ctx} is not {@code null} and the end of the outermost rule is
     * reached, {@link Token//EOF} is added to the result set.</p>
     *
     * @param s the ATN state
     * @param stopState the ATN state to stop at. This can be a
     * {@link BlockEndState} to detect epsilon paths through a closure.
     * @param ctx the complete parser context, or {@code null} if the context
     * should be ignored
     *
     * @return The set of tokens that can follow {@code s} in the ATN in the
     * specified {@code ctx}.
     */
    LOOK(s, stopState, ctx) {
        const r = new IntervalSet$2();
        const seeThruPreds = true; // ignore preds; get all lookahead
        ctx = ctx || null;
        const lookContext = ctx!==null ? predictionContextFromRuleContext$1(s.atn, ctx) : null;
        this._LOOK(s, stopState, lookContext, r, new Set$2(), new BitSet$1(), seeThruPreds, true);
        return r;
    }

    /**
     * Compute set of tokens that can follow {@code s} in the ATN in the
     * specified {@code ctx}.
     *
     * <p>If {@code ctx} is {@code null} and {@code stopState} or the end of the
     * rule containing {@code s} is reached, {@link Token//EPSILON} is added to
     * the result set. If {@code ctx} is not {@code null} and {@code addEOF} is
     * {@code true} and {@code stopState} or the end of the outermost rule is
     * reached, {@link Token//EOF} is added to the result set.</p>
     *
     * @param s the ATN state.
     * @param stopState the ATN state to stop at. This can be a
     * {@link BlockEndState} to detect epsilon paths through a closure.
     * @param ctx The outer context, or {@code null} if the outer context should
     * not be used.
     * @param look The result lookahead set.
     * @param lookBusy A set used for preventing epsilon closures in the ATN
     * from causing a stack overflow. Outside code should pass
     * {@code new Set<ATNConfig>} for this argument.
     * @param calledRuleStack A set used for preventing left recursion in the
     * ATN from causing a stack overflow. Outside code should pass
     * {@code new BitSet()} for this argument.
     * @param seeThruPreds {@code true} to true semantic predicates as
     * implicitly {@code true} and "see through them", otherwise {@code false}
     * to treat semantic predicates as opaque and add {@link //HIT_PRED} to the
     * result if one is encountered.
     * @param addEOF Add {@link Token//EOF} to the result if the end of the
     * outermost context is reached. This parameter has no effect if {@code ctx}
     * is {@code null}.
     */
    _LOOK(s, stopState , ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF) {
        const c = new ATNConfig$1({state:s, alt:0, context: ctx}, null);
        if (lookBusy.contains(c)) {
            return;
        }
        lookBusy.add(c);
        if (s === stopState) {
            if (ctx ===null) {
                look.addOne(Token$5.EPSILON);
                return;
            } else if (ctx.isEmpty() && addEOF) {
                look.addOne(Token$5.EOF);
                return;
            }
        }
        if (s instanceof RuleStopState$1 ) {
            if (ctx ===null) {
                look.addOne(Token$5.EPSILON);
                return;
            } else if (ctx.isEmpty() && addEOF) {
                look.addOne(Token$5.EOF);
                return;
            }
            if (ctx !== PredictionContext$1.EMPTY) {
                // run thru all possible stack tops in ctx
                for(let i=0; i<ctx.length; i++) {
                    const returnState = this.atn.states[ctx.getReturnState(i)];
                    const removed = calledRuleStack.contains(returnState.ruleIndex);
                    try {
                        calledRuleStack.remove(returnState.ruleIndex);
                        this._LOOK(returnState, stopState, ctx.getParent(i), look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
                    } finally {
                        if (removed) {
                            calledRuleStack.add(returnState.ruleIndex);
                        }
                    }
                }
                return;
            }
        }
        for(let j=0; j<s.transitions.length; j++) {
            const t = s.transitions[j];
            if (t.constructor === RuleTransition$1) {
                if (calledRuleStack.contains(t.target.ruleIndex)) {
                    continue;
                }
                const newContext = SingletonPredictionContext$1.create(ctx, t.followState.stateNumber);
                try {
                    calledRuleStack.add(t.target.ruleIndex);
                    this._LOOK(t.target, stopState, newContext, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
                } finally {
                    calledRuleStack.remove(t.target.ruleIndex);
                }
            } else if (t instanceof AbstractPredicateTransition$1 ) {
                if (seeThruPreds) {
                    this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
                } else {
                    look.addOne(LL1Analyzer.HIT_PRED);
                }
            } else if( t.isEpsilon) {
                this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
            } else if (t.constructor === WildcardTransition$1) {
                look.addRange( Token$5.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType );
            } else {
                let set = t.label;
                if (set !== null) {
                    if (t instanceof NotSetTransition$1) {
                        set = set.complement(Token$5.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType);
                    }
                    look.addSet(set);
                }
            }
        }
    }
}

/**
 * Special value added to the lookahead sets to indicate that we hit
 * a predicate during analysis if {@code seeThruPreds==false}.
 */
LL1Analyzer.HIT_PRED = Token$5.INVALID_TYPE;

var LL1Analyzer_1 = LL1Analyzer;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {IntervalSet: IntervalSet$3} = IntervalSet_1;
const {Token: Token$6} = Token_1;

class ATN {

    constructor(grammarType , maxTokenType) {
        /**
         * Used for runtime deserialization of ATNs from strings
         * The type of the ATN.
        */
        this.grammarType = grammarType;
        // The maximum value for any symbol recognized by a transition in the ATN.
        this.maxTokenType = maxTokenType;
        this.states = [];
        /**
         * Each subrule/rule is a decision point and we must track them so we
         * can go back later and build DFA predictors for them.  This includes
         * all the rules, subrules, optional blocks, ()+, ()* etc...
         */
        this.decisionToState = [];
        // Maps from rule index to starting state number.
        this.ruleToStartState = [];
        // Maps from rule index to stop state number.
        this.ruleToStopState = null;
        this.modeNameToStartState = {};
        /**
         * For lexer ATNs, this maps the rule index to the resulting token type.
         * For parser ATNs, this maps the rule index to the generated bypass token
         * type if the {@link ATNDeserializationOptions//isGenerateRuleBypassTransitions}
         * deserialization option was specified; otherwise, this is {@code null}
         */
        this.ruleToTokenType = null;
        /**
         * For lexer ATNs, this is an array of {@link LexerAction} objects which may
         * be referenced by action transitions in the ATN
         */
        this.lexerActions = null;
        this.modeToStartState = [];
    }

    /**
     * Compute the set of valid tokens that can occur starting in state {@code s}.
     * If {@code ctx} is null, the set of tokens will not include what can follow
     * the rule surrounding {@code s}. In other words, the set will be
     * restricted to tokens reachable staying within {@code s}'s rule
     */
    nextTokensInContext(s, ctx) {
        const anal = new LL1Analyzer_1(this);
        return anal.LOOK(s, null, ctx);
    }

    /**
     * Compute the set of valid tokens that can occur starting in {@code s} and
     * staying in same rule. {@link Token//EPSILON} is in set if we reach end of
     * rule
     */
    nextTokensNoContext(s) {
        if (s.nextTokenWithinRule !== null ) {
            return s.nextTokenWithinRule;
        }
        s.nextTokenWithinRule = this.nextTokensInContext(s, null);
        s.nextTokenWithinRule.readOnly = true;
        return s.nextTokenWithinRule;
    }

    nextTokens(s, ctx) {
        if ( ctx===undefined ) {
            return this.nextTokensNoContext(s);
        } else {
            return this.nextTokensInContext(s, ctx);
        }
    }

    addState(state) {
        if ( state !== null ) {
            state.atn = this;
            state.stateNumber = this.states.length;
        }
        this.states.push(state);
    }

    removeState(state) {
        this.states[state.stateNumber] = null; // just free mem, don't shift states in list
    }

    defineDecisionState(s) {
        this.decisionToState.push(s);
        s.decision = this.decisionToState.length-1;
        return s.decision;
    }

    getDecisionState(decision) {
        if (this.decisionToState.length===0) {
            return null;
        } else {
            return this.decisionToState[decision];
        }
    }

    /**
     * Computes the set of input symbols which could follow ATN state number
     * {@code stateNumber} in the specified full {@code context}. This method
     * considers the complete parser context, but does not evaluate semantic
     * predicates (i.e. all predicates encountered during the calculation are
     * assumed true). If a path in the ATN exists from the starting state to the
     * {@link RuleStopState} of the outermost context without matching any
     * symbols, {@link Token//EOF} is added to the returned set.
     *
     * <p>If {@code context} is {@code null}, it is treated as
     * {@link ParserRuleContext//EMPTY}.</p>
     *
     * @param stateNumber the ATN state number
     * @param ctx the full parse context
     *
     * @return {IntervalSet} The set of potentially valid input symbols which could follow the
     * specified state in the specified context.
     *
     * @throws IllegalArgumentException if the ATN does not contain a state with
     * number {@code stateNumber}
     */
    getExpectedTokens(stateNumber, ctx ) {
        if ( stateNumber < 0 || stateNumber >= this.states.length ) {
            throw("Invalid state number.");
        }
        const s = this.states[stateNumber];
        let following = this.nextTokens(s);
        if (!following.contains(Token$6.EPSILON)) {
            return following;
        }
        const expected = new IntervalSet$3();
        expected.addSet(following);
        expected.removeOne(Token$6.EPSILON);
        while (ctx !== null && ctx.invokingState >= 0 && following.contains(Token$6.EPSILON)) {
            const invokingState = this.states[ctx.invokingState];
            const rt = invokingState.transitions[0];
            following = this.nextTokens(rt.followState);
            expected.addSet(following);
            expected.removeOne(Token$6.EPSILON);
            ctx = ctx.parentCtx;
        }
        if (following.contains(Token$6.EPSILON)) {
            expected.addOne(Token$6.EOF);
        }
        return expected;
    }
}

ATN.INVALID_ALT_NUMBER = 0;

var ATN_1 = ATN;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
/**
 * Represents the type of recognizer an ATN applies to
 */
var ATNType = {
    LEXER: 0,
    PARSER: 1
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
class ATNDeserializationOptions {
	constructor(copyFrom) {
		if(copyFrom===undefined) {
			copyFrom = null;
		}
		this.readOnly = false;
		this.verifyATN = copyFrom===null ? true : copyFrom.verifyATN;
		this.generateRuleBypassTransitions = copyFrom===null ? false : copyFrom.generateRuleBypassTransitions;
	}
}

ATNDeserializationOptions.defaultOptions = new ATNDeserializationOptions();
ATNDeserializationOptions.defaultOptions.readOnly = true;

//    def __setattr__(self, key, value):
//        if key!="readOnly" and self.readOnly:
//            raise Exception("The object is read only.")
//        super(type(self), self).__setattr__(key,value)

var ATNDeserializationOptions_1 = ATNDeserializationOptions;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
const LexerActionType = {
    // The type of a {@link LexerChannelAction} action.
    CHANNEL: 0,
    // The type of a {@link LexerCustomAction} action
    CUSTOM: 1,
    // The type of a {@link LexerModeAction} action.
    MODE: 2,
    //The type of a {@link LexerMoreAction} action.
    MORE: 3,
    //The type of a {@link LexerPopModeAction} action.
    POP_MODE: 4,
    //The type of a {@link LexerPushModeAction} action.
    PUSH_MODE: 5,
    //The type of a {@link LexerSkipAction} action.
    SKIP: 6,
    //The type of a {@link LexerTypeAction} action.
    TYPE: 7
};

class LexerAction {
    constructor(action) {
        this.actionType = action;
        this.isPositionDependent = false;
    }

    hashCode() {
        const hash = new Hash();
        this.updateHashCode(hash);
        return hash.finish()
    }

    updateHashCode(hash) {
        hash.update(this.actionType);
    }

    equals(other) {
        return this === other;
    }
}


/**
 * Implements the {@code skip} lexer action by calling {@link Lexer//skip}.
 *
 * <p>The {@code skip} command does not have any parameters, so this action is
 * implemented as a singleton instance exposed by {@link //INSTANCE}.</p>
 */
class LexerSkipAction extends LexerAction {
    constructor() {
        super(LexerActionType.SKIP);
    }

    execute(lexer) {
        lexer.skip();
    }

    toString() {
        return "skip";
    }
}

// Provides a singleton instance of this parameterless lexer action.
LexerSkipAction.INSTANCE = new LexerSkipAction();

/**
 * Implements the {@code type} lexer action by calling {@link Lexer//setType}
 * with the assigned type
 */
class LexerTypeAction extends LexerAction {
    constructor(type) {
        super(LexerActionType.TYPE);
        this.type = type;
    }

    execute(lexer) {
        lexer.type = this.type;
    }

    updateHashCode(hash) {
        hash.update(this.actionType, this.type);
    }

    equals(other) {
        if(this === other) {
            return true;
        } else if (! (other instanceof LexerTypeAction)) {
            return false;
        } else {
            return this.type === other.type;
        }
    }

    toString() {
        return "type(" + this.type + ")";
    }
}


/**
 * Implements the {@code pushMode} lexer action by calling
 * {@link Lexer//pushMode} with the assigned mode
 */
class LexerPushModeAction extends LexerAction {
    constructor(mode) {
        super(LexerActionType.PUSH_MODE);
        this.mode = mode;
    }

    /**
     * <p>This action is implemented by calling {@link Lexer//pushMode} with the
     * value provided by {@link //getMode}.</p>
     */
    execute(lexer) {
        lexer.pushMode(this.mode);
    }

    updateHashCode(hash) {
        hash.update(this.actionType, this.mode);
    }

    equals(other) {
        if (this === other) {
            return true;
        } else if (! (other instanceof LexerPushModeAction)) {
            return false;
        } else {
            return this.mode === other.mode;
        }
    }

    toString() {
        return "pushMode(" + this.mode + ")";
    }
}

/**
 * Implements the {@code popMode} lexer action by calling {@link Lexer//popMode}.
 *
 * <p>The {@code popMode} command does not have any parameters, so this action is
 * implemented as a singleton instance exposed by {@link //INSTANCE}.</p>
 */
class LexerPopModeAction extends LexerAction {
    constructor() {
        super(LexerActionType.POP_MODE);
    }

    /**
     * <p>This action is implemented by calling {@link Lexer//popMode}.</p>
     */
    execute(lexer) {
        lexer.popMode();
    }

    toString() {
        return "popMode";
    }
}

LexerPopModeAction.INSTANCE = new LexerPopModeAction();

/**
 * Implements the {@code more} lexer action by calling {@link Lexer//more}.
 *
 * <p>The {@code more} command does not have any parameters, so this action is
 * implemented as a singleton instance exposed by {@link //INSTANCE}.</p>
 */
class LexerMoreAction extends LexerAction {
    constructor() {
        super(LexerActionType.MORE);
    }

    /**
     * <p>This action is implemented by calling {@link Lexer//popMode}.</p>
     */
    execute(lexer) {
        lexer.more();
    }

    toString() {
        return "more";
    }
}

LexerMoreAction.INSTANCE = new LexerMoreAction();


/**
 * Implements the {@code mode} lexer action by calling {@link Lexer//mode} with
 * the assigned mode
 */
class LexerModeAction extends LexerAction {
    constructor(mode) {
        super(LexerActionType.MODE);
        this.mode = mode;
    }

    /**
     * <p>This action is implemented by calling {@link Lexer//mode} with the
     * value provided by {@link //getMode}.</p>
     */
    execute(lexer) {
        lexer.mode(this.mode);
    }

    updateHashCode(hash) {
        hash.update(this.actionType, this.mode);
    }

    equals(other) {
        if (this === other) {
            return true;
        } else if (! (other instanceof LexerModeAction)) {
            return false;
        } else {
            return this.mode === other.mode;
        }
    }

    toString() {
        return "mode(" + this.mode + ")";
    }
}

/**
 * Executes a custom lexer action by calling {@link Recognizer//action} with the
 * rule and action indexes assigned to the custom action. The implementation of
 * a custom action is added to the generated code for the lexer in an override
 * of {@link Recognizer//action} when the grammar is compiled.
 *
 * <p>This class may represent embedded actions created with the <code>{...}</code>
 * syntax in ANTLR 4, as well as actions created for lexer commands where the
 * command argument could not be evaluated when the grammar was compiled.</p>
 */
class LexerCustomAction extends LexerAction {
    /**
     * Constructs a custom lexer action with the specified rule and action
     * indexes.
     *
     * @param ruleIndex The rule index to use for calls to
     * {@link Recognizer//action}.
     * @param actionIndex The action index to use for calls to
     * {@link Recognizer//action}.
     */
    constructor(ruleIndex, actionIndex) {
        super(LexerActionType.CUSTOM);
        this.ruleIndex = ruleIndex;
        this.actionIndex = actionIndex;
        this.isPositionDependent = true;
    }

    /**
     * <p>Custom actions are implemented by calling {@link Lexer//action} with the
     * appropriate rule and action indexes.</p>
     */
    execute(lexer) {
        lexer.action(null, this.ruleIndex, this.actionIndex);
    }

    updateHashCode(hash) {
        hash.update(this.actionType, this.ruleIndex, this.actionIndex);
    }

    equals(other) {
        if (this === other) {
            return true;
        } else if (! (other instanceof LexerCustomAction)) {
            return false;
        } else {
            return this.ruleIndex === other.ruleIndex && this.actionIndex === other.actionIndex;
        }
    }
}

/**
 * Implements the {@code channel} lexer action by calling
 * {@link Lexer//setChannel} with the assigned channel.
 * Constructs a new {@code channel} action with the specified channel value.
 * @param channel The channel value to pass to {@link Lexer//setChannel}
 */
class LexerChannelAction extends LexerAction {
    constructor(channel) {
        super(LexerActionType.CHANNEL);
        this.channel = channel;
    }

    /**
     * <p>This action is implemented by calling {@link Lexer//setChannel} with the
     * value provided by {@link //getChannel}.</p>
     */
    execute(lexer) {
        lexer._channel = this.channel;
    }

    updateHashCode(hash) {
        hash.update(this.actionType, this.channel);
    }

    equals(other) {
        if (this === other) {
            return true;
        } else if (! (other instanceof LexerChannelAction)) {
            return false;
        } else {
            return this.channel === other.channel;
        }
    }

    toString() {
        return "channel(" + this.channel + ")";
    }
}


/**
 * This implementation of {@link LexerAction} is used for tracking input offsets
 * for position-dependent actions within a {@link LexerActionExecutor}.
 *
 * <p>This action is not serialized as part of the ATN, and is only required for
 * position-dependent lexer actions which appear at a location other than the
 * end of a rule. For more information about DFA optimizations employed for
 * lexer actions, see {@link LexerActionExecutor//append} and
 * {@link LexerActionExecutor//fixOffsetBeforeMatch}.</p>
 *
 * Constructs a new indexed custom action by associating a character offset
 * with a {@link LexerAction}.
 *
 * <p>Note: This class is only required for lexer actions for which
 * {@link LexerAction//isPositionDependent} returns {@code true}.</p>
 *
 * @param offset The offset into the input {@link CharStream}, relative to
 * the token start index, at which the specified lexer action should be
 * executed.
 * @param action The lexer action to execute at a particular offset in the
 * input {@link CharStream}.
 */
class LexerIndexedCustomAction extends LexerAction {
    constructor(offset, action) {
        super(action.actionType);
        this.offset = offset;
        this.action = action;
        this.isPositionDependent = true;
    }

    /**
     * <p>This method calls {@link //execute} on the result of {@link //getAction}
     * using the provided {@code lexer}.</p>
     */
    execute(lexer) {
        // assume the input stream position was properly set by the calling code
        this.action.execute(lexer);
    }

    updateHashCode(hash) {
        hash.update(this.actionType, this.offset, this.action);
    }

    equals(other) {
        if (this === other) {
            return true;
        } else if (! (other instanceof LexerIndexedCustomAction)) {
            return false;
        } else {
            return this.offset === other.offset && this.action === other.action;
        }
    }
}

var LexerAction_1 = {
    LexerActionType,
    LexerSkipAction,
    LexerChannelAction,
    LexerCustomAction,
    LexerIndexedCustomAction,
    LexerMoreAction,
    LexerTypeAction,
    LexerPushModeAction,
    LexerPopModeAction,
    LexerModeAction
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$7} = Token_1;



const {
    ATNState: ATNState$1,
    BasicState: BasicState$1,
    DecisionState: DecisionState$2,
    BlockStartState: BlockStartState$1,
    BlockEndState: BlockEndState$1,
    LoopEndState: LoopEndState$1,
    RuleStartState: RuleStartState$1,
    RuleStopState: RuleStopState$2,
    TokensStartState: TokensStartState$1,
    PlusLoopbackState: PlusLoopbackState$1,
    StarLoopbackState: StarLoopbackState$1,
    StarLoopEntryState: StarLoopEntryState$1,
    PlusBlockStartState: PlusBlockStartState$1,
    StarBlockStartState: StarBlockStartState$1,
    BasicBlockStartState: BasicBlockStartState$1
} = ATNState_1;

const {
    Transition: Transition$1,
    AtomTransition: AtomTransition$2,
    SetTransition: SetTransition$1,
    NotSetTransition: NotSetTransition$2,
    RuleTransition: RuleTransition$2,
    RangeTransition: RangeTransition$1,
    ActionTransition: ActionTransition$1,
    EpsilonTransition: EpsilonTransition$1,
    WildcardTransition: WildcardTransition$2,
    PredicateTransition: PredicateTransition$1,
    PrecedencePredicateTransition: PrecedencePredicateTransition$1
} = Transition_1;

const {IntervalSet: IntervalSet$4} = IntervalSet_1;


const {
    LexerActionType: LexerActionType$1,
    LexerSkipAction: LexerSkipAction$1,
    LexerChannelAction: LexerChannelAction$1,
    LexerCustomAction: LexerCustomAction$1,
    LexerMoreAction: LexerMoreAction$1,
    LexerTypeAction: LexerTypeAction$1,
    LexerPushModeAction: LexerPushModeAction$1,
    LexerPopModeAction: LexerPopModeAction$1,
    LexerModeAction: LexerModeAction$1,
} = LexerAction_1;

// This is the earliest supported serialized UUID.
// stick to serialized version for now, we don't need a UUID instance
const BASE_SERIALIZED_UUID = "AADB8D7E-AEEF-4415-AD2B-8204D6CF042E";

//
// This UUID indicates the serialized ATN contains two sets of
// IntervalSets, where the second set's values are encoded as
// 32-bit integers to support the full Unicode SMP range up to U+10FFFF.
//
const ADDED_UNICODE_SMP = "59627784-3BE5-417A-B9EB-8131A7286089";

// This list contains all of the currently supported UUIDs, ordered by when
// the feature first appeared in this branch.
const SUPPORTED_UUIDS = [ BASE_SERIALIZED_UUID, ADDED_UNICODE_SMP ];

const SERIALIZED_VERSION = 3;

// This is the current serialized UUID.
const SERIALIZED_UUID = ADDED_UNICODE_SMP;

function initArray( length, value) {
	const tmp = [];
	tmp[length-1] = value;
	return tmp.map(function(i) {return value;});
}

class ATNDeserializer {
    constructor(options) {

        if ( options=== undefined || options === null ) {
            options = ATNDeserializationOptions_1.defaultOptions;
        }
        this.deserializationOptions = options;
        this.stateFactories = null;
        this.actionFactories = null;
    }

    /**
     * Determines if a particular serialized representation of an ATN supports
     * a particular feature, identified by the {@link UUID} used for serializing
     * the ATN at the time the feature was first introduced.
     *
     * @param feature The {@link UUID} marking the first time the feature was
     * supported in the serialized ATN.
     * @param actualUuid The {@link UUID} of the actual serialized ATN which is
     * currently being deserialized.
     * @return {@code true} if the {@code actualUuid} value represents a
     * serialized ATN at or after the feature identified by {@code feature} was
     * introduced; otherwise, {@code false}.
    */
    isFeatureSupported(feature, actualUuid) {
        const idx1 = SUPPORTED_UUIDS.indexOf(feature);
        if (idx1<0) {
            return false;
        }
        const idx2 = SUPPORTED_UUIDS.indexOf(actualUuid);
        return idx2 >= idx1;
    }

    deserialize(data) {
        this.reset(data);
        this.checkVersion();
        this.checkUUID();
        const atn = this.readATN();
        this.readStates(atn);
        this.readRules(atn);
        this.readModes(atn);
        const sets = [];
        // First, deserialize sets with 16-bit arguments <= U+FFFF.
        this.readSets(atn, sets, this.readInt.bind(this));
        // Next, if the ATN was serialized with the Unicode SMP feature,
        // deserialize sets with 32-bit arguments <= U+10FFFF.
        if (this.isFeatureSupported(ADDED_UNICODE_SMP, this.uuid)) {
            this.readSets(atn, sets, this.readInt32.bind(this));
        }
        this.readEdges(atn, sets);
        this.readDecisions(atn);
        this.readLexerActions(atn);
        this.markPrecedenceDecisions(atn);
        this.verifyATN(atn);
        if (this.deserializationOptions.generateRuleBypassTransitions && atn.grammarType === ATNType.PARSER ) {
            this.generateRuleBypassTransitions(atn);
            // re-verify after modification
            this.verifyATN(atn);
        }
        return atn;
    }

    reset(data) {
        const adjust = function(c) {
            const v = c.charCodeAt(0);
            return v>1  ? v-2 : v + 65534;
        };
        const temp = data.split("").map(adjust);
        // don't adjust the first value since that's the version number
        temp[0] = data.charCodeAt(0);
        this.data = temp;
        this.pos = 0;
    }

    checkVersion() {
        const version = this.readInt();
        if ( version !== SERIALIZED_VERSION ) {
            throw ("Could not deserialize ATN with version " + version + " (expected " + SERIALIZED_VERSION + ").");
        }
    }

    checkUUID() {
        const uuid = this.readUUID();
        if (SUPPORTED_UUIDS.indexOf(uuid)<0) {
            throw (SERIALIZED_UUID);
        }
        this.uuid = uuid;
    }

    readATN() {
        const grammarType = this.readInt();
        const maxTokenType = this.readInt();
        return new ATN_1(grammarType, maxTokenType);
    }

    readStates(atn) {
        let j, pair, stateNumber;
        const  loopBackStateNumbers = [];
        const  endStateNumbers = [];
        const  nstates = this.readInt();
        for(let i=0; i<nstates; i++) {
            const  stype = this.readInt();
            // ignore bad type of states
            if (stype===ATNState$1.INVALID_TYPE) {
                atn.addState(null);
                continue;
            }
            let ruleIndex = this.readInt();
            if (ruleIndex === 0xFFFF) {
                ruleIndex = -1;
            }
            const  s = this.stateFactory(stype, ruleIndex);
            if (stype === ATNState$1.LOOP_END) { // special case
                const  loopBackStateNumber = this.readInt();
                loopBackStateNumbers.push([s, loopBackStateNumber]);
            } else if(s instanceof BlockStartState$1) {
                const  endStateNumber = this.readInt();
                endStateNumbers.push([s, endStateNumber]);
            }
            atn.addState(s);
        }
        // delay the assignment of loop back and end states until we know all the
        // state instances have been initialized
        for (j=0; j<loopBackStateNumbers.length; j++) {
            pair = loopBackStateNumbers[j];
            pair[0].loopBackState = atn.states[pair[1]];
        }

        for (j=0; j<endStateNumbers.length; j++) {
            pair = endStateNumbers[j];
            pair[0].endState = atn.states[pair[1]];
        }

        let numNonGreedyStates = this.readInt();
        for (j=0; j<numNonGreedyStates; j++) {
            stateNumber = this.readInt();
            atn.states[stateNumber].nonGreedy = true;
        }

        let numPrecedenceStates = this.readInt();
        for (j=0; j<numPrecedenceStates; j++) {
            stateNumber = this.readInt();
            atn.states[stateNumber].isPrecedenceRule = true;
        }
    }

    readRules(atn) {
        let i;
        const nrules = this.readInt();
        if (atn.grammarType === ATNType.LEXER ) {
            atn.ruleToTokenType = initArray(nrules, 0);
        }
        atn.ruleToStartState = initArray(nrules, 0);
        for (i=0; i<nrules; i++) {
            const s = this.readInt();
            atn.ruleToStartState[i] = atn.states[s];
            if ( atn.grammarType === ATNType.LEXER ) {
                let tokenType = this.readInt();
                if (tokenType === 0xFFFF) {
                    tokenType = Token$7.EOF;
                }
                atn.ruleToTokenType[i] = tokenType;
            }
        }
        atn.ruleToStopState = initArray(nrules, 0);
        for (i=0; i<atn.states.length; i++) {
            const state = atn.states[i];
            if (!(state instanceof RuleStopState$2)) {
                continue;
            }
            atn.ruleToStopState[state.ruleIndex] = state;
            atn.ruleToStartState[state.ruleIndex].stopState = state;
        }
    }

    readModes(atn) {
        const nmodes = this.readInt();
        for (let i=0; i<nmodes; i++) {
            let s = this.readInt();
            atn.modeToStartState.push(atn.states[s]);
        }
    }

    readSets(atn, sets, readUnicode) {
        const m = this.readInt();
        for (let i=0; i<m; i++) {
            const iset = new IntervalSet$4();
            sets.push(iset);
            const n = this.readInt();
            const containsEof = this.readInt();
            if (containsEof!==0) {
                iset.addOne(-1);
            }
            for (let j=0; j<n; j++) {
                const i1 = readUnicode();
                const i2 = readUnicode();
                iset.addRange(i1, i2);
            }
        }
    }

    readEdges(atn, sets) {
        let i, j, state, trans, target;
        const nedges = this.readInt();
        for (i=0; i<nedges; i++) {
            const src = this.readInt();
            const trg = this.readInt();
            const ttype = this.readInt();
            const arg1 = this.readInt();
            const arg2 = this.readInt();
            const arg3 = this.readInt();
            trans = this.edgeFactory(atn, ttype, src, trg, arg1, arg2, arg3, sets);
            const srcState = atn.states[src];
            srcState.addTransition(trans);
        }
        // edges for rule stop states can be derived, so they aren't serialized
        for (i=0; i<atn.states.length; i++) {
            state = atn.states[i];
            for (j=0; j<state.transitions.length; j++) {
                const t = state.transitions[j];
                if (!(t instanceof RuleTransition$2)) {
                    continue;
                }
                let outermostPrecedenceReturn = -1;
                if (atn.ruleToStartState[t.target.ruleIndex].isPrecedenceRule) {
                    if (t.precedence === 0) {
                        outermostPrecedenceReturn = t.target.ruleIndex;
                    }
                }

                trans = new EpsilonTransition$1(t.followState, outermostPrecedenceReturn);
                atn.ruleToStopState[t.target.ruleIndex].addTransition(trans);
            }
        }

        for (i=0; i<atn.states.length; i++) {
            state = atn.states[i];
            if (state instanceof BlockStartState$1) {
                // we need to know the end state to set its start state
                if (state.endState === null) {
                    throw ("IllegalState");
                }
                // block end states can only be associated to a single block start
                // state
                if ( state.endState.startState !== null) {
                    throw ("IllegalState");
                }
                state.endState.startState = state;
            }
            if (state instanceof PlusLoopbackState$1) {
                for (j=0; j<state.transitions.length; j++) {
                    target = state.transitions[j].target;
                    if (target instanceof PlusBlockStartState$1) {
                        target.loopBackState = state;
                    }
                }
            } else if (state instanceof StarLoopbackState$1) {
                for (j=0; j<state.transitions.length; j++) {
                    target = state.transitions[j].target;
                    if (target instanceof StarLoopEntryState$1) {
                        target.loopBackState = state;
                    }
                }
            }
        }
    }

    readDecisions(atn) {
        const ndecisions = this.readInt();
        for (let i=0; i<ndecisions; i++) {
            const s = this.readInt();
            const decState = atn.states[s];
            atn.decisionToState.push(decState);
            decState.decision = i;
        }
    }

    readLexerActions(atn) {
        if (atn.grammarType === ATNType.LEXER) {
            const count = this.readInt();
            atn.lexerActions = initArray(count, null);
            for (let i=0; i<count; i++) {
                const actionType = this.readInt();
                let data1 = this.readInt();
                if (data1 === 0xFFFF) {
                    data1 = -1;
                }
                let data2 = this.readInt();
                if (data2 === 0xFFFF) {
                    data2 = -1;
                }

                atn.lexerActions[i] = this.lexerActionFactory(actionType, data1, data2);
            }
        }
    }

    generateRuleBypassTransitions(atn) {
        let i;
        const count = atn.ruleToStartState.length;
        for(i=0; i<count; i++) {
            atn.ruleToTokenType[i] = atn.maxTokenType + i + 1;
        }
        for(i=0; i<count; i++) {
            this.generateRuleBypassTransition(atn, i);
        }
    }

    generateRuleBypassTransition(atn, idx) {
        let i, state;
        const bypassStart = new BasicBlockStartState$1();
        bypassStart.ruleIndex = idx;
        atn.addState(bypassStart);

        const bypassStop = new BlockEndState$1();
        bypassStop.ruleIndex = idx;
        atn.addState(bypassStop);

        bypassStart.endState = bypassStop;
        atn.defineDecisionState(bypassStart);

        bypassStop.startState = bypassStart;

        let excludeTransition = null;
        let endState = null;

        if (atn.ruleToStartState[idx].isPrecedenceRule) {
            // wrap from the beginning of the rule to the StarLoopEntryState
            endState = null;
            for(i=0; i<atn.states.length; i++) {
                state = atn.states[i];
                if (this.stateIsEndStateFor(state, idx)) {
                    endState = state;
                    excludeTransition = state.loopBackState.transitions[0];
                    break;
                }
            }
            if (excludeTransition === null) {
                throw ("Couldn't identify final state of the precedence rule prefix section.");
            }
        } else {
            endState = atn.ruleToStopState[idx];
        }

        // all non-excluded transitions that currently target end state need to
        // target blockEnd instead
        for(i=0; i<atn.states.length; i++) {
            state = atn.states[i];
            for(let j=0; j<state.transitions.length; j++) {
                const transition = state.transitions[j];
                if (transition === excludeTransition) {
                    continue;
                }
                if (transition.target === endState) {
                    transition.target = bypassStop;
                }
            }
        }

        // all transitions leaving the rule start state need to leave blockStart
        // instead
        const ruleToStartState = atn.ruleToStartState[idx];
        const count = ruleToStartState.transitions.length;
        while ( count > 0) {
            bypassStart.addTransition(ruleToStartState.transitions[count-1]);
            ruleToStartState.transitions = ruleToStartState.transitions.slice(-1);
        }
        // link the new states
        atn.ruleToStartState[idx].addTransition(new EpsilonTransition$1(bypassStart));
        bypassStop.addTransition(new EpsilonTransition$1(endState));

        const matchState = new BasicState$1();
        atn.addState(matchState);
        matchState.addTransition(new AtomTransition$2(bypassStop, atn.ruleToTokenType[idx]));
        bypassStart.addTransition(new EpsilonTransition$1(matchState));
    }

    stateIsEndStateFor(state, idx) {
        if ( state.ruleIndex !== idx) {
            return null;
        }
        if (!( state instanceof StarLoopEntryState$1)) {
            return null;
        }
        const maybeLoopEndState = state.transitions[state.transitions.length - 1].target;
        if (!( maybeLoopEndState instanceof LoopEndState$1)) {
            return null;
        }
        if (maybeLoopEndState.epsilonOnlyTransitions &&
            (maybeLoopEndState.transitions[0].target instanceof RuleStopState$2)) {
            return state;
        } else {
            return null;
        }
    }

    /**
     * Analyze the {@link StarLoopEntryState} states in the specified ATN to set
     * the {@link StarLoopEntryState//isPrecedenceDecision} field to the
     * correct value.
     * @param atn The ATN.
     */
    markPrecedenceDecisions(atn) {
        for(let i=0; i<atn.states.length; i++) {
            const state = atn.states[i];
            if (!( state instanceof StarLoopEntryState$1)) {
                continue;
            }
            // We analyze the ATN to determine if this ATN decision state is the
            // decision for the closure block that determines whether a
            // precedence rule should continue or complete.
            if ( atn.ruleToStartState[state.ruleIndex].isPrecedenceRule) {
                const maybeLoopEndState = state.transitions[state.transitions.length - 1].target;
                if (maybeLoopEndState instanceof LoopEndState$1) {
                    if ( maybeLoopEndState.epsilonOnlyTransitions &&
                            (maybeLoopEndState.transitions[0].target instanceof RuleStopState$2)) {
                        state.isPrecedenceDecision = true;
                    }
                }
            }
        }
    }

    verifyATN(atn) {
        if (!this.deserializationOptions.verifyATN) {
            return;
        }
        // verify assumptions
        for(let i=0; i<atn.states.length; i++) {
            const state = atn.states[i];
            if (state === null) {
                continue;
            }
            this.checkCondition(state.epsilonOnlyTransitions || state.transitions.length <= 1);
            if (state instanceof PlusBlockStartState$1) {
                this.checkCondition(state.loopBackState !== null);
            } else  if (state instanceof StarLoopEntryState$1) {
                this.checkCondition(state.loopBackState !== null);
                this.checkCondition(state.transitions.length === 2);
                if (state.transitions[0].target instanceof StarBlockStartState$1) {
                    this.checkCondition(state.transitions[1].target instanceof LoopEndState$1);
                    this.checkCondition(!state.nonGreedy);
                } else if (state.transitions[0].target instanceof LoopEndState$1) {
                    this.checkCondition(state.transitions[1].target instanceof StarBlockStartState$1);
                    this.checkCondition(state.nonGreedy);
                } else {
                    throw("IllegalState");
                }
            } else if (state instanceof StarLoopbackState$1) {
                this.checkCondition(state.transitions.length === 1);
                this.checkCondition(state.transitions[0].target instanceof StarLoopEntryState$1);
            } else if (state instanceof LoopEndState$1) {
                this.checkCondition(state.loopBackState !== null);
            } else if (state instanceof RuleStartState$1) {
                this.checkCondition(state.stopState !== null);
            } else if (state instanceof BlockStartState$1) {
                this.checkCondition(state.endState !== null);
            } else if (state instanceof BlockEndState$1) {
                this.checkCondition(state.startState !== null);
            } else if (state instanceof DecisionState$2) {
                this.checkCondition(state.transitions.length <= 1 || state.decision >= 0);
            } else {
                this.checkCondition(state.transitions.length <= 1 || (state instanceof RuleStopState$2));
            }
        }
    }

    checkCondition(condition, message) {
        if (!condition) {
            if (message === undefined || message===null) {
                message = "IllegalState";
            }
            throw (message);
        }
    }

    readInt() {
        return this.data[this.pos++];
    }

    readInt32() {
        const low = this.readInt();
        const high = this.readInt();
        return low | (high << 16);
    }

    readLong() {
        const low = this.readInt32();
        const high = this.readInt32();
        return (low & 0x00000000FFFFFFFF) | (high << 32);
    }

    readUUID() {
        const bb = [];
        for(let i=7;i>=0;i--) {
            const int = this.readInt();
            /* jshint bitwise: false */
            bb[(2*i)+1] = int & 0xFF;
            bb[2*i] = (int >> 8) & 0xFF;
        }
        return byteToHex[bb[0]] + byteToHex[bb[1]] +
        byteToHex[bb[2]] + byteToHex[bb[3]] + '-' +
        byteToHex[bb[4]] + byteToHex[bb[5]] + '-' +
        byteToHex[bb[6]] + byteToHex[bb[7]] + '-' +
        byteToHex[bb[8]] + byteToHex[bb[9]] + '-' +
        byteToHex[bb[10]] + byteToHex[bb[11]] +
        byteToHex[bb[12]] + byteToHex[bb[13]] +
        byteToHex[bb[14]] + byteToHex[bb[15]];
    }

    edgeFactory(atn, type, src, trg, arg1, arg2, arg3, sets) {
        const target = atn.states[trg];
        switch(type) {
        case Transition$1.EPSILON:
            return new EpsilonTransition$1(target);
        case Transition$1.RANGE:
            return arg3 !== 0 ? new RangeTransition$1(target, Token$7.EOF, arg2) : new RangeTransition$1(target, arg1, arg2);
        case Transition$1.RULE:
            return new RuleTransition$2(atn.states[arg1], arg2, arg3, target);
        case Transition$1.PREDICATE:
            return new PredicateTransition$1(target, arg1, arg2, arg3 !== 0);
        case Transition$1.PRECEDENCE:
            return new PrecedencePredicateTransition$1(target, arg1);
        case Transition$1.ATOM:
            return arg3 !== 0 ? new AtomTransition$2(target, Token$7.EOF) : new AtomTransition$2(target, arg1);
        case Transition$1.ACTION:
            return new ActionTransition$1(target, arg1, arg2, arg3 !== 0);
        case Transition$1.SET:
            return new SetTransition$1(target, sets[arg1]);
        case Transition$1.NOT_SET:
            return new NotSetTransition$2(target, sets[arg1]);
        case Transition$1.WILDCARD:
            return new WildcardTransition$2(target);
        default:
            throw "The specified transition type: " + type + " is not valid.";
        }
    }

    stateFactory(type, ruleIndex) {
        if (this.stateFactories === null) {
            const sf = [];
            sf[ATNState$1.INVALID_TYPE] = null;
            sf[ATNState$1.BASIC] = () => new BasicState$1();
            sf[ATNState$1.RULE_START] = () => new RuleStartState$1();
            sf[ATNState$1.BLOCK_START] = () => new BasicBlockStartState$1();
            sf[ATNState$1.PLUS_BLOCK_START] = () => new PlusBlockStartState$1();
            sf[ATNState$1.STAR_BLOCK_START] = () => new StarBlockStartState$1();
            sf[ATNState$1.TOKEN_START] = () => new TokensStartState$1();
            sf[ATNState$1.RULE_STOP] = () => new RuleStopState$2();
            sf[ATNState$1.BLOCK_END] = () => new BlockEndState$1();
            sf[ATNState$1.STAR_LOOP_BACK] = () => new StarLoopbackState$1();
            sf[ATNState$1.STAR_LOOP_ENTRY] = () => new StarLoopEntryState$1();
            sf[ATNState$1.PLUS_LOOP_BACK] = () => new PlusLoopbackState$1();
            sf[ATNState$1.LOOP_END] = () => new LoopEndState$1();
            this.stateFactories = sf;
        }
        if (type>this.stateFactories.length || this.stateFactories[type] === null) {
            throw("The specified state type " + type + " is not valid.");
        } else {
            const s = this.stateFactories[type]();
            if (s!==null) {
                s.ruleIndex = ruleIndex;
                return s;
            }
        }
    }

    lexerActionFactory(type, data1, data2) {
        if (this.actionFactories === null) {
            const af = [];
            af[LexerActionType$1.CHANNEL] = (data1, data2) => new LexerChannelAction$1(data1);
            af[LexerActionType$1.CUSTOM] = (data1, data2) => new LexerCustomAction$1(data1, data2);
            af[LexerActionType$1.MODE] = (data1, data2) => new LexerModeAction$1(data1);
            af[LexerActionType$1.MORE] = (data1, data2) => LexerMoreAction$1.INSTANCE;
            af[LexerActionType$1.POP_MODE] = (data1, data2) => LexerPopModeAction$1.INSTANCE;
            af[LexerActionType$1.PUSH_MODE] = (data1, data2) => new LexerPushModeAction$1(data1);
            af[LexerActionType$1.SKIP] = (data1, data2) => LexerSkipAction$1.INSTANCE;
            af[LexerActionType$1.TYPE] = (data1, data2) => new LexerTypeAction$1(data1);
            this.actionFactories = af;
        }
        if (type>this.actionFactories.length || this.actionFactories[type] === null) {
            throw("The specified lexer action type " + type + " is not valid.");
        } else {
            return this.actionFactories[type](data1, data2);
        }
    }
}

function createByteToHex() {
	const bth = [];
	for (let i = 0; i < 256; i++) {
		bth[i] = (i + 0x100).toString(16).substr(1).toUpperCase();
	}
	return bth;
}

const byteToHex = createByteToHex();


var ATNDeserializer_1 = ATNDeserializer;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
/**
 * Provides an empty default implementation of {@link ANTLRErrorListener}. The
 * default implementation of each method does nothing, but can be overridden as
 * necessary.
 */
class ErrorListener {
    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
    }

    reportAmbiguity(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
    }

    reportAttemptingFullContext(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
    }

    reportContextSensitivity(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
    }
}

/**
 * {@inheritDoc}
 *
 * <p>
 * This implementation prints messages to {@link System//err} containing the
 * values of {@code line}, {@code charPositionInLine}, and {@code msg} using
 * the following format.</p>
 *
 * <pre>
 * line <em>line</em>:<em>charPositionInLine</em> <em>msg</em>
 * </pre>
 *
 */
class ConsoleErrorListener extends ErrorListener {
    constructor() {
        super();
    }

    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        console.error("line " + line + ":" + column + " " + msg);
    }
}


/**
 * Provides a default instance of {@link ConsoleErrorListener}.
 */
ConsoleErrorListener.INSTANCE = new ConsoleErrorListener();

class ProxyErrorListener extends ErrorListener {
    constructor(delegates) {
        super();
        if (delegates===null) {
            throw "delegates";
        }
        this.delegates = delegates;
        return this;
    }

    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        this.delegates.map(d => d.syntaxError(recognizer, offendingSymbol, line, column, msg, e));
    }

    reportAmbiguity(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
        this.delegates.map(d => d.reportAmbiguity(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs));
    }

    reportAttemptingFullContext(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
        this.delegates.map(d => d.reportAttemptingFullContext(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs));
    }

    reportContextSensitivity(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
        this.delegates.map(d => d.reportContextSensitivity(recognizer, dfa, startIndex, stopIndex, prediction, configs));
    }
}

var ErrorListener_1 = {ErrorListener, ConsoleErrorListener, ProxyErrorListener};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$8} = Token_1;
const {ConsoleErrorListener: ConsoleErrorListener$1} = ErrorListener_1;
const {ProxyErrorListener: ProxyErrorListener$1} = ErrorListener_1;

class Recognizer {
    constructor() {
        this._listeners = [ ConsoleErrorListener$1.INSTANCE ];
        this._interp = null;
        this._stateNumber = -1;
    }

    checkVersion(toolVersion) {
        const runtimeVersion = "4.9";
        if (runtimeVersion!==toolVersion) {
            console.log("ANTLR runtime and generated code versions disagree: "+runtimeVersion+"!="+toolVersion);
        }
    }

    addErrorListener(listener) {
        this._listeners.push(listener);
    }

    removeErrorListeners() {
        this._listeners = [];
    }

    getTokenTypeMap() {
        const tokenNames = this.getTokenNames();
        if (tokenNames===null) {
            throw("The current recognizer does not provide a list of token names.");
        }
        let result = this.tokenTypeMapCache[tokenNames];
        if(result===undefined) {
            result = tokenNames.reduce(function(o, k, i) { o[k] = i; });
            result.EOF = Token$8.EOF;
            this.tokenTypeMapCache[tokenNames] = result;
        }
        return result;
    }

    /**
     * Get a map from rule names to rule indexes.
     * <p>Used for XPath and tree pattern compilation.</p>
     */
    getRuleIndexMap() {
        const ruleNames = this.ruleNames;
        if (ruleNames===null) {
            throw("The current recognizer does not provide a list of rule names.");
        }
        let result = this.ruleIndexMapCache[ruleNames]; // todo: should it be Recognizer.ruleIndexMapCache ?
        if(result===undefined) {
            result = ruleNames.reduce(function(o, k, i) { o[k] = i; });
            this.ruleIndexMapCache[ruleNames] = result;
        }
        return result;
    }

    getTokenType(tokenName) {
        const ttype = this.getTokenTypeMap()[tokenName];
        if (ttype !==undefined) {
            return ttype;
        } else {
            return Token$8.INVALID_TYPE;
        }
    }

    // What is the error header, normally line/character position information?
    getErrorHeader(e) {
        const line = e.getOffendingToken().line;
        const column = e.getOffendingToken().column;
        return "line " + line + ":" + column;
    }

    /**
     * How should a token be displayed in an error message? The default
     * is to display just the text, but during development you might
     * want to have a lot of information spit out.  Override in that case
     * to use t.toString() (which, for CommonToken, dumps everything about
     * the token). This is better than forcing you to override a method in
     * your token objects because you don't have to go modify your lexer
     * so that it creates a new Java type.
     *
     * @deprecated This method is not called by the ANTLR 4 Runtime. Specific
     * implementations of {@link ANTLRErrorStrategy} may provide a similar
     * feature when necessary. For example, see
     * {@link DefaultErrorStrategy//getTokenErrorDisplay}.*/
    getTokenErrorDisplay(t) {
        if (t===null) {
            return "<no token>";
        }
        let s = t.text;
        if (s===null) {
            if (t.type===Token$8.EOF) {
                s = "<EOF>";
            } else {
                s = "<" + t.type + ">";
            }
        }
        s = s.replace("\n","\\n").replace("\r","\\r").replace("\t","\\t");
        return "'" + s + "'";
    }

    getErrorListenerDispatch() {
        return new ProxyErrorListener$1(this._listeners);
    }

    /**
     * subclass needs to override these if there are sempreds or actions
     * that the ATN interp needs to execute
     */
    sempred(localctx, ruleIndex, actionIndex) {
        return true;
    }

    precpred(localctx , precedence) {
        return true;
    }

    get state(){
        return this._stateNumber;
    }

    set state(state) {
        this._stateNumber = state;
    }
}

Recognizer.tokenTypeMapCache = {};
Recognizer.ruleIndexMapCache = {};

var Recognizer_1 = Recognizer;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const CommonToken$1 = Token_1.CommonToken;

class TokenFactory {}

/**
 * This default implementation of {@link TokenFactory} creates
 * {@link CommonToken} objects.
 */
class CommonTokenFactory extends TokenFactory {
    constructor(copyText) {
        super();
        /**
         * Indicates whether {@link CommonToken//setText} should be called after
         * constructing tokens to explicitly set the text. This is useful for cases
         * where the input stream might not be able to provide arbitrary substrings
         * of text from the input after the lexer creates a token (e.g. the
         * implementation of {@link CharStream//getText} in
         * {@link UnbufferedCharStream} throws an
         * {@link UnsupportedOperationException}). Explicitly setting the token text
         * allows {@link Token//getText} to be called at any time regardless of the
         * input stream implementation.
         *
         * <p>
         * The default value is {@code false} to avoid the performance and memory
         * overhead of copying text for every token unless explicitly requested.</p>
         */
        this.copyText = copyText===undefined ? false : copyText;
    }

    create(source, type, text, channel, start, stop, line, column) {
        const t = new CommonToken$1(source, type, channel, start, stop);
        t.line = line;
        t.column = column;
        if (text !==null) {
            t.text = text;
        } else if (this.copyText && source[1] !==null) {
            t.text = source[1].getText(start,stop);
        }
        return t;
    }

    createThin(type, text) {
        const t = new CommonToken$1(null, type);
        t.text = text;
        return t;
    }
}

/**
 * The default {@link CommonTokenFactory} instance.
 *
 * <p>
 * This token factory does not explicitly copy token text when constructing
 * tokens.</p>
 */
CommonTokenFactory.DEFAULT = new CommonTokenFactory();

var CommonTokenFactory_1 = CommonTokenFactory;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

/**
 * The root of the ANTLR exception hierarchy. In general, ANTLR tracks just
 *  3 kinds of errors: prediction errors, failed predicate errors, and
 *  mismatched input errors. In each case, the parser knows where it is
 *  in the input, where it is in the ATN, the rule invocation stack,
 *  and what kind of problem occurred.
 */

const {PredicateTransition: PredicateTransition$2} = Transition_1;

class RecognitionException extends Error {
    constructor(params) {
        super(params.message);
        if (!!Error.captureStackTrace) {
            Error.captureStackTrace(this, RecognitionException);
        }
        this.message = params.message;
        this.recognizer = params.recognizer;
        this.input = params.input;
        this.ctx = params.ctx;
        /**
         * The current {@link Token} when an error occurred. Since not all streams
         * support accessing symbols by index, we have to track the {@link Token}
         * instance itself
        */
        this.offendingToken = null;
        /**
         * Get the ATN state number the parser was in at the time the error
         * occurred. For {@link NoViableAltException} and
         * {@link LexerNoViableAltException} exceptions, this is the
         * {@link DecisionState} number. For others, it is the state whose outgoing
         * edge we couldn't match.
         */
        this.offendingState = -1;
        if (this.recognizer!==null) {
            this.offendingState = this.recognizer.state;
        }
    }

    /**
     * Gets the set of input symbols which could potentially follow the
     * previously matched symbol at the time this exception was thrown.
     *
     * <p>If the set of expected tokens is not known and could not be computed,
     * this method returns {@code null}.</p>
     *
     * @return The set of token types that could potentially follow the current
     * state in the ATN, or {@code null} if the information is not available.
     */
    getExpectedTokens() {
        if (this.recognizer!==null) {
            return this.recognizer.atn.getExpectedTokens(this.offendingState, this.ctx);
        } else {
            return null;
        }
    }

    // <p>If the state number is not known, this method returns -1.</p>
    toString() {
        return this.message;
    }
}

class LexerNoViableAltException extends RecognitionException {
    constructor(lexer, input, startIndex, deadEndConfigs) {
        super({message: "", recognizer: lexer, input: input, ctx: null});
        this.startIndex = startIndex;
        this.deadEndConfigs = deadEndConfigs;
    }

    toString() {
        let symbol = "";
        if (this.startIndex >= 0 && this.startIndex < this.input.size) {
            symbol = this.input.getText((this.startIndex,this.startIndex));
        }
        return "LexerNoViableAltException" + symbol;
    }
}


/**
 * Indicates that the parser could not decide which of two or more paths
 * to take based upon the remaining input. It tracks the starting token
 * of the offending input and also knows where the parser was
 * in the various paths when the error. Reported by reportNoViableAlternative()
 */
class NoViableAltException extends RecognitionException {
    constructor(recognizer, input, startToken, offendingToken, deadEndConfigs, ctx) {
        ctx = ctx || recognizer._ctx;
        offendingToken = offendingToken || recognizer.getCurrentToken();
        startToken = startToken || recognizer.getCurrentToken();
        input = input || recognizer.getInputStream();
        super({message: "", recognizer: recognizer, input: input, ctx: ctx});
        // Which configurations did we try at input.index() that couldn't match
        // input.LT(1)?//
        this.deadEndConfigs = deadEndConfigs;
        // The token object at the start index; the input stream might
        // not be buffering tokens so get a reference to it. (At the
        // time the error occurred, of course the stream needs to keep a
        // buffer all of the tokens but later we might not have access to those.)
        this.startToken = startToken;
        this.offendingToken = offendingToken;
    }
}

/**
 * This signifies any kind of mismatched input exceptions such as
 * when the current input does not match the expected token.
*/
class InputMismatchException extends RecognitionException {
    constructor(recognizer) {
        super({message: "", recognizer: recognizer, input: recognizer.getInputStream(), ctx: recognizer._ctx});
        this.offendingToken = recognizer.getCurrentToken();
    }
}

function formatMessage(predicate, message) {
    if (message !==null) {
        return message;
    } else {
        return "failed predicate: {" + predicate + "}?";
    }
}

/**
 * A semantic predicate failed during validation. Validation of predicates
 * occurs when normally parsing the alternative just like matching a token.
 * Disambiguating predicate evaluation occurs when we test a predicate during
 * prediction.
*/
class FailedPredicateException extends RecognitionException {
    constructor(recognizer, predicate, message) {
        super({
            message: formatMessage(predicate, message || null), recognizer: recognizer,
            input: recognizer.getInputStream(), ctx: recognizer._ctx
        });
        const s = recognizer._interp.atn.states[recognizer.state];
        const trans = s.transitions[0];
        if (trans instanceof PredicateTransition$2) {
            this.ruleIndex = trans.ruleIndex;
            this.predicateIndex = trans.predIndex;
        } else {
            this.ruleIndex = 0;
            this.predicateIndex = 0;
        }
        this.predicate = predicate;
        this.offendingToken = recognizer.getCurrentToken();
    }
}


class ParseCancellationException extends Error{
    constructor() {
        super();
        Error.captureStackTrace(this, ParseCancellationException);
    }
}

var Errors = {
    RecognitionException,
    NoViableAltException,
    LexerNoViableAltException,
    InputMismatchException,
    FailedPredicateException,
    ParseCancellationException
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$9} = Token_1;


const {RecognitionException: RecognitionException$1} = Errors;
const {LexerNoViableAltException: LexerNoViableAltException$1} = Errors;

/**
 * A lexer is recognizer that draws input symbols from a character stream.
 * lexer grammars result in a subclass of this object. A Lexer object
 * uses simplified match() and error recovery mechanisms in the interest of speed.
 */
class Lexer extends Recognizer_1 {
	constructor(input) {
		super();
		this._input = input;
		this._factory = CommonTokenFactory_1.DEFAULT;
		this._tokenFactorySourcePair = [ this, input ];

		this._interp = null; // child classes must populate this

		/**
		 * The goal of all lexer rules/methods is to create a token object.
		 * this is an instance variable as multiple rules may collaborate to
		 * create a single token. nextToken will return this object after
		 * matching lexer rule(s). If you subclass to allow multiple token
		 * emissions, then set this to the last token to be matched or
		 * something nonnull so that the auto token emit mechanism will not
		 * emit another token.
		 */
		this._token = null;

		/**
		 * What character index in the stream did the current token start at?
		 * Needed, for example, to get the text for current token. Set at
		 * the start of nextToken.
		 */
		this._tokenStartCharIndex = -1;

		// The line on which the first character of the token resides///
		this._tokenStartLine = -1;

		// The character position of first character within the line///
		this._tokenStartColumn = -1;

		// Once we see EOF on char stream, next token will be EOF.
		// If you have DONE : EOF ; then you see DONE EOF.
		this._hitEOF = false;

		// The channel number for the current token///
		this._channel = Token$9.DEFAULT_CHANNEL;

		// The token type for the current token///
		this._type = Token$9.INVALID_TYPE;

		this._modeStack = [];
		this._mode = Lexer.DEFAULT_MODE;

		/**
		 * You can set the text for the current token to override what is in
		 * the input char buffer. Use setText() or can set this instance var.
		 */
		this._text = null;
	}

	reset() {
		// wack Lexer state variables
		if (this._input !== null) {
			this._input.seek(0); // rewind the input
		}
		this._token = null;
		this._type = Token$9.INVALID_TYPE;
		this._channel = Token$9.DEFAULT_CHANNEL;
		this._tokenStartCharIndex = -1;
		this._tokenStartColumn = -1;
		this._tokenStartLine = -1;
		this._text = null;

		this._hitEOF = false;
		this._mode = Lexer.DEFAULT_MODE;
		this._modeStack = [];

		this._interp.reset();
	}

// Return a token from this source; i.e., match a token on the char stream.
	nextToken() {
		if (this._input === null) {
			throw "nextToken requires a non-null input stream.";
		}

		/**
		 * Mark start location in char stream so unbuffered streams are
		 * guaranteed at least have text of current token
		 */
		const tokenStartMarker = this._input.mark();
		try {
			while (true) {
				if (this._hitEOF) {
					this.emitEOF();
					return this._token;
				}
				this._token = null;
				this._channel = Token$9.DEFAULT_CHANNEL;
				this._tokenStartCharIndex = this._input.index;
				this._tokenStartColumn = this._interp.column;
				this._tokenStartLine = this._interp.line;
				this._text = null;
				let continueOuter = false;
				while (true) {
					this._type = Token$9.INVALID_TYPE;
					let ttype = Lexer.SKIP;
					try {
						ttype = this._interp.match(this._input, this._mode);
					} catch (e) {
						if(e instanceof RecognitionException$1) {
							this.notifyListeners(e); // report error
							this.recover(e);
						} else {
							console.log(e.stack);
							throw e;
						}
					}
					if (this._input.LA(1) === Token$9.EOF) {
						this._hitEOF = true;
					}
					if (this._type === Token$9.INVALID_TYPE) {
						this._type = ttype;
					}
					if (this._type === Lexer.SKIP) {
						continueOuter = true;
						break;
					}
					if (this._type !== Lexer.MORE) {
						break;
					}
				}
				if (continueOuter) {
					continue;
				}
				if (this._token === null) {
					this.emit();
				}
				return this._token;
			}
		} finally {
			// make sure we release marker after match or
			// unbuffered char stream will keep buffering
			this._input.release(tokenStartMarker);
		}
	}

	/**
	 * Instruct the lexer to skip creating a token for current lexer rule
	 * and look for another token. nextToken() knows to keep looking when
	 * a lexer rule finishes with token set to SKIP_TOKEN. Recall that
	 * if token==null at end of any token rule, it creates one for you
	 * and emits it.
	 */
	skip() {
		this._type = Lexer.SKIP;
	}

	more() {
		this._type = Lexer.MORE;
	}

	mode(m) {
		this._mode = m;
	}

	pushMode(m) {
		if (this._interp.debug) {
			console.log("pushMode " + m);
		}
		this._modeStack.push(this._mode);
		this.mode(m);
	}

	popMode() {
		if (this._modeStack.length === 0) {
			throw "Empty Stack";
		}
		if (this._interp.debug) {
			console.log("popMode back to " + this._modeStack.slice(0, -1));
		}
		this.mode(this._modeStack.pop());
		return this._mode;
	}

	/**
	 * By default does not support multiple emits per nextToken invocation
	 * for efficiency reasons. Subclass and override this method, nextToken,
	 * and getToken (to push tokens into a list and pull from that list
	 * rather than a single variable as this implementation does).
	 */
	emitToken(token) {
		this._token = token;
	}

	/**
	 * The standard method called to automatically emit a token at the
	 * outermost lexical rule. The token object should point into the
	 * char buffer start..stop. If there is a text override in 'text',
	 * use that to set the token's text. Override this method to emit
	 * custom Token objects or provide a new factory.
	 */
	emit() {
		const t = this._factory.create(this._tokenFactorySourcePair, this._type,
				this._text, this._channel, this._tokenStartCharIndex, this
						.getCharIndex() - 1, this._tokenStartLine,
				this._tokenStartColumn);
		this.emitToken(t);
		return t;
	}

	emitEOF() {
		const cpos = this.column;
		const lpos = this.line;
		const eof = this._factory.create(this._tokenFactorySourcePair, Token$9.EOF,
				null, Token$9.DEFAULT_CHANNEL, this._input.index,
				this._input.index - 1, lpos, cpos);
		this.emitToken(eof);
		return eof;
	}

// What is the index of the current character of lookahead?///
	getCharIndex() {
		return this._input.index;
	}

	/**
	 * Return a list of all Token objects in input char stream.
	 * Forces load of all tokens. Does not include EOF token.
	 */
	getAllTokens() {
		const tokens = [];
		let t = this.nextToken();
		while (t.type !== Token$9.EOF) {
			tokens.push(t);
			t = this.nextToken();
		}
		return tokens;
	}

	notifyListeners(e) {
		const start = this._tokenStartCharIndex;
		const stop = this._input.index;
		const text = this._input.getText(start, stop);
		const msg = "token recognition error at: '" + this.getErrorDisplay(text) + "'";
		const listener = this.getErrorListenerDispatch();
		listener.syntaxError(this, null, this._tokenStartLine,
				this._tokenStartColumn, msg, e);
	}

	getErrorDisplay(s) {
		const d = [];
		for (let i = 0; i < s.length; i++) {
			d.push(s[i]);
		}
		return d.join('');
	}

	getErrorDisplayForChar(c) {
		if (c.charCodeAt(0) === Token$9.EOF) {
			return "<EOF>";
		} else if (c === '\n') {
			return "\\n";
		} else if (c === '\t') {
			return "\\t";
		} else if (c === '\r') {
			return "\\r";
		} else {
			return c;
		}
	}

	getCharErrorDisplay(c) {
		return "'" + this.getErrorDisplayForChar(c) + "'";
	}

	/**
	 * Lexers can normally match any char in it's vocabulary after matching
	 * a token, so do the easy thing and just kill a character and hope
	 * it all works out. You can instead use the rule invocation stack
	 * to do sophisticated error recovery if you are in a fragment rule.
	 */
	recover(re) {
		if (this._input.LA(1) !== Token$9.EOF) {
			if (re instanceof LexerNoViableAltException$1) {
				// skip a char and try again
				this._interp.consume(this._input);
			} else {
				// TODO: Do we lose character or line position information?
				this._input.consume();
			}
		}
	}

	get inputStream(){
		return this._input;
	}

	set inputStream(input) {
		this._input = null;
		this._tokenFactorySourcePair = [ this, this._input ];
		this.reset();
		this._input = input;
		this._tokenFactorySourcePair = [ this, this._input ];
	}

	get sourceName(){
		return this._input.sourceName;
	}

	get type(){
		return this.type;
	}

	set type(type) {
		this._type = type;
	}

	get line(){
		return this._interp.line;
	}

	set line(line) {
		this._interp.line = line;
	}

	get column(){
		return this._interp.column;
	}

	set column(column) {
		this._interp.column = column;
	}

	get text(){
		if (this._text !== null) {
			return this._text;
		} else {
			return this._interp.getText(this._input);
		}
	}

	set text(text) {
		this._text = text;
	}
}




Lexer.DEFAULT_MODE = 0;
Lexer.MORE = -2;
Lexer.SKIP = -3;

Lexer.DEFAULT_TOKEN_CHANNEL = Token$9.DEFAULT_CHANNEL;
Lexer.HIDDEN = Token$9.HIDDEN_CHANNEL;
Lexer.MIN_CHAR_VALUE = 0x0000;
Lexer.MAX_CHAR_VALUE = 0x10FFFF;

// Set the char stream and reset the lexer


var Lexer_1 = Lexer;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {SemanticContext: SemanticContext$2} = SemanticContext_1;
const {merge: merge$1} = PredictionContext_1;

function hashATNConfig(c) {
	return c.hashCodeForConfigSet();
}

function equalATNConfigs(a, b) {
	if ( a===b ) {
		return true;
	} else if ( a===null || b===null ) {
		return false;
	} else
       return a.equalsForConfigSet(b);
 }

/**
 * Specialized {@link Set}{@code <}{@link ATNConfig}{@code >} that can track
 * info about the set, with support for combining similar configurations using a
 * graph-structured stack
 */
class ATNConfigSet {
	constructor(fullCtx) {
		/**
		 * The reason that we need this is because we don't want the hash map to use
		 * the standard hash code and equals. We need all configurations with the
		 * same
		 * {@code (s,i,_,semctx)} to be equal. Unfortunately, this key effectively
		 * doubles
		 * the number of objects associated with ATNConfigs. The other solution is
		 * to
		 * use a hash table that lets us specify the equals/hashcode operation.
		 * All configs but hashed by (s, i, _, pi) not including context. Wiped out
		 * when we go readonly as this set becomes a DFA state
		 */
		this.configLookup = new Utils.Set(hashATNConfig, equalATNConfigs);
		/**
		 * Indicates that this configuration set is part of a full context
		 * LL prediction. It will be used to determine how to merge $. With SLL
		 * it's a wildcard whereas it is not for LL context merge
		 */
		this.fullCtx = fullCtx === undefined ? true : fullCtx;
		/**
		 * Indicates that the set of configurations is read-only. Do not
		 * allow any code to manipulate the set; DFA states will point at
		 * the sets and they must not change. This does not protect the other
		 * fields; in particular, conflictingAlts is set after
		 * we've made this readonly
		 */
		this.readOnly = false;
		// Track the elements as they are added to the set; supports get(i)///
		this.configs = [];

		// TODO: these fields make me pretty uncomfortable but nice to pack up info
		// together, saves recomputation
		// TODO: can we track conflicts as they are added to save scanning configs
		// later?
		this.uniqueAlt = 0;
		this.conflictingAlts = null;

		/**
		 * Used in parser and lexer. In lexer, it indicates we hit a pred
		 * while computing a closure operation. Don't make a DFA state from this
		 */
		this.hasSemanticContext = false;
		this.dipsIntoOuterContext = false;

		this.cachedHashCode = -1;
	}

	/**
	 * Adding a new config means merging contexts with existing configs for
	 * {@code (s, i, pi, _)}, where {@code s} is the
	 * {@link ATNConfig//state}, {@code i} is the {@link ATNConfig//alt}, and
	 * {@code pi} is the {@link ATNConfig//semanticContext}. We use
	 * {@code (s,i,pi)} as key.
	 *
	 * <p>This method updates {@link //dipsIntoOuterContext} and
	 * {@link //hasSemanticContext} when necessary.</p>
	 */
	add(config, mergeCache) {
		if (mergeCache === undefined) {
			mergeCache = null;
		}
		if (this.readOnly) {
			throw "This set is readonly";
		}
		if (config.semanticContext !== SemanticContext$2.NONE) {
			this.hasSemanticContext = true;
		}
		if (config.reachesIntoOuterContext > 0) {
			this.dipsIntoOuterContext = true;
		}
		const existing = this.configLookup.add(config);
		if (existing === config) {
			this.cachedHashCode = -1;
			this.configs.push(config); // track order here
			return true;
		}
		// a previous (s,i,pi,_), merge with it and save result
		const rootIsWildcard = !this.fullCtx;
		const merged = merge$1(existing.context, config.context, rootIsWildcard, mergeCache);
		/**
		 * no need to check for existing.context, config.context in cache
		 * since only way to create new graphs is "call rule" and here. We
		 * cache at both places
		 */
		existing.reachesIntoOuterContext = Math.max( existing.reachesIntoOuterContext, config.reachesIntoOuterContext);
		// make sure to preserve the precedence filter suppression during the merge
		if (config.precedenceFilterSuppressed) {
			existing.precedenceFilterSuppressed = true;
		}
		existing.context = merged; // replace context; no need to alt mapping
		return true;
	}

	getStates() {
		const states = new Utils.Set();
		for (let i = 0; i < this.configs.length; i++) {
			states.add(this.configs[i].state);
		}
		return states;
	}

	getPredicates() {
		const preds = [];
		for (let i = 0; i < this.configs.length; i++) {
			const c = this.configs[i].semanticContext;
			if (c !== SemanticContext$2.NONE) {
				preds.push(c.semanticContext);
			}
		}
		return preds;
	}

	optimizeConfigs(interpreter) {
		if (this.readOnly) {
			throw "This set is readonly";
		}
		if (this.configLookup.length === 0) {
			return;
		}
		for (let i = 0; i < this.configs.length; i++) {
			const config = this.configs[i];
			config.context = interpreter.getCachedContext(config.context);
		}
	}

	addAll(coll) {
		for (let i = 0; i < coll.length; i++) {
			this.add(coll[i]);
		}
		return false;
	}

	equals(other) {
		return this === other ||
			(other instanceof ATNConfigSet &&
			Utils.equalArrays(this.configs, other.configs) &&
			this.fullCtx === other.fullCtx &&
			this.uniqueAlt === other.uniqueAlt &&
			this.conflictingAlts === other.conflictingAlts &&
			this.hasSemanticContext === other.hasSemanticContext &&
			this.dipsIntoOuterContext === other.dipsIntoOuterContext);
	}

	hashCode() {
		const hash = new Utils.Hash();
		hash.update(this.configs);
		return hash.finish();
	}

	updateHashCode(hash) {
		if (this.readOnly) {
			if (this.cachedHashCode === -1) {
				this.cachedHashCode = this.hashCode();
			}
			hash.update(this.cachedHashCode);
		} else {
			hash.update(this.hashCode());
		}
	}

	isEmpty() {
		return this.configs.length === 0;
	}

	contains(item) {
		if (this.configLookup === null) {
			throw "This method is not implemented for readonly sets.";
		}
		return this.configLookup.contains(item);
	}

	containsFast(item) {
		if (this.configLookup === null) {
			throw "This method is not implemented for readonly sets.";
		}
		return this.configLookup.containsFast(item);
	}

	clear() {
		if (this.readOnly) {
			throw "This set is readonly";
		}
		this.configs = [];
		this.cachedHashCode = -1;
		this.configLookup = new Utils.Set();
	}

	setReadonly(readOnly) {
		this.readOnly = readOnly;
		if (readOnly) {
			this.configLookup = null; // can't mod, no need for lookup cache
		}
	}

	toString() {
		return Utils.arrayToString(this.configs) +
			(this.hasSemanticContext ? ",hasSemanticContext=" + this.hasSemanticContext : "") +
			(this.uniqueAlt !== ATN_1.INVALID_ALT_NUMBER ? ",uniqueAlt=" + this.uniqueAlt : "") +
			(this.conflictingAlts !== null ? ",conflictingAlts=" + this.conflictingAlts : "") +
			(this.dipsIntoOuterContext ? ",dipsIntoOuterContext" : "");
	}

	get items(){
		return this.configs;
	}

	get length(){
		return this.configs.length;
	}
}


class OrderedATNConfigSet extends ATNConfigSet {
	constructor() {
		super();
		this.configLookup = new Utils.Set();
	}
}

var ATNConfigSet_1 = {
	ATNConfigSet,
	OrderedATNConfigSet
};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {ATNConfigSet: ATNConfigSet$1} = ATNConfigSet_1;
const {Hash: Hash$5, Set: Set$3} = Utils;

/**
 * Map a predicate to a predicted alternative.
 */
class PredPrediction {
	constructor(pred, alt) {
		this.alt = alt;
		this.pred = pred;
	}

	toString() {
		return "(" + this.pred + ", " + this.alt + ")";
	}
}

/**
 * A DFA state represents a set of possible ATN configurations.
 * As Aho, Sethi, Ullman p. 117 says "The DFA uses its state
 * to keep track of all possible states the ATN can be in after
 * reading each input symbol. That is to say, after reading
 * input a1a2..an, the DFA is in a state that represents the
 * subset T of the states of the ATN that are reachable from the
 * ATN's start state along some path labeled a1a2..an."
 * In conventional NFA&rarr;DFA conversion, therefore, the subset T
 * would be a bitset representing the set of states the
 * ATN could be in. We need to track the alt predicted by each
 * state as well, however. More importantly, we need to maintain
 * a stack of states, tracking the closure operations as they
 * jump from rule to rule, emulating rule invocations (method calls).
 * I have to add a stack to simulate the proper lookahead sequences for
 * the underlying LL grammar from which the ATN was derived.
 *
 * <p>I use a set of ATNConfig objects not simple states. An ATNConfig
 * is both a state (ala normal conversion) and a RuleContext describing
 * the chain of rules (if any) followed to arrive at that state.</p>
 *
 * <p>A DFA state may have multiple references to a particular state,
 * but with different ATN contexts (with same or different alts)
 * meaning that state was reached via a different set of rule invocations.</p>
 */
class DFAState {
	constructor(stateNumber, configs) {
		if (stateNumber === null) {
			stateNumber = -1;
		}
		if (configs === null) {
			configs = new ATNConfigSet$1();
		}
		this.stateNumber = stateNumber;
		this.configs = configs;
		/**
		 * {@code edges[symbol]} points to target of symbol. Shift up by 1 so (-1)
		 * {@link Token//EOF} maps to {@code edges[0]}.
		 */
		this.edges = null;
		this.isAcceptState = false;
		/**
		 * if accept state, what ttype do we match or alt do we predict?
		 * This is set to {@link ATN//INVALID_ALT_NUMBER} when {@link//predicates}
		 * {@code !=null} or {@link //requiresFullContext}.
		 */
		this.prediction = 0;
		this.lexerActionExecutor = null;
		/**
		 * Indicates that this state was created during SLL prediction that
		 * discovered a conflict between the configurations in the state. Future
		 * {@link ParserATNSimulator//execATN} invocations immediately jumped doing
		 * full context prediction if this field is true.
		 */
		this.requiresFullContext = false;
		/**
		 * During SLL parsing, this is a list of predicates associated with the
		 * ATN configurations of the DFA state. When we have predicates,
		 * {@link //requiresFullContext} is {@code false} since full context
		 * prediction evaluates predicates
		 * on-the-fly. If this is not null, then {@link //prediction} is
		 * {@link ATN//INVALID_ALT_NUMBER}.
		 *
		 * <p>We only use these for non-{@link //requiresFullContext} but
		 * conflicting states. That
		 * means we know from the context (it's $ or we don't dip into outer
		 * context) that it's an ambiguity not a conflict.</p>
		 *
		 * <p>This list is computed by {@link
		 * ParserATNSimulator//predicateDFAState}.</p>
		 */
		this.predicates = null;
		return this;
	}

	/**
	 * Get the set of all alts mentioned by all ATN configurations in this
	 * DFA state.
	 */
	getAltSet() {
		const alts = new Set$3();
		if (this.configs !== null) {
			for (let i = 0; i < this.configs.length; i++) {
				const c = this.configs[i];
				alts.add(c.alt);
			}
		}
		if (alts.length === 0) {
			return null;
		} else {
			return alts;
		}
	}

	/**
	 * Two {@link DFAState} instances are equal if their ATN configuration sets
	 * are the same. This method is used to see if a state already exists.
	 *
	 * <p>Because the number of alternatives and number of ATN configurations are
	 * finite, there is a finite number of DFA states that can be processed.
	 * This is necessary to show that the algorithm terminates.</p>
	 *
	 * <p>Cannot test the DFA state numbers here because in
	 * {@link ParserATNSimulator//addDFAState} we need to know if any other state
	 * exists that has this exact set of ATN configurations. The
	 * {@link //stateNumber} is irrelevant.</p>
	 */
	equals(other) {
		// compare set of ATN configurations in this set with other
		return this === other ||
				(other instanceof DFAState &&
					this.configs.equals(other.configs));
	}

	toString() {
		let s = "" + this.stateNumber + ":" + this.configs;
		if(this.isAcceptState) {
			s = s + "=>";
			if (this.predicates !== null)
				s = s + this.predicates;
			else
				s = s + this.prediction;
		}
		return s;
	}

	hashCode() {
		const hash = new Hash$5();
		hash.update(this.configs);
		return hash.finish();
	}
}

var DFAState_1 = { DFAState, PredPrediction };

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {DFAState: DFAState$1} = DFAState_1;
const {ATNConfigSet: ATNConfigSet$2} = ATNConfigSet_1;
const {getCachedPredictionContext: getCachedPredictionContext$1} = PredictionContext_1;
const {Map: Map$3} = Utils;

class ATNSimulator {
    constructor(atn, sharedContextCache) {
        /**
         * The context cache maps all PredictionContext objects that are ==
         * to a single cached copy. This cache is shared across all contexts
         * in all ATNConfigs in all DFA states.  We rebuild each ATNConfigSet
         * to use only cached nodes/graphs in addDFAState(). We don't want to
         * fill this during closure() since there are lots of contexts that
         * pop up but are not used ever again. It also greatly slows down closure().
         *
         * <p>This cache makes a huge difference in memory and a little bit in speed.
         * For the Java grammar on java.*, it dropped the memory requirements
         * at the end from 25M to 16M. We don't store any of the full context
         * graphs in the DFA because they are limited to local context only,
         * but apparently there's a lot of repetition there as well. We optimize
         * the config contexts before storing the config set in the DFA states
         * by literally rebuilding them with cached subgraphs only.</p>
         *
         * <p>I tried a cache for use during closure operations, that was
         * whacked after each adaptivePredict(). It cost a little bit
         * more time I think and doesn't save on the overall footprint
         * so it's not worth the complexity.</p>
         */
        this.atn = atn;
        this.sharedContextCache = sharedContextCache;
        return this;
    }

    getCachedContext(context) {
        if (this.sharedContextCache ===null) {
            return context;
        }
        const visited = new Map$3();
        return getCachedPredictionContext$1(context, this.sharedContextCache, visited);
    }
}

// Must distinguish between missing edge and edge we know leads nowhere///
ATNSimulator.ERROR = new DFAState$1(0x7FFFFFFF, new ATNConfigSet$2());


var ATNSimulator_1 = ATNSimulator;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {hashStuff: hashStuff$1} = Utils;
const {LexerIndexedCustomAction: LexerIndexedCustomAction$1} = LexerAction_1;

class LexerActionExecutor {
	/**
	 * Represents an executor for a sequence of lexer actions which traversed during
	 * the matching operation of a lexer rule (token).
	 *
	 * <p>The executor tracks position information for position-dependent lexer actions
	 * efficiently, ensuring that actions appearing only at the end of the rule do
	 * not cause bloating of the {@link DFA} created for the lexer.</p>
	 */
	constructor(lexerActions) {
		this.lexerActions = lexerActions === null ? [] : lexerActions;
		/**
		 * Caches the result of {@link //hashCode} since the hash code is an element
		 * of the performance-critical {@link LexerATNConfig//hashCode} operation
		 */
		this.cachedHashCode = hashStuff$1(lexerActions); // "".join([str(la) for la in
		// lexerActions]))
		return this;
	}

	/**
	 * Creates a {@link LexerActionExecutor} which encodes the current offset
	 * for position-dependent lexer actions.
	 *
	 * <p>Normally, when the executor encounters lexer actions where
	 * {@link LexerAction//isPositionDependent} returns {@code true}, it calls
	 * {@link IntStream//seek} on the input {@link CharStream} to set the input
	 * position to the <em>end</em> of the current token. This behavior provides
	 * for efficient DFA representation of lexer actions which appear at the end
	 * of a lexer rule, even when the lexer rule matches a variable number of
	 * characters.</p>
	 *
	 * <p>Prior to traversing a match transition in the ATN, the current offset
	 * from the token start index is assigned to all position-dependent lexer
	 * actions which have not already been assigned a fixed offset. By storing
	 * the offsets relative to the token start index, the DFA representation of
	 * lexer actions which appear in the middle of tokens remains efficient due
	 * to sharing among tokens of the same length, regardless of their absolute
	 * position in the input stream.</p>
	 *
	 * <p>If the current executor already has offsets assigned to all
	 * position-dependent lexer actions, the method returns {@code this}.</p>
	 *
	 * @param offset The current offset to assign to all position-dependent
	 * lexer actions which do not already have offsets assigned.
	 *
	 * @return {LexerActionExecutor} A {@link LexerActionExecutor} which stores input stream offsets
	 * for all position-dependent lexer actions.
	 */
	fixOffsetBeforeMatch(offset) {
		let updatedLexerActions = null;
		for (let i = 0; i < this.lexerActions.length; i++) {
			if (this.lexerActions[i].isPositionDependent &&
					!(this.lexerActions[i] instanceof LexerIndexedCustomAction$1)) {
				if (updatedLexerActions === null) {
					updatedLexerActions = this.lexerActions.concat([]);
				}
				updatedLexerActions[i] = new LexerIndexedCustomAction$1(offset,
						this.lexerActions[i]);
			}
		}
		if (updatedLexerActions === null) {
			return this;
		} else {
			return new LexerActionExecutor(updatedLexerActions);
		}
	}

	/**
	 * Execute the actions encapsulated by this executor within the context of a
	 * particular {@link Lexer}.
	 *
	 * <p>This method calls {@link IntStream//seek} to set the position of the
	 * {@code input} {@link CharStream} prior to calling
	 * {@link LexerAction//execute} on a position-dependent action. Before the
	 * method returns, the input position will be restored to the same position
	 * it was in when the method was invoked.</p>
	 *
	 * @param lexer The lexer instance.
	 * @param input The input stream which is the source for the current token.
	 * When this method is called, the current {@link IntStream//index} for
	 * {@code input} should be the start of the following token, i.e. 1
	 * character past the end of the current token.
	 * @param startIndex The token start index. This value may be passed to
	 * {@link IntStream//seek} to set the {@code input} position to the beginning
	 * of the token.
	 */
	execute(lexer, input, startIndex) {
		let requiresSeek = false;
		const stopIndex = input.index;
		try {
			for (let i = 0; i < this.lexerActions.length; i++) {
				let lexerAction = this.lexerActions[i];
				if (lexerAction instanceof LexerIndexedCustomAction$1) {
					const offset = lexerAction.offset;
					input.seek(startIndex + offset);
					lexerAction = lexerAction.action;
					requiresSeek = (startIndex + offset) !== stopIndex;
				} else if (lexerAction.isPositionDependent) {
					input.seek(stopIndex);
					requiresSeek = false;
				}
				lexerAction.execute(lexer);
			}
		} finally {
			if (requiresSeek) {
				input.seek(stopIndex);
			}
		}
	}

	hashCode() {
		return this.cachedHashCode;
	}

	updateHashCode(hash) {
		hash.update(this.cachedHashCode);
	}

	equals(other) {
		if (this === other) {
			return true;
		} else if (!(other instanceof LexerActionExecutor)) {
			return false;
		} else if (this.cachedHashCode != other.cachedHashCode) {
			return false;
		} else if (this.lexerActions.length != other.lexerActions.length) {
			return false;
		} else {
			const numActions = this.lexerActions.length;
			for (let idx = 0; idx < numActions; ++idx) {
				if (!this.lexerActions[idx].equals(other.lexerActions[idx])) {
					return false;
				}
			}
			return true;
		}
	}

	/**
	 * Creates a {@link LexerActionExecutor} which executes the actions for
	 * the input {@code lexerActionExecutor} followed by a specified
	 * {@code lexerAction}.
	 *
	 * @param lexerActionExecutor The executor for actions already traversed by
	 * the lexer while matching a token within a particular
	 * {@link LexerATNConfig}. If this is {@code null}, the method behaves as
	 * though it were an empty executor.
	 * @param lexerAction The lexer action to execute after the actions
	 * specified in {@code lexerActionExecutor}.
	 *
	 * @return {LexerActionExecutor} A {@link LexerActionExecutor} for executing the combine actions
	 * of {@code lexerActionExecutor} and {@code lexerAction}.
	 */
	static append(lexerActionExecutor, lexerAction) {
		if (lexerActionExecutor === null) {
			return new LexerActionExecutor([ lexerAction ]);
		}
		const lexerActions = lexerActionExecutor.lexerActions.concat([ lexerAction ]);
		return new LexerActionExecutor(lexerActions);
	}
}


var LexerActionExecutor_1 = LexerActionExecutor;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$a} = Token_1;



const {DFAState: DFAState$2} = DFAState_1;
const {OrderedATNConfigSet: OrderedATNConfigSet$1} = ATNConfigSet_1;
const {PredictionContext: PredictionContext$2} = PredictionContext_1;
const {SingletonPredictionContext: SingletonPredictionContext$2} = PredictionContext_1;
const {RuleStopState: RuleStopState$3} = ATNState_1;
const {LexerATNConfig: LexerATNConfig$1} = ATNConfig_1;
const {Transition: Transition$2} = Transition_1;

const {LexerNoViableAltException: LexerNoViableAltException$2} = Errors;

function resetSimState(sim) {
	sim.index = -1;
	sim.line = 0;
	sim.column = -1;
	sim.dfaState = null;
}

class SimState {
	constructor() {
		resetSimState(this);
	}

	reset() {
		resetSimState(this);
	}
}

class LexerATNSimulator extends ATNSimulator_1 {
	/**
	 * When we hit an accept state in either the DFA or the ATN, we
	 * have to notify the character stream to start buffering characters
	 * via {@link IntStream//mark} and record the current state. The current sim state
	 * includes the current index into the input, the current line,
	 * and current character position in that line. Note that the Lexer is
	 * tracking the starting line and characterization of the token. These
	 * variables track the "state" of the simulator when it hits an accept state.
	 *
	 * <p>We track these variables separately for the DFA and ATN simulation
	 * because the DFA simulation often has to fail over to the ATN
	 * simulation. If the ATN simulation fails, we need the DFA to fall
	 * back to its previously accepted state, if any. If the ATN succeeds,
	 * then the ATN does the accept and the DFA simulator that invoked it
	 * can simply return the predicted token type.</p>
	 */
	constructor(recog, atn, decisionToDFA, sharedContextCache) {
		super(atn, sharedContextCache);
		this.decisionToDFA = decisionToDFA;
		this.recog = recog;
		/**
		 * The current token's starting index into the character stream.
		 * Shared across DFA to ATN simulation in case the ATN fails and the
		 * DFA did not have a previous accept state. In this case, we use the
		 * ATN-generated exception object
		 */
		this.startIndex = -1;
		// line number 1..n within the input///
		this.line = 1;
		/**
		 * The index of the character relative to the beginning of the line
		 * 0..n-1
		 */
		this.column = 0;
		this.mode = Lexer_1.DEFAULT_MODE;
		/**
		 * Used during DFA/ATN exec to record the most recent accept configuration
		 * info
		 */
		this.prevAccept = new SimState();
	}

	copyState(simulator) {
		this.column = simulator.column;
		this.line = simulator.line;
		this.mode = simulator.mode;
		this.startIndex = simulator.startIndex;
	}

	match(input, mode) {
		this.match_calls += 1;
		this.mode = mode;
		const mark = input.mark();
		try {
			this.startIndex = input.index;
			this.prevAccept.reset();
			const dfa = this.decisionToDFA[mode];
			if (dfa.s0 === null) {
				return this.matchATN(input);
			} else {
				return this.execATN(input, dfa.s0);
			}
		} finally {
			input.release(mark);
		}
	}

	reset() {
		this.prevAccept.reset();
		this.startIndex = -1;
		this.line = 1;
		this.column = 0;
		this.mode = Lexer_1.DEFAULT_MODE;
	}

	matchATN(input) {
		const startState = this.atn.modeToStartState[this.mode];

		if (LexerATNSimulator.debug) {
			console.log("matchATN mode " + this.mode + " start: " + startState);
		}
		const old_mode = this.mode;
		const s0_closure = this.computeStartState(input, startState);
		const suppressEdge = s0_closure.hasSemanticContext;
		s0_closure.hasSemanticContext = false;

		const next = this.addDFAState(s0_closure);
		if (!suppressEdge) {
			this.decisionToDFA[this.mode].s0 = next;
		}

		const predict = this.execATN(input, next);

		if (LexerATNSimulator.debug) {
			console.log("DFA after matchATN: " + this.decisionToDFA[old_mode].toLexerString());
		}
		return predict;
	}

	execATN(input, ds0) {
		if (LexerATNSimulator.debug) {
			console.log("start state closure=" + ds0.configs);
		}
		if (ds0.isAcceptState) {
			// allow zero-length tokens
			this.captureSimState(this.prevAccept, input, ds0);
		}
		let t = input.LA(1);
		let s = ds0; // s is current/from DFA state

		while (true) { // while more work
			if (LexerATNSimulator.debug) {
				console.log("execATN loop starting closure: " + s.configs);
			}

			/**
			 * As we move src->trg, src->trg, we keep track of the previous trg to
			 * avoid looking up the DFA state again, which is expensive.
			 * If the previous target was already part of the DFA, we might
			 * be able to avoid doing a reach operation upon t. If s!=null,
			 * it means that semantic predicates didn't prevent us from
			 * creating a DFA state. Once we know s!=null, we check to see if
			 * the DFA state has an edge already for t. If so, we can just reuse
			 * it's configuration set; there's no point in re-computing it.
			 * This is kind of like doing DFA simulation within the ATN
			 * simulation because DFA simulation is really just a way to avoid
			 * computing reach/closure sets. Technically, once we know that
			 * we have a previously added DFA state, we could jump over to
			 * the DFA simulator. But, that would mean popping back and forth
			 * a lot and making things more complicated algorithmically.
			 * This optimization makes a lot of sense for loops within DFA.
			 * A character will take us back to an existing DFA state
			 * that already has lots of edges out of it. e.g., .* in comments.
			 * print("Target for:" + str(s) + " and:" + str(t))
			 */
			let target = this.getExistingTargetState(s, t);
			// print("Existing:" + str(target))
			if (target === null) {
				target = this.computeTargetState(input, s, t);
				// print("Computed:" + str(target))
			}
			if (target === ATNSimulator_1.ERROR) {
				break;
			}
			// If this is a consumable input element, make sure to consume before
			// capturing the accept state so the input index, line, and char
			// position accurately reflect the state of the interpreter at the
			// end of the token.
			if (t !== Token$a.EOF) {
				this.consume(input);
			}
			if (target.isAcceptState) {
				this.captureSimState(this.prevAccept, input, target);
				if (t === Token$a.EOF) {
					break;
				}
			}
			t = input.LA(1);
			s = target; // flip; current DFA target becomes new src/from state
		}
		return this.failOrAccept(this.prevAccept, input, s.configs, t);
	}

	/**
	 * Get an existing target state for an edge in the DFA. If the target state
	 * for the edge has not yet been computed or is otherwise not available,
	 * this method returns {@code null}.
	 *
	 * @param s The current DFA state
	 * @param t The next input symbol
	 * @return The existing target DFA state for the given input symbol
	 * {@code t}, or {@code null} if the target state for this edge is not
	 * already cached
	 */
	getExistingTargetState(s, t) {
		if (s.edges === null || t < LexerATNSimulator.MIN_DFA_EDGE || t > LexerATNSimulator.MAX_DFA_EDGE) {
			return null;
		}

		let target = s.edges[t - LexerATNSimulator.MIN_DFA_EDGE];
		if(target===undefined) {
			target = null;
		}
		if (LexerATNSimulator.debug && target !== null) {
			console.log("reuse state " + s.stateNumber + " edge to " + target.stateNumber);
		}
		return target;
	}

	/**
	 * Compute a target state for an edge in the DFA, and attempt to add the
	 * computed state and corresponding edge to the DFA.
	 *
	 * @param input The input stream
	 * @param s The current DFA state
	 * @param t The next input symbol
	 *
	 * @return The computed target DFA state for the given input symbol
	 * {@code t}. If {@code t} does not lead to a valid DFA state, this method
	 * returns {@link //ERROR}.
	 */
	computeTargetState(input, s, t) {
		const reach = new OrderedATNConfigSet$1();
		// if we don't find an existing DFA state
		// Fill reach starting from closure, following t transitions
		this.getReachableConfigSet(input, s.configs, reach, t);

		if (reach.items.length === 0) { // we got nowhere on t from s
			if (!reach.hasSemanticContext) {
				// we got nowhere on t, don't throw out this knowledge; it'd
				// cause a failover from DFA later.
				this.addDFAEdge(s, t, ATNSimulator_1.ERROR);
			}
			// stop when we can't match any more char
			return ATNSimulator_1.ERROR;
		}
		// Add an edge from s to target DFA found/created for reach
		return this.addDFAEdge(s, t, null, reach);
	}

	failOrAccept(prevAccept, input, reach, t) {
		if (this.prevAccept.dfaState !== null) {
			const lexerActionExecutor = prevAccept.dfaState.lexerActionExecutor;
			this.accept(input, lexerActionExecutor, this.startIndex,
					prevAccept.index, prevAccept.line, prevAccept.column);
			return prevAccept.dfaState.prediction;
		} else {
			// if no accept and EOF is first char, return EOF
			if (t === Token$a.EOF && input.index === this.startIndex) {
				return Token$a.EOF;
			}
			throw new LexerNoViableAltException$2(this.recog, input, this.startIndex, reach);
		}
	}

	/**
	 * Given a starting configuration set, figure out all ATN configurations
	 * we can reach upon input {@code t}. Parameter {@code reach} is a return
	 * parameter.
	 */
	getReachableConfigSet(input, closure,
			reach, t) {
		// this is used to skip processing for configs which have a lower priority
		// than a config that already reached an accept state for the same rule
		let skipAlt = ATN_1.INVALID_ALT_NUMBER;
		for (let i = 0; i < closure.items.length; i++) {
			const cfg = closure.items[i];
			const currentAltReachedAcceptState = (cfg.alt === skipAlt);
			if (currentAltReachedAcceptState && cfg.passedThroughNonGreedyDecision) {
				continue;
			}
			if (LexerATNSimulator.debug) {
				console.log("testing %s at %s\n", this.getTokenName(t), cfg
						.toString(this.recog, true));
			}
			for (let j = 0; j < cfg.state.transitions.length; j++) {
				const trans = cfg.state.transitions[j]; // for each transition
				const target = this.getReachableTarget(trans, t);
				if (target !== null) {
					let lexerActionExecutor = cfg.lexerActionExecutor;
					if (lexerActionExecutor !== null) {
						lexerActionExecutor = lexerActionExecutor.fixOffsetBeforeMatch(input.index - this.startIndex);
					}
					const treatEofAsEpsilon = (t === Token$a.EOF);
					const config = new LexerATNConfig$1({state:target, lexerActionExecutor:lexerActionExecutor}, cfg);
					if (this.closure(input, config, reach,
							currentAltReachedAcceptState, true, treatEofAsEpsilon)) {
						// any remaining configs for this alt have a lower priority
						// than the one that just reached an accept state.
						skipAlt = cfg.alt;
					}
				}
			}
		}
	}

	accept(input, lexerActionExecutor,
			   startIndex, index, line, charPos) {
		   if (LexerATNSimulator.debug) {
			   console.log("ACTION %s\n", lexerActionExecutor);
		   }
		   // seek to after last char in token
		   input.seek(index);
		   this.line = line;
		   this.column = charPos;
		   if (lexerActionExecutor !== null && this.recog !== null) {
			   lexerActionExecutor.execute(this.recog, input, startIndex);
		   }
	   }

	getReachableTarget(trans, t) {
		if (trans.matches(t, 0, Lexer_1.MAX_CHAR_VALUE)) {
			return trans.target;
		} else {
			return null;
		}
	}

	computeStartState(input, p) {
		const initialContext = PredictionContext$2.EMPTY;
		const configs = new OrderedATNConfigSet$1();
		for (let i = 0; i < p.transitions.length; i++) {
			const target = p.transitions[i].target;
			const cfg = new LexerATNConfig$1({state:target, alt:i+1, context:initialContext}, null);
			this.closure(input, cfg, configs, false, false, false);
		}
		return configs;
	}

	/**
	 * Since the alternatives within any lexer decision are ordered by
	 * preference, this method stops pursuing the closure as soon as an accept
	 * state is reached. After the first accept state is reached by depth-first
	 * search from {@code config}, all other (potentially reachable) states for
	 * this rule would have a lower priority.
	 *
	 * @return {Boolean} {@code true} if an accept state is reached, otherwise
	 * {@code false}.
	 */
	closure(input, config, configs,
			currentAltReachedAcceptState, speculative, treatEofAsEpsilon) {
		let cfg = null;
		if (LexerATNSimulator.debug) {
			console.log("closure(" + config.toString(this.recog, true) + ")");
		}
		if (config.state instanceof RuleStopState$3) {
			if (LexerATNSimulator.debug) {
				if (this.recog !== null) {
					console.log("closure at %s rule stop %s\n", this.recog.ruleNames[config.state.ruleIndex], config);
				} else {
					console.log("closure at rule stop %s\n", config);
				}
			}
			if (config.context === null || config.context.hasEmptyPath()) {
				if (config.context === null || config.context.isEmpty()) {
					configs.add(config);
					return true;
				} else {
					configs.add(new LexerATNConfig$1({ state:config.state, context:PredictionContext$2.EMPTY}, config));
					currentAltReachedAcceptState = true;
				}
			}
			if (config.context !== null && !config.context.isEmpty()) {
				for (let i = 0; i < config.context.length; i++) {
					if (config.context.getReturnState(i) !== PredictionContext$2.EMPTY_RETURN_STATE) {
						const newContext = config.context.getParent(i); // "pop" return state
						const returnState = this.atn.states[config.context.getReturnState(i)];
						cfg = new LexerATNConfig$1({ state:returnState, context:newContext }, config);
						currentAltReachedAcceptState = this.closure(input, cfg,
								configs, currentAltReachedAcceptState, speculative,
								treatEofAsEpsilon);
					}
				}
			}
			return currentAltReachedAcceptState;
		}
		// optimization
		if (!config.state.epsilonOnlyTransitions) {
			if (!currentAltReachedAcceptState || !config.passedThroughNonGreedyDecision) {
				configs.add(config);
			}
		}
		for (let j = 0; j < config.state.transitions.length; j++) {
			const trans = config.state.transitions[j];
			cfg = this.getEpsilonTarget(input, config, trans, configs, speculative, treatEofAsEpsilon);
			if (cfg !== null) {
				currentAltReachedAcceptState = this.closure(input, cfg, configs,
						currentAltReachedAcceptState, speculative, treatEofAsEpsilon);
			}
		}
		return currentAltReachedAcceptState;
	}

	// side-effect: can alter configs.hasSemanticContext
	getEpsilonTarget(input, config, trans,
			configs, speculative, treatEofAsEpsilon) {
		let cfg = null;
		if (trans.serializationType === Transition$2.RULE) {
			const newContext = SingletonPredictionContext$2.create(config.context, trans.followState.stateNumber);
			cfg = new LexerATNConfig$1( { state:trans.target, context:newContext}, config);
		} else if (trans.serializationType === Transition$2.PRECEDENCE) {
			throw "Precedence predicates are not supported in lexers.";
		} else if (trans.serializationType === Transition$2.PREDICATE) {
			// Track traversing semantic predicates. If we traverse,
			// we cannot add a DFA state for this "reach" computation
			// because the DFA would not test the predicate again in the
			// future. Rather than creating collections of semantic predicates
			// like v3 and testing them on prediction, v4 will test them on the
			// fly all the time using the ATN not the DFA. This is slower but
			// semantically it's not used that often. One of the key elements to
			// this predicate mechanism is not adding DFA states that see
			// predicates immediately afterwards in the ATN. For example,

			// a : ID {p1}? | ID {p2}? ;

			// should create the start state for rule 'a' (to save start state
			// competition), but should not create target of ID state. The
			// collection of ATN states the following ID references includes
			// states reached by traversing predicates. Since this is when we
			// test them, we cannot cash the DFA state target of ID.

			if (LexerATNSimulator.debug) {
				console.log("EVAL rule " + trans.ruleIndex + ":" + trans.predIndex);
			}
			configs.hasSemanticContext = true;
			if (this.evaluatePredicate(input, trans.ruleIndex, trans.predIndex, speculative)) {
				cfg = new LexerATNConfig$1({ state:trans.target}, config);
			}
		} else if (trans.serializationType === Transition$2.ACTION) {
			if (config.context === null || config.context.hasEmptyPath()) {
				// execute actions anywhere in the start rule for a token.
				//
				// TODO: if the entry rule is invoked recursively, some
				// actions may be executed during the recursive call. The
				// problem can appear when hasEmptyPath() is true but
				// isEmpty() is false. In this case, the config needs to be
				// split into two contexts - one with just the empty path
				// and another with everything but the empty path.
				// Unfortunately, the current algorithm does not allow
				// getEpsilonTarget to return two configurations, so
				// additional modifications are needed before we can support
				// the split operation.
				const lexerActionExecutor = LexerActionExecutor_1.append(config.lexerActionExecutor,
						this.atn.lexerActions[trans.actionIndex]);
				cfg = new LexerATNConfig$1({ state:trans.target, lexerActionExecutor:lexerActionExecutor }, config);
			} else {
				// ignore actions in referenced rules
				cfg = new LexerATNConfig$1( { state:trans.target}, config);
			}
		} else if (trans.serializationType === Transition$2.EPSILON) {
			cfg = new LexerATNConfig$1({ state:trans.target}, config);
		} else if (trans.serializationType === Transition$2.ATOM ||
					trans.serializationType === Transition$2.RANGE ||
					trans.serializationType === Transition$2.SET) {
			if (treatEofAsEpsilon) {
				if (trans.matches(Token$a.EOF, 0, Lexer_1.MAX_CHAR_VALUE)) {
					cfg = new LexerATNConfig$1( { state:trans.target }, config);
				}
			}
		}
		return cfg;
	}

	/**
	 * Evaluate a predicate specified in the lexer.
	 *
	 * <p>If {@code speculative} is {@code true}, this method was called before
	 * {@link //consume} for the matched character. This method should call
	 * {@link //consume} before evaluating the predicate to ensure position
	 * sensitive values, including {@link Lexer//getText}, {@link Lexer//getLine},
	 * and {@link Lexer//getcolumn}, properly reflect the current
	 * lexer state. This method should restore {@code input} and the simulator
	 * to the original state before returning (i.e. undo the actions made by the
	 * call to {@link //consume}.</p>
	 *
	 * @param input The input stream.
	 * @param ruleIndex The rule containing the predicate.
	 * @param predIndex The index of the predicate within the rule.
	 * @param speculative {@code true} if the current index in {@code input} is
	 * one character before the predicate's location.
	 *
	 * @return {@code true} if the specified predicate evaluates to
	 * {@code true}.
	 */
	evaluatePredicate(input, ruleIndex,
			predIndex, speculative) {
		// assume true if no recognizer was provided
		if (this.recog === null) {
			return true;
		}
		if (!speculative) {
			return this.recog.sempred(null, ruleIndex, predIndex);
		}
		const savedcolumn = this.column;
		const savedLine = this.line;
		const index = input.index;
		const marker = input.mark();
		try {
			this.consume(input);
			return this.recog.sempred(null, ruleIndex, predIndex);
		} finally {
			this.column = savedcolumn;
			this.line = savedLine;
			input.seek(index);
			input.release(marker);
		}
	}

	captureSimState(settings, input, dfaState) {
		settings.index = input.index;
		settings.line = this.line;
		settings.column = this.column;
		settings.dfaState = dfaState;
	}

	addDFAEdge(from_, tk, to, cfgs) {
		if (to === undefined) {
			to = null;
		}
		if (cfgs === undefined) {
			cfgs = null;
		}
		if (to === null && cfgs !== null) {
			// leading to this call, ATNConfigSet.hasSemanticContext is used as a
			// marker indicating dynamic predicate evaluation makes this edge
			// dependent on the specific input sequence, so the static edge in the
			// DFA should be omitted. The target DFAState is still created since
			// execATN has the ability to resynchronize with the DFA state cache
			// following the predicate evaluation step.
			//
			// TJP notes: next time through the DFA, we see a pred again and eval.
			// If that gets us to a previously created (but dangling) DFA
			// state, we can continue in pure DFA mode from there.
			// /
			const suppressEdge = cfgs.hasSemanticContext;
			cfgs.hasSemanticContext = false;

			to = this.addDFAState(cfgs);

			if (suppressEdge) {
				return to;
			}
		}
		// add the edge
		if (tk < LexerATNSimulator.MIN_DFA_EDGE || tk > LexerATNSimulator.MAX_DFA_EDGE) {
			// Only track edges within the DFA bounds
			return to;
		}
		if (LexerATNSimulator.debug) {
			console.log("EDGE " + from_ + " -> " + to + " upon " + tk);
		}
		if (from_.edges === null) {
			// make room for tokens 1..n and -1 masquerading as index 0
			from_.edges = [];
		}
		from_.edges[tk - LexerATNSimulator.MIN_DFA_EDGE] = to; // connect

		return to;
	}

	/**
	 * Add a new DFA state if there isn't one with this set of
	 * configurations already. This method also detects the first
	 * configuration containing an ATN rule stop state. Later, when
	 * traversing the DFA, we will know which rule to accept.
	 */
	addDFAState(configs) {
		const proposed = new DFAState$2(null, configs);
		let firstConfigWithRuleStopState = null;
		for (let i = 0; i < configs.items.length; i++) {
			const cfg = configs.items[i];
			if (cfg.state instanceof RuleStopState$3) {
				firstConfigWithRuleStopState = cfg;
				break;
			}
		}
		if (firstConfigWithRuleStopState !== null) {
			proposed.isAcceptState = true;
			proposed.lexerActionExecutor = firstConfigWithRuleStopState.lexerActionExecutor;
			proposed.prediction = this.atn.ruleToTokenType[firstConfigWithRuleStopState.state.ruleIndex];
		}
		const dfa = this.decisionToDFA[this.mode];
		const existing = dfa.states.get(proposed);
		if (existing!==null) {
			return existing;
		}
		const newState = proposed;
		newState.stateNumber = dfa.states.length;
		configs.setReadonly(true);
		newState.configs = configs;
		dfa.states.add(newState);
		return newState;
	}

	getDFA(mode) {
		return this.decisionToDFA[mode];
	}

// Get the text matched so far for the current token.
	getText(input) {
		// index is first lookahead char, don't include.
		return input.getText(this.startIndex, input.index - 1);
	}

	consume(input) {
		const curChar = input.LA(1);
		if (curChar === "\n".charCodeAt(0)) {
			this.line += 1;
			this.column = 0;
		} else {
			this.column += 1;
		}
		input.consume();
	}

	getTokenName(tt) {
		if (tt === -1) {
			return "EOF";
		} else {
			return "'" + String.fromCharCode(tt) + "'";
		}
	}
}

LexerATNSimulator.debug = false;
LexerATNSimulator.dfa_debug = false;

LexerATNSimulator.MIN_DFA_EDGE = 0;
LexerATNSimulator.MAX_DFA_EDGE = 127; // forces unicode to stay in ATN

LexerATNSimulator.match_calls = 0;

var LexerATNSimulator_1 = LexerATNSimulator;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Map: Map$4, BitSet: BitSet$2, AltDict: AltDict$1, hashStuff: hashStuff$2} = Utils;

const {RuleStopState: RuleStopState$4} = ATNState_1;
const {ATNConfigSet: ATNConfigSet$3} = ATNConfigSet_1;
const {ATNConfig: ATNConfig$2} = ATNConfig_1;
const {SemanticContext: SemanticContext$3} = SemanticContext_1;

/**
 * This enumeration defines the prediction modes available in ANTLR 4 along with
 * utility methods for analyzing configuration sets for conflicts and/or
 * ambiguities.
 */
const PredictionMode = {
    /**
     * The SLL(*) prediction mode. This prediction mode ignores the current
     * parser context when making predictions. This is the fastest prediction
     * mode, and provides correct results for many grammars. This prediction
     * mode is more powerful than the prediction mode provided by ANTLR 3, but
     * may result in syntax errors for grammar and input combinations which are
     * not SLL.
     *
     * <p>
     * When using this prediction mode, the parser will either return a correct
     * parse tree (i.e. the same parse tree that would be returned with the
     * {@link //LL} prediction mode), or it will report a syntax error. If a
     * syntax error is encountered when using the {@link //SLL} prediction mode,
     * it may be due to either an actual syntax error in the input or indicate
     * that the particular combination of grammar and input requires the more
     * powerful {@link //LL} prediction abilities to complete successfully.</p>
     *
     * <p>
     * This prediction mode does not provide any guarantees for prediction
     * behavior for syntactically-incorrect inputs.</p>
     */
    SLL: 0,

    /**
     * The LL(*) prediction mode. This prediction mode allows the current parser
     * context to be used for resolving SLL conflicts that occur during
     * prediction. This is the fastest prediction mode that guarantees correct
     * parse results for all combinations of grammars with syntactically correct
     * inputs.
     *
     * <p>
     * When using this prediction mode, the parser will make correct decisions
     * for all syntactically-correct grammar and input combinations. However, in
     * cases where the grammar is truly ambiguous this prediction mode might not
     * report a precise answer for <em>exactly which</em> alternatives are
     * ambiguous.</p>
     *
     * <p>
     * This prediction mode does not provide any guarantees for prediction
     * behavior for syntactically-incorrect inputs.</p>
     */
    LL: 1,

    /**
     *
     * The LL(*) prediction mode with exact ambiguity detection. In addition to
     * the correctness guarantees provided by the {@link //LL} prediction mode,
     * this prediction mode instructs the prediction algorithm to determine the
     * complete and exact set of ambiguous alternatives for every ambiguous
     * decision encountered while parsing.
     *
     * <p>
     * This prediction mode may be used for diagnosing ambiguities during
     * grammar development. Due to the performance overhead of calculating sets
     * of ambiguous alternatives, this prediction mode should be avoided when
     * the exact results are not necessary.</p>
     *
     * <p>
     * This prediction mode does not provide any guarantees for prediction
     * behavior for syntactically-incorrect inputs.</p>
     */
    LL_EXACT_AMBIG_DETECTION: 2,

    /**
     *
     * Computes the SLL prediction termination condition.
     *
     * <p>
     * This method computes the SLL prediction termination condition for both of
     * the following cases.</p>
     *
     * <ul>
     * <li>The usual SLL+LL fallback upon SLL conflict</li>
     * <li>Pure SLL without LL fallback</li>
     * </ul>
     *
     * <p><strong>COMBINED SLL+LL PARSING</strong></p>
     *
     * <p>When LL-fallback is enabled upon SLL conflict, correct predictions are
     * ensured regardless of how the termination condition is computed by this
     * method. Due to the substantially higher cost of LL prediction, the
     * prediction should only fall back to LL when the additional lookahead
     * cannot lead to a unique SLL prediction.</p>
     *
     * <p>Assuming combined SLL+LL parsing, an SLL configuration set with only
     * conflicting subsets should fall back to full LL, even if the
     * configuration sets don't resolve to the same alternative (e.g.
     * {@code {1,2}} and {@code {3,4}}. If there is at least one non-conflicting
     * configuration, SLL could continue with the hopes that more lookahead will
     * resolve via one of those non-conflicting configurations.</p>
     *
     * <p>Here's the prediction termination rule them: SLL (for SLL+LL parsing)
     * stops when it sees only conflicting configuration subsets. In contrast,
     * full LL keeps going when there is uncertainty.</p>
     *
     * <p><strong>HEURISTIC</strong></p>
     *
     * <p>As a heuristic, we stop prediction when we see any conflicting subset
     * unless we see a state that only has one alternative associated with it.
     * The single-alt-state thing lets prediction continue upon rules like
     * (otherwise, it would admit defeat too soon):</p>
     *
     * <p>{@code [12|1|[], 6|2|[], 12|2|[]]. s : (ID | ID ID?) ';' ;}</p>
     *
     * <p>When the ATN simulation reaches the state before {@code ';'}, it has a
     * DFA state that looks like: {@code [12|1|[], 6|2|[], 12|2|[]]}. Naturally
     * {@code 12|1|[]} and {@code 12|2|[]} conflict, but we cannot stop
     * processing this node because alternative to has another way to continue,
     * via {@code [6|2|[]]}.</p>
     *
     * <p>It also let's us continue for this rule:</p>
     *
     * <p>{@code [1|1|[], 1|2|[], 8|3|[]] a : A | A | A B ;}</p>
     *
     * <p>After matching input A, we reach the stop state for rule A, state 1.
     * State 8 is the state right before B. Clearly alternatives 1 and 2
     * conflict and no amount of further lookahead will separate the two.
     * However, alternative 3 will be able to continue and so we do not stop
     * working on this state. In the previous example, we're concerned with
     * states associated with the conflicting alternatives. Here alt 3 is not
     * associated with the conflicting configs, but since we can continue
     * looking for input reasonably, don't declare the state done.</p>
     *
     * <p><strong>PURE SLL PARSING</strong></p>
     *
     * <p>To handle pure SLL parsing, all we have to do is make sure that we
     * combine stack contexts for configurations that differ only by semantic
     * predicate. From there, we can do the usual SLL termination heuristic.</p>
     *
     * <p><strong>PREDICATES IN SLL+LL PARSING</strong></p>
     *
     * <p>SLL decisions don't evaluate predicates until after they reach DFA stop
     * states because they need to create the DFA cache that works in all
     * semantic situations. In contrast, full LL evaluates predicates collected
     * during start state computation so it can ignore predicates thereafter.
     * This means that SLL termination detection can totally ignore semantic
     * predicates.</p>
     *
     * <p>Implementation-wise, {@link ATNConfigSet} combines stack contexts but not
     * semantic predicate contexts so we might see two configurations like the
     * following.</p>
     *
     * <p>{@code (s, 1, x, {}), (s, 1, x', {p})}</p>
     *
     * <p>Before testing these configurations against others, we have to merge
     * {@code x} and {@code x'} (without modifying the existing configurations).
     * For example, we test {@code (x+x')==x''} when looking for conflicts in
     * the following configurations.</p>
     *
     * <p>{@code (s, 1, x, {}), (s, 1, x', {p}), (s, 2, x'', {})}</p>
     *
     * <p>If the configuration set has predicates (as indicated by
     * {@link ATNConfigSet//hasSemanticContext}), this algorithm makes a copy of
     * the configurations to strip out all of the predicates so that a standard
     * {@link ATNConfigSet} will merge everything ignoring predicates.</p>
     */
    hasSLLConflictTerminatingPrediction: function( mode, configs) {
        // Configs in rule stop states indicate reaching the end of the decision
        // rule (local context) or end of start rule (full context). If all
        // configs meet this condition, then none of the configurations is able
        // to match additional input so we terminate prediction.
        //
        if (PredictionMode.allConfigsInRuleStopStates(configs)) {
            return true;
        }
        // pure SLL mode parsing
        if (mode === PredictionMode.SLL) {
            // Don't bother with combining configs from different semantic
            // contexts if we can fail over to full LL; costs more time
            // since we'll often fail over anyway.
            if (configs.hasSemanticContext) {
                // dup configs, tossing out semantic predicates
                const dup = new ATNConfigSet$3();
                for(let i=0;i<configs.items.length;i++) {
                    let c = configs.items[i];
                    c = new ATNConfig$2({semanticContext:SemanticContext$3.NONE}, c);
                    dup.add(c);
                }
                configs = dup;
            }
            // now we have combined contexts for configs with dissimilar preds
        }
        // pure SLL or combined SLL+LL mode parsing
        const altsets = PredictionMode.getConflictingAltSubsets(configs);
        return PredictionMode.hasConflictingAltSet(altsets) && !PredictionMode.hasStateAssociatedWithOneAlt(configs);
    },

    /**
     * Checks if any configuration in {@code configs} is in a
     * {@link RuleStopState}. Configurations meeting this condition have reached
     * the end of the decision rule (local context) or end of start rule (full
     * context).
     *
     * @param configs the configuration set to test
     * @return {@code true} if any configuration in {@code configs} is in a
     * {@link RuleStopState}, otherwise {@code false}
     */
    hasConfigInRuleStopState: function(configs) {
        for(let i=0;i<configs.items.length;i++) {
            const c = configs.items[i];
            if (c.state instanceof RuleStopState$4) {
                return true;
            }
        }
        return false;
    },

    /**
     * Checks if all configurations in {@code configs} are in a
     * {@link RuleStopState}. Configurations meeting this condition have reached
     * the end of the decision rule (local context) or end of start rule (full
     * context).
     *
     * @param configs the configuration set to test
     * @return {@code true} if all configurations in {@code configs} are in a
     * {@link RuleStopState}, otherwise {@code false}
     */
    allConfigsInRuleStopStates: function(configs) {
        for(let i=0;i<configs.items.length;i++) {
            const c = configs.items[i];
            if (!(c.state instanceof RuleStopState$4)) {
                return false;
            }
        }
        return true;
    },

    /**
     *
     * Full LL prediction termination.
     *
     * <p>Can we stop looking ahead during ATN simulation or is there some
     * uncertainty as to which alternative we will ultimately pick, after
     * consuming more input? Even if there are partial conflicts, we might know
     * that everything is going to resolve to the same minimum alternative. That
     * means we can stop since no more lookahead will change that fact. On the
     * other hand, there might be multiple conflicts that resolve to different
     * minimums. That means we need more look ahead to decide which of those
     * alternatives we should predict.</p>
     *
     * <p>The basic idea is to split the set of configurations {@code C}, into
     * conflicting subsets {@code (s, _, ctx, _)} and singleton subsets with
     * non-conflicting configurations. Two configurations conflict if they have
     * identical {@link ATNConfig//state} and {@link ATNConfig//context} values
     * but different {@link ATNConfig//alt} value, e.g. {@code (s, i, ctx, _)}
     * and {@code (s, j, ctx, _)} for {@code i!=j}.</p>
     *
     * <p>Reduce these configuration subsets to the set of possible alternatives.
     * You can compute the alternative subsets in one pass as follows:</p>
     *
     * <p>{@code A_s,ctx = {i | (s, i, ctx, _)}} for each configuration in
     * {@code C} holding {@code s} and {@code ctx} fixed.</p>
     *
     * <p>Or in pseudo-code, for each configuration {@code c} in {@code C}:</p>
     *
     * <pre>
     * map[c] U= c.{@link ATNConfig//alt alt} // map hash/equals uses s and x, not
     * alt and not pred
     * </pre>
     *
     * <p>The values in {@code map} are the set of {@code A_s,ctx} sets.</p>
     *
     * <p>If {@code |A_s,ctx|=1} then there is no conflict associated with
     * {@code s} and {@code ctx}.</p>
     *
     * <p>Reduce the subsets to singletons by choosing a minimum of each subset. If
     * the union of these alternative subsets is a singleton, then no amount of
     * more lookahead will help us. We will always pick that alternative. If,
     * however, there is more than one alternative, then we are uncertain which
     * alternative to predict and must continue looking for resolution. We may
     * or may not discover an ambiguity in the future, even if there are no
     * conflicting subsets this round.</p>
     *
     * <p>The biggest sin is to terminate early because it means we've made a
     * decision but were uncertain as to the eventual outcome. We haven't used
     * enough lookahead. On the other hand, announcing a conflict too late is no
     * big deal; you will still have the conflict. It's just inefficient. It
     * might even look until the end of file.</p>
     *
     * <p>No special consideration for semantic predicates is required because
     * predicates are evaluated on-the-fly for full LL prediction, ensuring that
     * no configuration contains a semantic context during the termination
     * check.</p>
     *
     * <p><strong>CONFLICTING CONFIGS</strong></p>
     *
     * <p>Two configurations {@code (s, i, x)} and {@code (s, j, x')}, conflict
     * when {@code i!=j} but {@code x=x'}. Because we merge all
     * {@code (s, i, _)} configurations together, that means that there are at
     * most {@code n} configurations associated with state {@code s} for
     * {@code n} possible alternatives in the decision. The merged stacks
     * complicate the comparison of configuration contexts {@code x} and
     * {@code x'}. Sam checks to see if one is a subset of the other by calling
     * merge and checking to see if the merged result is either {@code x} or
     * {@code x'}. If the {@code x} associated with lowest alternative {@code i}
     * is the superset, then {@code i} is the only possible prediction since the
     * others resolve to {@code min(i)} as well. However, if {@code x} is
     * associated with {@code j>i} then at least one stack configuration for
     * {@code j} is not in conflict with alternative {@code i}. The algorithm
     * should keep going, looking for more lookahead due to the uncertainty.</p>
     *
     * <p>For simplicity, I'm doing a equality check between {@code x} and
     * {@code x'} that lets the algorithm continue to consume lookahead longer
     * than necessary. The reason I like the equality is of course the
     * simplicity but also because that is the test you need to detect the
     * alternatives that are actually in conflict.</p>
     *
     * <p><strong>CONTINUE/STOP RULE</strong></p>
     *
     * <p>Continue if union of resolved alternative sets from non-conflicting and
     * conflicting alternative subsets has more than one alternative. We are
     * uncertain about which alternative to predict.</p>
     *
     * <p>The complete set of alternatives, {@code [i for (_,i,_)]}, tells us which
     * alternatives are still in the running for the amount of input we've
     * consumed at this point. The conflicting sets let us to strip away
     * configurations that won't lead to more states because we resolve
     * conflicts to the configuration with a minimum alternate for the
     * conflicting set.</p>
     *
     * <p><strong>CASES</strong></p>
     *
     * <ul>
     *
     * <li>no conflicts and more than 1 alternative in set =&gt; continue</li>
     *
     * <li> {@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s, 3, z)},
     * {@code (s', 1, y)}, {@code (s', 2, y)} yields non-conflicting set
     * {@code {3}} U conflicting sets {@code min({1,2})} U {@code min({1,2})} =
     * {@code {1,3}} =&gt; continue
     * </li>
     *
     * <li>{@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s', 1, y)},
     * {@code (s', 2, y)}, {@code (s'', 1, z)} yields non-conflicting set
     * {@code {1}} U conflicting sets {@code min({1,2})} U {@code min({1,2})} =
     * {@code {1}} =&gt; stop and predict 1</li>
     *
     * <li>{@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s', 1, y)},
     * {@code (s', 2, y)} yields conflicting, reduced sets {@code {1}} U
     * {@code {1}} = {@code {1}} =&gt; stop and predict 1, can announce
     * ambiguity {@code {1,2}}</li>
     *
     * <li>{@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s', 2, y)},
     * {@code (s', 3, y)} yields conflicting, reduced sets {@code {1}} U
     * {@code {2}} = {@code {1,2}} =&gt; continue</li>
     *
     * <li>{@code (s, 1, x)}, {@code (s, 2, x)}, {@code (s', 3, y)},
     * {@code (s', 4, y)} yields conflicting, reduced sets {@code {1}} U
     * {@code {3}} = {@code {1,3}} =&gt; continue</li>
     *
     * </ul>
     *
     * <p><strong>EXACT AMBIGUITY DETECTION</strong></p>
     *
     * <p>If all states report the same conflicting set of alternatives, then we
     * know we have the exact ambiguity set.</p>
     *
     * <p><code>|A_<em>i</em>|&gt;1</code> and
     * <code>A_<em>i</em> = A_<em>j</em></code> for all <em>i</em>, <em>j</em>.</p>
     *
     * <p>In other words, we continue examining lookahead until all {@code A_i}
     * have more than one alternative and all {@code A_i} are the same. If
     * {@code A={{1,2}, {1,3}}}, then regular LL prediction would terminate
     * because the resolved set is {@code {1}}. To determine what the real
     * ambiguity is, we have to know whether the ambiguity is between one and
     * two or one and three so we keep going. We can only stop prediction when
     * we need exact ambiguity detection when the sets look like
     * {@code A={{1,2}}} or {@code {{1,2},{1,2}}}, etc...</p>
     */
    resolvesToJustOneViableAlt: function(altsets) {
        return PredictionMode.getSingleViableAlt(altsets);
    },

    /**
     * Determines if every alternative subset in {@code altsets} contains more
     * than one alternative.
     *
     * @param altsets a collection of alternative subsets
     * @return {@code true} if every {@link BitSet} in {@code altsets} has
     * {@link BitSet//cardinality cardinality} &gt; 1, otherwise {@code false}
     */
    allSubsetsConflict: function(altsets) {
        return ! PredictionMode.hasNonConflictingAltSet(altsets);
    },
    /**
     * Determines if any single alternative subset in {@code altsets} contains
     * exactly one alternative.
     *
     * @param altsets a collection of alternative subsets
     * @return {@code true} if {@code altsets} contains a {@link BitSet} with
     * {@link BitSet//cardinality cardinality} 1, otherwise {@code false}
     */
    hasNonConflictingAltSet: function(altsets) {
        for(let i=0;i<altsets.length;i++) {
            const alts = altsets[i];
            if (alts.length===1) {
                return true;
            }
        }
        return false;
    },


    /**
     * Determines if any single alternative subset in {@code altsets} contains
     * more than one alternative.
     *
     * @param altsets a collection of alternative subsets
     * @return {@code true} if {@code altsets} contains a {@link BitSet} with
     * {@link BitSet//cardinality cardinality} &gt; 1, otherwise {@code false}
     */
    hasConflictingAltSet: function(altsets) {
        for(let i=0;i<altsets.length;i++) {
            const alts = altsets[i];
            if (alts.length>1) {
                return true;
            }
        }
        return false;
    },


    /**
     * Determines if every alternative subset in {@code altsets} is equivalent.
     *
     * @param altsets a collection of alternative subsets
     * @return {@code true} if every member of {@code altsets} is equal to the
     * others, otherwise {@code false}
     */
    allSubsetsEqual: function(altsets) {
        let first = null;
        for(let i=0;i<altsets.length;i++) {
            const alts = altsets[i];
            if (first === null) {
                first = alts;
            } else if (alts!==first) {
                return false;
            }
        }
        return true;
    },


    /**
     * Returns the unique alternative predicted by all alternative subsets in
     * {@code altsets}. If no such alternative exists, this method returns
     * {@link ATN//INVALID_ALT_NUMBER}.
     *
     * @param altsets a collection of alternative subsets
     */
    getUniqueAlt: function(altsets) {
        const all = PredictionMode.getAlts(altsets);
        if (all.length===1) {
            return all.minValue();
        } else {
            return ATN_1.INVALID_ALT_NUMBER;
        }
    },

    /**
     * Gets the complete set of represented alternatives for a collection of
     * alternative subsets. This method returns the union of each {@link BitSet}
     * in {@code altsets}.
     *
     * @param altsets a collection of alternative subsets
     * @return the set of represented alternatives in {@code altsets}
     */
    getAlts: function(altsets) {
        const all = new BitSet$2();
        altsets.map( function(alts) { all.or(alts); });
        return all;
    },

    /**
     * This function gets the conflicting alt subsets from a configuration set.
     * For each configuration {@code c} in {@code configs}:
     *
     * <pre>
     * map[c] U= c.{@link ATNConfig//alt alt} // map hash/equals uses s and x, not
     * alt and not pred
     * </pre>
     */
    getConflictingAltSubsets: function(configs) {
        const configToAlts = new Map$4();
        configToAlts.hashFunction = function(cfg) { hashStuff$2(cfg.state.stateNumber, cfg.context); };
        configToAlts.equalsFunction = function(c1, c2) { return c1.state.stateNumber==c2.state.stateNumber && c1.context.equals(c2.context);};
        configs.items.map(function(cfg) {
            let alts = configToAlts.get(cfg);
            if (alts === null) {
                alts = new BitSet$2();
                configToAlts.put(cfg, alts);
            }
            alts.add(cfg.alt);
        });
        return configToAlts.getValues();
    },

    /**
     * Get a map from state to alt subset from a configuration set. For each
     * configuration {@code c} in {@code configs}:
     *
     * <pre>
     * map[c.{@link ATNConfig//state state}] U= c.{@link ATNConfig//alt alt}
     * </pre>
     */
    getStateToAltMap: function(configs) {
        const m = new AltDict$1();
        configs.items.map(function(c) {
            let alts = m.get(c.state);
            if (alts === null) {
                alts = new BitSet$2();
                m.put(c.state, alts);
            }
            alts.add(c.alt);
        });
        return m;
    },

    hasStateAssociatedWithOneAlt: function(configs) {
        const values = PredictionMode.getStateToAltMap(configs).values();
        for(let i=0;i<values.length;i++) {
            if (values[i].length===1) {
                return true;
            }
        }
        return false;
    },

    getSingleViableAlt: function(altsets) {
        let result = null;
        for(let i=0;i<altsets.length;i++) {
            const alts = altsets[i];
            const minAlt = alts.minValue();
            if(result===null) {
                result = minAlt;
            } else if(result!==minAlt) { // more than 1 viable alt
                return ATN_1.INVALID_ALT_NUMBER;
            }
        }
        return result;
    }
};

var PredictionMode_1 = PredictionMode;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const INVALID_INTERVAL$2 = Tree_1.INVALID_INTERVAL;
const TerminalNode$2 = Tree_1.TerminalNode;
const TerminalNodeImpl$1 = Tree_1.TerminalNodeImpl;
const ErrorNodeImpl$1 = Tree_1.ErrorNodeImpl;
const Interval$2 = IntervalSet_1.Interval;

/**
 * A rule invocation record for parsing.
 *
 *  Contains all of the information about the current rule not stored in the
 *  RuleContext. It handles parse tree children list, Any ATN state
 *  tracing, and the default values available for rule indications:
 *  start, stop, rule index, current alt number, current
 *  ATN state.
 *
 *  Subclasses made for each rule and grammar track the parameters,
 *  return values, locals, and labels specific to that rule. These
 *  are the objects that are returned from rules.
 *
 *  Note text is not an actual field of a rule return value; it is computed
 *  from start and stop using the input stream's toString() method.  I
 *  could add a ctor to this so that we can pass in and store the input
 *  stream, but I'm not sure we want to do that.  It would seem to be undefined
 *  to get the .text property anyway if the rule matches tokens from multiple
 *  input streams.
 *
 *  I do not use getters for fields of objects that are used simply to
 *  group values such as this aggregate.  The getters/setters are there to
 *  satisfy the superclass interface.
 */
class ParserRuleContext extends RuleContext_1 {
	constructor(parent, invokingStateNumber) {
		parent = parent || null;
		invokingStateNumber = invokingStateNumber || null;
		super(parent, invokingStateNumber);
		this.ruleIndex = -1;
		/**
		 * If we are debugging or building a parse tree for a visitor,
		 * we need to track all of the tokens and rule invocations associated
		 * with this rule's context. This is empty for parsing w/o tree constr.
		 * operation because we don't the need to track the details about
		 * how we parse this rule.
		 */
		this.children = null;
		this.start = null;
		this.stop = null;
		/**
		 * The exception that forced this rule to return. If the rule successfully
		 * completed, this is {@code null}.
		 */
		this.exception = null;
	}

	// COPY a ctx (I'm deliberately not using copy constructor)
	copyFrom(ctx) {
		// from RuleContext
		this.parentCtx = ctx.parentCtx;
		this.invokingState = ctx.invokingState;
		this.children = null;
		this.start = ctx.start;
		this.stop = ctx.stop;
		// copy any error nodes to alt label node
		if(ctx.children) {
			this.children = [];
			// reset parent pointer for any error nodes
			ctx.children.map(function(child) {
				if (child instanceof ErrorNodeImpl$1) {
					this.children.push(child);
					child.parentCtx = this;
				}
			}, this);
		}
	}

	// Double dispatch methods for listeners
	enterRule(listener) {
	}

	exitRule(listener) {
	}

	// Does not set parent link; other add methods do that
	addChild(child) {
		if (this.children === null) {
			this.children = [];
		}
		this.children.push(child);
		return child;
	}

	/** Used by enterOuterAlt to toss out a RuleContext previously added as
	 * we entered a rule. If we have // label, we will need to remove
	 * generic ruleContext object.
	 */
	removeLastChild() {
		if (this.children !== null) {
			this.children.pop();
		}
	}

	addTokenNode(token) {
		const node = new TerminalNodeImpl$1(token);
		this.addChild(node);
		node.parentCtx = this;
		return node;
	}

	addErrorNode(badToken) {
		const node = new ErrorNodeImpl$1(badToken);
		this.addChild(node);
		node.parentCtx = this;
		return node;
	}

	getChild(i, type) {
		type = type || null;
		if (this.children === null || i < 0 || i >= this.children.length) {
			return null;
		}
		if (type === null) {
			return this.children[i];
		} else {
			for(let j=0; j<this.children.length; j++) {
				const child = this.children[j];
				if(child instanceof type) {
					if(i===0) {
						return child;
					} else {
						i -= 1;
					}
				}
			}
			return null;
		}
	}

	getToken(ttype, i) {
		if (this.children === null || i < 0 || i >= this.children.length) {
			return null;
		}
		for(let j=0; j<this.children.length; j++) {
			const child = this.children[j];
			if (child instanceof TerminalNode$2) {
				if (child.symbol.type === ttype) {
					if(i===0) {
						return child;
					} else {
						i -= 1;
					}
				}
			}
		}
		return null;
	}

	getTokens(ttype ) {
		if (this.children=== null) {
			return [];
		} else {
			const tokens = [];
			for(let j=0; j<this.children.length; j++) {
				const child = this.children[j];
				if (child instanceof TerminalNode$2) {
					if (child.symbol.type === ttype) {
						tokens.push(child);
					}
				}
			}
			return tokens;
		}
	}

	getTypedRuleContext(ctxType, i) {
		return this.getChild(i, ctxType);
	}

	getTypedRuleContexts(ctxType) {
		if (this.children=== null) {
			return [];
		} else {
			const contexts = [];
			for(let j=0; j<this.children.length; j++) {
				const child = this.children[j];
				if (child instanceof ctxType) {
					contexts.push(child);
				}
			}
			return contexts;
		}
	}

	getChildCount() {
		if (this.children=== null) {
			return 0;
		} else {
			return this.children.length;
		}
	}

	getSourceInterval() {
		if( this.start === null || this.stop === null) {
			return INVALID_INTERVAL$2;
		} else {
			return new Interval$2(this.start.tokenIndex, this.stop.tokenIndex);
		}
	}
}

RuleContext_1.EMPTY = new ParserRuleContext();

var ParserRuleContext_1 = ParserRuleContext;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Set: Set$4, BitSet: BitSet$3, DoubleDict: DoubleDict$1} = Utils;


const {ATNState: ATNState$2, RuleStopState: RuleStopState$5} = ATNState_1;

const {ATNConfig: ATNConfig$3} = ATNConfig_1;
const {ATNConfigSet: ATNConfigSet$4} = ATNConfigSet_1;
const {Token: Token$b} = Token_1;
const {DFAState: DFAState$3, PredPrediction: PredPrediction$1} = DFAState_1;




const {SemanticContext: SemanticContext$4} = SemanticContext_1;
const {PredictionContext: PredictionContext$3} = PredictionContext_1;
const {Interval: Interval$3} = IntervalSet_1;
const {Transition: Transition$3, SetTransition: SetTransition$2, NotSetTransition: NotSetTransition$3, RuleTransition: RuleTransition$3, ActionTransition: ActionTransition$2} = Transition_1;
const {NoViableAltException: NoViableAltException$1} = Errors;
const {SingletonPredictionContext: SingletonPredictionContext$3, predictionContextFromRuleContext: predictionContextFromRuleContext$2} = PredictionContext_1;


/**
 * The embodiment of the adaptive LL(*), ALL(*), parsing strategy.
 *
 * <p>
 * The basic complexity of the adaptive strategy makes it harder to understand.
 * We begin with ATN simulation to build paths in a DFA. Subsequent prediction
 * requests go through the DFA first. If they reach a state without an edge for
 * the current symbol, the algorithm fails over to the ATN simulation to
 * complete the DFA path for the current input (until it finds a conflict state
 * or uniquely predicting state).</p>
 *
 * <p>
 * All of that is done without using the outer context because we want to create
 * a DFA that is not dependent upon the rule invocation stack when we do a
 * prediction. One DFA works in all contexts. We avoid using context not
 * necessarily because it's slower, although it can be, but because of the DFA
 * caching problem. The closure routine only considers the rule invocation stack
 * created during prediction beginning in the decision rule. For example, if
 * prediction occurs without invoking another rule's ATN, there are no context
 * stacks in the configurations. When lack of context leads to a conflict, we
 * don't know if it's an ambiguity or a weakness in the strong LL(*) parsing
 * strategy (versus full LL(*)).</p>
 *
 * <p>
 * When SLL yields a configuration set with conflict, we rewind the input and
 * retry the ATN simulation, this time using full outer context without adding
 * to the DFA. Configuration context stacks will be the full invocation stacks
 * from the start rule. If we get a conflict using full context, then we can
 * definitively say we have a true ambiguity for that input sequence. If we
 * don't get a conflict, it implies that the decision is sensitive to the outer
 * context. (It is not context-sensitive in the sense of context-sensitive
 * grammars.)</p>
 *
 * <p>
 * The next time we reach this DFA state with an SLL conflict, through DFA
 * simulation, we will again retry the ATN simulation using full context mode.
 * This is slow because we can't save the results and have to "interpret" the
 * ATN each time we get that input.</p>
 *
 * <p>
 * <strong>CACHING FULL CONTEXT PREDICTIONS</strong></p>
 *
 * <p>
 * We could cache results from full context to predicted alternative easily and
 * that saves a lot of time but doesn't work in presence of predicates. The set
 * of visible predicates from the ATN start state changes depending on the
 * context, because closure can fall off the end of a rule. I tried to cache
 * tuples (stack context, semantic context, predicted alt) but it was slower
 * than interpreting and much more complicated. Also required a huge amount of
 * memory. The goal is not to create the world's fastest parser anyway. I'd like
 * to keep this algorithm simple. By launching multiple threads, we can improve
 * the speed of parsing across a large number of files.</p>
 *
 * <p>
 * There is no strict ordering between the amount of input used by SLL vs LL,
 * which makes it really hard to build a cache for full context. Let's say that
 * we have input A B C that leads to an SLL conflict with full context X. That
 * implies that using X we might only use A B but we could also use A B C D to
 * resolve conflict. Input A B C D could predict alternative 1 in one position
 * in the input and A B C E could predict alternative 2 in another position in
 * input. The conflicting SLL configurations could still be non-unique in the
 * full context prediction, which would lead us to requiring more input than the
 * original A B C.	To make a	prediction cache work, we have to track	the exact
 * input	used during the previous prediction. That amounts to a cache that maps
 * X to a specific DFA for that context.</p>
 *
 * <p>
 * Something should be done for left-recursive expression predictions. They are
 * likely LL(1) + pred eval. Easier to do the whole SLL unless error and retry
 * with full LL thing Sam does.</p>
 *
 * <p>
 * <strong>AVOIDING FULL CONTEXT PREDICTION</strong></p>
 *
 * <p>
 * We avoid doing full context retry when the outer context is empty, we did not
 * dip into the outer context by falling off the end of the decision state rule,
 * or when we force SLL mode.</p>
 *
 * <p>
 * As an example of the not dip into outer context case, consider as super
 * constructor calls versus function calls. One grammar might look like
 * this:</p>
 *
 * <pre>
 * ctorBody
 *   : '{' superCall? stat* '}'
 *   ;
 * </pre>
 *
 * <p>
 * Or, you might see something like</p>
 *
 * <pre>
 * stat
 *   : superCall ';'
 *   | expression ';'
 *   | ...
 *   ;
 * </pre>
 *
 * <p>
 * In both cases I believe that no closure operations will dip into the outer
 * context. In the first case ctorBody in the worst case will stop at the '}'.
 * In the 2nd case it should stop at the ';'. Both cases should stay within the
 * entry rule and not dip into the outer context.</p>
 *
 * <p>
 * <strong>PREDICATES</strong></p>
 *
 * <p>
 * Predicates are always evaluated if present in either SLL or LL both. SLL and
 * LL simulation deals with predicates differently. SLL collects predicates as
 * it performs closure operations like ANTLR v3 did. It delays predicate
 * evaluation until it reaches and accept state. This allows us to cache the SLL
 * ATN simulation whereas, if we had evaluated predicates on-the-fly during
 * closure, the DFA state configuration sets would be different and we couldn't
 * build up a suitable DFA.</p>
 *
 * <p>
 * When building a DFA accept state during ATN simulation, we evaluate any
 * predicates and return the sole semantically valid alternative. If there is
 * more than 1 alternative, we report an ambiguity. If there are 0 alternatives,
 * we throw an exception. Alternatives without predicates act like they have
 * true predicates. The simple way to think about it is to strip away all
 * alternatives with false predicates and choose the minimum alternative that
 * remains.</p>
 *
 * <p>
 * When we start in the DFA and reach an accept state that's predicated, we test
 * those and return the minimum semantically viable alternative. If no
 * alternatives are viable, we throw an exception.</p>
 *
 * <p>
 * During full LL ATN simulation, closure always evaluates predicates and
 * on-the-fly. This is crucial to reducing the configuration set size during
 * closure. It hits a landmine when parsing with the Java grammar, for example,
 * without this on-the-fly evaluation.</p>
 *
 * <p>
 * <strong>SHARING DFA</strong></p>
 *
 * <p>
 * All instances of the same parser share the same decision DFAs through a
 * static field. Each instance gets its own ATN simulator but they share the
 * same {@link //decisionToDFA} field. They also share a
 * {@link PredictionContextCache} object that makes sure that all
 * {@link PredictionContext} objects are shared among the DFA states. This makes
 * a big size difference.</p>
 *
 * <p>
 * <strong>THREAD SAFETY</strong></p>
 *
 * <p>
 * The {@link ParserATNSimulator} locks on the {@link //decisionToDFA} field when
 * it adds a new DFA object to that array. {@link //addDFAEdge}
 * locks on the DFA for the current decision when setting the
 * {@link DFAState//edges} field. {@link //addDFAState} locks on
 * the DFA for the current decision when looking up a DFA state to see if it
 * already exists. We must make sure that all requests to add DFA states that
 * are equivalent result in the same shared DFA object. This is because lots of
 * threads will be trying to update the DFA at once. The
 * {@link //addDFAState} method also locks inside the DFA lock
 * but this time on the shared context cache when it rebuilds the
 * configurations' {@link PredictionContext} objects using cached
 * subgraphs/nodes. No other locking occurs, even during DFA simulation. This is
 * safe as long as we can guarantee that all threads referencing
 * {@code s.edge[t]} get the same physical target {@link DFAState}, or
 * {@code null}. Once into the DFA, the DFA simulation does not reference the
 * {@link DFA//states} map. It follows the {@link DFAState//edges} field to new
 * targets. The DFA simulator will either find {@link DFAState//edges} to be
 * {@code null}, to be non-{@code null} and {@code dfa.edges[t]} null, or
 * {@code dfa.edges[t]} to be non-null. The
 * {@link //addDFAEdge} method could be racing to set the field
 * but in either case the DFA simulator works; if {@code null}, and requests ATN
 * simulation. It could also race trying to get {@code dfa.edges[t]}, but either
 * way it will work because it's not doing a test and set operation.</p>
 *
 * <p>
 * <strong>Starting with SLL then failing to combined SLL/LL (Two-Stage
 * Parsing)</strong></p>
 *
 * <p>
 * Sam pointed out that if SLL does not give a syntax error, then there is no
 * point in doing full LL, which is slower. We only have to try LL if we get a
 * syntax error. For maximum speed, Sam starts the parser set to pure SLL
 * mode with the {@link BailErrorStrategy}:</p>
 *
 * <pre>
 * parser.{@link Parser//getInterpreter() getInterpreter()}.{@link //setPredictionMode setPredictionMode}{@code (}{@link PredictionMode//SLL}{@code )};
 * parser.{@link Parser//setErrorHandler setErrorHandler}(new {@link BailErrorStrategy}());
 * </pre>
 *
 * <p>
 * If it does not get a syntax error, then we're done. If it does get a syntax
 * error, we need to retry with the combined SLL/LL strategy.</p>
 *
 * <p>
 * The reason this works is as follows. If there are no SLL conflicts, then the
 * grammar is SLL (at least for that input set). If there is an SLL conflict,
 * the full LL analysis must yield a set of viable alternatives which is a
 * subset of the alternatives reported by SLL. If the LL set is a singleton,
 * then the grammar is LL but not SLL. If the LL set is the same size as the SLL
 * set, the decision is SLL. If the LL set has size &gt; 1, then that decision
 * is truly ambiguous on the current input. If the LL set is smaller, then the
 * SLL conflict resolution might choose an alternative that the full LL would
 * rule out as a possibility based upon better context information. If that's
 * the case, then the SLL parse will definitely get an error because the full LL
 * analysis says it's not viable. If SLL conflict resolution chooses an
 * alternative within the LL set, them both SLL and LL would choose the same
 * alternative because they both choose the minimum of multiple conflicting
 * alternatives.</p>
 *
 * <p>
 * Let's say we have a set of SLL conflicting alternatives {@code {1, 2, 3}} and
 * a smaller LL set called <em>s</em>. If <em>s</em> is {@code {2, 3}}, then SLL
 * parsing will get an error because SLL will pursue alternative 1. If
 * <em>s</em> is {@code {1, 2}} or {@code {1, 3}} then both SLL and LL will
 * choose the same alternative because alternative one is the minimum of either
 * set. If <em>s</em> is {@code {2}} or {@code {3}} then SLL will get a syntax
 * error. If <em>s</em> is {@code {1}} then SLL will succeed.</p>
 *
 * <p>
 * Of course, if the input is invalid, then we will get an error for sure in
 * both SLL and LL parsing. Erroneous input will therefore require 2 passes over
 * the input.</p>
 */
class ParserATNSimulator extends ATNSimulator_1 {
    constructor(parser, atn, decisionToDFA, sharedContextCache) {
        super(atn, sharedContextCache);
        this.parser = parser;
        this.decisionToDFA = decisionToDFA;
        // SLL, LL, or LL + exact ambig detection?//
        this.predictionMode = PredictionMode_1.LL;
        // LAME globals to avoid parameters!!!!! I need these down deep in predTransition
        this._input = null;
        this._startIndex = 0;
        this._outerContext = null;
        this._dfa = null;
        /**
         * Each prediction operation uses a cache for merge of prediction contexts.
         *  Don't keep around as it wastes huge amounts of memory. DoubleKeyMap
         *  isn't synchronized but we're ok since two threads shouldn't reuse same
         *  parser/atnsim object because it can only handle one input at a time.
         *  This maps graphs a and b to merged result c. (a,b)&rarr;c. We can avoid
         *  the merge if we ever see a and b again.  Note that (b,a)&rarr;c should
         *  also be examined during cache lookup.
         */
        this.mergeCache = null;
        this.debug = false;
        this.debug_closure = false;
        this.debug_add = false;
        this.debug_list_atn_decisions = false;
        this.dfa_debug = false;
        this.retry_debug = false;
    }

    reset() {}

    adaptivePredict(input, decision, outerContext) {
        if (this.debug || this.debug_list_atn_decisions) {
            console.log("adaptivePredict decision " + decision +
                                   " exec LA(1)==" + this.getLookaheadName(input) +
                                   " line " + input.LT(1).line + ":" +
                                   input.LT(1).column);
        }
        this._input = input;
        this._startIndex = input.index;
        this._outerContext = outerContext;

        const dfa = this.decisionToDFA[decision];
        this._dfa = dfa;
        const m = input.mark();
        const index = input.index;

        // Now we are certain to have a specific decision's DFA
        // But, do we still need an initial state?
        try {
            let s0;
            if (dfa.precedenceDfa) {
                // the start state for a precedence DFA depends on the current
                // parser precedence, and is provided by a DFA method.
                s0 = dfa.getPrecedenceStartState(this.parser.getPrecedence());
            } else {
                // the start state for a "regular" DFA is just s0
                s0 = dfa.s0;
            }
            if (s0===null) {
                if (outerContext===null) {
                    outerContext = RuleContext_1.EMPTY;
                }
                if (this.debug || this.debug_list_atn_decisions) {
                    console.log("predictATN decision " + dfa.decision +
                                       " exec LA(1)==" + this.getLookaheadName(input) +
                                       ", outerContext=" + outerContext.toString(this.parser.ruleNames));
                }

                const fullCtx = false;
                let s0_closure = this.computeStartState(dfa.atnStartState, RuleContext_1.EMPTY, fullCtx);

                if( dfa.precedenceDfa) {
                    // If this is a precedence DFA, we use applyPrecedenceFilter
                    // to convert the computed start state to a precedence start
                    // state. We then use DFA.setPrecedenceStartState to set the
                    // appropriate start state for the precedence level rather
                    // than simply setting DFA.s0.
                    //
                    dfa.s0.configs = s0_closure; // not used for prediction but useful to know start configs anyway
                    s0_closure = this.applyPrecedenceFilter(s0_closure);
                    s0 = this.addDFAState(dfa, new DFAState$3(null, s0_closure));
                    dfa.setPrecedenceStartState(this.parser.getPrecedence(), s0);
                } else {
                    s0 = this.addDFAState(dfa, new DFAState$3(null, s0_closure));
                    dfa.s0 = s0;
                }
            }
            const alt = this.execATN(dfa, s0, input, index, outerContext);
            if (this.debug) {
                console.log("DFA after predictATN: " + dfa.toString(this.parser.literalNames));
            }
            return alt;
        } finally {
            this._dfa = null;
            this.mergeCache = null; // wack cache after each prediction
            input.seek(index);
            input.release(m);
        }
    }

    /**
     * Performs ATN simulation to compute a predicted alternative based
     *  upon the remaining input, but also updates the DFA cache to avoid
     *  having to traverse the ATN again for the same input sequence.
     *
     * There are some key conditions we're looking for after computing a new
     * set of ATN configs (proposed DFA state):
     *       if the set is empty, there is no viable alternative for current symbol
     *       does the state uniquely predict an alternative?
     *       does the state have a conflict that would prevent us from
     *         putting it on the work list?
     *
     * We also have some key operations to do:
     *       add an edge from previous DFA state to potentially new DFA state, D,
     *         upon current symbol but only if adding to work list, which means in all
     *         cases except no viable alternative (and possibly non-greedy decisions?)
     *       collecting predicates and adding semantic context to DFA accept states
     *       adding rule context to context-sensitive DFA accept states
     *       consuming an input symbol
     *       reporting a conflict
     *       reporting an ambiguity
     *       reporting a context sensitivity
     *       reporting insufficient predicates
     *
     * cover these cases:
     *    dead end
     *    single alt
     *    single alt + preds
     *    conflict
     *    conflict + preds
     *
     */
    execATN(dfa, s0, input, startIndex, outerContext ) {
        if (this.debug || this.debug_list_atn_decisions) {
            console.log("execATN decision " + dfa.decision +
                    " exec LA(1)==" + this.getLookaheadName(input) +
                    " line " + input.LT(1).line + ":" + input.LT(1).column);
        }
        let alt;
        let previousD = s0;

        if (this.debug) {
            console.log("s0 = " + s0);
        }
        let t = input.LA(1);
        while(true) { // while more work
            let D = this.getExistingTargetState(previousD, t);
            if(D===null) {
                D = this.computeTargetState(dfa, previousD, t);
            }
            if(D===ATNSimulator_1.ERROR) {
                // if any configs in previous dipped into outer context, that
                // means that input up to t actually finished entry rule
                // at least for SLL decision. Full LL doesn't dip into outer
                // so don't need special case.
                // We will get an error no matter what so delay until after
                // decision; better error message. Also, no reachable target
                // ATN states in SLL implies LL will also get nowhere.
                // If conflict in states that dip out, choose min since we
                // will get error no matter what.
                const e = this.noViableAlt(input, outerContext, previousD.configs, startIndex);
                input.seek(startIndex);
                alt = this.getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule(previousD.configs, outerContext);
                if(alt!==ATN_1.INVALID_ALT_NUMBER) {
                    return alt;
                } else {
                    throw e;
                }
            }
            if(D.requiresFullContext && this.predictionMode !== PredictionMode_1.SLL) {
                // IF PREDS, MIGHT RESOLVE TO SINGLE ALT => SLL (or syntax error)
                let conflictingAlts = null;
                if (D.predicates!==null) {
                    if (this.debug) {
                        console.log("DFA state has preds in DFA sim LL failover");
                    }
                    const conflictIndex = input.index;
                    if(conflictIndex !== startIndex) {
                        input.seek(startIndex);
                    }
                    conflictingAlts = this.evalSemanticContext(D.predicates, outerContext, true);
                    if (conflictingAlts.length===1) {
                        if(this.debug) {
                            console.log("Full LL avoided");
                        }
                        return conflictingAlts.minValue();
                    }
                    if (conflictIndex !== startIndex) {
                        // restore the index so reporting the fallback to full
                        // context occurs with the index at the correct spot
                        input.seek(conflictIndex);
                    }
                }
                if (this.dfa_debug) {
                    console.log("ctx sensitive state " + outerContext +" in " + D);
                }
                const fullCtx = true;
                const s0_closure = this.computeStartState(dfa.atnStartState, outerContext, fullCtx);
                this.reportAttemptingFullContext(dfa, conflictingAlts, D.configs, startIndex, input.index);
                alt = this.execATNWithFullContext(dfa, D, s0_closure, input, startIndex, outerContext);
                return alt;
            }
            if (D.isAcceptState) {
                if (D.predicates===null) {
                    return D.prediction;
                }
                const stopIndex = input.index;
                input.seek(startIndex);
                const alts = this.evalSemanticContext(D.predicates, outerContext, true);
                if (alts.length===0) {
                    throw this.noViableAlt(input, outerContext, D.configs, startIndex);
                } else if (alts.length===1) {
                    return alts.minValue();
                } else {
                    // report ambiguity after predicate evaluation to make sure the correct set of ambig alts is reported.
                    this.reportAmbiguity(dfa, D, startIndex, stopIndex, false, alts, D.configs);
                    return alts.minValue();
                }
            }
            previousD = D;

            if (t !== Token$b.EOF) {
                input.consume();
                t = input.LA(1);
            }
        }
    }

    /**
     * Get an existing target state for an edge in the DFA. If the target state
     * for the edge has not yet been computed or is otherwise not available,
     * this method returns {@code null}.
     *
     * @param previousD The current DFA state
     * @param t The next input symbol
     * @return The existing target DFA state for the given input symbol
     * {@code t}, or {@code null} if the target state for this edge is not
     * already cached
     */
    getExistingTargetState(previousD, t) {
        const edges = previousD.edges;
        if (edges===null) {
            return null;
        } else {
            return edges[t + 1] || null;
        }
    }

    /**
     * Compute a target state for an edge in the DFA, and attempt to add the
     * computed state and corresponding edge to the DFA.
     *
     * @param dfa The DFA
     * @param previousD The current DFA state
     * @param t The next input symbol
     *
     * @return The computed target DFA state for the given input symbol
     * {@code t}. If {@code t} does not lead to a valid DFA state, this method
     * returns {@link //ERROR
     */
    computeTargetState(dfa, previousD, t) {
       const reach = this.computeReachSet(previousD.configs, t, false);
        if(reach===null) {
            this.addDFAEdge(dfa, previousD, t, ATNSimulator_1.ERROR);
            return ATNSimulator_1.ERROR;
        }
        // create new target state; we'll add to DFA after it's complete
        let D = new DFAState$3(null, reach);

        const predictedAlt = this.getUniqueAlt(reach);

        if (this.debug) {
            const altSubSets = PredictionMode_1.getConflictingAltSubsets(reach);
            console.log("SLL altSubSets=" + Utils.arrayToString(altSubSets) +
                        ", previous=" + previousD.configs +
                        ", configs=" + reach +
                        ", predict=" + predictedAlt +
                        ", allSubsetsConflict=" +
                        PredictionMode_1.allSubsetsConflict(altSubSets) + ", conflictingAlts=" +
                        this.getConflictingAlts(reach));
        }
        if (predictedAlt!==ATN_1.INVALID_ALT_NUMBER) {
            // NO CONFLICT, UNIQUELY PREDICTED ALT
            D.isAcceptState = true;
            D.configs.uniqueAlt = predictedAlt;
            D.prediction = predictedAlt;
        } else if (PredictionMode_1.hasSLLConflictTerminatingPrediction(this.predictionMode, reach)) {
            // MORE THAN ONE VIABLE ALTERNATIVE
            D.configs.conflictingAlts = this.getConflictingAlts(reach);
            D.requiresFullContext = true;
            // in SLL-only mode, we will stop at this state and return the minimum alt
            D.isAcceptState = true;
            D.prediction = D.configs.conflictingAlts.minValue();
        }
        if (D.isAcceptState && D.configs.hasSemanticContext) {
            this.predicateDFAState(D, this.atn.getDecisionState(dfa.decision));
            if( D.predicates!==null) {
                D.prediction = ATN_1.INVALID_ALT_NUMBER;
            }
        }
        // all adds to dfa are done after we've created full D state
        D = this.addDFAEdge(dfa, previousD, t, D);
        return D;
    }

    predicateDFAState(dfaState, decisionState) {
        // We need to test all predicates, even in DFA states that
        // uniquely predict alternative.
        const nalts = decisionState.transitions.length;
        // Update DFA so reach becomes accept state with (predicate,alt)
        // pairs if preds found for conflicting alts
        const altsToCollectPredsFrom = this.getConflictingAltsOrUniqueAlt(dfaState.configs);
        const altToPred = this.getPredsForAmbigAlts(altsToCollectPredsFrom, dfaState.configs, nalts);
        if (altToPred!==null) {
            dfaState.predicates = this.getPredicatePredictions(altsToCollectPredsFrom, altToPred);
            dfaState.prediction = ATN_1.INVALID_ALT_NUMBER; // make sure we use preds
        } else {
            // There are preds in configs but they might go away
            // when OR'd together like {p}? || NONE == NONE. If neither
            // alt has preds, resolve to min alt
            dfaState.prediction = altsToCollectPredsFrom.minValue();
        }
    }

// comes back with reach.uniqueAlt set to a valid alt
    execATNWithFullContext(dfa, D, // how far we got before failing over
                                         s0,
                                         input,
                                         startIndex,
                                         outerContext) {
        if (this.debug || this.debug_list_atn_decisions) {
            console.log("execATNWithFullContext "+s0);
        }
        const fullCtx = true;
        let foundExactAmbig = false;
        let reach = null;
        let previous = s0;
        input.seek(startIndex);
        let t = input.LA(1);
        let predictedAlt = -1;
        while (true) { // while more work
            reach = this.computeReachSet(previous, t, fullCtx);
            if (reach===null) {
                // if any configs in previous dipped into outer context, that
                // means that input up to t actually finished entry rule
                // at least for LL decision. Full LL doesn't dip into outer
                // so don't need special case.
                // We will get an error no matter what so delay until after
                // decision; better error message. Also, no reachable target
                // ATN states in SLL implies LL will also get nowhere.
                // If conflict in states that dip out, choose min since we
                // will get error no matter what.
                const e = this.noViableAlt(input, outerContext, previous, startIndex);
                input.seek(startIndex);
                const alt = this.getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule(previous, outerContext);
                if(alt!==ATN_1.INVALID_ALT_NUMBER) {
                    return alt;
                } else {
                    throw e;
                }
            }
            const altSubSets = PredictionMode_1.getConflictingAltSubsets(reach);
            if(this.debug) {
                console.log("LL altSubSets=" + altSubSets + ", predict=" +
                      PredictionMode_1.getUniqueAlt(altSubSets) + ", resolvesToJustOneViableAlt=" +
                      PredictionMode_1.resolvesToJustOneViableAlt(altSubSets));
            }
            reach.uniqueAlt = this.getUniqueAlt(reach);
            // unique prediction?
            if(reach.uniqueAlt!==ATN_1.INVALID_ALT_NUMBER) {
                predictedAlt = reach.uniqueAlt;
                break;
            } else if (this.predictionMode !== PredictionMode_1.LL_EXACT_AMBIG_DETECTION) {
                predictedAlt = PredictionMode_1.resolvesToJustOneViableAlt(altSubSets);
                if(predictedAlt !== ATN_1.INVALID_ALT_NUMBER) {
                    break;
                }
            } else {
                // In exact ambiguity mode, we never try to terminate early.
                // Just keeps scarfing until we know what the conflict is
                if (PredictionMode_1.allSubsetsConflict(altSubSets) && PredictionMode_1.allSubsetsEqual(altSubSets)) {
                    foundExactAmbig = true;
                    predictedAlt = PredictionMode_1.getSingleViableAlt(altSubSets);
                    break;
                }
                // else there are multiple non-conflicting subsets or
                // we're not sure what the ambiguity is yet.
                // So, keep going.
            }
            previous = reach;
            if( t !== Token$b.EOF) {
                input.consume();
                t = input.LA(1);
            }
        }
        // If the configuration set uniquely predicts an alternative,
        // without conflict, then we know that it's a full LL decision
        // not SLL.
        if (reach.uniqueAlt !== ATN_1.INVALID_ALT_NUMBER ) {
            this.reportContextSensitivity(dfa, predictedAlt, reach, startIndex, input.index);
            return predictedAlt;
        }
        // We do not check predicates here because we have checked them
        // on-the-fly when doing full context prediction.

        //
        // In non-exact ambiguity detection mode, we might	actually be able to
        // detect an exact ambiguity, but I'm not going to spend the cycles
        // needed to check. We only emit ambiguity warnings in exact ambiguity
        // mode.
        //
        // For example, we might know that we have conflicting configurations.
        // But, that does not mean that there is no way forward without a
        // conflict. It's possible to have nonconflicting alt subsets as in:

        // altSubSets=[{1, 2}, {1, 2}, {1}, {1, 2}]

        // from
        //
        //    [(17,1,[5 $]), (13,1,[5 10 $]), (21,1,[5 10 $]), (11,1,[$]),
        //     (13,2,[5 10 $]), (21,2,[5 10 $]), (11,2,[$])]
        //
        // In this case, (17,1,[5 $]) indicates there is some next sequence that
        // would resolve this without conflict to alternative 1. Any other viable
        // next sequence, however, is associated with a conflict.  We stop
        // looking for input because no amount of further lookahead will alter
        // the fact that we should predict alternative 1.  We just can't say for
        // sure that there is an ambiguity without looking further.

        this.reportAmbiguity(dfa, D, startIndex, input.index, foundExactAmbig, null, reach);

        return predictedAlt;
    }

    computeReachSet(closure, t, fullCtx) {
        if (this.debug) {
            console.log("in computeReachSet, starting closure: " + closure);
        }
        if( this.mergeCache===null) {
            this.mergeCache = new DoubleDict$1();
        }
        const intermediate = new ATNConfigSet$4(fullCtx);

        // Configurations already in a rule stop state indicate reaching the end
        // of the decision rule (local context) or end of the start rule (full
        // context). Once reached, these configurations are never updated by a
        // closure operation, so they are handled separately for the performance
        // advantage of having a smaller intermediate set when calling closure.
        //
        // For full-context reach operations, separate handling is required to
        // ensure that the alternative matching the longest overall sequence is
        // chosen when multiple such configurations can match the input.

        let skippedStopStates = null;

        // First figure out where we can reach on input t
        for (let i=0; i<closure.items.length;i++) {
            const c = closure.items[i];
            if(this.debug_add) {
                console.log("testing " + this.getTokenName(t) + " at " + c);
            }
            if (c.state instanceof RuleStopState$5) {
                if (fullCtx || t === Token$b.EOF) {
                    if (skippedStopStates===null) {
                        skippedStopStates = [];
                    }
                    skippedStopStates.push(c);
                    if(this.debug_add) {
                        console.log("added " + c + " to skippedStopStates");
                    }
                }
                continue;
            }
            for(let j=0;j<c.state.transitions.length;j++) {
                const trans = c.state.transitions[j];
                const target = this.getReachableTarget(trans, t);
                if (target!==null) {
                    const cfg = new ATNConfig$3({state:target}, c);
                    intermediate.add(cfg, this.mergeCache);
                    if(this.debug_add) {
                        console.log("added " + cfg + " to intermediate");
                    }
                }
            }
        }
        // Now figure out where the reach operation can take us...
        let reach = null;

        // This block optimizes the reach operation for intermediate sets which
        // trivially indicate a termination state for the overall
        // adaptivePredict operation.
        //
        // The conditions assume that intermediate
        // contains all configurations relevant to the reach set, but this
        // condition is not true when one or more configurations have been
        // withheld in skippedStopStates, or when the current symbol is EOF.
        //
        if (skippedStopStates===null && t!==Token$b.EOF) {
            if (intermediate.items.length===1) {
                // Don't pursue the closure if there is just one state.
                // It can only have one alternative; just add to result
                // Also don't pursue the closure if there is unique alternative
                // among the configurations.
                reach = intermediate;
            } else if (this.getUniqueAlt(intermediate)!==ATN_1.INVALID_ALT_NUMBER) {
                // Also don't pursue the closure if there is unique alternative
                // among the configurations.
                reach = intermediate;
            }
        }
        // If the reach set could not be trivially determined, perform a closure
        // operation on the intermediate set to compute its initial value.
        //
        if (reach===null) {
            reach = new ATNConfigSet$4(fullCtx);
            const closureBusy = new Set$4();
            const treatEofAsEpsilon = t === Token$b.EOF;
            for (let k=0; k<intermediate.items.length;k++) {
                this.closure(intermediate.items[k], reach, closureBusy, false, fullCtx, treatEofAsEpsilon);
            }
        }
        if (t === Token$b.EOF) {
            // After consuming EOF no additional input is possible, so we are
            // only interested in configurations which reached the end of the
            // decision rule (local context) or end of the start rule (full
            // context). Update reach to contain only these configurations. This
            // handles both explicit EOF transitions in the grammar and implicit
            // EOF transitions following the end of the decision or start rule.
            //
            // When reach==intermediate, no closure operation was performed. In
            // this case, removeAllConfigsNotInRuleStopState needs to check for
            // reachable rule stop states as well as configurations already in
            // a rule stop state.
            //
            // This is handled before the configurations in skippedStopStates,
            // because any configurations potentially added from that list are
            // already guaranteed to meet this condition whether or not it's
            // required.
            //
            reach = this.removeAllConfigsNotInRuleStopState(reach, reach === intermediate);
        }
        // If skippedStopStates!==null, then it contains at least one
        // configuration. For full-context reach operations, these
        // configurations reached the end of the start rule, in which case we
        // only add them back to reach if no configuration during the current
        // closure operation reached such a state. This ensures adaptivePredict
        // chooses an alternative matching the longest overall sequence when
        // multiple alternatives are viable.
        //
        if (skippedStopStates!==null && ( (! fullCtx) || (! PredictionMode_1.hasConfigInRuleStopState(reach)))) {
            for (let l=0; l<skippedStopStates.length;l++) {
                reach.add(skippedStopStates[l], this.mergeCache);
            }
        }
        if (reach.items.length===0) {
            return null;
        } else {
            return reach;
        }
    }

    /**
     * Return a configuration set containing only the configurations from
     * {@code configs} which are in a {@link RuleStopState}. If all
     * configurations in {@code configs} are already in a rule stop state, this
     * method simply returns {@code configs}.
     *
     * <p>When {@code lookToEndOfRule} is true, this method uses
     * {@link ATN//nextTokens} for each configuration in {@code configs} which is
     * not already in a rule stop state to see if a rule stop state is reachable
     * from the configuration via epsilon-only transitions.</p>
     *
     * @param configs the configuration set to update
     * @param lookToEndOfRule when true, this method checks for rule stop states
     * reachable by epsilon-only transitions from each configuration in
     * {@code configs}.
     *
     * @return {@code configs} if all configurations in {@code configs} are in a
     * rule stop state, otherwise return a new configuration set containing only
     * the configurations from {@code configs} which are in a rule stop state
     */
    removeAllConfigsNotInRuleStopState(configs, lookToEndOfRule) {
        if (PredictionMode_1.allConfigsInRuleStopStates(configs)) {
            return configs;
        }
        const result = new ATNConfigSet$4(configs.fullCtx);
        for(let i=0; i<configs.items.length;i++) {
            const config = configs.items[i];
            if (config.state instanceof RuleStopState$5) {
                result.add(config, this.mergeCache);
                continue;
            }
            if (lookToEndOfRule && config.state.epsilonOnlyTransitions) {
                const nextTokens = this.atn.nextTokens(config.state);
                if (nextTokens.contains(Token$b.EPSILON)) {
                    const endOfRuleState = this.atn.ruleToStopState[config.state.ruleIndex];
                    result.add(new ATNConfig$3({state:endOfRuleState}, config), this.mergeCache);
                }
            }
        }
        return result;
    }

    computeStartState(p, ctx, fullCtx) {
        // always at least the implicit call to start rule
        const initialContext = predictionContextFromRuleContext$2(this.atn, ctx);
        const configs = new ATNConfigSet$4(fullCtx);
        for(let i=0;i<p.transitions.length;i++) {
            const target = p.transitions[i].target;
            const c = new ATNConfig$3({ state:target, alt:i+1, context:initialContext }, null);
            const closureBusy = new Set$4();
            this.closure(c, configs, closureBusy, true, fullCtx, false);
        }
        return configs;
    }

    /**
     * This method transforms the start state computed by
     * {@link //computeStartState} to the special start state used by a
     * precedence DFA for a particular precedence value. The transformation
     * process applies the following changes to the start state's configuration
     * set.
     *
     * <ol>
     * <li>Evaluate the precedence predicates for each configuration using
     * {@link SemanticContext//evalPrecedence}.</li>
     * <li>Remove all configurations which predict an alternative greater than
     * 1, for which another configuration that predicts alternative 1 is in the
     * same ATN state with the same prediction context. This transformation is
     * valid for the following reasons:
     * <ul>
     * <li>The closure block cannot contain any epsilon transitions which bypass
     * the body of the closure, so all states reachable via alternative 1 are
     * part of the precedence alternatives of the transformed left-recursive
     * rule.</li>
     * <li>The "primary" portion of a left recursive rule cannot contain an
     * epsilon transition, so the only way an alternative other than 1 can exist
     * in a state that is also reachable via alternative 1 is by nesting calls
     * to the left-recursive rule, with the outer calls not being at the
     * preferred precedence level.</li>
     * </ul>
     * </li>
     * </ol>
     *
     * <p>
     * The prediction context must be considered by this filter to address
     * situations like the following.
     * </p>
     * <code>
     * <pre>
     * grammar TA;
     * prog: statement* EOF;
     * statement: letterA | statement letterA 'b' ;
     * letterA: 'a';
     * </pre>
     * </code>
     * <p>
     * If the above grammar, the ATN state immediately before the token
     * reference {@code 'a'} in {@code letterA} is reachable from the left edge
     * of both the primary and closure blocks of the left-recursive rule
     * {@code statement}. The prediction context associated with each of these
     * configurations distinguishes between them, and prevents the alternative
     * which stepped out to {@code prog} (and then back in to {@code statement}
     * from being eliminated by the filter.
     * </p>
     *
     * @param configs The configuration set computed by
     * {@link //computeStartState} as the start state for the DFA.
     * @return The transformed configuration set representing the start state
     * for a precedence DFA at a particular precedence level (determined by
     * calling {@link Parser//getPrecedence})
     */
    applyPrecedenceFilter(configs) {
        let config;
        const statesFromAlt1 = [];
        const configSet = new ATNConfigSet$4(configs.fullCtx);
        for(let i=0; i<configs.items.length; i++) {
            config = configs.items[i];
            // handle alt 1 first
            if (config.alt !== 1) {
                continue;
            }
            const updatedContext = config.semanticContext.evalPrecedence(this.parser, this._outerContext);
            if (updatedContext===null) {
                // the configuration was eliminated
                continue;
            }
            statesFromAlt1[config.state.stateNumber] = config.context;
            if (updatedContext !== config.semanticContext) {
                configSet.add(new ATNConfig$3({semanticContext:updatedContext}, config), this.mergeCache);
            } else {
                configSet.add(config, this.mergeCache);
            }
        }
        for(let i=0; i<configs.items.length; i++) {
            config = configs.items[i];
            if (config.alt === 1) {
                // already handled
                continue;
            }
            // In the future, this elimination step could be updated to also
            // filter the prediction context for alternatives predicting alt>1
            // (basically a graph subtraction algorithm).
            if (!config.precedenceFilterSuppressed) {
                const context = statesFromAlt1[config.state.stateNumber] || null;
                if (context!==null && context.equals(config.context)) {
                    // eliminated
                    continue;
                }
            }
            configSet.add(config, this.mergeCache);
        }
        return configSet;
    }

    getReachableTarget(trans, ttype) {
        if (trans.matches(ttype, 0, this.atn.maxTokenType)) {
            return trans.target;
        } else {
            return null;
        }
    }

    getPredsForAmbigAlts(ambigAlts, configs, nalts) {
        // REACH=[1|1|[]|0:0, 1|2|[]|0:1]
        // altToPred starts as an array of all null contexts. The entry at index i
        // corresponds to alternative i. altToPred[i] may have one of three values:
        //   1. null: no ATNConfig c is found such that c.alt==i
        //   2. SemanticContext.NONE: At least one ATNConfig c exists such that
        //      c.alt==i and c.semanticContext==SemanticContext.NONE. In other words,
        //      alt i has at least one unpredicated config.
        //   3. Non-NONE Semantic Context: There exists at least one, and for all
        //      ATNConfig c such that c.alt==i, c.semanticContext!=SemanticContext.NONE.
        //
        // From this, it is clear that NONE||anything==NONE.
        //
        let altToPred = [];
        for(let i=0;i<configs.items.length;i++) {
            const c = configs.items[i];
            if(ambigAlts.contains( c.alt )) {
                altToPred[c.alt] = SemanticContext$4.orContext(altToPred[c.alt] || null, c.semanticContext);
            }
        }
        let nPredAlts = 0;
        for (let i =1;i< nalts+1;i++) {
            const pred = altToPred[i] || null;
            if (pred===null) {
                altToPred[i] = SemanticContext$4.NONE;
            } else if (pred !== SemanticContext$4.NONE) {
                nPredAlts += 1;
            }
        }
        // nonambig alts are null in altToPred
        if (nPredAlts===0) {
            altToPred = null;
        }
        if (this.debug) {
            console.log("getPredsForAmbigAlts result " + Utils.arrayToString(altToPred));
        }
        return altToPred;
    }

    getPredicatePredictions(ambigAlts, altToPred) {
        const pairs = [];
        let containsPredicate = false;
        for (let i=1; i<altToPred.length;i++) {
            const pred = altToPred[i];
            // unpredicated is indicated by SemanticContext.NONE
            if( ambigAlts!==null && ambigAlts.contains( i )) {
                pairs.push(new PredPrediction$1(pred, i));
            }
            if (pred !== SemanticContext$4.NONE) {
                containsPredicate = true;
            }
        }
        if (! containsPredicate) {
            return null;
        }
        return pairs;
    }

    /**
     * This method is used to improve the localization of error messages by
     * choosing an alternative rather than throwing a
     * {@link NoViableAltException} in particular prediction scenarios where the
     * {@link //ERROR} state was reached during ATN simulation.
     *
     * <p>
     * The default implementation of this method uses the following
     * algorithm to identify an ATN configuration which successfully parsed the
     * decision entry rule. Choosing such an alternative ensures that the
     * {@link ParserRuleContext} returned by the calling rule will be complete
     * and valid, and the syntax error will be reported later at a more
     * localized location.</p>
     *
     * <ul>
     * <li>If a syntactically valid path or paths reach the end of the decision rule and
     * they are semantically valid if predicated, return the min associated alt.</li>
     * <li>Else, if a semantically invalid but syntactically valid path exist
     * or paths exist, return the minimum associated alt.
     * </li>
     * <li>Otherwise, return {@link ATN//INVALID_ALT_NUMBER}.</li>
     * </ul>
     *
     * <p>
     * In some scenarios, the algorithm described above could predict an
     * alternative which will result in a {@link FailedPredicateException} in
     * the parser. Specifically, this could occur if the <em>only</em> configuration
     * capable of successfully parsing to the end of the decision rule is
     * blocked by a semantic predicate. By choosing this alternative within
     * {@link //adaptivePredict} instead of throwing a
     * {@link NoViableAltException}, the resulting
     * {@link FailedPredicateException} in the parser will identify the specific
     * predicate which is preventing the parser from successfully parsing the
     * decision rule, which helps developers identify and correct logic errors
     * in semantic predicates.
     * </p>
     *
     * @param configs The ATN configurations which were valid immediately before
     * the {@link //ERROR} state was reached
     * @param outerContext The is the \gamma_0 initial parser context from the paper
     * or the parser stack at the instant before prediction commences.
     *
     * @return The value to return from {@link //adaptivePredict}, or
     * {@link ATN//INVALID_ALT_NUMBER} if a suitable alternative was not
     * identified and {@link //adaptivePredict} should report an error instead
     */
    getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule(configs, outerContext) {
        const cfgs = this.splitAccordingToSemanticValidity(configs, outerContext);
        const semValidConfigs = cfgs[0];
        const semInvalidConfigs = cfgs[1];
        let alt = this.getAltThatFinishedDecisionEntryRule(semValidConfigs);
        if (alt!==ATN_1.INVALID_ALT_NUMBER) { // semantically/syntactically viable path exists
            return alt;
        }
        // Is there a syntactically valid path with a failed pred?
        if (semInvalidConfigs.items.length>0) {
            alt = this.getAltThatFinishedDecisionEntryRule(semInvalidConfigs);
            if (alt!==ATN_1.INVALID_ALT_NUMBER) { // syntactically viable path exists
                return alt;
            }
        }
        return ATN_1.INVALID_ALT_NUMBER;
    }

    getAltThatFinishedDecisionEntryRule(configs) {
        const alts = [];
        for(let i=0;i<configs.items.length; i++) {
            const c = configs.items[i];
            if (c.reachesIntoOuterContext>0 || ((c.state instanceof RuleStopState$5) && c.context.hasEmptyPath())) {
                if(alts.indexOf(c.alt)<0) {
                    alts.push(c.alt);
                }
            }
        }
        if (alts.length===0) {
            return ATN_1.INVALID_ALT_NUMBER;
        } else {
            return Math.min.apply(null, alts);
        }
    }

    /**
     * Walk the list of configurations and split them according to
     * those that have preds evaluating to true/false.  If no pred, assume
     * true pred and include in succeeded set.  Returns Pair of sets.
     *
     * Create a new set so as not to alter the incoming parameter.
     *
     * Assumption: the input stream has been restored to the starting point
     * prediction, which is where predicates need to evaluate.*/
    splitAccordingToSemanticValidity( configs, outerContext) {
        const succeeded = new ATNConfigSet$4(configs.fullCtx);
        const failed = new ATNConfigSet$4(configs.fullCtx);
        for(let i=0;i<configs.items.length; i++) {
            const c = configs.items[i];
            if (c.semanticContext !== SemanticContext$4.NONE) {
                const predicateEvaluationResult = c.semanticContext.evaluate(this.parser, outerContext);
                if (predicateEvaluationResult) {
                    succeeded.add(c);
                } else {
                    failed.add(c);
                }
            } else {
                succeeded.add(c);
            }
        }
        return [succeeded, failed];
    }

    /**
     * Look through a list of predicate/alt pairs, returning alts for the
     * pairs that win. A {@code NONE} predicate indicates an alt containing an
     * unpredicated config which behaves as "always true." If !complete
     * then we stop at the first predicate that evaluates to true. This
     * includes pairs with null predicates.
     */
    evalSemanticContext(predPredictions, outerContext, complete) {
        const predictions = new BitSet$3();
        for(let i=0;i<predPredictions.length;i++) {
            const pair = predPredictions[i];
            if (pair.pred === SemanticContext$4.NONE) {
                predictions.add(pair.alt);
                if (! complete) {
                    break;
                }
                continue;
            }
            const predicateEvaluationResult = pair.pred.evaluate(this.parser, outerContext);
            if (this.debug || this.dfa_debug) {
                console.log("eval pred " + pair + "=" + predicateEvaluationResult);
            }
            if (predicateEvaluationResult) {
                if (this.debug || this.dfa_debug) {
                    console.log("PREDICT " + pair.alt);
                }
                predictions.add(pair.alt);
                if (! complete) {
                    break;
                }
            }
        }
        return predictions;
    }

// TODO: If we are doing predicates, there is no point in pursuing
//     closure operations if we reach a DFA state that uniquely predicts
//     alternative. We will not be caching that DFA state and it is a
//     waste to pursue the closure. Might have to advance when we do
//     ambig detection thought :(
//
    closure(config, configs, closureBusy, collectPredicates, fullCtx, treatEofAsEpsilon) {
        const initialDepth = 0;
        this.closureCheckingStopState(config, configs, closureBusy, collectPredicates,
                                 fullCtx, initialDepth, treatEofAsEpsilon);
    }

    closureCheckingStopState(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon) {
        if (this.debug || this.debug_closure) {
            console.log("closure(" + config.toString(this.parser,true) + ")");
            // console.log("configs(" + configs.toString() + ")");
            if(config.reachesIntoOuterContext>50) {
                throw "problem";
            }
        }
        if (config.state instanceof RuleStopState$5) {
            // We hit rule end. If we have context info, use it
            // run thru all possible stack tops in ctx
            if (! config.context.isEmpty()) {
                for (let i =0; i<config.context.length; i++) {
                    if (config.context.getReturnState(i) === PredictionContext$3.EMPTY_RETURN_STATE) {
                        if (fullCtx) {
                            configs.add(new ATNConfig$3({state:config.state, context:PredictionContext$3.EMPTY}, config), this.mergeCache);
                            continue;
                        } else {
                            // we have no context info, just chase follow links (if greedy)
                            if (this.debug) {
                                console.log("FALLING off rule " + this.getRuleName(config.state.ruleIndex));
                            }
                            this.closure_(config, configs, closureBusy, collectPredicates,
                                     fullCtx, depth, treatEofAsEpsilon);
                        }
                        continue;
                    }
                    const returnState = this.atn.states[config.context.getReturnState(i)];
                    const newContext = config.context.getParent(i); // "pop" return state
                    const parms = {state:returnState, alt:config.alt, context:newContext, semanticContext:config.semanticContext};
                    const c = new ATNConfig$3(parms, null);
                    // While we have context to pop back from, we may have
                    // gotten that context AFTER having falling off a rule.
                    // Make sure we track that we are now out of context.
                    c.reachesIntoOuterContext = config.reachesIntoOuterContext;
                    this.closureCheckingStopState(c, configs, closureBusy, collectPredicates, fullCtx, depth - 1, treatEofAsEpsilon);
                }
                return;
            } else if( fullCtx) {
                // reached end of start rule
                configs.add(config, this.mergeCache);
                return;
            } else {
                // else if we have no context info, just chase follow links (if greedy)
                if (this.debug) {
                    console.log("FALLING off rule " + this.getRuleName(config.state.ruleIndex));
                }
            }
        }
        this.closure_(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon);
    }

    // Do the actual work of walking epsilon edges//
    closure_(config, configs, closureBusy, collectPredicates, fullCtx, depth, treatEofAsEpsilon) {
        const p = config.state;
        // optimization
        if (! p.epsilonOnlyTransitions) {
            configs.add(config, this.mergeCache);
            // make sure to not return here, because EOF transitions can act as
            // both epsilon transitions and non-epsilon transitions.
        }
        for(let i = 0;i<p.transitions.length; i++) {
            if(i==0 && this.canDropLoopEntryEdgeInLeftRecursiveRule(config))
                continue;

            const t = p.transitions[i];
            const continueCollecting = collectPredicates && !(t instanceof ActionTransition$2);
            const c = this.getEpsilonTarget(config, t, continueCollecting, depth === 0, fullCtx, treatEofAsEpsilon);
            if (c!==null) {
                let newDepth = depth;
                if ( config.state instanceof RuleStopState$5) {
                    // target fell off end of rule; mark resulting c as having dipped into outer context
                    // We can't get here if incoming config was rule stop and we had context
                    // track how far we dip into outer context.  Might
                    // come in handy and we avoid evaluating context dependent
                    // preds if this is > 0.
                    if (this._dfa !== null && this._dfa.precedenceDfa) {
                        if (t.outermostPrecedenceReturn === this._dfa.atnStartState.ruleIndex) {
                            c.precedenceFilterSuppressed = true;
                        }
                    }

                    c.reachesIntoOuterContext += 1;
                    if (closureBusy.add(c)!==c) {
                        // avoid infinite recursion for right-recursive rules
                        continue;
                    }
                    configs.dipsIntoOuterContext = true; // TODO: can remove? only care when we add to set per middle of this method
                    newDepth -= 1;
                    if (this.debug) {
                        console.log("dips into outer ctx: " + c);
                    }
                } else {
                    if (!t.isEpsilon && closureBusy.add(c)!==c){
                        // avoid infinite recursion for EOF* and EOF+
                        continue;
                    }
                    if (t instanceof RuleTransition$3) {
                        // latch when newDepth goes negative - once we step out of the entry context we can't return
                        if (newDepth >= 0) {
                            newDepth += 1;
                        }
                    }
                }
                this.closureCheckingStopState(c, configs, closureBusy, continueCollecting, fullCtx, newDepth, treatEofAsEpsilon);
            }
        }
    }

    canDropLoopEntryEdgeInLeftRecursiveRule(config) {
        // return False
        const p = config.state;
        // First check to see if we are in StarLoopEntryState generated during
        // left-recursion elimination. For efficiency, also check if
        // the context has an empty stack case. If so, it would mean
        // global FOLLOW so we can't perform optimization
        // Are we the special loop entry/exit state? or SLL wildcard
        if(p.stateType != ATNState$2.STAR_LOOP_ENTRY)
            return false;
        if(p.stateType != ATNState$2.STAR_LOOP_ENTRY || !p.isPrecedenceDecision ||
               config.context.isEmpty() || config.context.hasEmptyPath())
            return false;

        // Require all return states to return back to the same rule that p is in.
        const numCtxs = config.context.length;
        for(let i=0; i<numCtxs; i++) { // for each stack context
            const returnState = this.atn.states[config.context.getReturnState(i)];
            if (returnState.ruleIndex != p.ruleIndex)
                return false;
        }

        const decisionStartState = p.transitions[0].target;
        const blockEndStateNum = decisionStartState.endState.stateNumber;
        const blockEndState = this.atn.states[blockEndStateNum];

        // Verify that the top of each stack context leads to loop entry/exit
        // state through epsilon edges and w/o leaving rule.
        for(let i=0; i<numCtxs; i++) { // for each stack context
            const returnStateNumber = config.context.getReturnState(i);
            const returnState = this.atn.states[returnStateNumber];
            // all states must have single outgoing epsilon edge
            if (returnState.transitions.length != 1 || !returnState.transitions[0].isEpsilon)
                return false;

            // Look for prefix op case like 'not expr', (' type ')' expr
            const returnStateTarget = returnState.transitions[0].target;
            if ( returnState.stateType == ATNState$2.BLOCK_END && returnStateTarget == p )
                continue;

            // Look for 'expr op expr' or case where expr's return state is block end
            // of (...)* internal block; the block end points to loop back
            // which points to p but we don't need to check that
            if ( returnState == blockEndState )
                continue;

            // Look for ternary expr ? expr : expr. The return state points at block end,
            // which points at loop entry state
            if ( returnStateTarget == blockEndState )
                continue;

            // Look for complex prefix 'between expr and expr' case where 2nd expr's
            // return state points at block end state of (...)* internal block
            if (returnStateTarget.stateType == ATNState$2.BLOCK_END && returnStateTarget.transitions.length == 1
                    && returnStateTarget.transitions[0].isEpsilon && returnStateTarget.transitions[0].target == p)
                continue;

            // anything else ain't conforming
            return false;
        }
        return true;
    }

    getRuleName(index) {
        if (this.parser!==null && index>=0) {
            return this.parser.ruleNames[index];
        } else {
            return "<rule " + index + ">";
        }
    }

    getEpsilonTarget(config, t, collectPredicates, inContext, fullCtx, treatEofAsEpsilon) {
        switch(t.serializationType) {
        case Transition$3.RULE:
            return this.ruleTransition(config, t);
        case Transition$3.PRECEDENCE:
            return this.precedenceTransition(config, t, collectPredicates, inContext, fullCtx);
        case Transition$3.PREDICATE:
            return this.predTransition(config, t, collectPredicates, inContext, fullCtx);
        case Transition$3.ACTION:
            return this.actionTransition(config, t);
        case Transition$3.EPSILON:
            return new ATNConfig$3({state:t.target}, config);
        case Transition$3.ATOM:
        case Transition$3.RANGE:
        case Transition$3.SET:
            // EOF transitions act like epsilon transitions after the first EOF
            // transition is traversed
            if (treatEofAsEpsilon) {
                if (t.matches(Token$b.EOF, 0, 1)) {
                    return new ATNConfig$3({state: t.target}, config);
                }
            }
            return null;
        default:
            return null;
        }
    }

    actionTransition(config, t) {
        if (this.debug) {
            const index = t.actionIndex==-1 ? 65535 : t.actionIndex;
            console.log("ACTION edge " + t.ruleIndex + ":" + index);
        }
        return new ATNConfig$3({state:t.target}, config);
    }

    precedenceTransition(config, pt, collectPredicates, inContext, fullCtx) {
        if (this.debug) {
            console.log("PRED (collectPredicates=" + collectPredicates + ") " +
                    pt.precedence + ">=_p, ctx dependent=true");
            if (this.parser!==null) {
                console.log("context surrounding pred is " + Utils.arrayToString(this.parser.getRuleInvocationStack()));
            }
        }
        let c = null;
        if (collectPredicates && inContext) {
            if (fullCtx) {
                // In full context mode, we can evaluate predicates on-the-fly
                // during closure, which dramatically reduces the size of
                // the config sets. It also obviates the need to test predicates
                // later during conflict resolution.
                const currentPosition = this._input.index;
                this._input.seek(this._startIndex);
                const predSucceeds = pt.getPredicate().evaluate(this.parser, this._outerContext);
                this._input.seek(currentPosition);
                if (predSucceeds) {
                    c = new ATNConfig$3({state:pt.target}, config); // no pred context
                }
            } else {
                const newSemCtx = SemanticContext$4.andContext(config.semanticContext, pt.getPredicate());
                c = new ATNConfig$3({state:pt.target, semanticContext:newSemCtx}, config);
            }
        } else {
            c = new ATNConfig$3({state:pt.target}, config);
        }
        if (this.debug) {
            console.log("config from pred transition=" + c);
        }
        return c;
    }

    predTransition(config, pt, collectPredicates, inContext, fullCtx) {
        if (this.debug) {
            console.log("PRED (collectPredicates=" + collectPredicates + ") " + pt.ruleIndex +
                    ":" + pt.predIndex + ", ctx dependent=" + pt.isCtxDependent);
            if (this.parser!==null) {
                console.log("context surrounding pred is " + Utils.arrayToString(this.parser.getRuleInvocationStack()));
            }
        }
        let c = null;
        if (collectPredicates && ((pt.isCtxDependent && inContext) || ! pt.isCtxDependent)) {
            if (fullCtx) {
                // In full context mode, we can evaluate predicates on-the-fly
                // during closure, which dramatically reduces the size of
                // the config sets. It also obviates the need to test predicates
                // later during conflict resolution.
                const currentPosition = this._input.index;
                this._input.seek(this._startIndex);
                const predSucceeds = pt.getPredicate().evaluate(this.parser, this._outerContext);
                this._input.seek(currentPosition);
                if (predSucceeds) {
                    c = new ATNConfig$3({state:pt.target}, config); // no pred context
                }
            } else {
                const newSemCtx = SemanticContext$4.andContext(config.semanticContext, pt.getPredicate());
                c = new ATNConfig$3({state:pt.target, semanticContext:newSemCtx}, config);
            }
        } else {
            c = new ATNConfig$3({state:pt.target}, config);
        }
        if (this.debug) {
            console.log("config from pred transition=" + c);
        }
        return c;
    }

    ruleTransition(config, t) {
        if (this.debug) {
            console.log("CALL rule " + this.getRuleName(t.target.ruleIndex) + ", ctx=" + config.context);
        }
        const returnState = t.followState;
        const newContext = SingletonPredictionContext$3.create(config.context, returnState.stateNumber);
        return new ATNConfig$3({state:t.target, context:newContext}, config );
    }

    getConflictingAlts(configs) {
        const altsets = PredictionMode_1.getConflictingAltSubsets(configs);
        return PredictionMode_1.getAlts(altsets);
    }

    /**
     * Sam pointed out a problem with the previous definition, v3, of
     * ambiguous states. If we have another state associated with conflicting
     * alternatives, we should keep going. For example, the following grammar
     *
     * s : (ID | ID ID?) ';' ;
     *
     * When the ATN simulation reaches the state before ';', it has a DFA
     * state that looks like: [12|1|[], 6|2|[], 12|2|[]]. Naturally
     * 12|1|[] and 12|2|[] conflict, but we cannot stop processing this node
     * because alternative to has another way to continue, via [6|2|[]].
     * The key is that we have a single state that has config's only associated
     * with a single alternative, 2, and crucially the state transitions
     * among the configurations are all non-epsilon transitions. That means
     * we don't consider any conflicts that include alternative 2. So, we
     * ignore the conflict between alts 1 and 2. We ignore a set of
     * conflicting alts when there is an intersection with an alternative
     * associated with a single alt state in the state&rarr;config-list map.
     *
     * It's also the case that we might have two conflicting configurations but
     * also a 3rd nonconflicting configuration for a different alternative:
     * [1|1|[], 1|2|[], 8|3|[]]. This can come about from grammar:
     *
     * a : A | A | A B ;
     *
     * After matching input A, we reach the stop state for rule A, state 1.
     * State 8 is the state right before B. Clearly alternatives 1 and 2
     * conflict and no amount of further lookahead will separate the two.
     * However, alternative 3 will be able to continue and so we do not
     * stop working on this state. In the previous example, we're concerned
     * with states associated with the conflicting alternatives. Here alt
     * 3 is not associated with the conflicting configs, but since we can continue
     * looking for input reasonably, I don't declare the state done. We
     * ignore a set of conflicting alts when we have an alternative
     * that we still need to pursue
     */
    getConflictingAltsOrUniqueAlt(configs) {
        let conflictingAlts = null;
        if (configs.uniqueAlt!== ATN_1.INVALID_ALT_NUMBER) {
            conflictingAlts = new BitSet$3();
            conflictingAlts.add(configs.uniqueAlt);
        } else {
            conflictingAlts = configs.conflictingAlts;
        }
        return conflictingAlts;
    }

    getTokenName(t) {
        if (t===Token$b.EOF) {
            return "EOF";
        }
        if( this.parser!==null && this.parser.literalNames!==null) {
            if (t >= this.parser.literalNames.length && t >= this.parser.symbolicNames.length) {
                console.log("" + t + " ttype out of range: " + this.parser.literalNames);
                console.log("" + this.parser.getInputStream().getTokens());
            } else {
                const name = this.parser.literalNames[t] || this.parser.symbolicNames[t];
                return name + "<" + t + ">";
            }
        }
        return "" + t;
    }

    getLookaheadName(input) {
        return this.getTokenName(input.LA(1));
    }

    /**
     * Used for debugging in adaptivePredict around execATN but I cut
     * it out for clarity now that alg. works well. We can leave this
     * "dead" code for a bit
     */
    dumpDeadEndConfigs(nvae) {
        console.log("dead end configs: ");
        const decs = nvae.getDeadEndConfigs();
        for(let i=0; i<decs.length; i++) {
            const c = decs[i];
            let trans = "no edges";
            if (c.state.transitions.length>0) {
                const t = c.state.transitions[0];
                if (t instanceof AtomTransition) {
                    trans = "Atom "+ this.getTokenName(t.label);
                } else if (t instanceof SetTransition$2) {
                    const neg = (t instanceof NotSetTransition$3);
                    trans = (neg ? "~" : "") + "Set " + t.set;
                }
            }
            console.error(c.toString(this.parser, true) + ":" + trans);
        }
    }

    noViableAlt(input, outerContext, configs, startIndex) {
        return new NoViableAltException$1(this.parser, input, input.get(startIndex), input.LT(1), configs, outerContext);
    }

    getUniqueAlt(configs) {
        let alt = ATN_1.INVALID_ALT_NUMBER;
        for(let i=0;i<configs.items.length;i++) {
            const c = configs.items[i];
            if (alt === ATN_1.INVALID_ALT_NUMBER) {
                alt = c.alt; // found first alt
            } else if( c.alt!==alt) {
                return ATN_1.INVALID_ALT_NUMBER;
            }
        }
        return alt;
    }

    /**
     * Add an edge to the DFA, if possible. This method calls
     * {@link //addDFAState} to ensure the {@code to} state is present in the
     * DFA. If {@code from} is {@code null}, or if {@code t} is outside the
     * range of edges that can be represented in the DFA tables, this method
     * returns without adding the edge to the DFA.
     *
     * <p>If {@code to} is {@code null}, this method returns {@code null}.
     * Otherwise, this method returns the {@link DFAState} returned by calling
     * {@link //addDFAState} for the {@code to} state.</p>
     *
     * @param dfa The DFA
     * @param from_ The source state for the edge
     * @param t The input symbol
     * @param to The target state for the edge
     *
     * @return If {@code to} is {@code null}, this method returns {@code null};
     * otherwise this method returns the result of calling {@link //addDFAState}
     * on {@code to}
     */
    addDFAEdge(dfa, from_, t, to) {
        if( this.debug) {
            console.log("EDGE " + from_ + " -> " + to + " upon " + this.getTokenName(t));
        }
        if (to===null) {
            return null;
        }
        to = this.addDFAState(dfa, to); // used existing if possible not incoming
        if (from_===null || t < -1 || t > this.atn.maxTokenType) {
            return to;
        }
        if (from_.edges===null) {
            from_.edges = [];
        }
        from_.edges[t+1] = to; // connect

        if (this.debug) {
            const literalNames = this.parser===null ? null : this.parser.literalNames;
            const symbolicNames = this.parser===null ? null : this.parser.symbolicNames;
            console.log("DFA=\n" + dfa.toString(literalNames, symbolicNames));
        }
        return to;
    }

    /**
     * Add state {@code D} to the DFA if it is not already present, and return
     * the actual instance stored in the DFA. If a state equivalent to {@code D}
     * is already in the DFA, the existing state is returned. Otherwise this
     * method returns {@code D} after adding it to the DFA.
     *
     * <p>If {@code D} is {@link //ERROR}, this method returns {@link //ERROR} and
     * does not change the DFA.</p>
     *
     * @param dfa The dfa
     * @param D The DFA state to add
     * @return The state stored in the DFA. This will be either the existing
     * state if {@code D} is already in the DFA, or {@code D} itself if the
     * state was not already present
     */
    addDFAState(dfa, D) {
        if (D == ATNSimulator_1.ERROR) {
            return D;
        }
        const existing = dfa.states.get(D);
        if(existing!==null) {
            return existing;
        }
        D.stateNumber = dfa.states.length;
        if (! D.configs.readOnly) {
            D.configs.optimizeConfigs(this);
            D.configs.setReadonly(true);
        }
        dfa.states.add(D);
        if (this.debug) {
            console.log("adding new DFA state: " + D);
        }
        return D;
    }

    reportAttemptingFullContext(dfa, conflictingAlts, configs, startIndex, stopIndex) {
        if (this.debug || this.retry_debug) {
            const interval = new Interval$3(startIndex, stopIndex + 1);
            console.log("reportAttemptingFullContext decision=" + dfa.decision + ":" + configs +
                               ", input=" + this.parser.getTokenStream().getText(interval));
        }
        if (this.parser!==null) {
            this.parser.getErrorListenerDispatch().reportAttemptingFullContext(this.parser, dfa, startIndex, stopIndex, conflictingAlts, configs);
        }
    }

    reportContextSensitivity(dfa, prediction, configs, startIndex, stopIndex) {
        if (this.debug || this.retry_debug) {
            const interval = new Interval$3(startIndex, stopIndex + 1);
            console.log("reportContextSensitivity decision=" + dfa.decision + ":" + configs +
                               ", input=" + this.parser.getTokenStream().getText(interval));
        }
        if (this.parser!==null) {
            this.parser.getErrorListenerDispatch().reportContextSensitivity(this.parser, dfa, startIndex, stopIndex, prediction, configs);
        }
    }

    // If context sensitive parsing, we know it's ambiguity not conflict//
    reportAmbiguity(dfa, D, startIndex, stopIndex,
                                   exact, ambigAlts, configs ) {
        if (this.debug || this.retry_debug) {
            const interval = new Interval$3(startIndex, stopIndex + 1);
            console.log("reportAmbiguity " + ambigAlts + ":" + configs +
                               ", input=" + this.parser.getTokenStream().getText(interval));
        }
        if (this.parser!==null) {
            this.parser.getErrorListenerDispatch().reportAmbiguity(this.parser, dfa, startIndex, stopIndex, exact, ambigAlts, configs);
        }
    }
}

var ParserATNSimulator_1 = ParserATNSimulator;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

var ATN$1 = ATN_1;
var ATNDeserializer$1 = ATNDeserializer_1;
var LexerATNSimulator$1 = LexerATNSimulator_1;
var ParserATNSimulator$1 = ParserATNSimulator_1;
var PredictionMode$1 = PredictionMode_1;

var atn = {
	ATN: ATN$1,
	ATNDeserializer: ATNDeserializer$1,
	LexerATNSimulator: LexerATNSimulator$1,
	ParserATNSimulator: ParserATNSimulator$1,
	PredictionMode: PredictionMode$1
};

/*! https://mths.be/codepointat v0.2.0 by @mathias */
if (!String.prototype.codePointAt) {
	(function() {
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var codePointAt = function(position) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			var size = string.length;
			// `ToInteger`
			var index = position ? Number(position) : 0;
			if (index != index) { // better `isNaN`
				index = 0;
			}
			// Account for out-of-bounds indices:
			if (index < 0 || index >= size) {
				return undefined;
			}
			// Get the first code unit
			var first = string.charCodeAt(index);
			var second;
			if ( // check if it’s the start of a surrogate pair
				first >= 0xD800 && first <= 0xDBFF && // high surrogate
				size > index + 1 // there is a next code unit
			) {
				second = string.charCodeAt(index + 1);
				if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
					// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
					return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
				}
			}
			return first;
		};
		if (defineProperty) {
			defineProperty(String.prototype, 'codePointAt', {
				'value': codePointAt,
				'configurable': true,
				'writable': true
			});
		} else {
			String.prototype.codePointAt = codePointAt;
		}
	}());
}

var codepointat = /*#__PURE__*/Object.freeze({
  __proto__: null
});

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
/**
 * A DFA walker that knows how to dump them to serialized strings.
 */
class DFASerializer {
    constructor(dfa, literalNames, symbolicNames) {
        this.dfa = dfa;
        this.literalNames = literalNames || [];
        this.symbolicNames = symbolicNames || [];
    }

    toString() {
       if(this.dfa.s0 === null) {
           return null;
       }
       let buf = "";
       const states = this.dfa.sortedStates();
       for(let i=0; i<states.length; i++) {
           const s = states[i];
           if(s.edges!==null) {
                const n = s.edges.length;
                for(let j=0;j<n;j++) {
                    const t = s.edges[j] || null;
                    if(t!==null && t.stateNumber !== 0x7FFFFFFF) {
                        buf = buf.concat(this.getStateString(s));
                        buf = buf.concat("-");
                        buf = buf.concat(this.getEdgeLabel(j));
                        buf = buf.concat("->");
                        buf = buf.concat(this.getStateString(t));
                        buf = buf.concat('\n');
                    }
                }
           }
       }
       return buf.length===0 ? null : buf;
    }

    getEdgeLabel(i) {
        if (i===0) {
            return "EOF";
        } else if(this.literalNames !==null || this.symbolicNames!==null) {
            return this.literalNames[i-1] || this.symbolicNames[i-1];
        } else {
            return String.fromCharCode(i-1);
        }
    }

    getStateString(s) {
        const baseStateStr = ( s.isAcceptState ? ":" : "") + "s" + s.stateNumber + ( s.requiresFullContext ? "^" : "");
        if(s.isAcceptState) {
            if (s.predicates !== null) {
                return baseStateStr + "=>" + s.predicates.toString();
            } else {
                return baseStateStr + "=>" + s.prediction.toString();
            }
        } else {
            return baseStateStr;
        }
    }
}

class LexerDFASerializer extends DFASerializer {
    constructor(dfa) {
        super(dfa, null);
    }

    getEdgeLabel(i) {
        return "'" + String.fromCharCode(i) + "'";
    }
}

var DFASerializer_1 = { DFASerializer , LexerDFASerializer };

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Set: Set$5} = Utils;
const {DFAState: DFAState$4} = DFAState_1;
const {StarLoopEntryState: StarLoopEntryState$2} = ATNState_1;
const {ATNConfigSet: ATNConfigSet$5} = ATNConfigSet_1;
const {DFASerializer: DFASerializer$1} = DFASerializer_1;
const {LexerDFASerializer: LexerDFASerializer$1} = DFASerializer_1;

class DFA {
	constructor(atnStartState, decision) {
		if (decision === undefined) {
			decision = 0;
		}
		/**
		 * From which ATN state did we create this DFA?
		 */
		this.atnStartState = atnStartState;
		this.decision = decision;
		/**
		 * A set of all DFA states. Use {@link Map} so we can get old state back
		 * ({@link Set} only allows you to see if it's there).
		 */
		this._states = new Set$5();
		this.s0 = null;
		/**
		 * {@code true} if this DFA is for a precedence decision; otherwise,
		 * {@code false}. This is the backing field for {@link //isPrecedenceDfa},
		 * {@link //setPrecedenceDfa}
		 */
		this.precedenceDfa = false;
		if (atnStartState instanceof StarLoopEntryState$2)
		{
			if (atnStartState.isPrecedenceDecision) {
				this.precedenceDfa = true;
				const precedenceState = new DFAState$4(null, new ATNConfigSet$5());
				precedenceState.edges = [];
				precedenceState.isAcceptState = false;
				precedenceState.requiresFullContext = false;
				this.s0 = precedenceState;
			}
		}
	}

	/**
	 * Get the start state for a specific precedence value.
	 *
	 * @param precedence The current precedence.
	 * @return The start state corresponding to the specified precedence, or
	 * {@code null} if no start state exists for the specified precedence.
	 *
	 * @throws IllegalStateException if this is not a precedence DFA.
	 * @see //isPrecedenceDfa()
	 */
	getPrecedenceStartState(precedence) {
		if (!(this.precedenceDfa)) {
			throw ("Only precedence DFAs may contain a precedence start state.");
		}
		// s0.edges is never null for a precedence DFA
		if (precedence < 0 || precedence >= this.s0.edges.length) {
			return null;
		}
		return this.s0.edges[precedence] || null;
	}

	/**
	 * Set the start state for a specific precedence value.
	 *
	 * @param precedence The current precedence.
	 * @param startState The start state corresponding to the specified
	 * precedence.
	 *
	 * @throws IllegalStateException if this is not a precedence DFA.
	 * @see //isPrecedenceDfa()
	 */
	setPrecedenceStartState(precedence, startState) {
		if (!(this.precedenceDfa)) {
			throw ("Only precedence DFAs may contain a precedence start state.");
		}
		if (precedence < 0) {
			return;
		}

		/**
		 * synchronization on s0 here is ok. when the DFA is turned into a
		 * precedence DFA, s0 will be initialized once and not updated again
		 * s0.edges is never null for a precedence DFA
		 */
		this.s0.edges[precedence] = startState;
	}

	/**
	 * Sets whether this is a precedence DFA. If the specified value differs
	 * from the current DFA configuration, the following actions are taken;
	 * otherwise no changes are made to the current DFA.
	 *
	 * <ul>
	 * <li>The {@link //states} map is cleared</li>
	 * <li>If {@code precedenceDfa} is {@code false}, the initial state
	 * {@link //s0} is set to {@code null}; otherwise, it is initialized to a new
	 * {@link DFAState} with an empty outgoing {@link DFAState//edges} array to
	 * store the start states for individual precedence values.</li>
	 * <li>The {@link //precedenceDfa} field is updated</li>
	 * </ul>
	 *
	 * @param precedenceDfa {@code true} if this is a precedence DFA; otherwise,
	 * {@code false}
	 */
	setPrecedenceDfa(precedenceDfa) {
		if (this.precedenceDfa!==precedenceDfa) {
			this._states = new DFAStatesSet();
			if (precedenceDfa) {
				const precedenceState = new DFAState$4(null, new ATNConfigSet$5());
				precedenceState.edges = [];
				precedenceState.isAcceptState = false;
				precedenceState.requiresFullContext = false;
				this.s0 = precedenceState;
			} else {
				this.s0 = null;
			}
			this.precedenceDfa = precedenceDfa;
		}
	}

	/**
	 * Return a list of all states in this DFA, ordered by state number.
	 */
	sortedStates() {
		const list = this._states.values();
		return list.sort(function(a, b) {
			return a.stateNumber - b.stateNumber;
		});
	}

	toString(literalNames, symbolicNames) {
		literalNames = literalNames || null;
		symbolicNames = symbolicNames || null;
		if (this.s0 === null) {
			return "";
		}
		const serializer = new DFASerializer$1(this, literalNames, symbolicNames);
		return serializer.toString();
	}

	toLexerString() {
		if (this.s0 === null) {
			return "";
		}
		const serializer = new LexerDFASerializer$1(this);
		return serializer.toString();
	}

	get states(){
		return this._states;
	}
}


var DFA_1 = DFA;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

var DFA$1 = DFA_1;
var DFASerializer$2 = DFASerializer_1.DFASerializer;
var LexerDFASerializer$2 = DFASerializer_1.LexerDFASerializer;
var PredPrediction$2 = DFAState_1.PredPrediction;

var dfa = {
	DFA: DFA$1,
	DFASerializer: DFASerializer$2,
	LexerDFASerializer: LexerDFASerializer$2,
	PredPrediction: PredPrediction$2
};

/*! https://mths.be/fromcodepoint v0.2.1 by @mathias */
if (!String.fromCodePoint) {
	(function() {
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var stringFromCharCode = String.fromCharCode;
		var floor = Math.floor;
		var fromCodePoint = function(_) {
			var MAX_SIZE = 0x4000;
			var codeUnits = [];
			var highSurrogate;
			var lowSurrogate;
			var index = -1;
			var length = arguments.length;
			if (!length) {
				return '';
			}
			var result = '';
			while (++index < length) {
				var codePoint = Number(arguments[index]);
				if (
					!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
					codePoint < 0 || // not a valid Unicode code point
					codePoint > 0x10FFFF || // not a valid Unicode code point
					floor(codePoint) != codePoint // not an integer
				) {
					throw RangeError('Invalid code point: ' + codePoint);
				}
				if (codePoint <= 0xFFFF) { // BMP code point
					codeUnits.push(codePoint);
				} else { // Astral code point; split in surrogate halves
					// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
					codePoint -= 0x10000;
					highSurrogate = (codePoint >> 10) + 0xD800;
					lowSurrogate = (codePoint % 0x400) + 0xDC00;
					codeUnits.push(highSurrogate, lowSurrogate);
				}
				if (index + 1 == length || codeUnits.length > MAX_SIZE) {
					result += stringFromCharCode.apply(null, codeUnits);
					codeUnits.length = 0;
				}
			}
			return result;
		};
		if (defineProperty) {
			defineProperty(String, 'fromCodePoint', {
				'value': fromCodePoint,
				'configurable': true,
				'writable': true
			});
		} else {
			String.fromCodePoint = fromCodePoint;
		}
	}());
}

var fromcodepoint = /*#__PURE__*/Object.freeze({
  __proto__: null
});

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

var tree = {...Tree_1, Trees: Trees_1};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {BitSet: BitSet$4} = Utils;
const {ErrorListener: ErrorListener$1} = ErrorListener_1;
const {Interval: Interval$4} = IntervalSet_1;


/**
 * This implementation of {@link ANTLRErrorListener} can be used to identify
 *  certain potential correctness and performance problems in grammars. "Reports"
 *  are made by calling {@link Parser//notifyErrorListeners} with the appropriate
 *  message.
 *
 *  <ul>
 *  <li><b>Ambiguities</b>: These are cases where more than one path through the
 *  grammar can match the input.</li>
 *  <li><b>Weak context sensitivity</b>: These are cases where full-context
 *  prediction resolved an SLL conflict to a unique alternative which equaled the
 *  minimum alternative of the SLL conflict.</li>
 *  <li><b>Strong (forced) context sensitivity</b>: These are cases where the
 *  full-context prediction resolved an SLL conflict to a unique alternative,
 *  <em>and</em> the minimum alternative of the SLL conflict was found to not be
 *  a truly viable alternative. Two-stage parsing cannot be used for inputs where
 *  this situation occurs.</li>
 *  </ul>
 */
class DiagnosticErrorListener extends ErrorListener$1 {
	constructor(exactOnly) {
		super();
		exactOnly = exactOnly || true;
		// whether all ambiguities or only exact ambiguities are reported.
		this.exactOnly = exactOnly;
	}

	reportAmbiguity(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
		if (this.exactOnly && !exact) {
			return;
		}
		const msg = "reportAmbiguity d=" +
			this.getDecisionDescription(recognizer, dfa) +
			": ambigAlts=" +
			this.getConflictingAlts(ambigAlts, configs) +
			", input='" +
			recognizer.getTokenStream().getText(new Interval$4(startIndex, stopIndex)) + "'";
		recognizer.notifyErrorListeners(msg);
	}

	reportAttemptingFullContext(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
		const msg = "reportAttemptingFullContext d=" +
			this.getDecisionDescription(recognizer, dfa) +
			", input='" +
			recognizer.getTokenStream().getText(new Interval$4(startIndex, stopIndex)) + "'";
		recognizer.notifyErrorListeners(msg);
	}

	reportContextSensitivity(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
		const msg = "reportContextSensitivity d=" +
			this.getDecisionDescription(recognizer, dfa) +
			", input='" +
			recognizer.getTokenStream().getText(new Interval$4(startIndex, stopIndex)) + "'";
		recognizer.notifyErrorListeners(msg);
	}

	getDecisionDescription(recognizer, dfa) {
		const decision = dfa.decision;
		const ruleIndex = dfa.atnStartState.ruleIndex;

		const ruleNames = recognizer.ruleNames;
		if (ruleIndex < 0 || ruleIndex >= ruleNames.length) {
			return "" + decision;
		}
		const ruleName = ruleNames[ruleIndex] || null;
		if (ruleName === null || ruleName.length === 0) {
			return "" + decision;
		}
		return `${decision} (${ruleName})`;
	}

	/**
	 * Computes the set of conflicting or ambiguous alternatives from a
	 * configuration set, if that information was not already provided by the
	 * parser.
	 *
	 * @param reportedAlts The set of conflicting or ambiguous alternatives, as
	 * reported by the parser.
	 * @param configs The conflicting or ambiguous configuration set.
	 * @return Returns {@code reportedAlts} if it is not {@code null}, otherwise
	 * returns the set of alternatives represented in {@code configs}.
     */
	getConflictingAlts(reportedAlts, configs) {
		if (reportedAlts !== null) {
			return reportedAlts;
		}
		const result = new BitSet$4();
		for (let i = 0; i < configs.items.length; i++) {
			result.add(configs.items[i].alt);
		}
		return `{${result.values().join(", ")}}`;
	}
}

var DiagnosticErrorListener_1 = DiagnosticErrorListener;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$c} = Token_1;
const {NoViableAltException: NoViableAltException$2, InputMismatchException: InputMismatchException$1, FailedPredicateException: FailedPredicateException$1, ParseCancellationException: ParseCancellationException$1} = Errors;
const {ATNState: ATNState$3} = ATNState_1;
const {Interval: Interval$5, IntervalSet: IntervalSet$5} = IntervalSet_1;

class ErrorStrategy {

    reset(recognizer) {
    }

    recoverInline(recognizer) {
    }

    recover(recognizer, e) {
    }

    sync(recognizer) {
    }

    inErrorRecoveryMode(recognizer) {
    }

    reportError(recognizer) {
    }
}


/**
 * This is the default implementation of {@link ANTLRErrorStrategy} used for
 * error reporting and recovery in ANTLR parsers.
*/
class DefaultErrorStrategy extends ErrorStrategy {
    constructor() {
        super();
        /**
         * Indicates whether the error strategy is currently "recovering from an
         * error". This is used to suppress reporting multiple error messages while
         * attempting to recover from a detected syntax error.
         *
         * @see //inErrorRecoveryMode
         */
        this.errorRecoveryMode = false;

        /**
         * The index into the input stream where the last error occurred.
         * This is used to prevent infinite loops where an error is found
         * but no token is consumed during recovery...another error is found,
         * ad nauseum. This is a failsafe mechanism to guarantee that at least
         * one token/tree node is consumed for two errors.
         */
        this.lastErrorIndex = -1;
        this.lastErrorStates = null;
    }

    /**
     * <p>The default implementation simply calls {@link //endErrorCondition} to
     * ensure that the handler is not in error recovery mode.</p>
    */
    reset(recognizer) {
        this.endErrorCondition(recognizer);
    }

    /**
     * This method is called to enter error recovery mode when a recognition
     * exception is reported.
     *
     * @param recognizer the parser instance
    */
    beginErrorCondition(recognizer) {
        this.errorRecoveryMode = true;
    }

    inErrorRecoveryMode(recognizer) {
        return this.errorRecoveryMode;
    }

    /**
     * This method is called to leave error recovery mode after recovering from
     * a recognition exception.
     * @param recognizer
     */
    endErrorCondition(recognizer) {
        this.errorRecoveryMode = false;
        this.lastErrorStates = null;
        this.lastErrorIndex = -1;
    }

    /**
     * {@inheritDoc}
     * <p>The default implementation simply calls {@link //endErrorCondition}.</p>
     */
    reportMatch(recognizer) {
        this.endErrorCondition(recognizer);
    }

    /**
     * {@inheritDoc}
     *
     * <p>The default implementation returns immediately if the handler is already
     * in error recovery mode. Otherwise, it calls {@link //beginErrorCondition}
     * and dispatches the reporting task based on the runtime type of {@code e}
     * according to the following table.</p>
     *
     * <ul>
     * <li>{@link NoViableAltException}: Dispatches the call to
     * {@link //reportNoViableAlternative}</li>
     * <li>{@link InputMismatchException}: Dispatches the call to
     * {@link //reportInputMismatch}</li>
     * <li>{@link FailedPredicateException}: Dispatches the call to
     * {@link //reportFailedPredicate}</li>
     * <li>All other types: calls {@link Parser//notifyErrorListeners} to report
     * the exception</li>
     * </ul>
     */
    reportError(recognizer, e) {
       // if we've already reported an error and have not matched a token
       // yet successfully, don't report any errors.
        if(this.inErrorRecoveryMode(recognizer)) {
            return; // don't report spurious errors
        }
        this.beginErrorCondition(recognizer);
        if ( e instanceof NoViableAltException$2 ) {
            this.reportNoViableAlternative(recognizer, e);
        } else if ( e instanceof InputMismatchException$1 ) {
            this.reportInputMismatch(recognizer, e);
        } else if ( e instanceof FailedPredicateException$1 ) {
            this.reportFailedPredicate(recognizer, e);
        } else {
            console.log("unknown recognition error type: " + e.constructor.name);
            console.log(e.stack);
            recognizer.notifyErrorListeners(e.getOffendingToken(), e.getMessage(), e);
        }
    }

    /**
     *
     * {@inheritDoc}
     *
     * <p>The default implementation resynchronizes the parser by consuming tokens
     * until we find one in the resynchronization set--loosely the set of tokens
     * that can follow the current rule.</p>
     *
     */
    recover(recognizer, e) {
        if (this.lastErrorIndex===recognizer.getInputStream().index &&
            this.lastErrorStates !== null && this.lastErrorStates.indexOf(recognizer.state)>=0) {
            // uh oh, another error at same token index and previously-visited
            // state in ATN; must be a case where LT(1) is in the recovery
            // token set so nothing got consumed. Consume a single token
            // at least to prevent an infinite loop; this is a failsafe.
            recognizer.consume();
        }
        this.lastErrorIndex = recognizer._input.index;
        if (this.lastErrorStates === null) {
            this.lastErrorStates = [];
        }
        this.lastErrorStates.push(recognizer.state);
        const followSet = this.getErrorRecoverySet(recognizer);
        this.consumeUntil(recognizer, followSet);
    }

    /**
     * The default implementation of {@link ANTLRErrorStrategy//sync} makes sure
     * that the current lookahead symbol is consistent with what were expecting
     * at this point in the ATN. You can call this anytime but ANTLR only
     * generates code to check before subrules/loops and each iteration.
     *
     * <p>Implements Jim Idle's magic sync mechanism in closures and optional
     * subrules. E.g.,</p>
     *
     * <pre>
     * a : sync ( stuff sync )* ;
     * sync : {consume to what can follow sync} ;
     * </pre>
     *
     * At the start of a sub rule upon error, {@link //sync} performs single
     * token deletion, if possible. If it can't do that, it bails on the current
     * rule and uses the default error recovery, which consumes until the
     * resynchronization set of the current rule.
     *
     * <p>If the sub rule is optional ({@code (...)?}, {@code (...)*}, or block
     * with an empty alternative), then the expected set includes what follows
     * the subrule.</p>
     *
     * <p>During loop iteration, it consumes until it sees a token that can start a
     * sub rule or what follows loop. Yes, that is pretty aggressive. We opt to
     * stay in the loop as long as possible.</p>
     *
     * <p><strong>ORIGINS</strong></p>
     *
     * <p>Previous versions of ANTLR did a poor job of their recovery within loops.
     * A single mismatch token or missing token would force the parser to bail
     * out of the entire rules surrounding the loop. So, for rule</p>
     *
     * <pre>
     * classDef : 'class' ID '{' member* '}'
     * </pre>
     *
     * input with an extra token between members would force the parser to
     * consume until it found the next class definition rather than the next
     * member definition of the current class.
     *
     * <p>This functionality cost a little bit of effort because the parser has to
     * compare token set at the start of the loop and at each iteration. If for
     * some reason speed is suffering for you, you can turn off this
     * functionality by simply overriding this method as a blank { }.</p>
     *
     */
    sync(recognizer) {
        // If already recovering, don't try to sync
        if (this.inErrorRecoveryMode(recognizer)) {
            return;
        }
        const s = recognizer._interp.atn.states[recognizer.state];
        const la = recognizer.getTokenStream().LA(1);
        // try cheaper subset first; might get lucky. seems to shave a wee bit off
        const nextTokens = recognizer.atn.nextTokens(s);
        if (nextTokens.contains(Token$c.EPSILON) || nextTokens.contains(la)) {
            return;
        }
        switch (s.stateType) {
        case ATNState$3.BLOCK_START:
        case ATNState$3.STAR_BLOCK_START:
        case ATNState$3.PLUS_BLOCK_START:
        case ATNState$3.STAR_LOOP_ENTRY:
           // report error and recover if possible
            if( this.singleTokenDeletion(recognizer) !== null) {
                return;
            } else {
                throw new InputMismatchException$1(recognizer);
            }
        case ATNState$3.PLUS_LOOP_BACK:
        case ATNState$3.STAR_LOOP_BACK:
            this.reportUnwantedToken(recognizer);
            const expecting = new IntervalSet$5();
            expecting.addSet(recognizer.getExpectedTokens());
            const whatFollowsLoopIterationOrRule = expecting.addSet(this.getErrorRecoverySet(recognizer));
            this.consumeUntil(recognizer, whatFollowsLoopIterationOrRule);
            break;
            // do nothing if we can't identify the exact kind of ATN state
        }
    }

    /**
     * This is called by {@link //reportError} when the exception is a
     * {@link NoViableAltException}.
     *
     * @see //reportError
     *
     * @param recognizer the parser instance
     * @param e the recognition exception
     */
    reportNoViableAlternative(recognizer, e) {
        const tokens = recognizer.getTokenStream();
        let input;
        if(tokens !== null) {
            if (e.startToken.type===Token$c.EOF) {
                input = "<EOF>";
            } else {
                input = tokens.getText(new Interval$5(e.startToken.tokenIndex, e.offendingToken.tokenIndex));
            }
        } else {
            input = "<unknown input>";
        }
        const msg = "no viable alternative at input " + this.escapeWSAndQuote(input);
        recognizer.notifyErrorListeners(msg, e.offendingToken, e);
    }

    /**
     * This is called by {@link //reportError} when the exception is an
     * {@link InputMismatchException}.
     *
     * @see //reportError
     *
     * @param recognizer the parser instance
     * @param e the recognition exception
     */
    reportInputMismatch(recognizer, e) {
        const msg = "mismatched input " + this.getTokenErrorDisplay(e.offendingToken) +
            " expecting " + e.getExpectedTokens().toString(recognizer.literalNames, recognizer.symbolicNames);
        recognizer.notifyErrorListeners(msg, e.offendingToken, e);
    }

    /**
     * This is called by {@link //reportError} when the exception is a
     * {@link FailedPredicateException}.
     *
     * @see //reportError
     *
     * @param recognizer the parser instance
     * @param e the recognition exception
     */
    reportFailedPredicate(recognizer, e) {
        const ruleName = recognizer.ruleNames[recognizer._ctx.ruleIndex];
        const msg = "rule " + ruleName + " " + e.message;
        recognizer.notifyErrorListeners(msg, e.offendingToken, e);
    }

    /**
     * This method is called to report a syntax error which requires the removal
     * of a token from the input stream. At the time this method is called, the
     * erroneous symbol is current {@code LT(1)} symbol and has not yet been
     * removed from the input stream. When this method returns,
     * {@code recognizer} is in error recovery mode.
     *
     * <p>This method is called when {@link //singleTokenDeletion} identifies
     * single-token deletion as a viable recovery strategy for a mismatched
     * input error.</p>
     *
     * <p>The default implementation simply returns if the handler is already in
     * error recovery mode. Otherwise, it calls {@link //beginErrorCondition} to
     * enter error recovery mode, followed by calling
     * {@link Parser//notifyErrorListeners}.</p>
     *
     * @param recognizer the parser instance
     *
     */
    reportUnwantedToken(recognizer) {
        if (this.inErrorRecoveryMode(recognizer)) {
            return;
        }
        this.beginErrorCondition(recognizer);
        const t = recognizer.getCurrentToken();
        const tokenName = this.getTokenErrorDisplay(t);
        const expecting = this.getExpectedTokens(recognizer);
        const msg = "extraneous input " + tokenName + " expecting " +
            expecting.toString(recognizer.literalNames, recognizer.symbolicNames);
        recognizer.notifyErrorListeners(msg, t, null);
    }

    /**
     * This method is called to report a syntax error which requires the
     * insertion of a missing token into the input stream. At the time this
     * method is called, the missing token has not yet been inserted. When this
     * method returns, {@code recognizer} is in error recovery mode.
     *
     * <p>This method is called when {@link //singleTokenInsertion} identifies
     * single-token insertion as a viable recovery strategy for a mismatched
     * input error.</p>
     *
     * <p>The default implementation simply returns if the handler is already in
     * error recovery mode. Otherwise, it calls {@link //beginErrorCondition} to
     * enter error recovery mode, followed by calling
     * {@link Parser//notifyErrorListeners}.</p>
     *
     * @param recognizer the parser instance
     */
    reportMissingToken(recognizer) {
        if ( this.inErrorRecoveryMode(recognizer)) {
            return;
        }
        this.beginErrorCondition(recognizer);
        const t = recognizer.getCurrentToken();
        const expecting = this.getExpectedTokens(recognizer);
        const msg = "missing " + expecting.toString(recognizer.literalNames, recognizer.symbolicNames) +
            " at " + this.getTokenErrorDisplay(t);
        recognizer.notifyErrorListeners(msg, t, null);
    }

    /**
     * <p>The default implementation attempts to recover from the mismatched input
     * by using single token insertion and deletion as described below. If the
     * recovery attempt fails, this method throws an
     * {@link InputMismatchException}.</p>
     *
     * <p><strong>EXTRA TOKEN</strong> (single token deletion)</p>
     *
     * <p>{@code LA(1)} is not what we are looking for. If {@code LA(2)} has the
     * right token, however, then assume {@code LA(1)} is some extra spurious
     * token and delete it. Then consume and return the next token (which was
     * the {@code LA(2)} token) as the successful result of the match operation.</p>
     *
     * <p>This recovery strategy is implemented by {@link
     * //singleTokenDeletion}.</p>
     *
     * <p><strong>MISSING TOKEN</strong> (single token insertion)</p>
     *
     * <p>If current token (at {@code LA(1)}) is consistent with what could come
     * after the expected {@code LA(1)} token, then assume the token is missing
     * and use the parser's {@link TokenFactory} to create it on the fly. The
     * "insertion" is performed by returning the created token as the successful
     * result of the match operation.</p>
     *
     * <p>This recovery strategy is implemented by {@link
     * //singleTokenInsertion}.</p>
     *
     * <p><strong>EXAMPLE</strong></p>
     *
     * <p>For example, Input {@code i=(3;} is clearly missing the {@code ')'}. When
     * the parser returns from the nested call to {@code expr}, it will have
     * call chain:</p>
     *
     * <pre>
     * stat &rarr; expr &rarr; atom
     * </pre>
     *
     * and it will be trying to match the {@code ')'} at this point in the
     * derivation:
     *
     * <pre>
     * =&gt; ID '=' '(' INT ')' ('+' atom)* ';'
     * ^
     * </pre>
     *
     * The attempt to match {@code ')'} will fail when it sees {@code ';'} and
     * call {@link //recoverInline}. To recover, it sees that {@code LA(1)==';'}
     * is in the set of tokens that can follow the {@code ')'} token reference
     * in rule {@code atom}. It can assume that you forgot the {@code ')'}.
     */
    recoverInline(recognizer) {
        // SINGLE TOKEN DELETION
        const matchedSymbol = this.singleTokenDeletion(recognizer);
        if (matchedSymbol !== null) {
            // we have deleted the extra token.
            // now, move past ttype token as if all were ok
            recognizer.consume();
            return matchedSymbol;
        }
        // SINGLE TOKEN INSERTION
        if (this.singleTokenInsertion(recognizer)) {
            return this.getMissingSymbol(recognizer);
        }
        // even that didn't work; must throw the exception
        throw new InputMismatchException$1(recognizer);
    }

    /**
     * This method implements the single-token insertion inline error recovery
     * strategy. It is called by {@link //recoverInline} if the single-token
     * deletion strategy fails to recover from the mismatched input. If this
     * method returns {@code true}, {@code recognizer} will be in error recovery
     * mode.
     *
     * <p>This method determines whether or not single-token insertion is viable by
     * checking if the {@code LA(1)} input symbol could be successfully matched
     * if it were instead the {@code LA(2)} symbol. If this method returns
     * {@code true}, the caller is responsible for creating and inserting a
     * token with the correct type to produce this behavior.</p>
     *
     * @param recognizer the parser instance
     * @return {@code true} if single-token insertion is a viable recovery
     * strategy for the current mismatched input, otherwise {@code false}
     */
    singleTokenInsertion(recognizer) {
        const currentSymbolType = recognizer.getTokenStream().LA(1);
        // if current token is consistent with what could come after current
        // ATN state, then we know we're missing a token; error recovery
        // is free to conjure up and insert the missing token
        const atn = recognizer._interp.atn;
        const currentState = atn.states[recognizer.state];
        const next = currentState.transitions[0].target;
        const expectingAtLL2 = atn.nextTokens(next, recognizer._ctx);
        if (expectingAtLL2.contains(currentSymbolType) ){
            this.reportMissingToken(recognizer);
            return true;
        } else {
            return false;
        }
    }

    /**
     * This method implements the single-token deletion inline error recovery
     * strategy. It is called by {@link //recoverInline} to attempt to recover
     * from mismatched input. If this method returns null, the parser and error
     * handler state will not have changed. If this method returns non-null,
     * {@code recognizer} will <em>not</em> be in error recovery mode since the
     * returned token was a successful match.
     *
     * <p>If the single-token deletion is successful, this method calls
     * {@link //reportUnwantedToken} to report the error, followed by
     * {@link Parser//consume} to actually "delete" the extraneous token. Then,
     * before returning {@link //reportMatch} is called to signal a successful
     * match.</p>
     *
     * @param recognizer the parser instance
     * @return the successfully matched {@link Token} instance if single-token
     * deletion successfully recovers from the mismatched input, otherwise
     * {@code null}
     */
    singleTokenDeletion(recognizer) {
        const nextTokenType = recognizer.getTokenStream().LA(2);
        const expecting = this.getExpectedTokens(recognizer);
        if (expecting.contains(nextTokenType)) {
            this.reportUnwantedToken(recognizer);
            // print("recoverFromMismatchedToken deleting " \
            // + str(recognizer.getTokenStream().LT(1)) \
            // + " since " + str(recognizer.getTokenStream().LT(2)) \
            // + " is what we want", file=sys.stderr)
            recognizer.consume(); // simply delete extra token
            // we want to return the token we're actually matching
            const matchedSymbol = recognizer.getCurrentToken();
            this.reportMatch(recognizer); // we know current token is correct
            return matchedSymbol;
        } else {
            return null;
        }
    }

    /**
     * Conjure up a missing token during error recovery.
     *
     * The recognizer attempts to recover from single missing
     * symbols. But, actions might refer to that missing symbol.
     * For example, x=ID {f($x);}. The action clearly assumes
     * that there has been an identifier matched previously and that
     * $x points at that token. If that token is missing, but
     * the next token in the stream is what we want we assume that
     * this token is missing and we keep going. Because we
     * have to return some token to replace the missing token,
     * we have to conjure one up. This method gives the user control
     * over the tokens returned for missing tokens. Mostly,
     * you will want to create something special for identifier
     * tokens. For literals such as '{' and ',', the default
     * action in the parser or tree parser works. It simply creates
     * a CommonToken of the appropriate type. The text will be the token.
     * If you change what tokens must be created by the lexer,
     * override this method to create the appropriate tokens.
     *
     */
    getMissingSymbol(recognizer) {
        const currentSymbol = recognizer.getCurrentToken();
        const expecting = this.getExpectedTokens(recognizer);
        const expectedTokenType = expecting.first(); // get any element
        let tokenText;
        if (expectedTokenType===Token$c.EOF) {
            tokenText = "<missing EOF>";
        } else {
            tokenText = "<missing " + recognizer.literalNames[expectedTokenType] + ">";
        }
        let current = currentSymbol;
        const lookback = recognizer.getTokenStream().LT(-1);
        if (current.type===Token$c.EOF && lookback !== null) {
            current = lookback;
        }
        return recognizer.getTokenFactory().create(current.source,
            expectedTokenType, tokenText, Token$c.DEFAULT_CHANNEL,
            -1, -1, current.line, current.column);
    }

    getExpectedTokens(recognizer) {
        return recognizer.getExpectedTokens();
    }

    /**
     * How should a token be displayed in an error message? The default
     * is to display just the text, but during development you might
     * want to have a lot of information spit out. Override in that case
     * to use t.toString() (which, for CommonToken, dumps everything about
     * the token). This is better than forcing you to override a method in
     * your token objects because you don't have to go modify your lexer
     * so that it creates a new Java type.
     */
    getTokenErrorDisplay(t) {
        if (t === null) {
            return "<no token>";
        }
        let s = t.text;
        if (s === null) {
            if (t.type===Token$c.EOF) {
                s = "<EOF>";
            } else {
                s = "<" + t.type + ">";
            }
        }
        return this.escapeWSAndQuote(s);
    }

    escapeWSAndQuote(s) {
        s = s.replace(/\n/g,"\\n");
        s = s.replace(/\r/g,"\\r");
        s = s.replace(/\t/g,"\\t");
        return "'" + s + "'";
    }

    /**
     * Compute the error recovery set for the current rule. During
     * rule invocation, the parser pushes the set of tokens that can
     * follow that rule reference on the stack; this amounts to
     * computing FIRST of what follows the rule reference in the
     * enclosing rule. See LinearApproximator.FIRST().
     * This local follow set only includes tokens
     * from within the rule; i.e., the FIRST computation done by
     * ANTLR stops at the end of a rule.
     *
     * EXAMPLE
     *
     * When you find a "no viable alt exception", the input is not
     * consistent with any of the alternatives for rule r. The best
     * thing to do is to consume tokens until you see something that
     * can legally follow a call to r//or* any rule that called r.
     * You don't want the exact set of viable next tokens because the
     * input might just be missing a token--you might consume the
     * rest of the input looking for one of the missing tokens.
     *
     * Consider grammar:
     *
     * a : '[' b ']'
     * | '(' b ')'
     * ;
     * b : c '^' INT ;
     * c : ID
     * | INT
     * ;
     *
     * At each rule invocation, the set of tokens that could follow
     * that rule is pushed on a stack. Here are the various
     * context-sensitive follow sets:
     *
     * FOLLOW(b1_in_a) = FIRST(']') = ']'
     * FOLLOW(b2_in_a) = FIRST(')') = ')'
     * FOLLOW(c_in_b) = FIRST('^') = '^'
     *
     * Upon erroneous input "[]", the call chain is
     *
     * a -> b -> c
     *
     * and, hence, the follow context stack is:
     *
     * depth follow set start of rule execution
     * 0 <EOF> a (from main())
     * 1 ']' b
     * 2 '^' c
     *
     * Notice that ')' is not included, because b would have to have
     * been called from a different context in rule a for ')' to be
     * included.
     *
     * For error recovery, we cannot consider FOLLOW(c)
     * (context-sensitive or otherwise). We need the combined set of
     * all context-sensitive FOLLOW sets--the set of all tokens that
     * could follow any reference in the call chain. We need to
     * resync to one of those tokens. Note that FOLLOW(c)='^' and if
     * we resync'd to that token, we'd consume until EOF. We need to
     * sync to context-sensitive FOLLOWs for a, b, and c: {']','^'}.
     * In this case, for input "[]", LA(1) is ']' and in the set, so we would
     * not consume anything. After printing an error, rule c would
     * return normally. Rule b would not find the required '^' though.
     * At this point, it gets a mismatched token error and throws an
     * exception (since LA(1) is not in the viable following token
     * set). The rule exception handler tries to recover, but finds
     * the same recovery set and doesn't consume anything. Rule b
     * exits normally returning to rule a. Now it finds the ']' (and
     * with the successful match exits errorRecovery mode).
     *
     * So, you can see that the parser walks up the call chain looking
     * for the token that was a member of the recovery set.
     *
     * Errors are not generated in errorRecovery mode.
     *
     * ANTLR's error recovery mechanism is based upon original ideas:
     *
     * "Algorithms + Data Structures = Programs" by Niklaus Wirth
     *
     * and
     *
     * "A note on error recovery in recursive descent parsers":
     * http://portal.acm.org/citation.cfm?id=947902.947905
     *
     * Later, Josef Grosch had some good ideas:
     *
     * "Efficient and Comfortable Error Recovery in Recursive Descent
     * Parsers":
     * ftp://www.cocolab.com/products/cocktail/doca4.ps/ell.ps.zip
     *
     * Like Grosch I implement context-sensitive FOLLOW sets that are combined
     * at run-time upon error to avoid overhead during parsing.
     */
    getErrorRecoverySet(recognizer) {
        const atn = recognizer._interp.atn;
        let ctx = recognizer._ctx;
        const recoverSet = new IntervalSet$5();
        while (ctx !== null && ctx.invokingState>=0) {
            // compute what follows who invoked us
            const invokingState = atn.states[ctx.invokingState];
            const rt = invokingState.transitions[0];
            const follow = atn.nextTokens(rt.followState);
            recoverSet.addSet(follow);
            ctx = ctx.parentCtx;
        }
        recoverSet.removeOne(Token$c.EPSILON);
        return recoverSet;
    }

// Consume tokens until one matches the given token set.//
    consumeUntil(recognizer, set) {
        let ttype = recognizer.getTokenStream().LA(1);
        while( ttype !== Token$c.EOF && !set.contains(ttype)) {
            recognizer.consume();
            ttype = recognizer.getTokenStream().LA(1);
        }
    }
}


/**
 * This implementation of {@link ANTLRErrorStrategy} responds to syntax errors
 * by immediately canceling the parse operation with a
 * {@link ParseCancellationException}. The implementation ensures that the
 * {@link ParserRuleContext//exception} field is set for all parse tree nodes
 * that were not completed prior to encountering the error.
 *
 * <p>
 * This error strategy is useful in the following scenarios.</p>
 *
 * <ul>
 * <li><strong>Two-stage parsing:</strong> This error strategy allows the first
 * stage of two-stage parsing to immediately terminate if an error is
 * encountered, and immediately fall back to the second stage. In addition to
 * avoiding wasted work by attempting to recover from errors here, the empty
 * implementation of {@link BailErrorStrategy//sync} improves the performance of
 * the first stage.</li>
 * <li><strong>Silent validation:</strong> When syntax errors are not being
 * reported or logged, and the parse result is simply ignored if errors occur,
 * the {@link BailErrorStrategy} avoids wasting work on recovering from errors
 * when the result will be ignored either way.</li>
 * </ul>
 *
 * <p>
 * {@code myparser.setErrorHandler(new BailErrorStrategy());}</p>
 *
 * @see Parser//setErrorHandler(ANTLRErrorStrategy)
 * */
class BailErrorStrategy extends DefaultErrorStrategy {
    constructor() {
        super();
    }

    /**
     * Instead of recovering from exception {@code e}, re-throw it wrapped
     * in a {@link ParseCancellationException} so it is not caught by the
     * rule function catches. Use {@link Exception//getCause()} to get the
     * original {@link RecognitionException}.
     */
    recover(recognizer, e) {
        let context = recognizer._ctx;
        while (context !== null) {
            context.exception = e;
            context = context.parentCtx;
        }
        throw new ParseCancellationException$1(e);
    }

    /**
     * Make sure we don't attempt to recover inline; if the parser
     * successfully recovers, it won't throw an exception.
     */
    recoverInline(recognizer) {
        this.recover(recognizer, new InputMismatchException$1(recognizer));
    }

// Make sure we don't attempt to recover from problems in subrules.//
    sync(recognizer) {
        // pass
    }
}


var ErrorStrategy_1 = {BailErrorStrategy, DefaultErrorStrategy};

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

var RecognitionException$2 = Errors.RecognitionException;
var NoViableAltException$3 = Errors.NoViableAltException;
var LexerNoViableAltException$3 = Errors.LexerNoViableAltException;
var InputMismatchException$2 = Errors.InputMismatchException;
var FailedPredicateException$2 = Errors.FailedPredicateException;
var DiagnosticErrorListener$1 = DiagnosticErrorListener_1;
var BailErrorStrategy$1 = ErrorStrategy_1.BailErrorStrategy;
var DefaultErrorStrategy$1 = ErrorStrategy_1.DefaultErrorStrategy;
var ErrorListener$2 = ErrorListener_1.ErrorListener;

var error = {
	RecognitionException: RecognitionException$2,
	NoViableAltException: NoViableAltException$3,
	LexerNoViableAltException: LexerNoViableAltException$3,
	InputMismatchException: InputMismatchException$2,
	FailedPredicateException: FailedPredicateException$2,
	DiagnosticErrorListener: DiagnosticErrorListener$1,
	BailErrorStrategy: BailErrorStrategy$1,
	DefaultErrorStrategy: DefaultErrorStrategy$1,
	ErrorListener: ErrorListener$2
};

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var require$$1 = /*@__PURE__*/getAugmentedNamespace(codepointat);

var require$$3 = /*@__PURE__*/getAugmentedNamespace(fromcodepoint);

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$d} = Token_1;



/**
 * If decodeToUnicodeCodePoints is true, the input is treated
 * as a series of Unicode code points.
 *
 * Otherwise, the input is treated as a series of 16-bit UTF-16 code
 * units.
 */
class InputStream {
	constructor(data, decodeToUnicodeCodePoints) {
		this.name = "<empty>";
		this.strdata = data;
		this.decodeToUnicodeCodePoints = decodeToUnicodeCodePoints || false;
		// _loadString - Vacuum all input from a string and then treat it like a buffer.
		this._index = 0;
		this.data = [];
		if (this.decodeToUnicodeCodePoints) {
			for (let i = 0; i < this.strdata.length; ) {
				const codePoint = this.strdata.codePointAt(i);
				this.data.push(codePoint);
				i += codePoint <= 0xFFFF ? 1 : 2;
			}
		} else {
			for (let i = 0; i < this.strdata.length; i++) {
				const codeUnit = this.strdata.charCodeAt(i);
				this.data.push(codeUnit);
			}
		}
		this._size = this.data.length;
	}

	/**
	 * Reset the stream so that it's in the same state it was
	 * when the object was created *except* the data array is not
	 * touched.
	 */
	reset() {
		this._index = 0;
	}

	consume() {
		if (this._index >= this._size) {
			// assert this.LA(1) == Token.EOF
			throw ("cannot consume EOF");
		}
		this._index += 1;
	}

	LA(offset) {
		if (offset === 0) {
			return 0; // undefined
		}
		if (offset < 0) {
			offset += 1; // e.g., translate LA(-1) to use offset=0
		}
		const pos = this._index + offset - 1;
		if (pos < 0 || pos >= this._size) { // invalid
			return Token$d.EOF;
		}
		return this.data[pos];
	}

	LT(offset) {
		return this.LA(offset);
	}

// mark/release do nothing; we have entire buffer
	mark() {
		return -1;
	}

	release(marker) {
	}

	/**
	 * consume() ahead until p==_index; can't just set p=_index as we must
	 * update line and column. If we seek backwards, just set p
	 */
	seek(_index) {
		if (_index <= this._index) {
			this._index = _index; // just jump; don't update stream state (line,
									// ...)
			return;
		}
		// seek forward
		this._index = Math.min(_index, this._size);
	}

	getText(start, stop) {
		if (stop >= this._size) {
			stop = this._size - 1;
		}
		if (start >= this._size) {
			return "";
		} else {
			if (this.decodeToUnicodeCodePoints) {
				let result = "";
				for (let i = start; i <= stop; i++) {
					result += String.fromCodePoint(this.data[i]);
				}
				return result;
			} else {
				return this.strdata.slice(start, stop + 1);
			}
		}
	}

	toString() {
		return this.strdata;
	}

	get index(){
		return this._index;
	}

	get size(){
		return this._size;
	}
}


var InputStream_1 = InputStream;

var empty = {};

var empty$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': empty
});

var fs = /*@__PURE__*/getAugmentedNamespace(empty$1);

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {InputStream: InputStream$1} = InputStream_1;


/**
 * Utility functions to create InputStreams from various sources.
 *
 * All returned InputStreams support the full range of Unicode
 * up to U+10FFFF (the default behavior of InputStream only supports
 * code points up to U+FFFF).
 */
const CharStreams = {
  // Creates an InputStream from a string.
  fromString: function(str) {
    return new InputStream$1(str, true);
  },

  /**
   * Asynchronously creates an InputStream from a blob given the
   * encoding of the bytes in that blob (defaults to 'utf8' if
   * encoding is null).
   *
   * Invokes onLoad(result) on success, onError(error) on
   * failure.
   */
  fromBlob: function(blob, encoding, onLoad, onError) {
    const reader = new window.FileReader();
    reader.onload = function(e) {
      const is = new InputStream$1(e.target.result, true);
      onLoad(is);
    };
    reader.onerror = onError;
    reader.readAsText(blob, encoding);
  },

  /**
   * Creates an InputStream from a Buffer given the
   * encoding of the bytes in that buffer (defaults to 'utf8' if
   * encoding is null).
   */
  fromBuffer: function(buffer, encoding) {
    return new InputStream$1(buffer.toString(encoding), true);
  },

  /** Asynchronously creates an InputStream from a file on disk given
   * the encoding of the bytes in that file (defaults to 'utf8' if
   * encoding is null).
   *
   * Invokes callback(error, result) on completion.
   */
  fromPath: function(path, encoding, callback) {
    fs.readFile(path, encoding, function(err, data) {
      let is = null;
      if (data !== null) {
        is = new InputStream$1(data, true);
      }
      callback(err, is);
    });
  },

  /**
   * Synchronously creates an InputStream given a path to a file
   * on disk and the encoding of the bytes in that file (defaults to
   * 'utf8' if encoding is null).
   */
  fromPathSync: function(path, encoding) {
    const data = fs.readFileSync(path, encoding);
    return new InputStream$1(data, true);
  }
};

var CharStreams_1 = CharStreams;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

/**
 * This is an InputStream that is loaded from a file all at once
 * when you construct the object.
 */
class FileStream extends InputStream_1 {
	constructor(fileName, decodeToUnicodeCodePoints) {
		const data = fs.readFileSync(fileName, "utf8");
		super(data, decodeToUnicodeCodePoints);
		this.fileName = fileName;
	}
}

var FileStream_1 = FileStream;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$e} = Token_1;

const {Interval: Interval$6} = IntervalSet_1;

// this is just to keep meaningful parameter types to Parser
class TokenStream {}

/**
 * This implementation of {@link TokenStream} loads tokens from a
 * {@link TokenSource} on-demand, and places the tokens in a buffer to provide
 * access to any previous token by index.
 *
 * <p>
 * This token stream ignores the value of {@link Token//getChannel}. If your
 * parser requires the token stream filter tokens to only those on a particular
 * channel, such as {@link Token//DEFAULT_CHANNEL} or
 * {@link Token//HIDDEN_CHANNEL}, use a filtering token stream such a
 * {@link CommonTokenStream}.</p>
 */
class BufferedTokenStream extends TokenStream {
	constructor(tokenSource) {

		super();
		// The {@link TokenSource} from which tokens for this stream are fetched.
		this.tokenSource = tokenSource;
		/**
		 * A collection of all tokens fetched from the token source. The list is
		 * considered a complete view of the input once {@link //fetchedEOF} is set
		 * to {@code true}.
		 */
		this.tokens = [];

		/**
		 * The index into {@link //tokens} of the current token (next token to
		 * {@link //consume}). {@link //tokens}{@code [}{@link //p}{@code ]} should
		 * be
		 * {@link //LT LT(1)}.
		 *
		 * <p>This field is set to -1 when the stream is first constructed or when
		 * {@link //setTokenSource} is called, indicating that the first token has
		 * not yet been fetched from the token source. For additional information,
		 * see the documentation of {@link IntStream} for a description of
		 * Initializing Methods.</p>
		 */
		this.index = -1;

		/**
		 * Indicates whether the {@link Token//EOF} token has been fetched from
		 * {@link //tokenSource} and added to {@link //tokens}. This field improves
		 * performance for the following cases:
		 *
		 * <ul>
		 * <li>{@link //consume}: The lookahead check in {@link //consume} to
		 * prevent
		 * consuming the EOF symbol is optimized by checking the values of
		 * {@link //fetchedEOF} and {@link //p} instead of calling {@link
		 * //LA}.</li>
		 * <li>{@link //fetch}: The check to prevent adding multiple EOF symbols
		 * into
		 * {@link //tokens} is trivial with this field.</li>
		 * <ul>
		 */
		this.fetchedEOF = false;
	}

	mark() {
		return 0;
	}

	release(marker) {
		// no resources to release
	}

	reset() {
		this.seek(0);
	}

	seek(index) {
		this.lazyInit();
		this.index = this.adjustSeekIndex(index);
	}

	get(index) {
		this.lazyInit();
		return this.tokens[index];
	}

	consume() {
		let skipEofCheck = false;
		if (this.index >= 0) {
			if (this.fetchedEOF) {
				// the last token in tokens is EOF. skip check if p indexes any
				// fetched token except the last.
				skipEofCheck = this.index < this.tokens.length - 1;
			} else {
				// no EOF token in tokens. skip check if p indexes a fetched token.
				skipEofCheck = this.index < this.tokens.length;
			}
		} else {
			// not yet initialized
			skipEofCheck = false;
		}
		if (!skipEofCheck && this.LA(1) === Token$e.EOF) {
			throw "cannot consume EOF";
		}
		if (this.sync(this.index + 1)) {
			this.index = this.adjustSeekIndex(this.index + 1);
		}
	}

	/**
	 * Make sure index {@code i} in tokens has a token.
	 *
	 * @return {Boolean} {@code true} if a token is located at index {@code i}, otherwise
	 * {@code false}.
	 * @see //get(int i)
	 */
	sync(i) {
		const n = i - this.tokens.length + 1; // how many more elements we need?
		if (n > 0) {
			const fetched = this.fetch(n);
			return fetched >= n;
		}
		return true;
	}

	/**
	 * Add {@code n} elements to buffer.
	 *
	 * @return {Number} The actual number of elements added to the buffer.
	 */
	fetch(n) {
		if (this.fetchedEOF) {
			return 0;
		}
		for (let i = 0; i < n; i++) {
			const t = this.tokenSource.nextToken();
			t.tokenIndex = this.tokens.length;
			this.tokens.push(t);
			if (t.type === Token$e.EOF) {
				this.fetchedEOF = true;
				return i + 1;
			}
		}
		return n;
	}

// Get all tokens from start..stop inclusively///
	getTokens(start, stop, types) {
		if (types === undefined) {
			types = null;
		}
		if (start < 0 || stop < 0) {
			return null;
		}
		this.lazyInit();
		const subset = [];
		if (stop >= this.tokens.length) {
			stop = this.tokens.length - 1;
		}
		for (let i = start; i < stop; i++) {
			const t = this.tokens[i];
			if (t.type === Token$e.EOF) {
				break;
			}
			if (types === null || types.contains(t.type)) {
				subset.push(t);
			}
		}
		return subset;
	}

	LA(i) {
		return this.LT(i).type;
	}

	LB(k) {
		if (this.index - k < 0) {
			return null;
		}
		return this.tokens[this.index - k];
	}

	LT(k) {
		this.lazyInit();
		if (k === 0) {
			return null;
		}
		if (k < 0) {
			return this.LB(-k);
		}
		const i = this.index + k - 1;
		this.sync(i);
		if (i >= this.tokens.length) { // return EOF token
			// EOF must be last token
			return this.tokens[this.tokens.length - 1];
		}
		return this.tokens[i];
	}

	/**
	 * Allowed derived classes to modify the behavior of operations which change
	 * the current stream position by adjusting the target token index of a seek
	 * operation. The default implementation simply returns {@code i}. If an
	 * exception is thrown in this method, the current stream index should not be
	 * changed.
	 *
	 * <p>For example, {@link CommonTokenStream} overrides this method to ensure
	 * that
	 * the seek target is always an on-channel token.</p>
	 *
	 * @param {Number} i The target token index.
	 * @return {Number} The adjusted target token index.
	 */
	adjustSeekIndex(i) {
		return i;
	}

	lazyInit() {
		if (this.index === -1) {
			this.setup();
		}
	}

	setup() {
		this.sync(0);
		this.index = this.adjustSeekIndex(0);
	}

// Reset this token stream by setting its token source.///
	setTokenSource(tokenSource) {
		this.tokenSource = tokenSource;
		this.tokens = [];
		this.index = -1;
		this.fetchedEOF = false;
	}

	/**
	 * Given a starting index, return the index of the next token on channel.
	 * Return i if tokens[i] is on channel. Return -1 if there are no tokens
	 * on channel between i and EOF.
	 */
	nextTokenOnChannel(i, channel) {
		this.sync(i);
		if (i >= this.tokens.length) {
			return -1;
		}
		let token = this.tokens[i];
		while (token.channel !== this.channel) {
			if (token.type === Token$e.EOF) {
				return -1;
			}
			i += 1;
			this.sync(i);
			token = this.tokens[i];
		}
		return i;
	}

	/**
	 * Given a starting index, return the index of the previous token on channel.
	 * Return i if tokens[i] is on channel. Return -1 if there are no tokens
	 * on channel between i and 0.
	 */
	previousTokenOnChannel(i, channel) {
		while (i >= 0 && this.tokens[i].channel !== channel) {
			i -= 1;
		}
		return i;
	}

	/**
	 * Collect all tokens on specified channel to the right of
	 * the current token up until we see a token on DEFAULT_TOKEN_CHANNEL or
	 * EOF. If channel is -1, find any non default channel token.
	 */
	getHiddenTokensToRight(tokenIndex,
			channel) {
		if (channel === undefined) {
			channel = -1;
		}
		this.lazyInit();
		if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
			throw "" + tokenIndex + " not in 0.." + this.tokens.length - 1;
		}
		const nextOnChannel = this.nextTokenOnChannel(tokenIndex + 1, Lexer_1.DEFAULT_TOKEN_CHANNEL);
		const from_ = tokenIndex + 1;
		// if none onchannel to right, nextOnChannel=-1 so set to = last token
		const to = nextOnChannel === -1 ? this.tokens.length - 1 : nextOnChannel;
		return this.filterForChannel(from_, to, channel);
	}

	/**
	 * Collect all tokens on specified channel to the left of
	 * the current token up until we see a token on DEFAULT_TOKEN_CHANNEL.
	 * If channel is -1, find any non default channel token.
	 */
	getHiddenTokensToLeft(tokenIndex,
			channel) {
		if (channel === undefined) {
			channel = -1;
		}
		this.lazyInit();
		if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
			throw "" + tokenIndex + " not in 0.." + this.tokens.length - 1;
		}
		const prevOnChannel = this.previousTokenOnChannel(tokenIndex - 1, Lexer_1.DEFAULT_TOKEN_CHANNEL);
		if (prevOnChannel === tokenIndex - 1) {
			return null;
		}
		// if none on channel to left, prevOnChannel=-1 then from=0
		const from_ = prevOnChannel + 1;
		const to = tokenIndex - 1;
		return this.filterForChannel(from_, to, channel);
	}

	filterForChannel(left, right, channel) {
		const hidden = [];
		for (let i = left; i < right + 1; i++) {
			const t = this.tokens[i];
			if (channel === -1) {
				if (t.channel !== Lexer_1.DEFAULT_TOKEN_CHANNEL) {
					hidden.push(t);
				}
			} else if (t.channel === channel) {
				hidden.push(t);
			}
		}
		if (hidden.length === 0) {
			return null;
		}
		return hidden;
	}

	getSourceName() {
		return this.tokenSource.getSourceName();
	}

// Get the text of all tokens in this buffer.///
	getText(interval) {
		this.lazyInit();
		this.fill();
		if (interval === undefined || interval === null) {
			interval = new Interval$6(0, this.tokens.length - 1);
		}
		let start = interval.start;
		if (start instanceof Token$e) {
			start = start.tokenIndex;
		}
		let stop = interval.stop;
		if (stop instanceof Token$e) {
			stop = stop.tokenIndex;
		}
		if (start === null || stop === null || start < 0 || stop < 0) {
			return "";
		}
		if (stop >= this.tokens.length) {
			stop = this.tokens.length - 1;
		}
		let s = "";
		for (let i = start; i < stop + 1; i++) {
			const t = this.tokens[i];
			if (t.type === Token$e.EOF) {
				break;
			}
			s = s + t.text;
		}
		return s;
	}

// Get all tokens from lexer until EOF///
	fill() {
		this.lazyInit();
		while (this.fetch(1000) === 1000) {
			continue;
		}
	}
}


var BufferedTokenStream_1 = BufferedTokenStream;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const Token$f = Token_1.Token;


/**
 * This class extends {@link BufferedTokenStream} with functionality to filter
 * token streams to tokens on a particular channel (tokens where
 * {@link Token//getChannel} returns a particular value).
 *
 * <p>
 * This token stream provides access to all tokens by index or when calling
 * methods like {@link //getText}. The channel filtering is only used for code
 * accessing tokens via the lookahead methods {@link //LA}, {@link //LT}, and
 * {@link //LB}.</p>
 *
 * <p>
 * By default, tokens are placed on the default channel
 * ({@link Token//DEFAULT_CHANNEL}), but may be reassigned by using the
 * {@code ->channel(HIDDEN)} lexer command, or by using an embedded action to
 * call {@link Lexer//setChannel}.
 * </p>
 *
 * <p>
 * Note: lexer rules which use the {@code ->skip} lexer command or call
 * {@link Lexer//skip} do not produce tokens at all, so input text matched by
 * such a rule will not be available as part of the token stream, regardless of
 * channel.</p>
 */
class CommonTokenStream extends BufferedTokenStream_1 {
    constructor(lexer, channel) {
        super(lexer);
        this.channel = channel===undefined ? Token$f.DEFAULT_CHANNEL : channel;
    }

    adjustSeekIndex(i) {
        return this.nextTokenOnChannel(i, this.channel);
    }

    LB(k) {
        if (k===0 || this.index-k<0) {
            return null;
        }
        let i = this.index;
        let n = 1;
        // find k good tokens looking backwards
        while (n <= k) {
            // skip off-channel tokens
            i = this.previousTokenOnChannel(i - 1, this.channel);
            n += 1;
        }
        if (i < 0) {
            return null;
        }
        return this.tokens[i];
    }

    LT(k) {
        this.lazyInit();
        if (k === 0) {
            return null;
        }
        if (k < 0) {
            return this.LB(-k);
        }
        let i = this.index;
        let n = 1; // we know tokens[pos] is a good one
        // find k good tokens
        while (n < k) {
            // skip off-channel tokens, but make sure to not look past EOF
            if (this.sync(i + 1)) {
                i = this.nextTokenOnChannel(i + 1, this.channel);
            }
            n += 1;
        }
        return this.tokens[i];
    }

    // Count EOF just once.
    getNumberOfOnChannelTokens() {
        let n = 0;
        this.fill();
        for (let i =0; i< this.tokens.length;i++) {
            const t = this.tokens[i];
            if( t.channel===this.channel) {
                n += 1;
            }
            if( t.type===Token$f.EOF) {
                break;
            }
        }
        return n;
    }
}

var CommonTokenStream_1 = CommonTokenStream;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

const {Token: Token$g} = Token_1;
const {ParseTreeListener: ParseTreeListener$1, TerminalNode: TerminalNode$3, ErrorNode: ErrorNode$2} = Tree_1;

const {DefaultErrorStrategy: DefaultErrorStrategy$2} = ErrorStrategy_1;




class TraceListener extends ParseTreeListener$1 {
	constructor(parser) {
		super();
		this.parser = parser;
	}

	enterEveryRule(ctx) {
		console.log("enter   " + this.parser.ruleNames[ctx.ruleIndex] + ", LT(1)=" + this.parser._input.LT(1).text);
	}

	visitTerminal(node) {
		console.log("consume " + node.symbol + " rule " + this.parser.ruleNames[this.parser._ctx.ruleIndex]);
	}

	exitEveryRule(ctx) {
		console.log("exit    " + this.parser.ruleNames[ctx.ruleIndex] + ", LT(1)=" + this.parser._input.LT(1).text);
	}
}

class Parser extends Recognizer_1 {
	/**
	 * this is all the parsing support code essentially; most of it is error
	 * recovery stuff.
	 */
	constructor(input) {
		super();
		// The input stream.
		this._input = null;
		/**
		 * The error handling strategy for the parser. The default value is a new
		 * instance of {@link DefaultErrorStrategy}.
		 */
		this._errHandler = new DefaultErrorStrategy$2();
		this._precedenceStack = [];
		this._precedenceStack.push(0);
		/**
		 * The {@link ParserRuleContext} object for the currently executing rule.
		 * this is always non-null during the parsing process.
		 */
		this._ctx = null;
		/**
		 * Specifies whether or not the parser should construct a parse tree during
		 * the parsing process. The default value is {@code true}.
		 */
		this.buildParseTrees = true;
		/**
		 * When {@link //setTrace}{@code (true)} is called, a reference to the
		 * {@link TraceListener} is stored here so it can be easily removed in a
		 * later call to {@link //setTrace}{@code (false)}. The listener itself is
		 * implemented as a parser listener so this field is not directly used by
		 * other parser methods.
		 */
		this._tracer = null;
		/**
		 * The list of {@link ParseTreeListener} listeners registered to receive
		 * events during the parse.
		 */
		this._parseListeners = null;
		/**
		 * The number of syntax errors reported during parsing. this value is
		 * incremented each time {@link //notifyErrorListeners} is called.
		 */
		this._syntaxErrors = 0;
		this.setInputStream(input);
	}

	// reset the parser's state
	reset() {
		if (this._input !== null) {
			this._input.seek(0);
		}
		this._errHandler.reset(this);
		this._ctx = null;
		this._syntaxErrors = 0;
		this.setTrace(false);
		this._precedenceStack = [];
		this._precedenceStack.push(0);
		if (this._interp !== null) {
			this._interp.reset();
		}
	}

	/**
	 * Match current input symbol against {@code ttype}. If the symbol type
	 * matches, {@link ANTLRErrorStrategy//reportMatch} and {@link //consume} are
	 * called to complete the match process.
	 *
	 * <p>If the symbol type does not match,
	 * {@link ANTLRErrorStrategy//recoverInline} is called on the current error
	 * strategy to attempt recovery. If {@link //getBuildParseTree} is
	 * {@code true} and the token index of the symbol returned by
	 * {@link ANTLRErrorStrategy//recoverInline} is -1, the symbol is added to
	 * the parse tree by calling {@link ParserRuleContext//addErrorNode}.</p>
	 *
	 * @param ttype the token type to match
	 * @return the matched symbol
	 * @throws RecognitionException if the current input symbol did not match
	 * {@code ttype} and the error strategy could not recover from the
	 * mismatched symbol
	 */
	match(ttype) {
		let t = this.getCurrentToken();
		if (t.type === ttype) {
			this._errHandler.reportMatch(this);
			this.consume();
		} else {
			t = this._errHandler.recoverInline(this);
			if (this.buildParseTrees && t.tokenIndex === -1) {
				// we must have conjured up a new token during single token
				// insertion
				// if it's not the current symbol
				this._ctx.addErrorNode(t);
			}
		}
		return t;
	}

	/**
	 * Match current input symbol as a wildcard. If the symbol type matches
	 * (i.e. has a value greater than 0), {@link ANTLRErrorStrategy//reportMatch}
	 * and {@link //consume} are called to complete the match process.
	 *
	 * <p>If the symbol type does not match,
	 * {@link ANTLRErrorStrategy//recoverInline} is called on the current error
	 * strategy to attempt recovery. If {@link //getBuildParseTree} is
	 * {@code true} and the token index of the symbol returned by
	 * {@link ANTLRErrorStrategy//recoverInline} is -1, the symbol is added to
	 * the parse tree by calling {@link ParserRuleContext//addErrorNode}.</p>
	 *
	 * @return the matched symbol
	 * @throws RecognitionException if the current input symbol did not match
	 * a wildcard and the error strategy could not recover from the mismatched
	 * symbol
	 */
	matchWildcard() {
		let t = this.getCurrentToken();
		if (t.type > 0) {
			this._errHandler.reportMatch(this);
			this.consume();
		} else {
			t = this._errHandler.recoverInline(this);
			if (this._buildParseTrees && t.tokenIndex === -1) {
				// we must have conjured up a new token during single token
				// insertion
				// if it's not the current symbol
				this._ctx.addErrorNode(t);
			}
		}
		return t;
	}

	getParseListeners() {
		return this._parseListeners || [];
	}

	/**
	 * Registers {@code listener} to receive events during the parsing process.
	 *
	 * <p>To support output-preserving grammar transformations (including but not
	 * limited to left-recursion removal, automated left-factoring, and
	 * optimized code generation), calls to listener methods during the parse
	 * may differ substantially from calls made by
	 * {@link ParseTreeWalker//DEFAULT} used after the parse is complete. In
	 * particular, rule entry and exit events may occur in a different order
	 * during the parse than after the parser. In addition, calls to certain
	 * rule entry methods may be omitted.</p>
	 *
	 * <p>With the following specific exceptions, calls to listener events are
	 * <em>deterministic</em>, i.e. for identical input the calls to listener
	 * methods will be the same.</p>
	 *
	 * <ul>
	 * <li>Alterations to the grammar used to generate code may change the
	 * behavior of the listener calls.</li>
	 * <li>Alterations to the command line options passed to ANTLR 4 when
	 * generating the parser may change the behavior of the listener calls.</li>
	 * <li>Changing the version of the ANTLR Tool used to generate the parser
	 * may change the behavior of the listener calls.</li>
	 * </ul>
	 *
	 * @param listener the listener to add
	 *
	 * @throws NullPointerException if {@code} listener is {@code null}
	 */
	addParseListener(listener) {
		if (listener === null) {
			throw "listener";
		}
		if (this._parseListeners === null) {
			this._parseListeners = [];
		}
		this._parseListeners.push(listener);
	}

	/**
	 * Remove {@code listener} from the list of parse listeners.
	 *
	 * <p>If {@code listener} is {@code null} or has not been added as a parse
	 * listener, this method does nothing.</p>
	 * @param listener the listener to remove
	 */
	removeParseListener(listener) {
		if (this._parseListeners !== null) {
			const idx = this._parseListeners.indexOf(listener);
			if (idx >= 0) {
				this._parseListeners.splice(idx, 1);
			}
			if (this._parseListeners.length === 0) {
				this._parseListeners = null;
			}
		}
	}

// Remove all parse listeners.
	removeParseListeners() {
		this._parseListeners = null;
	}

// Notify any parse listeners of an enter rule event.
	triggerEnterRuleEvent() {
		if (this._parseListeners !== null) {
			const ctx = this._ctx;
			this._parseListeners.map(function(listener) {
				listener.enterEveryRule(ctx);
				ctx.enterRule(listener);
			});
		}
	}

	/**
	 * Notify any parse listeners of an exit rule event.
	 * @see //addParseListener
	 */
	triggerExitRuleEvent() {
		if (this._parseListeners !== null) {
			// reverse order walk of listeners
			const ctx = this._ctx;
			this._parseListeners.slice(0).reverse().map(function(listener) {
				ctx.exitRule(listener);
				listener.exitEveryRule(ctx);
			});
		}
	}

	getTokenFactory() {
		return this._input.tokenSource._factory;
	}

	// Tell our token source and error strategy about a new way to create tokens.
	setTokenFactory(factory) {
		this._input.tokenSource._factory = factory;
	}

	/**
	 * The ATN with bypass alternatives is expensive to create so we create it
	 * lazily.
	 *
	 * @throws UnsupportedOperationException if the current parser does not
	 * implement the {@link //getSerializedATN()} method.
	 */
	getATNWithBypassAlts() {
		const serializedAtn = this.getSerializedATN();
		if (serializedAtn === null) {
			throw "The current parser does not support an ATN with bypass alternatives.";
		}
		let result = this.bypassAltsAtnCache[serializedAtn];
		if (result === null) {
			const deserializationOptions = new ATNDeserializationOptions_1();
			deserializationOptions.generateRuleBypassTransitions = true;
			result = new ATNDeserializer_1(deserializationOptions)
					.deserialize(serializedAtn);
			this.bypassAltsAtnCache[serializedAtn] = result;
		}
		return result;
	}

	/**
	 * The preferred method of getting a tree pattern. For example, here's a
	 * sample use:
	 *
	 * <pre>
	 * ParseTree t = parser.expr();
	 * ParseTreePattern p = parser.compileParseTreePattern("&lt;ID&gt;+0",
	 * MyParser.RULE_expr);
	 * ParseTreeMatch m = p.match(t);
	 * String id = m.get("ID");
	 * </pre>
	 */
	compileParseTreePattern(pattern, patternRuleIndex, lexer) {
		lexer = lexer || null;
		if (lexer === null) {
			if (this.getTokenStream() !== null) {
				const tokenSource = this.getTokenStream().tokenSource;
				if (tokenSource instanceof Lexer_1) {
					lexer = tokenSource;
				}
			}
		}
		if (lexer === null) {
			throw "Parser can't discover a lexer to use";
		}
		const m = new ParseTreePatternMatcher(lexer, this);
		return m.compile(pattern, patternRuleIndex);
	}

	getInputStream() {
		return this.getTokenStream();
	}

	setInputStream(input) {
		this.setTokenStream(input);
	}

	getTokenStream() {
		return this._input;
	}

	// Set the token stream and reset the parser.
	setTokenStream(input) {
		this._input = null;
		this.reset();
		this._input = input;
	}

	/**
	 * Match needs to return the current input symbol, which gets put
	 * into the label for the associated token ref; e.g., x=ID.
	 */
	getCurrentToken() {
		return this._input.LT(1);
	}

	notifyErrorListeners(msg, offendingToken, err) {
		offendingToken = offendingToken || null;
		err = err || null;
		if (offendingToken === null) {
			offendingToken = this.getCurrentToken();
		}
		this._syntaxErrors += 1;
		const line = offendingToken.line;
		const column = offendingToken.column;
		const listener = this.getErrorListenerDispatch();
		listener.syntaxError(this, offendingToken, line, column, msg, err);
	}

	/**
	 * Consume and return the {@linkplain //getCurrentToken current symbol}.
	 *
	 * <p>E.g., given the following input with {@code A} being the current
	 * lookahead symbol, this function moves the cursor to {@code B} and returns
	 * {@code A}.</p>
	 *
	 * <pre>
	 * A B
	 * ^
	 * </pre>
	 *
	 * If the parser is not in error recovery mode, the consumed symbol is added
	 * to the parse tree using {@link ParserRuleContext//addChild(Token)}, and
	 * {@link ParseTreeListener//visitTerminal} is called on any parse listeners.
	 * If the parser <em>is</em> in error recovery mode, the consumed symbol is
	 * added to the parse tree using
	 * {@link ParserRuleContext//addErrorNode(Token)}, and
	 * {@link ParseTreeListener//visitErrorNode} is called on any parse
	 * listeners.
	 */
	consume() {
		const o = this.getCurrentToken();
		if (o.type !== Token$g.EOF) {
			this.getInputStream().consume();
		}
		const hasListener = this._parseListeners !== null && this._parseListeners.length > 0;
		if (this.buildParseTrees || hasListener) {
			let node;
			if (this._errHandler.inErrorRecoveryMode(this)) {
				node = this._ctx.addErrorNode(o);
			} else {
				node = this._ctx.addTokenNode(o);
			}
			node.invokingState = this.state;
			if (hasListener) {
				this._parseListeners.map(function(listener) {
					if (node instanceof ErrorNode$2 || (node.isErrorNode !== undefined && node.isErrorNode())) {
						listener.visitErrorNode(node);
					} else if (node instanceof TerminalNode$3) {
						listener.visitTerminal(node);
					}
				});
			}
		}
		return o;
	}

	addContextToParseTree() {
		// add current context to parent if we have a parent
		if (this._ctx.parentCtx !== null) {
			this._ctx.parentCtx.addChild(this._ctx);
		}
	}

	/**
	 * Always called by generated parsers upon entry to a rule. Access field
	 * {@link //_ctx} get the current context.
	 */
	enterRule(localctx, state, ruleIndex) {
		this.state = state;
		this._ctx = localctx;
		this._ctx.start = this._input.LT(1);
		if (this.buildParseTrees) {
			this.addContextToParseTree();
		}
		if (this._parseListeners !== null) {
			this.triggerEnterRuleEvent();
		}
	}

	exitRule() {
		this._ctx.stop = this._input.LT(-1);
		// trigger event on _ctx, before it reverts to parent
		if (this._parseListeners !== null) {
			this.triggerExitRuleEvent();
		}
		this.state = this._ctx.invokingState;
		this._ctx = this._ctx.parentCtx;
	}

	enterOuterAlt(localctx, altNum) {
		localctx.setAltNumber(altNum);
		// if we have new localctx, make sure we replace existing ctx
		// that is previous child of parse tree
		if (this.buildParseTrees && this._ctx !== localctx) {
			if (this._ctx.parentCtx !== null) {
				this._ctx.parentCtx.removeLastChild();
				this._ctx.parentCtx.addChild(localctx);
			}
		}
		this._ctx = localctx;
	}

	/**
	 * Get the precedence level for the top-most precedence rule.
	 *
	 * @return The precedence level for the top-most precedence rule, or -1 if
	 * the parser context is not nested within a precedence rule.
	 */
	getPrecedence() {
		if (this._precedenceStack.length === 0) {
			return -1;
		} else {
			return this._precedenceStack[this._precedenceStack.length-1];
		}
	}

	enterRecursionRule(localctx, state, ruleIndex, precedence) {
	   this.state = state;
	   this._precedenceStack.push(precedence);
	   this._ctx = localctx;
	   this._ctx.start = this._input.LT(1);
	   if (this._parseListeners !== null) {
		   this.triggerEnterRuleEvent(); // simulates rule entry for
		   									// left-recursive rules
	   }
   }

	// Like {@link //enterRule} but for recursive rules.
	pushNewRecursionContext(localctx, state, ruleIndex) {
		const previous = this._ctx;
		previous.parentCtx = localctx;
		previous.invokingState = state;
		previous.stop = this._input.LT(-1);

		this._ctx = localctx;
		this._ctx.start = previous.start;
		if (this.buildParseTrees) {
			this._ctx.addChild(previous);
		}
		if (this._parseListeners !== null) {
			this.triggerEnterRuleEvent(); // simulates rule entry for
											// left-recursive rules
		}
	}

	unrollRecursionContexts(parentCtx) {
		this._precedenceStack.pop();
		this._ctx.stop = this._input.LT(-1);
		const retCtx = this._ctx; // save current ctx (return value)
		// unroll so _ctx is as it was before call to recursive method
		if (this._parseListeners !== null) {
			while (this._ctx !== parentCtx) {
				this.triggerExitRuleEvent();
				this._ctx = this._ctx.parentCtx;
			}
		} else {
			this._ctx = parentCtx;
		}
		// hook into tree
		retCtx.parentCtx = parentCtx;
		if (this.buildParseTrees && parentCtx !== null) {
			// add return ctx into invoking rule's tree
			parentCtx.addChild(retCtx);
		}
	}

	getInvokingContext(ruleIndex) {
		let ctx = this._ctx;
		while (ctx !== null) {
			if (ctx.ruleIndex === ruleIndex) {
				return ctx;
			}
			ctx = ctx.parentCtx;
		}
		return null;
	}

	precpred(localctx, precedence) {
		return precedence >= this._precedenceStack[this._precedenceStack.length-1];
	}

	inContext(context) {
		// TODO: useful in parser?
		return false;
	}

	/**
	 * Checks whether or not {@code symbol} can follow the current state in the
	 * ATN. The behavior of this method is equivalent to the following, but is
	 * implemented such that the complete context-sensitive follow set does not
	 * need to be explicitly constructed.
	 *
	 * <pre>
	 * return getExpectedTokens().contains(symbol);
	 * </pre>
	 *
	 * @param symbol the symbol type to check
	 * @return {@code true} if {@code symbol} can follow the current state in
	 * the ATN, otherwise {@code false}.
	 */
	isExpectedToken(symbol) {
		const atn = this._interp.atn;
		let ctx = this._ctx;
		const s = atn.states[this.state];
		let following = atn.nextTokens(s);
		if (following.contains(symbol)) {
			return true;
		}
		if (!following.contains(Token$g.EPSILON)) {
			return false;
		}
		while (ctx !== null && ctx.invokingState >= 0 && following.contains(Token$g.EPSILON)) {
			const invokingState = atn.states[ctx.invokingState];
			const rt = invokingState.transitions[0];
			following = atn.nextTokens(rt.followState);
			if (following.contains(symbol)) {
				return true;
			}
			ctx = ctx.parentCtx;
		}
		if (following.contains(Token$g.EPSILON) && symbol === Token$g.EOF) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Computes the set of input symbols which could follow the current parser
	 * state and context, as given by {@link //getState} and {@link //getContext},
	 * respectively.
	 *
	 * @see ATN//getExpectedTokens(int, RuleContext)
	 */
	getExpectedTokens() {
		return this._interp.atn.getExpectedTokens(this.state, this._ctx);
	}

	getExpectedTokensWithinCurrentRule() {
		const atn = this._interp.atn;
		const s = atn.states[this.state];
		return atn.nextTokens(s);
	}

	// Get a rule's index (i.e., {@code RULE_ruleName} field) or -1 if not found.
	getRuleIndex(ruleName) {
		const ruleIndex = this.getRuleIndexMap()[ruleName];
		if (ruleIndex !== null) {
			return ruleIndex;
		} else {
			return -1;
		}
	}

	/**
	 * Return List&lt;String&gt; of the rule names in your parser instance
	 * leading up to a call to the current rule. You could override if
	 * you want more details such as the file/line info of where
	 * in the ATN a rule is invoked.
	 *
	 * this is very useful for error messages.
	 */
	getRuleInvocationStack(p) {
		p = p || null;
		if (p === null) {
			p = this._ctx;
		}
		const stack = [];
		while (p !== null) {
			// compute what follows who invoked us
			const ruleIndex = p.ruleIndex;
			if (ruleIndex < 0) {
				stack.push("n/a");
			} else {
				stack.push(this.ruleNames[ruleIndex]);
			}
			p = p.parentCtx;
		}
		return stack;
	}

	// For debugging and other purposes.
	getDFAStrings() {
		return this._interp.decisionToDFA.toString();
	}

	// For debugging and other purposes.
	dumpDFA() {
		let seenOne = false;
		for (let i = 0; i < this._interp.decisionToDFA.length; i++) {
			const dfa = this._interp.decisionToDFA[i];
			if (dfa.states.length > 0) {
				if (seenOne) {
					console.log();
				}
				this.printer.println("Decision " + dfa.decision + ":");
				this.printer.print(dfa.toString(this.literalNames, this.symbolicNames));
				seenOne = true;
			}
		}
	}

	/*
		"			printer = function() {\r\n" +
		"				this.println = function(s) { document.getElementById('output') += s + '\\n'; }\r\n" +
		"				this.print = function(s) { document.getElementById('output') += s; }\r\n" +
		"			};\r\n" +
		*/
	getSourceName() {
		return this._input.sourceName;
	}

	/**
	 * During a parse is sometimes useful to listen in on the rule entry and exit
	 * events as well as token matches. this is for quick and dirty debugging.
	 */
	setTrace(trace) {
		if (!trace) {
			this.removeParseListener(this._tracer);
			this._tracer = null;
		} else {
			if (this._tracer !== null) {
				this.removeParseListener(this._tracer);
			}
			this._tracer = new TraceListener(this);
			this.addParseListener(this._tracer);
		}
	}
}

/**
 * this field maps from the serialized ATN string to the deserialized {@link
 * ATN} with
 * bypass alternatives.
 *
 * @see ATNDeserializationOptions//isGenerateRuleBypassTransitions()
 */
Parser.bypassAltsAtnCache = {};

var Parser_1 = Parser;

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */

var atn$1 = atn;
var codepointat$1 = require$$1;
var dfa$1 = dfa;
var fromcodepoint$1 = require$$3;
var tree$1 = tree;
var error$1 = error;
var Token$h = Token_1.Token;
var CharStreams$1 = CharStreams_1;
var CommonToken$2 = Token_1.CommonToken;
var InputStream$2 = InputStream_1;
var FileStream$1 = FileStream_1;
var CommonTokenStream$1 = CommonTokenStream_1;
var Lexer$1 = Lexer_1;
var Parser$1 = Parser_1;

var PredictionContextCache$1 = PredictionContext_1.PredictionContextCache;
var ParserRuleContext$1 = ParserRuleContext_1;
var Interval$7 = IntervalSet_1.Interval;
var IntervalSet$6 = IntervalSet_1.IntervalSet;
var Utils$1 = Utils;
var LL1Analyzer$1 = LL1Analyzer_1.LL1Analyzer;

var antlr4 = {
	atn: atn$1,
	codepointat: codepointat$1,
	dfa: dfa$1,
	fromcodepoint: fromcodepoint$1,
	tree: tree$1,
	error: error$1,
	Token: Token$h,
	CharStreams: CharStreams$1,
	CommonToken: CommonToken$2,
	InputStream: InputStream$2,
	FileStream: FileStream$1,
	CommonTokenStream: CommonTokenStream$1,
	Lexer: Lexer$1,
	Parser: Parser$1,
	PredictionContextCache: PredictionContextCache$1,
	ParserRuleContext: ParserRuleContext$1,
	Interval: Interval$7,
	IntervalSet: IntervalSet$6,
	Utils: Utils$1,
	LL1Analyzer: LL1Analyzer$1
};

var serializedATN = ["\x03\u608B\uA72A\u8133\uB9ED\u417C\u3BE7\u7786", "\u5964\x02\x85\u072B\b\x01\x04\x02\t\x02\x04\x03\t\x03", "\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07", "\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\x0B\t\x0B\x04", "\f\t\f\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10", "\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04\x13\t\x13", "\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17", "\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A", "\x04\x1B\t\x1B\x04\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E", "\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#", "\t#\x04$\t$\x04%\t%\x04&\t&\x04'\t'\x04(\t(\x04)\t)\x04", "*\t*\x04+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x04", "1\t1\x042\t2\x043\t3\x044\t4\x045\t5\x046\t6\x047\t7\x04", "8\t8\x049\t9\x04:\t:\x04;\t;\x04<\t<\x04=\t=\x04>\t>\x04", "?\t?\x04@\t@\x04A\tA\x04B\tB\x04C\tC\x04D\tD\x04E\tE\x04", "F\tF\x04G\tG\x04H\tH\x04I\tI\x04J\tJ\x04K\tK\x04L\tL\x04", "M\tM\x04N\tN\x04O\tO\x04P\tP\x04Q\tQ\x04R\tR\x04S\tS\x04", "T\tT\x04U\tU\x04V\tV\x04W\tW\x04X\tX\x04Y\tY\x04Z\tZ\x04", "[\t[\x04\\\t\\\x04]\t]\x04^\t^\x04_\t_\x04`\t`\x04a\ta\x04", "b\tb\x04c\tc\x04d\td\x04e\te\x04f\tf\x04g\tg\x04h\th\x04", "i\ti\x04j\tj\x04k\tk\x04l\tl\x04m\tm\x04n\tn\x04o\to\x04", "p\tp\x04q\tq\x04r\tr\x04s\ts\x04t\tt\x04u\tu\x04v\tv\x04", "w\tw\x04x\tx\x04y\ty\x04z\tz\x04{\t{\x04|\t|\x04}\t}\x04", "~\t~\x04\x7F\t\x7F\x04\x80\t\x80\x04\x81\t\x81\x04", "\x82\t\x82\x04\x83\t\x83\x04\x84\t\x84\x04\x85\t", "\x85\x04\x86\t\x86\x04\x87\t\x87\x04\x88\t\x88\x04", "\x89\t\x89\x04\x8A\t\x8A\x04\x8B\t\x8B\x04\x8C\t", "\x8C\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x03", "\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03", "\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03", "\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03", "\n\x03\x0B\x03\x0B\x03\f\x03\f\x03\f\x03\r\x03\r\x03", "\r\x03\r\x03\r\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F", "\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10", "\x03\x11\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13", "\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13", "\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14", "\x03\x14\x03\x14\x03\x14\x03\x14\x03\x15\x03\x15", "\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15", "\x03\x15\x03\x15\x03\x16\x03\x16\x03\x16\x03\x16", "\x03\x16\x03\x16\x03\x16\x03\x16\x03\x17\x03\x17", "\x03\x17\x03\x18\x03\x18\x03\x19\x03\x19\x03\x1A", "\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1B", "\x03\x1B\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x03\x1C", "\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1D\x03\x1D", "\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D", "\x03\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E", "\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1F\x03\x1F", "\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03\x1F", "\x03 \x03 \x03 \x03 \x03 \x03 \x03!\x03!\x03!\x03", "!\x03!\x03\"\x03\"\x03#\x03#\x03$\x03$\x03$\x03$\x03", "$\x03$\x03$\x03$\x03%\x03%\x03&\x03&\x03&\x03&\x03", "&\x03&\x03&\x03&\x03'\x03'\x03'\x03(\x03(\x03(", "\x03(\x03(\x03(\x03(\x03)\x03)\x03)\x03)\x03)\x03", ")\x03)\x03)\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03", "*\x03*\x03+\x03+\x03+\x03,\x03,\x03,\x03,\x03,\x03", "-\x03-\x03-\x03-\x03.\x03.\x03.\x03.\x03.\x03.\x03", "/\x03/\x03/\x03/\x03/\x03/\x030\x030\x030\x030\x03", "0\x030\x030\x030\x030\x030\x031\x031\x031\x031\x03", "1\x031\x031\x031\x031\x032\x032\x032\x033\x033\x03", "3\x033\x033\x033\x033\x034\x034\x034\x034\x034\x03", "4\x035\x035\x035\x035\x035\x036\x036\x036\x036\x03", "7\x037\x037\x037\x037\x038\x038\x038\x038\x038\x03", "8\x038\x039\x039\x039\x039\x039\x03:\x03:\x03:\x03", ";\x03;\x03;\x03<\x03<\x03<\x03<\x03=\x03=\x03>\x03", ">\x03?\x03?\x03@\x03@\x03@\x03@\x03@\x03@\x03A\x03", "A\x03A\x03A\x03A\x03A\x03A\x03B\x03B\x03C\x03C\x03", "C\x03D\x03D\x03E\x03E\x03F\x03F\x03F\x03G\x03G\x03", "G\x03H\x03H\x03I\x03I\x03J\x03J\x03J\x03K\x03K\x03", "K\x03L\x03L\x03L\x03M\x03M\x03N\x03N\x03N\x03O\x03", "O\x03O\x03P\x03P\x03P\x03Q\x03Q\x03Q\x03Q\x03R\x03", "R\x03R\x03R\x03S\x03S\x03S\x03T\x03T\x03T\x03U\x03", "U\x03U\x03V\x03V\x03V\x03W\x03W\x03W\x03X\x03X\x03", "X\x03X\x03Y\x03Y\x03Y\x03Z\x03Z\x03Z\x03[\x03[\x03", "[\x03[\x03[\x03[\x03[\x03\\\x03\\\x03\\\x03\\\x03", "\\\x03]\x03]\x03]\x03]\x03]\x03]\x03]\x03]\x03^\x03", "^\x03^\x03_\x03_\x03_\x03_\x03_\x03_\x03_\x03_\x03", "_\x03`\x03`\x03`\x03`\x03`\x03`\x03`\x03`\x03`\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03a\x03", "a\x03a\x05a\u0378\na\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03", "b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x03b\x05b\u0451", "\nb\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03c\x03", "c\x05c\u052F\nc\x03d\x03d\x03d\x03d\x03d\x03d\x03d\x03", "d\x03d\x03d\x03d\x03d\x06d\u053D\nd\rd\x0Ed\u053E\x03", "d\x03d\x06d\u0543\nd\rd\x0Ed\u0544\x05d\u0547\nd\x03e\x03", "e\x03e\x03e\x03e\x03e\x03e\x03e\x03e\x03e\x03e\x03", "e\x03e\x03e\x06e\u0557\ne\re\x0Ee\u0558\x03e\x03e\x06", "e\u055D\ne\re\x0Ee\u055E\x05e\u0561\ne\x03f\x03f\x03f\x03", "f\x03f\x03f\x03f\x03f\x03f\x05f\u056C\nf\x03g\x03g\x05", "g\u0570\ng\x03g\x03g\x05g\u0574\ng\x03g\x03g\x05g\u0578", "\ng\x03h\x03h\x05h\u057C\nh\x03h\x07h\u057F\nh\fh\x0Eh\u0582", "\x0Bh\x03i\x03i\x03i\x03i\x03j\x03j\x05j\u058A\nj\x03", "j\x07j\u058D\nj\fj\x0Ej\u0590\x0Bj\x03k\x03k\x03k\x03", "k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03", "k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03", "k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03", "k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03", "k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03k\x03", "k\x03k\x03k\x05k\u05CA\nk\x03l\x03l\x03l\x03l\x03l\x03", "l\x05l\u05D2\nl\x03l\x03l\x03l\x05l\u05D7\nl\x03l\x05", "l\u05DA\nl\x03m\x03m\x03m\x03n\x03n\x03o\x03o\x03o\x03", "o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03", "o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03", "o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03", "o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03", "o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03", "o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03", "o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03", "o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03o\x03", "o\x03o\x03o\x03o\x03o\x05o\u0639\no\x03p\x03p\x03p\x03", "p\x03p\x03p\x03p\x03p\x03p\x03p\x03q\x03q\x03q\x03", "q\x03q\x03q\x03r\x03r\x03r\x03r\x03r\x03r\x03r\x03", "r\x03r\x03s\x03s\x03s\x03s\x03s\x03s\x03s\x03s\x03", "s\x03s\x03t\x03t\x03t\x03t\x03t\x03t\x03t\x03t\x03", "t\x03u\x03u\x03u\x03u\x03u\x03u\x03v\x03v\x03v\x03", "v\x03v\x03v\x03v\x03v\x03v\x03w\x03w\x03w\x03w\x03", "w\x03w\x03w\x03w\x03x\x03x\x03x\x03x\x03x\x03x\x03", "x\x03x\x03x\x03y\x03y\x03y\x03y\x03y\x03y\x03y\x03", "y\x03z\x03z\x03z\x03z\x03z\x03z\x03z\x03z\x03{\x03", "{\x03{\x03{\x03{\x03{\x03{\x03|\x03|\x03|\x03|\x03", "|\x03|\x03|\x03|\x03}\x03}\x03}\x03}\x03}\x03~\x03", "~\x03~\x03~\x03~\x03\x7F\x03\x7F\x03\x7F\x03\x7F", "\x03\x7F\x03\x80\x03\x80\x03\x80\x03\x80\x03\x80", "\x03\x80\x03\x80\x03\x80\x03\x80\x03\x80\x03\x80", "\x03\x80\x03\x81\x03\x81\x03\x81\x03\x81\x03\x81", "\x03\x81\x03\x81\x03\x81\x03\x81\x03\x82\x03\x82", "\x03\x82\x03\x82\x03\x82\x03\x82\x03\x82\x03\x82", "\x03\x83\x03\x83\x07\x83\u06D4\n\x83\f\x83\x0E\x83", "\u06D7\x0B\x83\x03\x84\x03\x84\x03\x85\x03\x85\x03", "\x86\x03\x86\x07\x86\u06DF\n\x86\f\x86\x0E\x86\u06E2", "\x0B\x86\x03\x86\x03\x86\x03\x86\x07\x86\u06E7\n", "\x86\f\x86\x0E\x86\u06EA\x0B\x86\x03\x86\x05\x86", "\u06ED\n\x86\x03\x87\x03\x87\x03\x87\x05\x87\u06F2", "\n\x87\x03\x88\x03\x88\x03\x88\x05\x88\u06F7\n\x88", "\x03\x89\x06\x89\u06FA\n\x89\r\x89\x0E\x89\u06FB\x03", "\x89\x03\x89\x06\x89\u0700\n\x89\r\x89\x0E\x89\u0701", "\x03\x89\x03\x89\x06\x89\u0706\n\x89\r\x89\x0E\x89", "\u0707\x05\x89\u070A\n\x89\x03\x8A\x06\x8A\u070D\n\x8A", "\r\x8A\x0E\x8A\u070E\x03\x8A\x03\x8A\x03\x8B\x03", "\x8B\x03\x8B\x03\x8B\x07\x8B\u0717\n\x8B\f\x8B\x0E", "\x8B\u071A\x0B\x8B\x03\x8B\x03\x8B\x03\x8B\x03\x8B", "\x03\x8B\x03\x8C\x03\x8C\x03\x8C\x03\x8C\x07\x8C", "\u0725\n\x8C\f\x8C\x0E\x8C\u0728\x0B\x8C\x03\x8C\x03", "\x8C\x03\u0718\x02\x8D\x03\x03\x05\x04\x07\x05\t", "\x06\x0B\x07\r\b\x0F\t\x11\n\x13\x0B\x15\f\x17\r\x19", "\x0E\x1B\x0F\x1D\x10\x1F\x11!\x12#\x13%\x14'\x15", ")\x16+\x17-\x18/\x191\x1A3\x1B5\x1C7\x1D9\x1E;\x1F", "= ?!A\"C#E$G%I&K\'M(O)Q*S+U,W-Y.[/]0_1a2c3e4g5i6k7m8o9q:s;u<w=y>{?}", "@\x7FA\x81B\x83C\x85D\x87E\x89F\x8BG\x8DH\x8FI\x91", "J\x93K\x95L\x97M\x99N\x9BO\x9DP\x9FQ\xA1R\xA3S\xA5", "T\xA7U\xA9V\xABW\xADX\xAFY\xB1Z\xB3[\xB5\\\xB7]\xB9", "^\xBB_\xBD`\xBFa\xC1b\xC3c\xC5d\xC7e\xC9f\xCBg\xCD", "h\xCF\x02\xD1i\xD3\x02\xD5j\xD7k\xD9\x02\xDB\x02", "\xDDl\xDFm\xE1n\xE3o\xE5p\xE7q\xE9r\xEBs\xEDt\xEF", "u\xF1v\xF3w\xF5x\xF7y\xF9z\xFB{\xFD|\xFF}\u0101~\u0103", "\x7F\u0105\x80\u0107\x02\u0109\x02\u010B\x81\u010D\x02\u010F", "\x02\u0111\x82\u0113\x83\u0115\x84\u0117\x85\x03\x02\f", "\x03\x022;\x04\x02GGgg\x04\x02ZZzz\x05\x022;CHch\x06", "\x02&&C\\aac|\x07\x02&&2;C\\aac|\x06\x02\f\f\x0F\x0F$", "$^^\x06\x02\f\f\x0F\x0F))^^\x05\x02\x0B\f\x0E\x0F", "\"\"\x04\x02\f\f\x0F\x0F\x02\u07BA\x02\x03\x03\x02", "\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02", "\x02\x02\x02\t\x03\x02\x02\x02\x02\x0B\x03\x02", "\x02\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03\x02", "\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02", "\x02\x02\x02\x15\x03\x02\x02\x02\x02\x17\x03\x02", "\x02\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02", "\x02\x02\x02\x1D\x03\x02\x02\x02\x02\x1F\x03\x02", "\x02\x02\x02!\x03\x02\x02\x02\x02#\x03\x02\x02", "\x02\x02%\x03\x02\x02\x02\x02'\x03\x02\x02\x02", "\x02)\x03\x02\x02\x02\x02+\x03\x02\x02\x02\x02", "-\x03\x02\x02\x02\x02/\x03\x02\x02\x02\x021\x03", "\x02\x02\x02\x023\x03\x02\x02\x02\x025\x03\x02", "\x02\x02\x027\x03\x02\x02\x02\x029\x03\x02\x02", "\x02\x02;\x03\x02\x02\x02\x02=\x03\x02\x02\x02", "\x02?\x03\x02\x02\x02\x02A\x03\x02\x02\x02\x02", "C\x03\x02\x02\x02\x02E\x03\x02\x02\x02\x02G\x03", "\x02\x02\x02\x02I\x03\x02\x02\x02\x02K\x03\x02", "\x02\x02\x02M\x03\x02\x02\x02\x02O\x03\x02\x02", "\x02\x02Q\x03\x02\x02\x02\x02S\x03\x02\x02\x02", "\x02U\x03\x02\x02\x02\x02W\x03\x02\x02\x02\x02", "Y\x03\x02\x02\x02\x02[\x03\x02\x02\x02\x02]\x03", "\x02\x02\x02\x02_\x03\x02\x02\x02\x02a\x03\x02", "\x02\x02\x02c\x03\x02\x02\x02\x02e\x03\x02\x02", "\x02\x02g\x03\x02\x02\x02\x02i\x03\x02\x02\x02", "\x02k\x03\x02\x02\x02\x02m\x03\x02\x02\x02\x02", "o\x03\x02\x02\x02\x02q\x03\x02\x02\x02\x02s\x03", "\x02\x02\x02\x02u\x03\x02\x02\x02\x02w\x03\x02", "\x02\x02\x02y\x03\x02\x02\x02\x02{\x03\x02\x02", "\x02\x02}\x03\x02\x02\x02\x02\x7F\x03\x02\x02", "\x02\x02\x81\x03\x02\x02\x02\x02\x83\x03\x02\x02", "\x02\x02\x85\x03\x02\x02\x02\x02\x87\x03\x02\x02", "\x02\x02\x89\x03\x02\x02\x02\x02\x8B\x03\x02\x02", "\x02\x02\x8D\x03\x02\x02\x02\x02\x8F\x03\x02\x02", "\x02\x02\x91\x03\x02\x02\x02\x02\x93\x03\x02\x02", "\x02\x02\x95\x03\x02\x02\x02\x02\x97\x03\x02\x02", "\x02\x02\x99\x03\x02\x02\x02\x02\x9B\x03\x02\x02", "\x02\x02\x9D\x03\x02\x02\x02\x02\x9F\x03\x02\x02", "\x02\x02\xA1\x03\x02\x02\x02\x02\xA3\x03\x02\x02", "\x02\x02\xA5\x03\x02\x02\x02\x02\xA7\x03\x02\x02", "\x02\x02\xA9\x03\x02\x02\x02\x02\xAB\x03\x02\x02", "\x02\x02\xAD\x03\x02\x02\x02\x02\xAF\x03\x02\x02", "\x02\x02\xB1\x03\x02\x02\x02\x02\xB3\x03\x02\x02", "\x02\x02\xB5\x03\x02\x02\x02\x02\xB7\x03\x02\x02", "\x02\x02\xB9\x03\x02\x02\x02\x02\xBB\x03\x02\x02", "\x02\x02\xBD\x03\x02\x02\x02\x02\xBF\x03\x02\x02", "\x02\x02\xC1\x03\x02\x02\x02\x02\xC3\x03\x02\x02", "\x02\x02\xC5\x03\x02\x02\x02\x02\xC7\x03\x02\x02", "\x02\x02\xC9\x03\x02\x02\x02\x02\xCB\x03\x02\x02", "\x02\x02\xCD\x03\x02\x02\x02\x02\xD1\x03\x02\x02", "\x02\x02\xD5\x03\x02\x02\x02\x02\xD7\x03\x02\x02", "\x02\x02\xDD\x03\x02\x02\x02\x02\xDF\x03\x02\x02", "\x02\x02\xE1\x03\x02\x02\x02\x02\xE3\x03\x02\x02", "\x02\x02\xE5\x03\x02\x02\x02\x02\xE7\x03\x02\x02", "\x02\x02\xE9\x03\x02\x02\x02\x02\xEB\x03\x02\x02", "\x02\x02\xED\x03\x02\x02\x02\x02\xEF\x03\x02\x02", "\x02\x02\xF1\x03\x02\x02\x02\x02\xF3\x03\x02\x02", "\x02\x02\xF5\x03\x02\x02\x02\x02\xF7\x03\x02\x02", "\x02\x02\xF9\x03\x02\x02\x02\x02\xFB\x03\x02\x02", "\x02\x02\xFD\x03\x02\x02\x02\x02\xFF\x03\x02\x02", "\x02\x02\u0101\x03\x02\x02\x02\x02\u0103\x03\x02\x02", "\x02\x02\u0105\x03\x02\x02\x02\x02\u010B\x03\x02\x02", "\x02\x02\u0111\x03\x02\x02\x02\x02\u0113\x03\x02\x02", "\x02\x02\u0115\x03\x02\x02\x02\x02\u0117\x03\x02\x02", "\x02\x03\u0119\x03\x02\x02\x02\x05\u0120\x03\x02\x02", "\x02\x07\u0122\x03\x02\x02\x02\t\u0125\x03\x02\x02", "\x02\x0B\u0127\x03\x02\x02\x02\r\u0129\x03\x02\x02", "\x02\x0F\u012C\x03\x02\x02\x02\x11\u012E\x03\x02\x02", "\x02\x13\u0130\x03\x02\x02\x02\x15\u0133\x03\x02\x02", "\x02\x17\u0135\x03\x02\x02\x02\x19\u0138\x03\x02\x02", "\x02\x1B\u013F\x03\x02\x02\x02\x1D\u0141\x03\x02\x02", "\x02\x1F\u0146\x03\x02\x02\x02!\u0148\x03\x02\x02", "\x02#\u014A\x03\x02\x02\x02%\u014C\x03\x02\x02\x02", "'\u0155\x03\x02\x02\x02)\u015E\x03\x02\x02\x02+\u0168", "\x03\x02\x02\x02-\u0170\x03\x02\x02\x02/\u0173\x03", "\x02\x02\x021\u0175\x03\x02\x02\x023\u0177\x03\x02", "\x02\x025\u017D\x03\x02\x02\x027\u0181\x03\x02\x02", "\x029\u0188\x03\x02\x02\x02;\u0191\x03\x02\x02\x02", "=\u019A\x03\x02\x02\x02?\u01A2\x03\x02\x02\x02A\u01A8", "\x03\x02\x02\x02C\u01AD\x03\x02\x02\x02E\u01AF\x03", "\x02\x02\x02G\u01B1\x03\x02\x02\x02I\u01B9\x03\x02", "\x02\x02K\u01BB\x03\x02\x02\x02M\u01C3\x03\x02\x02", "\x02O\u01C6\x03\x02\x02\x02Q\u01CD\x03\x02\x02\x02", "S\u01D5\x03\x02\x02\x02U\u01DE\x03\x02\x02\x02W\u01E1", "\x03\x02\x02\x02Y\u01E6\x03\x02\x02\x02[\u01EA\x03", "\x02\x02\x02]\u01F0\x03\x02\x02\x02_\u01F6\x03\x02", "\x02\x02a\u0200\x03\x02\x02\x02c\u0209\x03\x02\x02", "\x02e\u020C\x03\x02\x02\x02g\u0213\x03\x02\x02\x02", "i\u0219\x03\x02\x02\x02k\u021E\x03\x02\x02\x02m\u0222", "\x03\x02\x02\x02o\u0227\x03\x02\x02\x02q\u022E\x03", "\x02\x02\x02s\u0233\x03\x02\x02\x02u\u0236\x03\x02", "\x02\x02w\u0239\x03\x02\x02\x02y\u023D\x03\x02\x02", "\x02{\u023F\x03\x02\x02\x02}\u0241\x03\x02\x02\x02", "\x7F\u0243\x03\x02\x02\x02\x81\u0249\x03\x02\x02\x02", "\x83\u0250\x03\x02\x02\x02\x85\u0252\x03\x02\x02\x02", "\x87\u0255\x03\x02\x02\x02\x89\u0257\x03\x02\x02\x02", "\x8B\u0259\x03\x02\x02\x02\x8D\u025C\x03\x02\x02\x02", "\x8F\u025F\x03\x02\x02\x02\x91\u0261\x03\x02\x02\x02", "\x93\u0263\x03\x02\x02\x02\x95\u0266\x03\x02\x02\x02", "\x97\u0269\x03\x02\x02\x02\x99\u026C\x03\x02\x02\x02", "\x9B\u026E\x03\x02\x02\x02\x9D\u0271\x03\x02\x02\x02", "\x9F\u0274\x03\x02\x02\x02\xA1\u0277\x03\x02\x02\x02", "\xA3\u027B\x03\x02\x02\x02\xA5\u027F\x03\x02\x02\x02", "\xA7\u0282\x03\x02\x02\x02\xA9\u0285\x03\x02\x02\x02", "\xAB\u0288\x03\x02\x02\x02\xAD\u028B\x03\x02\x02\x02", "\xAF\u028E\x03\x02\x02\x02\xB1\u0292\x03\x02\x02\x02", "\xB3\u0295\x03\x02\x02\x02\xB5\u0298\x03\x02\x02\x02", "\xB7\u029F\x03\x02\x02\x02\xB9\u02A4\x03\x02\x02\x02", "\xBB\u02AC\x03\x02\x02\x02\xBD\u02AF\x03\x02\x02\x02", "\xBF\u02B8\x03\x02\x02\x02\xC1\u0377\x03\x02\x02\x02", "\xC3\u0450\x03\x02\x02\x02\xC5\u052E\x03\x02\x02\x02", "\xC7\u0546\x03\x02\x02\x02\xC9\u0560\x03\x02\x02\x02", "\xCB\u056B\x03\x02\x02\x02\xCD\u0573\x03\x02\x02\x02", "\xCF\u0579\x03\x02\x02\x02\xD1\u0583\x03\x02\x02\x02", "\xD3\u0587\x03\x02\x02\x02\xD5\u05C9\x03\x02\x02\x02", "\xD7\u05CB\x03\x02\x02\x02\xD9\u05DB\x03\x02\x02\x02", "\xDB\u05DE\x03\x02\x02\x02\xDD\u0638\x03\x02\x02\x02", "\xDF\u063A\x03\x02\x02\x02\xE1\u0644\x03\x02\x02\x02", "\xE3\u064A\x03\x02\x02\x02\xE5\u0653\x03\x02\x02\x02", "\xE7\u065D\x03\x02\x02\x02\xE9\u0666\x03\x02\x02\x02", "\xEB\u066C\x03\x02\x02\x02\xED\u0675\x03\x02\x02\x02", "\xEF\u067D\x03\x02\x02\x02\xF1\u0686\x03\x02\x02\x02", "\xF3\u068E\x03\x02\x02\x02\xF5\u0696\x03\x02\x02\x02", "\xF7\u069D\x03\x02\x02\x02\xF9\u06A5\x03\x02\x02\x02", "\xFB\u06AA\x03\x02\x02\x02\xFD\u06AF\x03\x02\x02\x02", "\xFF\u06B4\x03\x02\x02\x02\u0101\u06C0\x03\x02\x02\x02", "\u0103\u06C9\x03\x02\x02\x02\u0105\u06D1\x03\x02\x02\x02", "\u0107\u06D8\x03\x02\x02\x02\u0109\u06DA\x03\x02\x02\x02", "\u010B\u06EC\x03\x02\x02\x02\u010D\u06F1\x03\x02\x02\x02", "\u010F\u06F6\x03\x02\x02\x02\u0111\u06F9\x03\x02\x02\x02", "\u0113\u070C\x03\x02\x02\x02\u0115\u0712\x03\x02\x02\x02", "\u0117\u0720\x03\x02\x02\x02\u0119\u011A\x07r\x02\x02", "\u011A\u011B\x07t\x02\x02\u011B\u011C\x07c\x02\x02\u011C", "\u011D\x07i\x02\x02\u011D\u011E\x07o\x02\x02\u011E\u011F", "\x07c\x02\x02\u011F\x04\x03\x02\x02\x02\u0120\u0121", "\x07=\x02\x02\u0121\x06\x03\x02\x02\x02\u0122\u0123", "\x07~\x02\x02\u0123\u0124\x07~\x02\x02\u0124\b\x03\x02", "\x02\x02\u0125\u0126\x07`\x02\x02\u0126\n\x03\x02\x02", "\x02\u0127\u0128\x07\x80\x02\x02\u0128\f\x03\x02\x02", "\x02\u0129\u012A\x07@\x02\x02\u012A\u012B\x07?\x02\x02", "\u012B\x0E\x03\x02\x02\x02\u012C\u012D\x07@\x02\x02", "\u012D\x10\x03\x02\x02\x02\u012E\u012F\x07>\x02\x02", "\u012F\x12\x03\x02\x02\x02\u0130\u0131\x07>\x02\x02", "\u0131\u0132\x07?\x02\x02\u0132\x14\x03\x02\x02\x02", "\u0133\u0134\x07?\x02\x02\u0134\x16\x03\x02\x02\x02", "\u0135\u0136\x07c\x02\x02\u0136\u0137\x07u\x02\x02\u0137", "\x18\x03\x02\x02\x02\u0138\u0139\x07k\x02\x02\u0139", "\u013A\x07o\x02\x02\u013A\u013B\x07r\x02\x02\u013B\u013C", "\x07q\x02\x02\u013C\u013D\x07t\x02\x02\u013D\u013E\x07", "v\x02\x02\u013E\x1A\x03\x02\x02\x02\u013F\u0140\x07", ",\x02\x02\u0140\x1C\x03\x02\x02\x02\u0141\u0142\x07", "h\x02\x02\u0142\u0143\x07t\x02\x02\u0143\u0144\x07q\x02", "\x02\u0144\u0145\x07o\x02\x02\u0145\x1E\x03\x02\x02", "\x02\u0146\u0147\x07}\x02\x02\u0147 \x03\x02\x02\x02", "\u0148\u0149\x07.\x02\x02\u0149\"\x03\x02\x02\x02\u014A", "\u014B\x07\x7F\x02\x02\u014B$\x03\x02\x02\x02\u014C", "\u014D\x07c\x02\x02\u014D\u014E\x07d\x02\x02\u014E\u014F", "\x07u\x02\x02\u014F\u0150\x07v\x02\x02\u0150\u0151\x07", "t\x02\x02\u0151\u0152\x07c\x02\x02\u0152\u0153\x07e\x02", "\x02\u0153\u0154\x07v\x02\x02\u0154&\x03\x02\x02\x02", "\u0155\u0156\x07e\x02\x02\u0156\u0157\x07q\x02\x02\u0157", "\u0158\x07p\x02\x02\u0158\u0159\x07v\x02\x02\u0159\u015A", "\x07t\x02\x02\u015A\u015B\x07c\x02\x02\u015B\u015C\x07", "e\x02\x02\u015C\u015D\x07v\x02\x02\u015D(\x03\x02\x02", "\x02\u015E\u015F\x07k\x02\x02\u015F\u0160\x07p\x02\x02", "\u0160\u0161\x07v\x02\x02\u0161\u0162\x07g\x02\x02\u0162", "\u0163\x07t\x02\x02\u0163\u0164\x07h\x02\x02\u0164\u0165", "\x07c\x02\x02\u0165\u0166\x07e\x02\x02\u0166\u0167\x07", "g\x02\x02\u0167*\x03\x02\x02\x02\u0168\u0169\x07n\x02", "\x02\u0169\u016A\x07k\x02\x02\u016A\u016B\x07d\x02\x02", "\u016B\u016C\x07t\x02\x02\u016C\u016D\x07c\x02\x02\u016D", "\u016E\x07t\x02\x02\u016E\u016F\x07{\x02\x02\u016F,\x03", "\x02\x02\x02\u0170\u0171\x07k\x02\x02\u0171\u0172\x07", "u\x02\x02\u0172.\x03\x02\x02\x02\u0173\u0174\x07*\x02", "\x02\u01740\x03\x02\x02\x02\u0175\u0176\x07+\x02\x02", "\u01762\x03\x02\x02\x02\u0177\u0178\x07w\x02\x02\u0178", "\u0179\x07u\x02\x02\u0179\u017A\x07k\x02\x02\u017A\u017B", "\x07p\x02\x02\u017B\u017C\x07i\x02\x02\u017C4\x03\x02", "\x02\x02\u017D\u017E\x07h\x02\x02\u017E\u017F\x07q\x02", "\x02\u017F\u0180\x07t\x02\x02\u01806\x03\x02\x02\x02", "\u0181\u0182\x07u\x02\x02\u0182\u0183\x07v\x02\x02\u0183", "\u0184\x07t\x02\x02\u0184\u0185\x07w\x02\x02\u0185\u0186", "\x07e\x02\x02\u0186\u0187\x07v\x02\x02\u01878\x03\x02", "\x02\x02\u0188\u0189\x07o\x02\x02\u0189\u018A\x07q\x02", "\x02\u018A\u018B\x07f\x02\x02\u018B\u018C\x07k\x02\x02", "\u018C\u018D\x07h\x02\x02\u018D\u018E\x07k\x02\x02\u018E", "\u018F\x07g\x02\x02\u018F\u0190\x07t\x02\x02\u0190:\x03", "\x02\x02\x02\u0191\u0192\x07h\x02\x02\u0192\u0193\x07", "w\x02\x02\u0193\u0194\x07p\x02\x02\u0194\u0195\x07e\x02", "\x02\u0195\u0196\x07v\x02\x02\u0196\u0197\x07k\x02\x02", "\u0197\u0198\x07q\x02\x02\u0198\u0199\x07p\x02\x02\u0199", "<\x03\x02\x02\x02\u019A\u019B\x07t\x02\x02\u019B\u019C", "\x07g\x02\x02\u019C\u019D\x07v\x02\x02\u019D\u019E\x07", "w\x02\x02\u019E\u019F\x07t\x02\x02\u019F\u01A0\x07p\x02", "\x02\u01A0\u01A1\x07u\x02\x02\u01A1>\x03\x02\x02\x02", "\u01A2\u01A3\x07g\x02\x02\u01A3\u01A4\x07x\x02\x02\u01A4", "\u01A5\x07g\x02\x02\u01A5\u01A6\x07p\x02\x02\u01A6\u01A7", "\x07v\x02\x02\u01A7@\x03\x02\x02\x02\u01A8\u01A9\x07", "g\x02\x02\u01A9\u01AA\x07p\x02\x02\u01AA\u01AB\x07w\x02", "\x02\u01AB\u01AC\x07o\x02\x02\u01ACB\x03\x02\x02\x02", "\u01AD\u01AE\x07]\x02\x02\u01AED\x03\x02\x02\x02\u01AF", "\u01B0\x07_\x02\x02\u01B0F\x03\x02\x02\x02\u01B1\u01B2", "\x07c\x02\x02\u01B2\u01B3\x07f\x02\x02\u01B3\u01B4\x07", "f\x02\x02\u01B4\u01B5\x07t\x02\x02\u01B5\u01B6\x07g\x02", "\x02\u01B6\u01B7\x07u\x02\x02\u01B7\u01B8\x07u\x02\x02", "\u01B8H\x03\x02\x02\x02\u01B9\u01BA\x070\x02\x02\u01BA", "J\x03\x02\x02\x02\u01BB\u01BC\x07o\x02\x02\u01BC\u01BD", "\x07c\x02\x02\u01BD\u01BE\x07r\x02\x02\u01BE\u01BF\x07", "r\x02\x02\u01BF\u01C0\x07k\x02\x02\u01C0\u01C1\x07p\x02", "\x02\u01C1\u01C2\x07i\x02\x02\u01C2L\x03\x02\x02\x02", "\u01C3\u01C4\x07?\x02\x02\u01C4\u01C5\x07@\x02\x02\u01C5", "N\x03\x02\x02\x02\u01C6\u01C7\x07o\x02\x02\u01C7\u01C8", "\x07g\x02\x02\u01C8\u01C9\x07o\x02\x02\u01C9\u01CA\x07", "q\x02\x02\u01CA\u01CB\x07t\x02\x02\u01CB\u01CC\x07{\x02", "\x02\u01CCP\x03\x02\x02\x02\u01CD\u01CE\x07u\x02\x02", "\u01CE\u01CF\x07v\x02\x02\u01CF\u01D0\x07q\x02\x02\u01D0", "\u01D1\x07t\x02\x02\u01D1\u01D2\x07c\x02\x02\u01D2\u01D3", "\x07i\x02\x02\u01D3\u01D4\x07g\x02\x02\u01D4R\x03\x02", "\x02\x02\u01D5\u01D6\x07e\x02\x02\u01D6\u01D7\x07c\x02", "\x02\u01D7\u01D8\x07n\x02\x02\u01D8\u01D9\x07n\x02\x02", "\u01D9\u01DA\x07f\x02\x02\u01DA\u01DB\x07c\x02\x02\u01DB", "\u01DC\x07v\x02\x02\u01DC\u01DD\x07c\x02\x02\u01DDT\x03", "\x02\x02\x02\u01DE\u01DF\x07k\x02\x02\u01DF\u01E0\x07", "h\x02\x02\u01E0V\x03\x02\x02\x02\u01E1\u01E2\x07g\x02", "\x02\u01E2\u01E3\x07n\x02\x02\u01E3\u01E4\x07u\x02\x02", "\u01E4\u01E5\x07g\x02\x02\u01E5X\x03\x02\x02\x02\u01E6", "\u01E7\x07v\x02\x02\u01E7\u01E8\x07t\x02\x02\u01E8\u01E9", "\x07{\x02\x02\u01E9Z\x03\x02\x02\x02\u01EA\u01EB\x07", "e\x02\x02\u01EB\u01EC\x07c\x02\x02\u01EC\u01ED\x07v\x02", "\x02\u01ED\u01EE\x07e\x02\x02\u01EE\u01EF\x07j\x02\x02", "\u01EF\\\x03\x02\x02\x02\u01F0\u01F1\x07y\x02\x02\u01F1", "\u01F2\x07j\x02\x02\u01F2\u01F3\x07k\x02\x02\u01F3\u01F4", "\x07n\x02\x02\u01F4\u01F5\x07g\x02\x02\u01F5^\x03\x02", "\x02\x02\u01F6\u01F7\x07w\x02\x02\u01F7\u01F8\x07p\x02", "\x02\u01F8\u01F9\x07e\x02\x02\u01F9\u01FA\x07j\x02\x02", "\u01FA\u01FB\x07g\x02\x02\u01FB\u01FC\x07e\x02\x02\u01FC", "\u01FD\x07m\x02\x02\u01FD\u01FE\x07g\x02\x02\u01FE\u01FF", "\x07f\x02\x02\u01FF`\x03\x02\x02\x02\u0200\u0201\x07", "c\x02\x02\u0201\u0202\x07u\x02\x02\u0202\u0203\x07u\x02", "\x02\u0203\u0204\x07g\x02\x02\u0204\u0205\x07o\x02\x02", "\u0205\u0206\x07d\x02\x02\u0206\u0207\x07n\x02\x02\u0207", "\u0208\x07{\x02\x02\u0208b\x03\x02\x02\x02\u0209\u020A", "\x07f\x02\x02\u020A\u020B\x07q\x02\x02\u020Bd\x03\x02", "\x02\x02\u020C\u020D\x07t\x02\x02\u020D\u020E\x07g\x02", "\x02\u020E\u020F\x07v\x02\x02\u020F\u0210\x07w\x02\x02", "\u0210\u0211\x07t\x02\x02\u0211\u0212\x07p\x02\x02\u0212", "f\x03\x02\x02\x02\u0213\u0214\x07v\x02\x02\u0214\u0215", "\x07j\x02\x02\u0215\u0216\x07t\x02\x02\u0216\u0217\x07", "q\x02\x02\u0217\u0218\x07y\x02\x02\u0218h\x03\x02\x02", "\x02\u0219\u021A\x07g\x02\x02\u021A\u021B\x07o\x02\x02", "\u021B\u021C\x07k\x02\x02\u021C\u021D\x07v\x02\x02\u021D", "j\x03\x02\x02\x02\u021E\u021F\x07x\x02\x02\u021F\u0220", "\x07c\x02\x02\u0220\u0221\x07t\x02\x02\u0221l\x03\x02", "\x02\x02\u0222\u0223\x07d\x02\x02\u0223\u0224\x07q\x02", "\x02\u0224\u0225\x07q\x02\x02\u0225\u0226\x07n\x02\x02", "\u0226n\x03\x02\x02\x02\u0227\u0228\x07u\x02\x02\u0228", "\u0229\x07v\x02\x02\u0229\u022A\x07t\x02\x02\u022A\u022B", "\x07k\x02\x02\u022B\u022C\x07p\x02\x02\u022C\u022D\x07", "i\x02\x02\u022Dp\x03\x02\x02\x02\u022E\u022F\x07d\x02", "\x02\u022F\u0230\x07{\x02\x02\u0230\u0231\x07v\x02\x02", "\u0231\u0232\x07g\x02\x02\u0232r\x03\x02\x02\x02\u0233", "\u0234\x07-\x02\x02\u0234\u0235\x07-\x02\x02\u0235t\x03", "\x02\x02\x02\u0236\u0237\x07/\x02\x02\u0237\u0238\x07", "/\x02\x02\u0238v\x03\x02\x02\x02\u0239\u023A\x07p\x02", "\x02\u023A\u023B\x07g\x02\x02\u023B\u023C\x07y\x02\x02", "\u023Cx\x03\x02\x02\x02\u023D\u023E\x07<\x02\x02\u023E", "z\x03\x02\x02\x02\u023F\u0240\x07-\x02\x02\u0240|\x03", "\x02\x02\x02\u0241\u0242\x07/\x02\x02\u0242~\x03\x02", "\x02\x02\u0243\u0244\x07c\x02\x02\u0244\u0245\x07h\x02", "\x02\u0245\u0246\x07v\x02\x02\u0246\u0247\x07g\x02\x02", "\u0247\u0248\x07t\x02\x02\u0248\x80\x03\x02\x02\x02", "\u0249\u024A\x07f\x02\x02\u024A\u024B\x07g\x02\x02\u024B", "\u024C\x07n\x02\x02\u024C\u024D\x07g\x02\x02\u024D\u024E", "\x07v\x02\x02\u024E\u024F\x07g\x02\x02\u024F\x82\x03", "\x02\x02\x02\u0250\u0251\x07#\x02\x02\u0251\x84\x03", "\x02\x02\x02\u0252\u0253\x07,\x02\x02\u0253\u0254\x07", ",\x02\x02\u0254\x86\x03\x02\x02\x02\u0255\u0256\x07", "1\x02\x02\u0256\x88\x03\x02\x02\x02\u0257\u0258\x07", "'\x02\x02\u0258\x8A\x03\x02\x02\x02\u0259\u025A\x07", ">\x02\x02\u025A\u025B\x07>\x02\x02\u025B\x8C\x03\x02", "\x02\x02\u025C\u025D\x07@\x02\x02\u025D\u025E\x07@\x02", "\x02\u025E\x8E\x03\x02\x02\x02\u025F\u0260\x07(\x02", "\x02\u0260\x90\x03\x02\x02\x02\u0261\u0262\x07~\x02", "\x02\u0262\x92\x03\x02\x02\x02\u0263\u0264\x07?\x02", "\x02\u0264\u0265\x07?\x02\x02\u0265\x94\x03\x02\x02", "\x02\u0266\u0267\x07#\x02\x02\u0267\u0268\x07?\x02\x02", "\u0268\x96\x03\x02\x02\x02\u0269\u026A\x07(\x02\x02", "\u026A\u026B\x07(\x02\x02\u026B\x98\x03\x02\x02\x02", "\u026C\u026D\x07A\x02\x02\u026D\x9A\x03\x02\x02\x02", "\u026E\u026F\x07~\x02\x02\u026F\u0270\x07?\x02\x02\u0270", "\x9C\x03\x02\x02\x02\u0271\u0272\x07`\x02\x02\u0272", "\u0273\x07?\x02\x02\u0273\x9E\x03\x02\x02\x02\u0274", "\u0275\x07(\x02\x02\u0275\u0276\x07?\x02\x02\u0276\xA0", "\x03\x02\x02\x02\u0277\u0278\x07>\x02\x02\u0278\u0279", "\x07>\x02\x02\u0279\u027A\x07?\x02\x02\u027A\xA2\x03", "\x02\x02\x02\u027B\u027C\x07@\x02\x02\u027C\u027D\x07", "@\x02\x02\u027D\u027E\x07?\x02\x02\u027E\xA4\x03\x02", "\x02\x02\u027F\u0280\x07-\x02\x02\u0280\u0281\x07?\x02", "\x02\u0281\xA6\x03\x02\x02\x02\u0282\u0283\x07/\x02", "\x02\u0283\u0284\x07?\x02\x02\u0284\xA8\x03\x02\x02", "\x02\u0285\u0286\x07,\x02\x02\u0286\u0287\x07?\x02\x02", "\u0287\xAA\x03\x02\x02\x02\u0288\u0289\x071\x02\x02", "\u0289\u028A\x07?\x02\x02\u028A\xAC\x03\x02\x02\x02", "\u028B\u028C\x07'\x02\x02\u028C\u028D\x07?\x02\x02\u028D", "\xAE\x03\x02\x02\x02\u028E\u028F\x07n\x02\x02\u028F", "\u0290\x07g\x02\x02\u0290\u0291\x07v\x02\x02\u0291\xB0", "\x03\x02\x02\x02\u0292\u0293\x07<\x02\x02\u0293\u0294", "\x07?\x02\x02\u0294\xB2\x03\x02\x02\x02\u0295\u0296", "\x07?\x02\x02\u0296\u0297\x07<\x02\x02\u0297\xB4\x03", "\x02\x02\x02\u0298\u0299\x07u\x02\x02\u0299\u029A\x07", "y\x02\x02\u029A\u029B\x07k\x02\x02\u029B\u029C\x07v\x02", "\x02\u029C\u029D\x07e\x02\x02\u029D\u029E\x07j\x02\x02", "\u029E\xB6\x03\x02\x02\x02\u029F\u02A0\x07e\x02\x02", "\u02A0\u02A1\x07c\x02\x02\u02A1\u02A2\x07u\x02\x02\u02A2", "\u02A3\x07g\x02\x02\u02A3\xB8\x03\x02\x02\x02\u02A4", "\u02A5\x07f\x02\x02\u02A5\u02A6\x07g\x02\x02\u02A6\u02A7", "\x07h\x02\x02\u02A7\u02A8\x07c\x02\x02\u02A8\u02A9\x07", "w\x02\x02\u02A9\u02AA\x07n\x02\x02\u02AA\u02AB\x07v\x02", "\x02\u02AB\xBA\x03\x02\x02\x02\u02AC\u02AD\x07/\x02", "\x02\u02AD\u02AE\x07@\x02\x02\u02AE\xBC\x03\x02\x02", "\x02\u02AF\u02B0\x07e\x02\x02\u02B0\u02B1\x07c\x02\x02", "\u02B1\u02B2\x07n\x02\x02\u02B2\u02B3\x07n\x02\x02\u02B3", "\u02B4\x07d\x02\x02\u02B4\u02B5\x07c\x02\x02\u02B5\u02B6", "\x07e\x02\x02\u02B6\u02B7\x07m\x02\x02\u02B7\xBE\x03", "\x02\x02\x02\u02B8\u02B9\x07q\x02\x02\u02B9\u02BA\x07", "x\x02\x02\u02BA\u02BB\x07g\x02\x02\u02BB\u02BC\x07t\x02", "\x02\u02BC\u02BD\x07t\x02\x02\u02BD\u02BE\x07k\x02\x02", "\u02BE\u02BF\x07f\x02\x02\u02BF\u02C0\x07g\x02\x02\u02C0", "\xC0\x03\x02\x02\x02\u02C1\u02C2\x07k\x02\x02\u02C2", "\u02C3\x07p\x02\x02\u02C3\u0378\x07v\x02\x02\u02C4\u02C5", "\x07k\x02\x02\u02C5\u02C6\x07p\x02\x02\u02C6\u02C7\x07", "v\x02\x02\u02C7\u0378\x07:\x02\x02\u02C8\u02C9\x07k\x02", "\x02\u02C9\u02CA\x07p\x02\x02\u02CA\u02CB\x07v\x02\x02", "\u02CB\u02CC\x073\x02\x02\u02CC\u0378\x078\x02\x02\u02CD", "\u02CE\x07k\x02\x02\u02CE\u02CF\x07p\x02\x02\u02CF\u02D0", "\x07v\x02\x02\u02D0\u02D1\x074\x02\x02\u02D1\u0378\x07", "6\x02\x02\u02D2\u02D3\x07k\x02\x02\u02D3\u02D4\x07p\x02", "\x02\u02D4\u02D5\x07v\x02\x02\u02D5\u02D6\x075\x02\x02", "\u02D6\u0378\x074\x02\x02\u02D7\u02D8\x07k\x02\x02\u02D8", "\u02D9\x07p\x02\x02\u02D9\u02DA\x07v\x02\x02\u02DA\u02DB", "\x076\x02\x02\u02DB\u0378\x072\x02\x02\u02DC\u02DD\x07", "k\x02\x02\u02DD\u02DE\x07p\x02\x02\u02DE\u02DF\x07v\x02", "\x02\u02DF\u02E0\x076\x02\x02\u02E0\u0378\x07:\x02\x02", "\u02E1\u02E2\x07k\x02\x02\u02E2\u02E3\x07p\x02\x02\u02E3", "\u02E4\x07v\x02\x02\u02E4\u02E5\x077\x02\x02\u02E5\u0378", "\x078\x02\x02\u02E6\u02E7\x07k\x02\x02\u02E7\u02E8\x07", "p\x02\x02\u02E8\u02E9\x07v\x02\x02\u02E9\u02EA\x078\x02", "\x02\u02EA\u0378\x076\x02\x02\u02EB\u02EC\x07k\x02\x02", "\u02EC\u02ED\x07p\x02\x02\u02ED\u02EE\x07v\x02\x02\u02EE", "\u02EF\x079\x02\x02\u02EF\u0378\x074\x02\x02\u02F0\u02F1", "\x07k\x02\x02\u02F1\u02F2\x07p\x02\x02\u02F2\u02F3\x07", "v\x02\x02\u02F3\u02F4\x07:\x02\x02\u02F4\u0378\x072\x02", "\x02\u02F5\u02F6\x07k\x02\x02\u02F6\u02F7\x07p\x02\x02", "\u02F7\u02F8\x07v\x02\x02\u02F8\u02F9\x07:\x02\x02\u02F9", "\u0378\x07:\x02\x02\u02FA\u02FB\x07k\x02\x02\u02FB\u02FC", "\x07p\x02\x02\u02FC\u02FD\x07v\x02\x02\u02FD\u02FE\x07", ";\x02\x02\u02FE\u0378\x078\x02\x02\u02FF\u0300\x07k\x02", "\x02\u0300\u0301\x07p\x02\x02\u0301\u0302\x07v\x02\x02", "\u0302\u0303\x073\x02\x02\u0303\u0304\x072\x02\x02\u0304", "\u0378\x076\x02\x02\u0305\u0306\x07k\x02\x02\u0306\u0307", "\x07p\x02\x02\u0307\u0308\x07v\x02\x02\u0308\u0309\x07", "3\x02\x02\u0309\u030A\x073\x02\x02\u030A\u0378\x074\x02", "\x02\u030B\u030C\x07k\x02\x02\u030C\u030D\x07p\x02\x02", "\u030D\u030E\x07v\x02\x02\u030E\u030F\x073\x02\x02\u030F", "\u0310\x074\x02\x02\u0310\u0378\x072\x02\x02\u0311\u0312", "\x07k\x02\x02\u0312\u0313\x07p\x02\x02\u0313\u0314\x07", "v\x02\x02\u0314\u0315\x073\x02\x02\u0315\u0316\x074\x02", "\x02\u0316\u0378\x07:\x02\x02\u0317\u0318\x07k\x02\x02", "\u0318\u0319\x07p\x02\x02\u0319\u031A\x07v\x02\x02\u031A", "\u031B\x073\x02\x02\u031B\u031C\x075\x02\x02\u031C\u0378", "\x078\x02\x02\u031D\u031E\x07k\x02\x02\u031E\u031F\x07", "p\x02\x02\u031F\u0320\x07v\x02\x02\u0320\u0321\x073\x02", "\x02\u0321\u0322\x076\x02\x02\u0322\u0378\x076\x02\x02", "\u0323\u0324\x07k\x02\x02\u0324\u0325\x07p\x02\x02\u0325", "\u0326\x07v\x02\x02\u0326\u0327\x073\x02\x02\u0327\u0328", "\x077\x02\x02\u0328\u0378\x074\x02\x02\u0329\u032A\x07", "k\x02\x02\u032A\u032B\x07p\x02\x02\u032B\u032C\x07v\x02", "\x02\u032C\u032D\x073\x02\x02\u032D\u032E\x078\x02\x02", "\u032E\u0378\x072\x02\x02\u032F\u0330\x07k\x02\x02\u0330", "\u0331\x07p\x02\x02\u0331\u0332\x07v\x02\x02\u0332\u0333", "\x073\x02\x02\u0333\u0334\x078\x02\x02\u0334\u0378\x07", ":\x02\x02\u0335\u0336\x07k\x02\x02\u0336\u0337\x07p\x02", "\x02\u0337\u0338\x07v\x02\x02\u0338\u0339\x073\x02\x02", "\u0339\u033A\x079\x02\x02\u033A\u0378\x078\x02\x02\u033B", "\u033C\x07k\x02\x02\u033C\u033D\x07p\x02\x02\u033D\u033E", "\x07v\x02\x02\u033E\u033F\x073\x02\x02\u033F\u0340\x07", ":\x02\x02\u0340\u0378\x076\x02\x02\u0341\u0342\x07k\x02", "\x02\u0342\u0343\x07p\x02\x02\u0343\u0344\x07v\x02\x02", "\u0344\u0345\x073\x02\x02\u0345\u0346\x07;\x02\x02\u0346", "\u0378\x074\x02\x02\u0347\u0348\x07k\x02\x02\u0348\u0349", "\x07p\x02\x02\u0349\u034A\x07v\x02\x02\u034A\u034B\x07", "4\x02\x02\u034B\u034C\x072\x02\x02\u034C\u0378\x072\x02", "\x02\u034D\u034E\x07k\x02\x02\u034E\u034F\x07p\x02\x02", "\u034F\u0350\x07v\x02\x02\u0350\u0351\x074\x02\x02\u0351", "\u0352\x072\x02\x02\u0352\u0378\x07:\x02\x02\u0353\u0354", "\x07k\x02\x02\u0354\u0355\x07p\x02\x02\u0355\u0356\x07", "v\x02\x02\u0356\u0357\x074\x02\x02\u0357\u0358\x073\x02", "\x02\u0358\u0378\x078\x02\x02\u0359\u035A\x07k\x02\x02", "\u035A\u035B\x07p\x02\x02\u035B\u035C\x07v\x02\x02\u035C", "\u035D\x074\x02\x02\u035D\u035E\x074\x02\x02\u035E\u0378", "\x076\x02\x02\u035F\u0360\x07k\x02\x02\u0360\u0361\x07", "p\x02\x02\u0361\u0362\x07v\x02\x02\u0362\u0363\x074\x02", "\x02\u0363\u0364\x075\x02\x02\u0364\u0378\x074\x02\x02", "\u0365\u0366\x07k\x02\x02\u0366\u0367\x07p\x02\x02\u0367", "\u0368\x07v\x02\x02\u0368\u0369\x074\x02\x02\u0369\u036A", "\x076\x02\x02\u036A\u0378\x072\x02\x02\u036B\u036C\x07", "k\x02\x02\u036C\u036D\x07p\x02\x02\u036D\u036E\x07v\x02", "\x02\u036E\u036F\x074\x02\x02\u036F\u0370\x076\x02\x02", "\u0370\u0378\x07:\x02\x02\u0371\u0372\x07k\x02\x02\u0372", "\u0373\x07p\x02\x02\u0373\u0374\x07v\x02\x02\u0374\u0375", "\x074\x02\x02\u0375\u0376\x077\x02\x02\u0376\u0378\x07", "8\x02\x02\u0377\u02C1\x03\x02\x02\x02\u0377\u02C4\x03", "\x02\x02\x02\u0377\u02C8\x03\x02\x02\x02\u0377\u02CD\x03", "\x02\x02\x02\u0377\u02D2\x03\x02\x02\x02\u0377\u02D7\x03", "\x02\x02\x02\u0377\u02DC\x03\x02\x02\x02\u0377\u02E1\x03", "\x02\x02\x02\u0377\u02E6\x03\x02\x02\x02\u0377\u02EB\x03", "\x02\x02\x02\u0377\u02F0\x03\x02\x02\x02\u0377\u02F5\x03", "\x02\x02\x02\u0377\u02FA\x03\x02\x02\x02\u0377\u02FF\x03", "\x02\x02\x02\u0377\u0305\x03\x02\x02\x02\u0377\u030B\x03", "\x02\x02\x02\u0377\u0311\x03\x02\x02\x02\u0377\u0317\x03", "\x02\x02\x02\u0377\u031D\x03\x02\x02\x02\u0377\u0323\x03", "\x02\x02\x02\u0377\u0329\x03\x02\x02\x02\u0377\u032F\x03", "\x02\x02\x02\u0377\u0335\x03\x02\x02\x02\u0377\u033B\x03", "\x02\x02\x02\u0377\u0341\x03\x02\x02\x02\u0377\u0347\x03", "\x02\x02\x02\u0377\u034D\x03\x02\x02\x02\u0377\u0353\x03", "\x02\x02\x02\u0377\u0359\x03\x02\x02\x02\u0377\u035F\x03", "\x02\x02\x02\u0377\u0365\x03\x02\x02\x02\u0377\u036B\x03", "\x02\x02\x02\u0377\u0371\x03\x02\x02\x02\u0378\xC2\x03", "\x02\x02\x02\u0379\u037A\x07w\x02\x02\u037A\u037B\x07", "k\x02\x02\u037B\u037C\x07p\x02\x02\u037C\u0451\x07v\x02", "\x02\u037D\u037E\x07w\x02\x02\u037E\u037F\x07k\x02\x02", "\u037F\u0380\x07p\x02\x02\u0380\u0381\x07v\x02\x02\u0381", "\u0451\x07:\x02\x02\u0382\u0383\x07w\x02\x02\u0383\u0384", "\x07k\x02\x02\u0384\u0385\x07p\x02\x02\u0385\u0386\x07", "v\x02\x02\u0386\u0387\x073\x02\x02\u0387\u0451\x078\x02", "\x02\u0388\u0389\x07w\x02\x02\u0389\u038A\x07k\x02\x02", "\u038A\u038B\x07p\x02\x02\u038B\u038C\x07v\x02\x02\u038C", "\u038D\x074\x02\x02\u038D\u0451\x076\x02\x02\u038E\u038F", "\x07w\x02\x02\u038F\u0390\x07k\x02\x02\u0390\u0391\x07", "p\x02\x02\u0391\u0392\x07v\x02\x02\u0392\u0393\x075\x02", "\x02\u0393\u0451\x074\x02\x02\u0394\u0395\x07w\x02\x02", "\u0395\u0396\x07k\x02\x02\u0396\u0397\x07p\x02\x02\u0397", "\u0398\x07v\x02\x02\u0398\u0399\x076\x02\x02\u0399\u0451", "\x072\x02\x02\u039A\u039B\x07w\x02\x02\u039B\u039C\x07", "k\x02\x02\u039C\u039D\x07p\x02\x02\u039D\u039E\x07v\x02", "\x02\u039E\u039F\x076\x02\x02\u039F\u0451\x07:\x02\x02", "\u03A0\u03A1\x07w\x02\x02\u03A1\u03A2\x07k\x02\x02\u03A2", "\u03A3\x07p\x02\x02\u03A3\u03A4\x07v\x02\x02\u03A4\u03A5", "\x077\x02\x02\u03A5\u0451\x078\x02\x02\u03A6\u03A7\x07", "w\x02\x02\u03A7\u03A8\x07k\x02\x02\u03A8\u03A9\x07p\x02", "\x02\u03A9\u03AA\x07v\x02\x02\u03AA\u03AB\x078\x02\x02", "\u03AB\u0451\x076\x02\x02\u03AC\u03AD\x07w\x02\x02\u03AD", "\u03AE\x07k\x02\x02\u03AE\u03AF\x07p\x02\x02\u03AF\u03B0", "\x07v\x02\x02\u03B0\u03B1\x079\x02\x02\u03B1\u0451\x07", "4\x02\x02\u03B2\u03B3\x07w\x02\x02\u03B3\u03B4\x07k\x02", "\x02\u03B4\u03B5\x07p\x02\x02\u03B5\u03B6\x07v\x02\x02", "\u03B6\u03B7\x07:\x02\x02\u03B7\u0451\x072\x02\x02\u03B8", "\u03B9\x07w\x02\x02\u03B9\u03BA\x07k\x02\x02\u03BA\u03BB", "\x07p\x02\x02\u03BB\u03BC\x07v\x02\x02\u03BC\u03BD\x07", ":\x02\x02\u03BD\u0451\x07:\x02\x02\u03BE\u03BF\x07w\x02", "\x02\u03BF\u03C0\x07k\x02\x02\u03C0\u03C1\x07p\x02\x02", "\u03C1\u03C2\x07v\x02\x02\u03C2\u03C3\x07;\x02\x02\u03C3", "\u0451\x078\x02\x02\u03C4\u03C5\x07w\x02\x02\u03C5\u03C6", "\x07k\x02\x02\u03C6\u03C7\x07p\x02\x02\u03C7\u03C8\x07", "v\x02\x02\u03C8\u03C9\x073\x02\x02\u03C9\u03CA\x072\x02", "\x02\u03CA\u0451\x076\x02\x02\u03CB\u03CC\x07w\x02\x02", "\u03CC\u03CD\x07k\x02\x02\u03CD\u03CE\x07p\x02\x02\u03CE", "\u03CF\x07v\x02\x02\u03CF\u03D0\x073\x02\x02\u03D0\u03D1", "\x073\x02\x02\u03D1\u0451\x074\x02\x02\u03D2\u03D3\x07", "w\x02\x02\u03D3\u03D4\x07k\x02\x02\u03D4\u03D5\x07p\x02", "\x02\u03D5\u03D6\x07v\x02\x02\u03D6\u03D7\x073\x02\x02", "\u03D7\u03D8\x074\x02\x02\u03D8\u0451\x072\x02\x02\u03D9", "\u03DA\x07w\x02\x02\u03DA\u03DB\x07k\x02\x02\u03DB\u03DC", "\x07p\x02\x02\u03DC\u03DD\x07v\x02\x02\u03DD\u03DE\x07", "3\x02\x02\u03DE\u03DF\x074\x02\x02\u03DF\u0451\x07:\x02", "\x02\u03E0\u03E1\x07w\x02\x02\u03E1\u03E2\x07k\x02\x02", "\u03E2\u03E3\x07p\x02\x02\u03E3\u03E4\x07v\x02\x02\u03E4", "\u03E5\x073\x02\x02\u03E5\u03E6\x075\x02\x02\u03E6\u0451", "\x078\x02\x02\u03E7\u03E8\x07w\x02\x02\u03E8\u03E9\x07", "k\x02\x02\u03E9\u03EA\x07p\x02\x02\u03EA\u03EB\x07v\x02", "\x02\u03EB\u03EC\x073\x02\x02\u03EC\u03ED\x076\x02\x02", "\u03ED\u0451\x076\x02\x02\u03EE\u03EF\x07w\x02\x02\u03EF", "\u03F0\x07k\x02\x02\u03F0\u03F1\x07p\x02\x02\u03F1\u03F2", "\x07v\x02\x02\u03F2\u03F3\x073\x02\x02\u03F3\u03F4\x07", "7\x02\x02\u03F4\u0451\x074\x02\x02\u03F5\u03F6\x07w\x02", "\x02\u03F6\u03F7\x07k\x02\x02\u03F7\u03F8\x07p\x02\x02", "\u03F8\u03F9\x07v\x02\x02\u03F9\u03FA\x073\x02\x02\u03FA", "\u03FB\x078\x02\x02\u03FB\u0451\x072\x02\x02\u03FC\u03FD", "\x07w\x02\x02\u03FD\u03FE\x07k\x02\x02\u03FE\u03FF\x07", "p\x02\x02\u03FF\u0400\x07v\x02\x02\u0400\u0401\x073\x02", "\x02\u0401\u0402\x078\x02\x02\u0402\u0451\x07:\x02\x02", "\u0403\u0404\x07w\x02\x02\u0404\u0405\x07k\x02\x02\u0405", "\u0406\x07p\x02\x02\u0406\u0407\x07v\x02\x02\u0407\u0408", "\x073\x02\x02\u0408\u0409\x079\x02\x02\u0409\u0451\x07", "8\x02\x02\u040A\u040B\x07w\x02\x02\u040B\u040C\x07k\x02", "\x02\u040C\u040D\x07p\x02\x02\u040D\u040E\x07v\x02\x02", "\u040E\u040F\x073\x02\x02\u040F\u0410\x07:\x02\x02\u0410", "\u0451\x076\x02\x02\u0411\u0412\x07w\x02\x02\u0412\u0413", "\x07k\x02\x02\u0413\u0414\x07p\x02\x02\u0414\u0415\x07", "v\x02\x02\u0415\u0416\x073\x02\x02\u0416\u0417\x07;\x02", "\x02\u0417\u0451\x074\x02\x02\u0418\u0419\x07w\x02\x02", "\u0419\u041A\x07k\x02\x02\u041A\u041B\x07p\x02\x02\u041B", "\u041C\x07v\x02\x02\u041C\u041D\x074\x02\x02\u041D\u041E", "\x072\x02\x02\u041E\u0451\x072\x02\x02\u041F\u0420\x07", "w\x02\x02\u0420\u0421\x07k\x02\x02\u0421\u0422\x07p\x02", "\x02\u0422\u0423\x07v\x02\x02\u0423\u0424\x074\x02\x02", "\u0424\u0425\x072\x02\x02\u0425\u0451\x07:\x02\x02\u0426", "\u0427\x07w\x02\x02\u0427\u0428\x07k\x02\x02\u0428\u0429", "\x07p\x02\x02\u0429\u042A\x07v\x02\x02\u042A\u042B\x07", "4\x02\x02\u042B\u042C\x073\x02\x02\u042C\u0451\x078\x02", "\x02\u042D\u042E\x07w\x02\x02\u042E\u042F\x07k\x02\x02", "\u042F\u0430\x07p\x02\x02\u0430\u0431\x07v\x02\x02\u0431", "\u0432\x074\x02\x02\u0432\u0433\x074\x02\x02\u0433\u0451", "\x076\x02\x02\u0434\u0435\x07w\x02\x02\u0435\u0436\x07", "k\x02\x02\u0436\u0437\x07p\x02\x02\u0437\u0438\x07v\x02", "\x02\u0438\u0439\x074\x02\x02\u0439\u043A\x075\x02\x02", "\u043A\u0451\x074\x02\x02\u043B\u043C\x07w\x02\x02\u043C", "\u043D\x07k\x02\x02\u043D\u043E\x07p\x02\x02\u043E\u043F", "\x07v\x02\x02\u043F\u0440\x074\x02\x02\u0440\u0441\x07", "6\x02\x02\u0441\u0451\x072\x02\x02\u0442\u0443\x07w\x02", "\x02\u0443\u0444\x07k\x02\x02\u0444\u0445\x07p\x02\x02", "\u0445\u0446\x07v\x02\x02\u0446\u0447\x074\x02\x02\u0447", "\u0448\x076\x02\x02\u0448\u0451\x07:\x02\x02\u0449\u044A", "\x07w\x02\x02\u044A\u044B\x07k\x02\x02\u044B\u044C\x07", "p\x02\x02\u044C\u044D\x07v\x02\x02\u044D\u044E\x074\x02", "\x02\u044E\u044F\x077\x02\x02\u044F\u0451\x078\x02\x02", "\u0450\u0379\x03\x02\x02\x02\u0450\u037D\x03\x02\x02\x02", "\u0450\u0382\x03\x02\x02\x02\u0450\u0388\x03\x02\x02\x02", "\u0450\u038E\x03\x02\x02\x02\u0450\u0394\x03\x02\x02\x02", "\u0450\u039A\x03\x02\x02\x02\u0450\u03A0\x03\x02\x02\x02", "\u0450\u03A6\x03\x02\x02\x02\u0450\u03AC\x03\x02\x02\x02", "\u0450\u03B2\x03\x02\x02\x02\u0450\u03B8\x03\x02\x02\x02", "\u0450\u03BE\x03\x02\x02\x02\u0450\u03C4\x03\x02\x02\x02", "\u0450\u03CB\x03\x02\x02\x02\u0450\u03D2\x03\x02\x02\x02", "\u0450\u03D9\x03\x02\x02\x02\u0450\u03E0\x03\x02\x02\x02", "\u0450\u03E7\x03\x02\x02\x02\u0450\u03EE\x03\x02\x02\x02", "\u0450\u03F5\x03\x02\x02\x02\u0450\u03FC\x03\x02\x02\x02", "\u0450\u0403\x03\x02\x02\x02\u0450\u040A\x03\x02\x02\x02", "\u0450\u0411\x03\x02\x02\x02\u0450\u0418\x03\x02\x02\x02", "\u0450\u041F\x03\x02\x02\x02\u0450\u0426\x03\x02\x02\x02", "\u0450\u042D\x03\x02\x02\x02\u0450\u0434\x03\x02\x02\x02", "\u0450\u043B\x03\x02\x02\x02\u0450\u0442\x03\x02\x02\x02", "\u0450\u0449\x03\x02\x02\x02\u0451\xC4\x03\x02\x02\x02", "\u0452\u0453\x07d\x02\x02\u0453\u0454\x07{\x02\x02\u0454", "\u0455\x07v\x02\x02\u0455\u0456\x07g\x02\x02\u0456\u052F", "\x07u\x02\x02\u0457\u0458\x07d\x02\x02\u0458\u0459\x07", "{\x02\x02\u0459\u045A\x07v\x02\x02\u045A\u045B\x07g\x02", "\x02\u045B\u045C\x07u\x02\x02\u045C\u052F\x073\x02\x02", "\u045D\u045E\x07d\x02\x02\u045E\u045F\x07{\x02\x02\u045F", "\u0460\x07v\x02\x02\u0460\u0461\x07g\x02\x02\u0461\u0462", "\x07u\x02\x02\u0462\u052F\x074\x02\x02\u0463\u0464\x07", "d\x02\x02\u0464\u0465\x07{\x02\x02\u0465\u0466\x07v\x02", "\x02\u0466\u0467\x07g\x02\x02\u0467\u0468\x07u\x02\x02", "\u0468\u052F\x075\x02\x02\u0469\u046A\x07d\x02\x02\u046A", "\u046B\x07{\x02\x02\u046B\u046C\x07v\x02\x02\u046C\u046D", "\x07g\x02\x02\u046D\u046E\x07u\x02\x02\u046E\u052F\x07", "6\x02\x02\u046F\u0470\x07d\x02\x02\u0470\u0471\x07{\x02", "\x02\u0471\u0472\x07v\x02\x02\u0472\u0473\x07g\x02\x02", "\u0473\u0474\x07u\x02\x02\u0474\u052F\x077\x02\x02\u0475", "\u0476\x07d\x02\x02\u0476\u0477\x07{\x02\x02\u0477\u0478", "\x07v\x02\x02\u0478\u0479\x07g\x02\x02\u0479\u047A\x07", "u\x02\x02\u047A\u052F\x078\x02\x02\u047B\u047C\x07d\x02", "\x02\u047C\u047D\x07{\x02\x02\u047D\u047E\x07v\x02\x02", "\u047E\u047F\x07g\x02\x02\u047F\u0480\x07u\x02\x02\u0480", "\u052F\x079\x02\x02\u0481\u0482\x07d\x02\x02\u0482\u0483", "\x07{\x02\x02\u0483\u0484\x07v\x02\x02\u0484\u0485\x07", "g\x02\x02\u0485\u0486\x07u\x02\x02\u0486\u052F\x07:\x02", "\x02\u0487\u0488\x07d\x02\x02\u0488\u0489\x07{\x02\x02", "\u0489\u048A\x07v\x02\x02\u048A\u048B\x07g\x02\x02\u048B", "\u048C\x07u\x02\x02\u048C\u052F\x07;\x02\x02\u048D\u048E", "\x07d\x02\x02\u048E\u048F\x07{\x02\x02\u048F\u0490\x07", "v\x02\x02\u0490\u0491\x07g\x02\x02\u0491\u0492\x07u\x02", "\x02\u0492\u0493\x073\x02\x02\u0493\u052F\x072\x02\x02", "\u0494\u0495\x07d\x02\x02\u0495\u0496\x07{\x02\x02\u0496", "\u0497\x07v\x02\x02\u0497\u0498\x07g\x02\x02\u0498\u0499", "\x07u\x02\x02\u0499\u049A\x073\x02\x02\u049A\u052F\x07", "3\x02\x02\u049B\u049C\x07d\x02\x02\u049C\u049D\x07{\x02", "\x02\u049D\u049E\x07v\x02\x02\u049E\u049F\x07g\x02\x02", "\u049F\u04A0\x07u\x02\x02\u04A0\u04A1\x073\x02\x02\u04A1", "\u052F\x074\x02\x02\u04A2\u04A3\x07d\x02\x02\u04A3\u04A4", "\x07{\x02\x02\u04A4\u04A5\x07v\x02\x02\u04A5\u04A6\x07", "g\x02\x02\u04A6\u04A7\x07u\x02\x02\u04A7\u04A8\x073\x02", "\x02\u04A8\u052F\x075\x02\x02\u04A9\u04AA\x07d\x02\x02", "\u04AA\u04AB\x07{\x02\x02\u04AB\u04AC\x07v\x02\x02\u04AC", "\u04AD\x07g\x02\x02\u04AD\u04AE\x07u\x02\x02\u04AE\u04AF", "\x073\x02\x02\u04AF\u052F\x076\x02\x02\u04B0\u04B1\x07", "d\x02\x02\u04B1\u04B2\x07{\x02\x02\u04B2\u04B3\x07v\x02", "\x02\u04B3\u04B4\x07g\x02\x02\u04B4\u04B5\x07u\x02\x02", "\u04B5\u04B6\x073\x02\x02\u04B6\u052F\x077\x02\x02\u04B7", "\u04B8\x07d\x02\x02\u04B8\u04B9\x07{\x02\x02\u04B9\u04BA", "\x07v\x02\x02\u04BA\u04BB\x07g\x02\x02\u04BB\u04BC\x07", "u\x02\x02\u04BC\u04BD\x073\x02\x02\u04BD\u052F\x078\x02", "\x02\u04BE\u04BF\x07d\x02\x02\u04BF\u04C0\x07{\x02\x02", "\u04C0\u04C1\x07v\x02\x02\u04C1\u04C2\x07g\x02\x02\u04C2", "\u04C3\x07u\x02\x02\u04C3\u04C4\x073\x02\x02\u04C4\u052F", "\x079\x02\x02\u04C5\u04C6\x07d\x02\x02\u04C6\u04C7\x07", "{\x02\x02\u04C7\u04C8\x07v\x02\x02\u04C8\u04C9\x07g\x02", "\x02\u04C9\u04CA\x07u\x02\x02\u04CA\u04CB\x073\x02\x02", "\u04CB\u052F\x07:\x02\x02\u04CC\u04CD\x07d\x02\x02\u04CD", "\u04CE\x07{\x02\x02\u04CE\u04CF\x07v\x02\x02\u04CF\u04D0", "\x07g\x02\x02\u04D0\u04D1\x07u\x02\x02\u04D1\u04D2\x07", "3\x02\x02\u04D2\u052F\x07;\x02\x02\u04D3\u04D4\x07d\x02", "\x02\u04D4\u04D5\x07{\x02\x02\u04D5\u04D6\x07v\x02\x02", "\u04D6\u04D7\x07g\x02\x02\u04D7\u04D8\x07u\x02\x02\u04D8", "\u04D9\x074\x02\x02\u04D9\u052F\x072\x02\x02\u04DA\u04DB", "\x07d\x02\x02\u04DB\u04DC\x07{\x02\x02\u04DC\u04DD\x07", "v\x02\x02\u04DD\u04DE\x07g\x02\x02\u04DE\u04DF\x07u\x02", "\x02\u04DF\u04E0\x074\x02\x02\u04E0\u052F\x073\x02\x02", "\u04E1\u04E2\x07d\x02\x02\u04E2\u04E3\x07{\x02\x02\u04E3", "\u04E4\x07v\x02\x02\u04E4\u04E5\x07g\x02\x02\u04E5\u04E6", "\x07u\x02\x02\u04E6\u04E7\x074\x02\x02\u04E7\u052F\x07", "4\x02\x02\u04E8\u04E9\x07d\x02\x02\u04E9\u04EA\x07{\x02", "\x02\u04EA\u04EB\x07v\x02\x02\u04EB\u04EC\x07g\x02\x02", "\u04EC\u04ED\x07u\x02\x02\u04ED\u04EE\x074\x02\x02\u04EE", "\u052F\x075\x02\x02\u04EF\u04F0\x07d\x02\x02\u04F0\u04F1", "\x07{\x02\x02\u04F1\u04F2\x07v\x02\x02\u04F2\u04F3\x07", "g\x02\x02\u04F3\u04F4\x07u\x02\x02\u04F4\u04F5\x074\x02", "\x02\u04F5\u052F\x076\x02\x02\u04F6\u04F7\x07d\x02\x02", "\u04F7\u04F8\x07{\x02\x02\u04F8\u04F9\x07v\x02\x02\u04F9", "\u04FA\x07g\x02\x02\u04FA\u04FB\x07u\x02\x02\u04FB\u04FC", "\x074\x02\x02\u04FC\u052F\x077\x02\x02\u04FD\u04FE\x07", "d\x02\x02\u04FE\u04FF\x07{\x02\x02\u04FF\u0500\x07v\x02", "\x02\u0500\u0501\x07g\x02\x02\u0501\u0502\x07u\x02\x02", "\u0502\u0503\x074\x02\x02\u0503\u052F\x078\x02\x02\u0504", "\u0505\x07d\x02\x02\u0505\u0506\x07{\x02\x02\u0506\u0507", "\x07v\x02\x02\u0507\u0508\x07g\x02\x02\u0508\u0509\x07", "u\x02\x02\u0509\u050A\x074\x02\x02\u050A\u052F\x079\x02", "\x02\u050B\u050C\x07d\x02\x02\u050C\u050D\x07{\x02\x02", "\u050D\u050E\x07v\x02\x02\u050E\u050F\x07g\x02\x02\u050F", "\u0510\x07u\x02\x02\u0510\u0511\x074\x02\x02\u0511\u052F", "\x07:\x02\x02\u0512\u0513\x07d\x02\x02\u0513\u0514\x07", "{\x02\x02\u0514\u0515\x07v\x02\x02\u0515\u0516\x07g\x02", "\x02\u0516\u0517\x07u\x02\x02\u0517\u0518\x074\x02\x02", "\u0518\u052F\x07;\x02\x02\u0519\u051A\x07d\x02\x02\u051A", "\u051B\x07{\x02\x02\u051B\u051C\x07v\x02\x02\u051C\u051D", "\x07g\x02\x02\u051D\u051E\x07u\x02\x02\u051E\u051F\x07", "5\x02\x02\u051F\u052F\x072\x02\x02\u0520\u0521\x07d\x02", "\x02\u0521\u0522\x07{\x02\x02\u0522\u0523\x07v\x02\x02", "\u0523\u0524\x07g\x02\x02\u0524\u0525\x07u\x02\x02\u0525", "\u0526\x075\x02\x02\u0526\u052F\x073\x02\x02\u0527\u0528", "\x07d\x02\x02\u0528\u0529\x07{\x02\x02\u0529\u052A\x07", "v\x02\x02\u052A\u052B\x07g\x02\x02\u052B\u052C\x07u\x02", "\x02\u052C\u052D\x075\x02\x02\u052D\u052F\x074\x02\x02", "\u052E\u0452\x03\x02\x02\x02\u052E\u0457\x03\x02\x02\x02", "\u052E\u045D\x03\x02\x02\x02\u052E\u0463\x03\x02\x02\x02", "\u052E\u0469\x03\x02\x02\x02\u052E\u046F\x03\x02\x02\x02", "\u052E\u0475\x03\x02\x02\x02\u052E\u047B\x03\x02\x02\x02", "\u052E\u0481\x03\x02\x02\x02\u052E\u0487\x03\x02\x02\x02", "\u052E\u048D\x03\x02\x02\x02\u052E\u0494\x03\x02\x02\x02", "\u052E\u049B\x03\x02\x02\x02\u052E\u04A2\x03\x02\x02\x02", "\u052E\u04A9\x03\x02\x02\x02\u052E\u04B0\x03\x02\x02\x02", "\u052E\u04B7\x03\x02\x02\x02\u052E\u04BE\x03\x02\x02\x02", "\u052E\u04C5\x03\x02\x02\x02\u052E\u04CC\x03\x02\x02\x02", "\u052E\u04D3\x03\x02\x02\x02\u052E\u04DA\x03\x02\x02\x02", "\u052E\u04E1\x03\x02\x02\x02\u052E\u04E8\x03\x02\x02\x02", "\u052E\u04EF\x03\x02\x02\x02\u052E\u04F6\x03\x02\x02\x02", "\u052E\u04FD\x03\x02\x02\x02\u052E\u0504\x03\x02\x02\x02", "\u052E\u050B\x03\x02\x02\x02\u052E\u0512\x03\x02\x02\x02", "\u052E\u0519\x03\x02\x02\x02\u052E\u0520\x03\x02\x02\x02", "\u052E\u0527\x03\x02\x02\x02\u052F\xC6\x03\x02\x02\x02", "\u0530\u0531\x07h\x02\x02\u0531\u0532\x07k\x02\x02\u0532", "\u0533\x07z\x02\x02\u0533\u0534\x07g\x02\x02\u0534\u0547", "\x07f\x02\x02\u0535\u0536\x07h\x02\x02\u0536\u0537\x07", "k\x02\x02\u0537\u0538\x07z\x02\x02\u0538\u0539\x07g\x02", "\x02\u0539\u053A\x07f\x02\x02\u053A\u053C\x03\x02\x02", "\x02\u053B\u053D\t\x02\x02\x02\u053C\u053B\x03\x02\x02", "\x02\u053D\u053E\x03\x02\x02\x02\u053E\u053C\x03\x02\x02", "\x02\u053E\u053F\x03\x02\x02\x02\u053F\u0540\x03\x02\x02", "\x02\u0540\u0542\x07z\x02\x02\u0541\u0543\t\x02\x02\x02", "\u0542\u0541\x03\x02\x02\x02\u0543\u0544\x03\x02\x02\x02", "\u0544\u0542\x03\x02\x02\x02\u0544\u0545\x03\x02\x02\x02", "\u0545\u0547\x03\x02\x02\x02\u0546\u0530\x03\x02\x02\x02", "\u0546\u0535\x03\x02\x02\x02\u0547\xC8\x03\x02\x02\x02", "\u0548\u0549\x07w\x02\x02\u0549\u054A\x07h\x02\x02\u054A", "\u054B\x07k\x02\x02\u054B\u054C\x07z\x02\x02\u054C\u054D", "\x07g\x02\x02\u054D\u0561\x07f\x02\x02\u054E\u054F\x07", "w\x02\x02\u054F\u0550\x07h\x02\x02\u0550\u0551\x07k\x02", "\x02\u0551\u0552\x07z\x02\x02\u0552\u0553\x07g\x02\x02", "\u0553\u0554\x07f\x02\x02\u0554\u0556\x03\x02\x02\x02", "\u0555\u0557\t\x02\x02\x02\u0556\u0555\x03\x02\x02\x02", "\u0557\u0558\x03\x02\x02\x02\u0558\u0556\x03\x02\x02\x02", "\u0558\u0559\x03\x02\x02\x02\u0559\u055A\x03\x02\x02\x02", "\u055A\u055C\x07z\x02\x02\u055B\u055D\t\x02\x02\x02\u055C", "\u055B\x03\x02\x02\x02\u055D\u055E\x03\x02\x02\x02\u055E", "\u055C\x03\x02\x02\x02\u055E\u055F\x03\x02\x02\x02\u055F", "\u0561\x03\x02\x02\x02\u0560\u0548\x03\x02\x02\x02\u0560", "\u054E\x03\x02\x02\x02\u0561\xCA\x03\x02\x02\x02\u0562", "\u0563\x07v\x02\x02\u0563\u0564\x07t\x02\x02\u0564\u0565", "\x07w\x02\x02\u0565\u056C\x07g\x02\x02\u0566\u0567\x07", "h\x02\x02\u0567\u0568\x07c\x02\x02\u0568\u0569\x07n\x02", "\x02\u0569\u056A\x07u\x02\x02\u056A\u056C\x07g\x02\x02", "\u056B\u0562\x03\x02\x02\x02\u056B\u0566\x03\x02\x02\x02", "\u056C\xCC\x03\x02\x02\x02\u056D\u0574\x05\xCFh\x02", "\u056E\u0570\x05\xCFh\x02\u056F\u056E\x03\x02\x02\x02", "\u056F\u0570\x03\x02\x02\x02\u0570\u0571\x03\x02\x02\x02", "\u0571\u0572\x070\x02\x02\u0572\u0574\x05\xCFh\x02\u0573", "\u056D\x03\x02\x02\x02\u0573\u056F\x03\x02\x02\x02\u0574", "\u0577\x03\x02\x02\x02\u0575\u0576\t\x03\x02\x02\u0576", "\u0578\x05\xCFh\x02\u0577\u0575\x03\x02\x02\x02\u0577", "\u0578\x03\x02\x02\x02\u0578\xCE\x03\x02\x02\x02\u0579", "\u0580\t\x02\x02\x02\u057A\u057C\x07a\x02\x02\u057B\u057A", "\x03\x02\x02\x02\u057B\u057C\x03\x02\x02\x02\u057C\u057D", "\x03\x02\x02\x02\u057D\u057F\t\x02\x02\x02\u057E\u057B", "\x03\x02\x02\x02\u057F\u0582\x03\x02\x02\x02\u0580\u057E", "\x03\x02\x02\x02\u0580\u0581\x03\x02\x02\x02\u0581\xD0", "\x03\x02\x02\x02\u0582\u0580\x03\x02\x02\x02\u0583\u0584", "\x072\x02\x02\u0584\u0585\t\x04\x02\x02\u0585\u0586\x05", "\xD3j\x02\u0586\xD2\x03\x02\x02\x02\u0587\u058E\x05", "\xDBn\x02\u0588\u058A\x07a\x02\x02\u0589\u0588\x03\x02", "\x02\x02\u0589\u058A\x03\x02\x02\x02\u058A\u058B\x03\x02", "\x02\x02\u058B\u058D\x05\xDBn\x02\u058C\u0589\x03\x02", "\x02\x02\u058D\u0590\x03\x02\x02\x02\u058E\u058C\x03\x02", "\x02\x02\u058E\u058F\x03\x02\x02\x02\u058F\xD4\x03\x02", "\x02\x02\u0590\u058E\x03\x02\x02\x02\u0591\u0592\x07y", "\x02\x02\u0592\u0593\x07g\x02\x02\u0593\u05CA\x07k\x02", "\x02\u0594\u0595\x07i\x02\x02\u0595\u0596\x07y\x02\x02", "\u0596\u0597\x07g\x02\x02\u0597\u05CA\x07k\x02\x02\u0598", "\u0599\x07u\x02\x02\u0599\u059A\x07|\x02\x02\u059A\u059B", "\x07c\x02\x02\u059B\u059C\x07d\x02\x02\u059C\u05CA\x07", "q\x02\x02\u059D\u059E\x07h\x02\x02\u059E\u059F\x07k\x02", "\x02\u059F\u05A0\x07p\x02\x02\u05A0\u05A1\x07p\x02\x02", "\u05A1\u05A2\x07g\x02\x02\u05A2\u05CA\x07{\x02\x02\u05A3", "\u05A4\x07g\x02\x02\u05A4\u05A5\x07v\x02\x02\u05A5\u05A6", "\x07j\x02\x02\u05A6\u05A7\x07g\x02\x02\u05A7\u05CA\x07", "t\x02\x02\u05A8\u05A9\x07u\x02\x02\u05A9\u05AA\x07g\x02", "\x02\u05AA\u05AB\x07e\x02\x02\u05AB\u05AC\x07q\x02\x02", "\u05AC\u05AD\x07p\x02\x02\u05AD\u05AE\x07f\x02\x02\u05AE", "\u05CA\x07u\x02\x02\u05AF\u05B0\x07o\x02\x02\u05B0\u05B1", "\x07k\x02\x02\u05B1\u05B2\x07p\x02\x02\u05B2\u05B3\x07", "w\x02\x02\u05B3\u05B4\x07v\x02\x02\u05B4\u05B5\x07g\x02", "\x02\u05B5\u05CA\x07u\x02\x02\u05B6\u05B7\x07j\x02\x02", "\u05B7\u05B8\x07q\x02\x02\u05B8\u05B9\x07w\x02\x02\u05B9", "\u05BA\x07t\x02\x02\u05BA\u05CA\x07u\x02\x02\u05BB\u05BC", "\x07f\x02\x02\u05BC\u05BD\x07c\x02\x02\u05BD\u05BE\x07", "{\x02\x02\u05BE\u05CA\x07u\x02\x02\u05BF\u05C0\x07y\x02", "\x02\u05C0\u05C1\x07g\x02\x02\u05C1\u05C2\x07g\x02\x02", "\u05C2\u05C3\x07m\x02\x02\u05C3\u05CA\x07u\x02\x02\u05C4", "\u05C5\x07{\x02\x02\u05C5\u05C6\x07g\x02\x02\u05C6\u05C7", "\x07c\x02\x02\u05C7\u05C8\x07t\x02\x02\u05C8\u05CA\x07", "u\x02\x02\u05C9\u0591\x03\x02\x02\x02\u05C9\u0594\x03", "\x02\x02\x02\u05C9\u0598\x03\x02\x02\x02\u05C9\u059D\x03", "\x02\x02\x02\u05C9\u05A3\x03\x02\x02\x02\u05C9\u05A8\x03", "\x02\x02\x02\u05C9\u05AF\x03\x02\x02\x02\u05C9\u05B6\x03", "\x02\x02\x02\u05C9\u05BB\x03\x02\x02\x02\u05C9\u05BF\x03", "\x02\x02\x02\u05C9\u05C4\x03\x02\x02\x02\u05CA\xD6\x03", "\x02\x02\x02\u05CB\u05CC\x07j\x02\x02\u05CC\u05CD\x07", "g\x02\x02\u05CD\u05CE\x07z\x02\x02\u05CE\u05D9\x03\x02", "\x02\x02\u05CF\u05D1\x07$\x02\x02\u05D0\u05D2\x05\xD3", "j\x02\u05D1\u05D0\x03\x02\x02\x02\u05D1\u05D2\x03\x02", "\x02\x02\u05D2\u05D3\x03\x02\x02\x02\u05D3\u05DA\x07$", "\x02\x02\u05D4\u05D6\x07)\x02\x02\u05D5\u05D7\x05\xD3", "j\x02\u05D6\u05D5\x03\x02\x02\x02\u05D6\u05D7\x03\x02", "\x02\x02\u05D7\u05D8\x03\x02\x02\x02\u05D8\u05DA\x07)", "\x02\x02\u05D9\u05CF\x03\x02\x02\x02\u05D9\u05D4\x03\x02", "\x02\x02\u05DA\xD8\x03\x02\x02\x02\u05DB\u05DC\x05\xDB", "n\x02\u05DC\u05DD\x05\xDBn\x02\u05DD\xDA\x03\x02\x02", "\x02\u05DE\u05DF\t\x05\x02\x02\u05DF\xDC\x03\x02\x02", "\x02\u05E0\u05E1\x07c\x02\x02\u05E1\u05E2\x07d\x02\x02", "\u05E2\u05E3\x07u\x02\x02\u05E3\u05E4\x07v\x02\x02\u05E4", "\u05E5\x07t\x02\x02\u05E5\u05E6\x07c\x02\x02\u05E6\u05E7", "\x07e\x02\x02\u05E7\u0639\x07v\x02\x02\u05E8\u05E9\x07", "c\x02\x02\u05E9\u05EA\x07h\x02\x02\u05EA\u05EB\x07v\x02", "\x02\u05EB\u05EC\x07g\x02\x02\u05EC\u0639\x07t\x02\x02", "\u05ED\u05EE\x07e\x02\x02\u05EE\u05EF\x07c\x02\x02\u05EF", "\u05F0\x07u\x02\x02\u05F0\u0639\x07g\x02\x02\u05F1\u05F2", "\x07e\x02\x02\u05F2\u05F3\x07c\x02\x02\u05F3\u05F4\x07", "v\x02\x02\u05F4\u05F5\x07e\x02\x02\u05F5\u0639\x07j\x02", "\x02\u05F6\u05F7\x07f\x02\x02\u05F7\u05F8\x07g\x02\x02", "\u05F8\u05F9\x07h\x02\x02\u05F9\u05FA\x07c\x02\x02\u05FA", "\u05FB\x07w\x02\x02\u05FB\u05FC\x07n\x02\x02\u05FC\u0639", "\x07v\x02\x02\u05FD\u05FE\x07h\x02\x02\u05FE\u05FF\x07", "k\x02\x02\u05FF\u0600\x07p\x02\x02\u0600\u0601\x07c\x02", "\x02\u0601\u0639\x07n\x02\x02\u0602\u0603\x07k\x02\x02", "\u0603\u0639\x07p\x02\x02\u0604\u0605\x07k\x02\x02\u0605", "\u0606\x07p\x02\x02\u0606\u0607\x07n\x02\x02\u0607\u0608", "\x07k\x02\x02\u0608\u0609\x07p\x02\x02\u0609\u0639\x07", "g\x02\x02\u060A\u060B\x07n\x02\x02\u060B\u060C\x07g\x02", "\x02\u060C\u0639\x07v\x02\x02\u060D\u060E\x07o\x02\x02", "\u060E\u060F\x07c\x02\x02\u060F\u0610\x07v\x02\x02\u0610", "\u0611\x07e\x02\x02\u0611\u0639\x07j\x02\x02\u0612\u0613", "\x07p\x02\x02\u0613\u0614\x07w\x02\x02\u0614\u0615\x07", "n\x02\x02\u0615\u0639\x07n\x02\x02\u0616\u0617\x07q\x02", "\x02\u0617\u0639\x07h\x02\x02\u0618\u0619\x07t\x02\x02", "\u0619\u061A\x07g\x02\x02\u061A\u061B\x07n\x02\x02\u061B", "\u061C\x07q\x02\x02\u061C\u061D\x07e\x02\x02\u061D\u061E", "\x07c\x02\x02\u061E\u061F\x07v\x02\x02\u061F\u0620\x07", "c\x02\x02\u0620\u0621\x07d\x02\x02\u0621\u0622\x07n\x02", "\x02\u0622\u0639\x07g\x02\x02\u0623\u0624\x07u\x02\x02", "\u0624\u0625\x07v\x02\x02\u0625\u0626\x07c\x02\x02\u0626", "\u0627\x07v\x02\x02\u0627\u0628\x07k\x02\x02\u0628\u0639", "\x07e\x02\x02\u0629\u062A\x07u\x02\x02\u062A\u062B\x07", "y\x02\x02\u062B\u062C\x07k\x02\x02\u062C\u062D\x07v\x02", "\x02\u062D\u062E\x07e\x02\x02\u062E\u0639\x07j\x02\x02", "\u062F\u0630\x07v\x02\x02\u0630\u0631\x07t\x02\x02\u0631", "\u0639\x07{\x02\x02\u0632\u0633\x07v\x02\x02\u0633\u0634", "\x07{\x02\x02\u0634\u0635\x07r\x02\x02\u0635\u0636\x07", "g\x02\x02\u0636\u0637\x07q\x02\x02\u0637\u0639\x07h\x02", "\x02\u0638\u05E0\x03\x02\x02\x02\u0638\u05E8\x03\x02\x02", "\x02\u0638\u05ED\x03\x02\x02\x02\u0638\u05F1\x03\x02\x02", "\x02\u0638\u05F6\x03\x02\x02\x02\u0638\u05FD\x03\x02\x02", "\x02\u0638\u0602\x03\x02\x02\x02\u0638\u0604\x03\x02\x02", "\x02\u0638\u060A\x03\x02\x02\x02\u0638\u060D\x03\x02\x02", "\x02\u0638\u0612\x03\x02\x02\x02\u0638\u0616\x03\x02\x02", "\x02\u0638\u0618\x03\x02\x02\x02\u0638\u0623\x03\x02\x02", "\x02\u0638\u0629\x03\x02\x02\x02\u0638\u062F\x03\x02\x02", "\x02\u0638\u0632\x03\x02\x02\x02\u0639\xDE\x03\x02\x02", "\x02\u063A\u063B\x07c\x02\x02\u063B\u063C\x07p\x02\x02", "\u063C\u063D\x07q\x02\x02\u063D\u063E\x07p\x02\x02\u063E", "\u063F\x07{\x02\x02\u063F\u0640\x07o\x02\x02\u0640\u0641", "\x07q\x02\x02\u0641\u0642\x07w\x02\x02\u0642\u0643\x07", "u\x02\x02\u0643\xE0\x03\x02\x02\x02\u0644\u0645\x07", "d\x02\x02\u0645\u0646\x07t\x02\x02\u0646\u0647\x07g\x02", "\x02\u0647\u0648\x07c\x02\x02\u0648\u0649\x07m\x02\x02", "\u0649\xE2\x03\x02\x02\x02\u064A\u064B\x07e\x02\x02", "\u064B\u064C\x07q\x02\x02\u064C\u064D\x07p\x02\x02\u064D", "\u064E\x07u\x02\x02\u064E\u064F\x07v\x02\x02\u064F\u0650", "\x07c\x02\x02\u0650\u0651\x07p\x02\x02\u0651\u0652\x07", "v\x02\x02\u0652\xE4\x03\x02\x02\x02\u0653\u0654\x07", "k\x02\x02\u0654\u0655\x07o\x02\x02\u0655\u0656\x07o\x02", "\x02\u0656\u0657\x07w\x02\x02\u0657\u0658\x07v\x02\x02", "\u0658\u0659\x07c\x02\x02\u0659\u065A\x07d\x02\x02\u065A", "\u065B\x07n\x02\x02\u065B\u065C\x07g\x02\x02\u065C\xE6", "\x03\x02\x02\x02\u065D\u065E\x07e\x02\x02\u065E\u065F", "\x07q\x02\x02\u065F\u0660\x07p\x02\x02\u0660\u0661\x07", "v\x02\x02\u0661\u0662\x07k\x02\x02\u0662\u0663\x07p\x02", "\x02\u0663\u0664\x07w\x02\x02\u0664\u0665\x07g\x02\x02", "\u0665\xE8\x03\x02\x02\x02\u0666\u0667\x07n\x02\x02", "\u0667\u0668\x07g\x02\x02\u0668\u0669\x07c\x02\x02\u0669", "\u066A\x07x\x02\x02\u066A\u066B\x07g\x02\x02\u066B\xEA", "\x03\x02\x02\x02\u066C\u066D\x07g\x02\x02\u066D\u066E", "\x07z\x02\x02\u066E\u066F\x07v\x02\x02\u066F\u0670\x07", "g\x02\x02\u0670\u0671\x07t\x02\x02\u0671\u0672\x07p\x02", "\x02\u0672\u0673\x07c\x02\x02\u0673\u0674\x07n\x02\x02", "\u0674\xEC\x03\x02\x02\x02\u0675\u0676\x07k\x02\x02", "\u0676\u0677\x07p\x02\x02\u0677\u0678\x07f\x02\x02\u0678", "\u0679\x07g\x02\x02\u0679\u067A\x07z\x02\x02\u067A\u067B", "\x07g\x02\x02\u067B\u067C\x07f\x02\x02\u067C\xEE\x03", "\x02\x02\x02\u067D\u067E\x07k\x02\x02\u067E\u067F\x07", "p\x02\x02\u067F\u0680\x07v\x02\x02\u0680\u0681\x07g\x02", "\x02\u0681\u0682\x07t\x02\x02\u0682\u0683\x07p\x02\x02", "\u0683\u0684\x07c\x02\x02\u0684\u0685\x07n\x02\x02\u0685", "\xF0\x03\x02\x02\x02\u0686\u0687\x07r\x02\x02\u0687", "\u0688\x07c\x02\x02\u0688\u0689\x07{\x02\x02\u0689\u068A", "\x07c\x02\x02\u068A\u068B\x07d\x02\x02\u068B\u068C\x07", "n\x02\x02\u068C\u068D\x07g\x02\x02\u068D\xF2\x03\x02", "\x02\x02\u068E\u068F\x07r\x02\x02\u068F\u0690\x07t\x02", "\x02\u0690\u0691\x07k\x02\x02\u0691\u0692\x07x\x02\x02", "\u0692\u0693\x07c\x02\x02\u0693\u0694\x07v\x02\x02\u0694", "\u0695\x07g\x02\x02\u0695\xF4\x03\x02\x02\x02\u0696", "\u0697\x07r\x02\x02\u0697\u0698\x07w\x02\x02\u0698\u0699", "\x07d\x02\x02\u0699\u069A\x07n\x02\x02\u069A\u069B\x07", "k\x02\x02\u069B\u069C\x07e\x02\x02\u069C\xF6\x03\x02", "\x02\x02\u069D\u069E\x07x\x02\x02\u069E\u069F\x07k\x02", "\x02\u069F\u06A0\x07t\x02\x02\u06A0\u06A1\x07v\x02\x02", "\u06A1\u06A2\x07w\x02\x02\u06A2\u06A3\x07c\x02\x02\u06A3", "\u06A4\x07n\x02\x02\u06A4\xF8\x03\x02\x02\x02\u06A5", "\u06A6\x07r\x02\x02\u06A6\u06A7\x07w\x02\x02\u06A7\u06A8", "\x07t\x02\x02\u06A8\u06A9\x07g\x02\x02\u06A9\xFA\x03", "\x02\x02\x02\u06AA\u06AB\x07v\x02\x02\u06AB\u06AC\x07", "{\x02\x02\u06AC\u06AD\x07r\x02\x02\u06AD\u06AE\x07g\x02", "\x02\u06AE\xFC\x03\x02\x02\x02\u06AF\u06B0\x07x\x02", "\x02\u06B0\u06B1\x07k\x02\x02\u06B1\u06B2\x07g\x02\x02", "\u06B2\u06B3\x07y\x02\x02\u06B3\xFE\x03\x02\x02\x02", "\u06B4\u06B5\x07e\x02\x02\u06B5\u06B6\x07q\x02\x02\u06B6", "\u06B7\x07p\x02\x02\u06B7\u06B8\x07u\x02\x02\u06B8\u06B9", "\x07v\x02\x02\u06B9\u06BA\x07t\x02\x02\u06BA\u06BB\x07", "w\x02\x02\u06BB\u06BC\x07e\x02\x02\u06BC\u06BD\x07v\x02", "\x02\u06BD\u06BE\x07q\x02\x02\u06BE\u06BF\x07t\x02\x02", "\u06BF\u0100\x03\x02\x02\x02\u06C0\u06C1\x07h\x02\x02", "\u06C1\u06C2\x07c\x02\x02\u06C2\u06C3\x07n\x02\x02\u06C3", "\u06C4\x07n\x02\x02\u06C4\u06C5\x07d\x02\x02\u06C5\u06C6", "\x07c\x02\x02\u06C6\u06C7\x07e\x02\x02\u06C7\u06C8\x07", "m\x02\x02\u06C8\u0102\x03\x02\x02\x02\u06C9\u06CA\x07", "t\x02\x02\u06CA\u06CB\x07g\x02\x02\u06CB\u06CC\x07e\x02", "\x02\u06CC\u06CD\x07g\x02\x02\u06CD\u06CE\x07k\x02\x02", "\u06CE\u06CF\x07x\x02\x02\u06CF\u06D0\x07g\x02\x02\u06D0", "\u0104\x03\x02\x02\x02\u06D1\u06D5\x05\u0107\x84\x02\u06D2", "\u06D4\x05\u0109\x85\x02\u06D3\u06D2\x03\x02\x02\x02\u06D4", "\u06D7\x03\x02\x02\x02\u06D5\u06D3\x03\x02\x02\x02\u06D5", "\u06D6\x03\x02\x02\x02\u06D6\u0106\x03\x02\x02\x02\u06D7", "\u06D5\x03\x02\x02\x02\u06D8\u06D9\t\x06\x02\x02\u06D9", "\u0108\x03\x02\x02\x02\u06DA\u06DB\t\x07\x02\x02\u06DB", "\u010A\x03\x02\x02\x02\u06DC\u06E0\x07$\x02\x02\u06DD", "\u06DF\x05\u010D\x87\x02\u06DE\u06DD\x03\x02\x02\x02\u06DF", "\u06E2\x03\x02\x02\x02\u06E0\u06DE\x03\x02\x02\x02\u06E0", "\u06E1\x03\x02\x02\x02\u06E1\u06E3\x03\x02\x02\x02\u06E2", "\u06E0\x03\x02\x02\x02\u06E3\u06ED\x07$\x02\x02\u06E4", "\u06E8\x07)\x02\x02\u06E5\u06E7\x05\u010F\x88\x02\u06E6", "\u06E5\x03\x02\x02\x02\u06E7\u06EA\x03\x02\x02\x02\u06E8", "\u06E6\x03\x02\x02\x02\u06E8\u06E9\x03\x02\x02\x02\u06E9", "\u06EB\x03\x02\x02\x02\u06EA\u06E8\x03\x02\x02\x02\u06EB", "\u06ED\x07)\x02\x02\u06EC\u06DC\x03\x02\x02\x02\u06EC", "\u06E4\x03\x02\x02\x02\u06ED\u010C\x03\x02\x02\x02\u06EE", "\u06F2\n\b\x02\x02\u06EF\u06F0\x07^\x02\x02\u06F0\u06F2\x0B", "\x02\x02\x02\u06F1\u06EE\x03\x02\x02\x02\u06F1\u06EF\x03", "\x02\x02\x02\u06F2\u010E\x03\x02\x02\x02\u06F3\u06F7\n", "\t\x02\x02\u06F4\u06F5\x07^\x02\x02\u06F5\u06F7\x0B\x02", "\x02\x02\u06F6\u06F3\x03\x02\x02\x02\u06F6\u06F4\x03\x02", "\x02\x02\u06F7\u0110\x03\x02\x02\x02\u06F8\u06FA\t\x02", "\x02\x02\u06F9\u06F8\x03\x02\x02\x02\u06FA\u06FB\x03\x02", "\x02\x02\u06FB\u06F9\x03\x02\x02\x02\u06FB\u06FC\x03\x02", "\x02\x02\u06FC\u06FD\x03\x02\x02\x02\u06FD\u06FF\x070", "\x02\x02\u06FE\u0700\t\x02\x02\x02\u06FF\u06FE\x03\x02", "\x02\x02\u0700\u0701\x03\x02\x02\x02\u0701\u06FF\x03\x02", "\x02\x02\u0701\u0702\x03\x02\x02\x02\u0702\u0709\x03\x02", "\x02\x02\u0703\u0705\x070\x02\x02\u0704\u0706\t\x02\x02", "\x02\u0705\u0704\x03\x02\x02\x02\u0706\u0707\x03\x02\x02", "\x02\u0707\u0705\x03\x02\x02\x02\u0707\u0708\x03\x02\x02", "\x02\u0708\u070A\x03\x02\x02\x02\u0709\u0703\x03\x02\x02", "\x02\u0709\u070A\x03\x02\x02\x02\u070A\u0112\x03\x02\x02", "\x02\u070B\u070D\t\n\x02\x02\u070C\u070B\x03\x02\x02\x02", "\u070D\u070E\x03\x02\x02\x02\u070E\u070C\x03\x02\x02\x02", "\u070E\u070F\x03\x02\x02\x02\u070F\u0710\x03\x02\x02\x02", "\u0710\u0711\b\x8A\x02\x02\u0711\u0114\x03\x02\x02\x02", "\u0712\u0713\x071\x02\x02\u0713\u0714\x07,\x02\x02\u0714", "\u0718\x03\x02\x02\x02\u0715\u0717\x0B\x02\x02\x02\u0716", "\u0715\x03\x02\x02\x02\u0717\u071A\x03\x02\x02\x02\u0718", "\u0719\x03\x02\x02\x02\u0718\u0716\x03\x02\x02\x02\u0719", "\u071B\x03\x02\x02\x02\u071A\u0718\x03\x02\x02\x02\u071B", "\u071C\x07,\x02\x02\u071C\u071D\x071\x02\x02\u071D\u071E", "\x03\x02\x02\x02\u071E\u071F\b\x8B\x03\x02\u071F\u0116", "\x03\x02\x02\x02\u0720\u0721\x071\x02\x02\u0721\u0722", "\x071\x02\x02\u0722\u0726\x03\x02\x02\x02\u0723\u0725", "\n\x0B\x02\x02\u0724\u0723\x03\x02\x02\x02\u0725\u0728", "\x03\x02\x02\x02\u0726\u0724\x03\x02\x02\x02\u0726\u0727", "\x03\x02\x02\x02\u0727\u0729\x03\x02\x02\x02\u0728\u0726", "\x03\x02\x02\x02\u0729\u072A\b\x8C\x03\x02\u072A\u0118", "\x03\x02\x02\x02&\x02\u0377\u0450\u052E\u053E\u0544\u0546", "\u0558\u055E\u0560\u056B\u056F\u0573\u0577\u057B\u0580\u0589\u058E\u05C9", "\u05D1\u05D6\u05D9\u0638\u06D5\u06E0\u06E8\u06EC\u06F1\u06F6\u06FB\u0701", "\u0707\u0709\u070E\u0718\u0726\x04\b\x02\x02\x02\x03\x02"].join("");
var atn$2 = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);
var decisionsToDFA = atn$2.decisionToState.map(function (ds, index) {
  return new antlr4.dfa.DFA(ds, index);
});

var SolidityLexer = /*#__PURE__*/function (_antlr4$Lexer) {
  _inherits(SolidityLexer, _antlr4$Lexer);

  var _super = _createSuper(SolidityLexer);

  function SolidityLexer(input) {
    var _this;

    _classCallCheck(this, SolidityLexer);

    _this = _super.call(this, input);
    _this._interp = new antlr4.atn.LexerATNSimulator(_assertThisInitialized(_this), atn$2, decisionsToDFA, new antlr4.PredictionContextCache());
    return _this;
  }

  _createClass(SolidityLexer, [{
    key: "atn",
    get: function get() {
      return atn$2;
    }
  }]);

  return SolidityLexer;
}(antlr4.Lexer);

_defineProperty(SolidityLexer, "grammarFileName", "Solidity.g4");

_defineProperty(SolidityLexer, "channelNames", ["DEFAULT_TOKEN_CHANNEL", "HIDDEN"]);

_defineProperty(SolidityLexer, "modeNames", ["DEFAULT_MODE"]);

_defineProperty(SolidityLexer, "literalNames", [null, "'pragma'", "';'", "'||'", "'^'", "'~'", "'>='", "'>'", "'<'", "'<='", "'='", "'as'", "'import'", "'*'", "'from'", "'{'", "','", "'}'", "'abstract'", "'contract'", "'interface'", "'library'", "'is'", "'('", "')'", "'using'", "'for'", "'struct'", "'modifier'", "'function'", "'returns'", "'event'", "'enum'", "'['", "']'", "'address'", "'.'", "'mapping'", "'=>'", "'memory'", "'storage'", "'calldata'", "'if'", "'else'", "'try'", "'catch'", "'while'", "'unchecked'", "'assembly'", "'do'", "'return'", "'throw'", "'emit'", "'var'", "'bool'", "'string'", "'byte'", "'++'", "'--'", "'new'", "':'", "'+'", "'-'", "'after'", "'delete'", "'!'", "'**'", "'/'", "'%'", "'<<'", "'>>'", "'&'", "'|'", "'=='", "'!='", "'&&'", "'?'", "'|='", "'^='", "'&='", "'<<='", "'>>='", "'+='", "'-='", "'*='", "'/='", "'%='", "'let'", "':='", "'=:'", "'switch'", "'case'", "'default'", "'->'", "'callback'", "'override'", null, null, null, null, null, null, null, null, null, null, null, "'anonymous'", "'break'", "'constant'", "'immutable'", "'continue'", "'leave'", "'external'", "'indexed'", "'internal'", "'payable'", "'private'", "'public'", "'virtual'", "'pure'", "'type'", "'view'", "'constructor'", "'fallback'", "'receive'"]);

_defineProperty(SolidityLexer, "symbolicNames", [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "Int", "Uint", "Byte", "Fixed", "Ufixed", "BooleanLiteral", "DecimalNumber", "HexNumber", "NumberUnit", "HexLiteralFragment", "ReservedKeyword", "AnonymousKeyword", "BreakKeyword", "ConstantKeyword", "ImmutableKeyword", "ContinueKeyword", "LeaveKeyword", "ExternalKeyword", "IndexedKeyword", "InternalKeyword", "PayableKeyword", "PrivateKeyword", "PublicKeyword", "VirtualKeyword", "PureKeyword", "TypeKeyword", "ViewKeyword", "ConstructorKeyword", "FallbackKeyword", "ReceiveKeyword", "Identifier", "StringLiteralFragment", "VersionLiteral", "WS", "COMMENT", "LINE_COMMENT"]);

_defineProperty(SolidityLexer, "ruleNames", ["T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "T__8", "T__9", "T__10", "T__11", "T__12", "T__13", "T__14", "T__15", "T__16", "T__17", "T__18", "T__19", "T__20", "T__21", "T__22", "T__23", "T__24", "T__25", "T__26", "T__27", "T__28", "T__29", "T__30", "T__31", "T__32", "T__33", "T__34", "T__35", "T__36", "T__37", "T__38", "T__39", "T__40", "T__41", "T__42", "T__43", "T__44", "T__45", "T__46", "T__47", "T__48", "T__49", "T__50", "T__51", "T__52", "T__53", "T__54", "T__55", "T__56", "T__57", "T__58", "T__59", "T__60", "T__61", "T__62", "T__63", "T__64", "T__65", "T__66", "T__67", "T__68", "T__69", "T__70", "T__71", "T__72", "T__73", "T__74", "T__75", "T__76", "T__77", "T__78", "T__79", "T__80", "T__81", "T__82", "T__83", "T__84", "T__85", "T__86", "T__87", "T__88", "T__89", "T__90", "T__91", "T__92", "T__93", "T__94", "Int", "Uint", "Byte", "Fixed", "Ufixed", "BooleanLiteral", "DecimalNumber", "DecimalDigits", "HexNumber", "HexDigits", "NumberUnit", "HexLiteralFragment", "HexPair", "HexCharacter", "ReservedKeyword", "AnonymousKeyword", "BreakKeyword", "ConstantKeyword", "ImmutableKeyword", "ContinueKeyword", "LeaveKeyword", "ExternalKeyword", "IndexedKeyword", "InternalKeyword", "PayableKeyword", "PrivateKeyword", "PublicKeyword", "VirtualKeyword", "PureKeyword", "TypeKeyword", "ViewKeyword", "ConstructorKeyword", "FallbackKeyword", "ReceiveKeyword", "Identifier", "IdentifierStart", "IdentifierPart", "StringLiteralFragment", "DoubleQuotedStringCharacter", "SingleQuotedStringCharacter", "VersionLiteral", "WS", "COMMENT", "LINE_COMMENT"]);
SolidityLexer.EOF = antlr4.Token.EOF;
SolidityLexer.T__0 = 1;
SolidityLexer.T__1 = 2;
SolidityLexer.T__2 = 3;
SolidityLexer.T__3 = 4;
SolidityLexer.T__4 = 5;
SolidityLexer.T__5 = 6;
SolidityLexer.T__6 = 7;
SolidityLexer.T__7 = 8;
SolidityLexer.T__8 = 9;
SolidityLexer.T__9 = 10;
SolidityLexer.T__10 = 11;
SolidityLexer.T__11 = 12;
SolidityLexer.T__12 = 13;
SolidityLexer.T__13 = 14;
SolidityLexer.T__14 = 15;
SolidityLexer.T__15 = 16;
SolidityLexer.T__16 = 17;
SolidityLexer.T__17 = 18;
SolidityLexer.T__18 = 19;
SolidityLexer.T__19 = 20;
SolidityLexer.T__20 = 21;
SolidityLexer.T__21 = 22;
SolidityLexer.T__22 = 23;
SolidityLexer.T__23 = 24;
SolidityLexer.T__24 = 25;
SolidityLexer.T__25 = 26;
SolidityLexer.T__26 = 27;
SolidityLexer.T__27 = 28;
SolidityLexer.T__28 = 29;
SolidityLexer.T__29 = 30;
SolidityLexer.T__30 = 31;
SolidityLexer.T__31 = 32;
SolidityLexer.T__32 = 33;
SolidityLexer.T__33 = 34;
SolidityLexer.T__34 = 35;
SolidityLexer.T__35 = 36;
SolidityLexer.T__36 = 37;
SolidityLexer.T__37 = 38;
SolidityLexer.T__38 = 39;
SolidityLexer.T__39 = 40;
SolidityLexer.T__40 = 41;
SolidityLexer.T__41 = 42;
SolidityLexer.T__42 = 43;
SolidityLexer.T__43 = 44;
SolidityLexer.T__44 = 45;
SolidityLexer.T__45 = 46;
SolidityLexer.T__46 = 47;
SolidityLexer.T__47 = 48;
SolidityLexer.T__48 = 49;
SolidityLexer.T__49 = 50;
SolidityLexer.T__50 = 51;
SolidityLexer.T__51 = 52;
SolidityLexer.T__52 = 53;
SolidityLexer.T__53 = 54;
SolidityLexer.T__54 = 55;
SolidityLexer.T__55 = 56;
SolidityLexer.T__56 = 57;
SolidityLexer.T__57 = 58;
SolidityLexer.T__58 = 59;
SolidityLexer.T__59 = 60;
SolidityLexer.T__60 = 61;
SolidityLexer.T__61 = 62;
SolidityLexer.T__62 = 63;
SolidityLexer.T__63 = 64;
SolidityLexer.T__64 = 65;
SolidityLexer.T__65 = 66;
SolidityLexer.T__66 = 67;
SolidityLexer.T__67 = 68;
SolidityLexer.T__68 = 69;
SolidityLexer.T__69 = 70;
SolidityLexer.T__70 = 71;
SolidityLexer.T__71 = 72;
SolidityLexer.T__72 = 73;
SolidityLexer.T__73 = 74;
SolidityLexer.T__74 = 75;
SolidityLexer.T__75 = 76;
SolidityLexer.T__76 = 77;
SolidityLexer.T__77 = 78;
SolidityLexer.T__78 = 79;
SolidityLexer.T__79 = 80;
SolidityLexer.T__80 = 81;
SolidityLexer.T__81 = 82;
SolidityLexer.T__82 = 83;
SolidityLexer.T__83 = 84;
SolidityLexer.T__84 = 85;
SolidityLexer.T__85 = 86;
SolidityLexer.T__86 = 87;
SolidityLexer.T__87 = 88;
SolidityLexer.T__88 = 89;
SolidityLexer.T__89 = 90;
SolidityLexer.T__90 = 91;
SolidityLexer.T__91 = 92;
SolidityLexer.T__92 = 93;
SolidityLexer.T__93 = 94;
SolidityLexer.T__94 = 95;
SolidityLexer.Int = 96;
SolidityLexer.Uint = 97;
SolidityLexer.Byte = 98;
SolidityLexer.Fixed = 99;
SolidityLexer.Ufixed = 100;
SolidityLexer.BooleanLiteral = 101;
SolidityLexer.DecimalNumber = 102;
SolidityLexer.HexNumber = 103;
SolidityLexer.NumberUnit = 104;
SolidityLexer.HexLiteralFragment = 105;
SolidityLexer.ReservedKeyword = 106;
SolidityLexer.AnonymousKeyword = 107;
SolidityLexer.BreakKeyword = 108;
SolidityLexer.ConstantKeyword = 109;
SolidityLexer.ImmutableKeyword = 110;
SolidityLexer.ContinueKeyword = 111;
SolidityLexer.LeaveKeyword = 112;
SolidityLexer.ExternalKeyword = 113;
SolidityLexer.IndexedKeyword = 114;
SolidityLexer.InternalKeyword = 115;
SolidityLexer.PayableKeyword = 116;
SolidityLexer.PrivateKeyword = 117;
SolidityLexer.PublicKeyword = 118;
SolidityLexer.VirtualKeyword = 119;
SolidityLexer.PureKeyword = 120;
SolidityLexer.TypeKeyword = 121;
SolidityLexer.ViewKeyword = 122;
SolidityLexer.ConstructorKeyword = 123;
SolidityLexer.FallbackKeyword = 124;
SolidityLexer.ReceiveKeyword = 125;
SolidityLexer.Identifier = 126;
SolidityLexer.StringLiteralFragment = 127;
SolidityLexer.VersionLiteral = 128;
SolidityLexer.WS = 129;
SolidityLexer.COMMENT = 130;
SolidityLexer.LINE_COMMENT = 131;

var SolidityListener = /*#__PURE__*/function (_antlr4$tree$ParseTre) {
  _inherits(SolidityListener, _antlr4$tree$ParseTre);

  var _super = _createSuper(SolidityListener);

  function SolidityListener() {
    _classCallCheck(this, SolidityListener);

    return _super.apply(this, arguments);
  }

  _createClass(SolidityListener, [{
    key: "enterSourceUnit",
    // Enter a parse tree produced by SolidityParser#sourceUnit.
    value: function enterSourceUnit(ctx) {} // Exit a parse tree produced by SolidityParser#sourceUnit.

  }, {
    key: "exitSourceUnit",
    value: function exitSourceUnit(ctx) {} // Enter a parse tree produced by SolidityParser#pragmaDirective.

  }, {
    key: "enterPragmaDirective",
    value: function enterPragmaDirective(ctx) {} // Exit a parse tree produced by SolidityParser#pragmaDirective.

  }, {
    key: "exitPragmaDirective",
    value: function exitPragmaDirective(ctx) {} // Enter a parse tree produced by SolidityParser#pragmaName.

  }, {
    key: "enterPragmaName",
    value: function enterPragmaName(ctx) {} // Exit a parse tree produced by SolidityParser#pragmaName.

  }, {
    key: "exitPragmaName",
    value: function exitPragmaName(ctx) {} // Enter a parse tree produced by SolidityParser#pragmaValue.

  }, {
    key: "enterPragmaValue",
    value: function enterPragmaValue(ctx) {} // Exit a parse tree produced by SolidityParser#pragmaValue.

  }, {
    key: "exitPragmaValue",
    value: function exitPragmaValue(ctx) {} // Enter a parse tree produced by SolidityParser#version.

  }, {
    key: "enterVersion",
    value: function enterVersion(ctx) {} // Exit a parse tree produced by SolidityParser#version.

  }, {
    key: "exitVersion",
    value: function exitVersion(ctx) {} // Enter a parse tree produced by SolidityParser#versionOperator.

  }, {
    key: "enterVersionOperator",
    value: function enterVersionOperator(ctx) {} // Exit a parse tree produced by SolidityParser#versionOperator.

  }, {
    key: "exitVersionOperator",
    value: function exitVersionOperator(ctx) {} // Enter a parse tree produced by SolidityParser#versionConstraint.

  }, {
    key: "enterVersionConstraint",
    value: function enterVersionConstraint(ctx) {} // Exit a parse tree produced by SolidityParser#versionConstraint.

  }, {
    key: "exitVersionConstraint",
    value: function exitVersionConstraint(ctx) {} // Enter a parse tree produced by SolidityParser#importDeclaration.

  }, {
    key: "enterImportDeclaration",
    value: function enterImportDeclaration(ctx) {} // Exit a parse tree produced by SolidityParser#importDeclaration.

  }, {
    key: "exitImportDeclaration",
    value: function exitImportDeclaration(ctx) {} // Enter a parse tree produced by SolidityParser#importDirective.

  }, {
    key: "enterImportDirective",
    value: function enterImportDirective(ctx) {} // Exit a parse tree produced by SolidityParser#importDirective.

  }, {
    key: "exitImportDirective",
    value: function exitImportDirective(ctx) {} // Enter a parse tree produced by SolidityParser#contractDefinition.

  }, {
    key: "enterContractDefinition",
    value: function enterContractDefinition(ctx) {} // Exit a parse tree produced by SolidityParser#contractDefinition.

  }, {
    key: "exitContractDefinition",
    value: function exitContractDefinition(ctx) {} // Enter a parse tree produced by SolidityParser#inheritanceSpecifier.

  }, {
    key: "enterInheritanceSpecifier",
    value: function enterInheritanceSpecifier(ctx) {} // Exit a parse tree produced by SolidityParser#inheritanceSpecifier.

  }, {
    key: "exitInheritanceSpecifier",
    value: function exitInheritanceSpecifier(ctx) {} // Enter a parse tree produced by SolidityParser#contractPart.

  }, {
    key: "enterContractPart",
    value: function enterContractPart(ctx) {} // Exit a parse tree produced by SolidityParser#contractPart.

  }, {
    key: "exitContractPart",
    value: function exitContractPart(ctx) {} // Enter a parse tree produced by SolidityParser#stateVariableDeclaration.

  }, {
    key: "enterStateVariableDeclaration",
    value: function enterStateVariableDeclaration(ctx) {} // Exit a parse tree produced by SolidityParser#stateVariableDeclaration.

  }, {
    key: "exitStateVariableDeclaration",
    value: function exitStateVariableDeclaration(ctx) {} // Enter a parse tree produced by SolidityParser#fileLevelConstant.

  }, {
    key: "enterFileLevelConstant",
    value: function enterFileLevelConstant(ctx) {} // Exit a parse tree produced by SolidityParser#fileLevelConstant.

  }, {
    key: "exitFileLevelConstant",
    value: function exitFileLevelConstant(ctx) {} // Enter a parse tree produced by SolidityParser#usingForDeclaration.

  }, {
    key: "enterUsingForDeclaration",
    value: function enterUsingForDeclaration(ctx) {} // Exit a parse tree produced by SolidityParser#usingForDeclaration.

  }, {
    key: "exitUsingForDeclaration",
    value: function exitUsingForDeclaration(ctx) {} // Enter a parse tree produced by SolidityParser#structDefinition.

  }, {
    key: "enterStructDefinition",
    value: function enterStructDefinition(ctx) {} // Exit a parse tree produced by SolidityParser#structDefinition.

  }, {
    key: "exitStructDefinition",
    value: function exitStructDefinition(ctx) {} // Enter a parse tree produced by SolidityParser#modifierDefinition.

  }, {
    key: "enterModifierDefinition",
    value: function enterModifierDefinition(ctx) {} // Exit a parse tree produced by SolidityParser#modifierDefinition.

  }, {
    key: "exitModifierDefinition",
    value: function exitModifierDefinition(ctx) {} // Enter a parse tree produced by SolidityParser#modifierInvocation.

  }, {
    key: "enterModifierInvocation",
    value: function enterModifierInvocation(ctx) {} // Exit a parse tree produced by SolidityParser#modifierInvocation.

  }, {
    key: "exitModifierInvocation",
    value: function exitModifierInvocation(ctx) {} // Enter a parse tree produced by SolidityParser#functionDefinition.

  }, {
    key: "enterFunctionDefinition",
    value: function enterFunctionDefinition(ctx) {} // Exit a parse tree produced by SolidityParser#functionDefinition.

  }, {
    key: "exitFunctionDefinition",
    value: function exitFunctionDefinition(ctx) {} // Enter a parse tree produced by SolidityParser#functionDescriptor.

  }, {
    key: "enterFunctionDescriptor",
    value: function enterFunctionDescriptor(ctx) {} // Exit a parse tree produced by SolidityParser#functionDescriptor.

  }, {
    key: "exitFunctionDescriptor",
    value: function exitFunctionDescriptor(ctx) {} // Enter a parse tree produced by SolidityParser#returnParameters.

  }, {
    key: "enterReturnParameters",
    value: function enterReturnParameters(ctx) {} // Exit a parse tree produced by SolidityParser#returnParameters.

  }, {
    key: "exitReturnParameters",
    value: function exitReturnParameters(ctx) {} // Enter a parse tree produced by SolidityParser#modifierList.

  }, {
    key: "enterModifierList",
    value: function enterModifierList(ctx) {} // Exit a parse tree produced by SolidityParser#modifierList.

  }, {
    key: "exitModifierList",
    value: function exitModifierList(ctx) {} // Enter a parse tree produced by SolidityParser#eventDefinition.

  }, {
    key: "enterEventDefinition",
    value: function enterEventDefinition(ctx) {} // Exit a parse tree produced by SolidityParser#eventDefinition.

  }, {
    key: "exitEventDefinition",
    value: function exitEventDefinition(ctx) {} // Enter a parse tree produced by SolidityParser#enumValue.

  }, {
    key: "enterEnumValue",
    value: function enterEnumValue(ctx) {} // Exit a parse tree produced by SolidityParser#enumValue.

  }, {
    key: "exitEnumValue",
    value: function exitEnumValue(ctx) {} // Enter a parse tree produced by SolidityParser#enumDefinition.

  }, {
    key: "enterEnumDefinition",
    value: function enterEnumDefinition(ctx) {} // Exit a parse tree produced by SolidityParser#enumDefinition.

  }, {
    key: "exitEnumDefinition",
    value: function exitEnumDefinition(ctx) {} // Enter a parse tree produced by SolidityParser#parameterList.

  }, {
    key: "enterParameterList",
    value: function enterParameterList(ctx) {} // Exit a parse tree produced by SolidityParser#parameterList.

  }, {
    key: "exitParameterList",
    value: function exitParameterList(ctx) {} // Enter a parse tree produced by SolidityParser#parameter.

  }, {
    key: "enterParameter",
    value: function enterParameter(ctx) {} // Exit a parse tree produced by SolidityParser#parameter.

  }, {
    key: "exitParameter",
    value: function exitParameter(ctx) {} // Enter a parse tree produced by SolidityParser#eventParameterList.

  }, {
    key: "enterEventParameterList",
    value: function enterEventParameterList(ctx) {} // Exit a parse tree produced by SolidityParser#eventParameterList.

  }, {
    key: "exitEventParameterList",
    value: function exitEventParameterList(ctx) {} // Enter a parse tree produced by SolidityParser#eventParameter.

  }, {
    key: "enterEventParameter",
    value: function enterEventParameter(ctx) {} // Exit a parse tree produced by SolidityParser#eventParameter.

  }, {
    key: "exitEventParameter",
    value: function exitEventParameter(ctx) {} // Enter a parse tree produced by SolidityParser#functionTypeParameterList.

  }, {
    key: "enterFunctionTypeParameterList",
    value: function enterFunctionTypeParameterList(ctx) {} // Exit a parse tree produced by SolidityParser#functionTypeParameterList.

  }, {
    key: "exitFunctionTypeParameterList",
    value: function exitFunctionTypeParameterList(ctx) {} // Enter a parse tree produced by SolidityParser#functionTypeParameter.

  }, {
    key: "enterFunctionTypeParameter",
    value: function enterFunctionTypeParameter(ctx) {} // Exit a parse tree produced by SolidityParser#functionTypeParameter.

  }, {
    key: "exitFunctionTypeParameter",
    value: function exitFunctionTypeParameter(ctx) {} // Enter a parse tree produced by SolidityParser#variableDeclaration.

  }, {
    key: "enterVariableDeclaration",
    value: function enterVariableDeclaration(ctx) {} // Exit a parse tree produced by SolidityParser#variableDeclaration.

  }, {
    key: "exitVariableDeclaration",
    value: function exitVariableDeclaration(ctx) {} // Enter a parse tree produced by SolidityParser#typeName.

  }, {
    key: "enterTypeName",
    value: function enterTypeName(ctx) {} // Exit a parse tree produced by SolidityParser#typeName.

  }, {
    key: "exitTypeName",
    value: function exitTypeName(ctx) {} // Enter a parse tree produced by SolidityParser#userDefinedTypeName.

  }, {
    key: "enterUserDefinedTypeName",
    value: function enterUserDefinedTypeName(ctx) {} // Exit a parse tree produced by SolidityParser#userDefinedTypeName.

  }, {
    key: "exitUserDefinedTypeName",
    value: function exitUserDefinedTypeName(ctx) {} // Enter a parse tree produced by SolidityParser#mappingKey.

  }, {
    key: "enterMappingKey",
    value: function enterMappingKey(ctx) {} // Exit a parse tree produced by SolidityParser#mappingKey.

  }, {
    key: "exitMappingKey",
    value: function exitMappingKey(ctx) {} // Enter a parse tree produced by SolidityParser#mapping.

  }, {
    key: "enterMapping",
    value: function enterMapping(ctx) {} // Exit a parse tree produced by SolidityParser#mapping.

  }, {
    key: "exitMapping",
    value: function exitMapping(ctx) {} // Enter a parse tree produced by SolidityParser#functionTypeName.

  }, {
    key: "enterFunctionTypeName",
    value: function enterFunctionTypeName(ctx) {} // Exit a parse tree produced by SolidityParser#functionTypeName.

  }, {
    key: "exitFunctionTypeName",
    value: function exitFunctionTypeName(ctx) {} // Enter a parse tree produced by SolidityParser#storageLocation.

  }, {
    key: "enterStorageLocation",
    value: function enterStorageLocation(ctx) {} // Exit a parse tree produced by SolidityParser#storageLocation.

  }, {
    key: "exitStorageLocation",
    value: function exitStorageLocation(ctx) {} // Enter a parse tree produced by SolidityParser#stateMutability.

  }, {
    key: "enterStateMutability",
    value: function enterStateMutability(ctx) {} // Exit a parse tree produced by SolidityParser#stateMutability.

  }, {
    key: "exitStateMutability",
    value: function exitStateMutability(ctx) {} // Enter a parse tree produced by SolidityParser#block.

  }, {
    key: "enterBlock",
    value: function enterBlock(ctx) {} // Exit a parse tree produced by SolidityParser#block.

  }, {
    key: "exitBlock",
    value: function exitBlock(ctx) {} // Enter a parse tree produced by SolidityParser#statement.

  }, {
    key: "enterStatement",
    value: function enterStatement(ctx) {} // Exit a parse tree produced by SolidityParser#statement.

  }, {
    key: "exitStatement",
    value: function exitStatement(ctx) {} // Enter a parse tree produced by SolidityParser#expressionStatement.

  }, {
    key: "enterExpressionStatement",
    value: function enterExpressionStatement(ctx) {} // Exit a parse tree produced by SolidityParser#expressionStatement.

  }, {
    key: "exitExpressionStatement",
    value: function exitExpressionStatement(ctx) {} // Enter a parse tree produced by SolidityParser#ifStatement.

  }, {
    key: "enterIfStatement",
    value: function enterIfStatement(ctx) {} // Exit a parse tree produced by SolidityParser#ifStatement.

  }, {
    key: "exitIfStatement",
    value: function exitIfStatement(ctx) {} // Enter a parse tree produced by SolidityParser#tryStatement.

  }, {
    key: "enterTryStatement",
    value: function enterTryStatement(ctx) {} // Exit a parse tree produced by SolidityParser#tryStatement.

  }, {
    key: "exitTryStatement",
    value: function exitTryStatement(ctx) {} // Enter a parse tree produced by SolidityParser#catchClause.

  }, {
    key: "enterCatchClause",
    value: function enterCatchClause(ctx) {} // Exit a parse tree produced by SolidityParser#catchClause.

  }, {
    key: "exitCatchClause",
    value: function exitCatchClause(ctx) {} // Enter a parse tree produced by SolidityParser#whileStatement.

  }, {
    key: "enterWhileStatement",
    value: function enterWhileStatement(ctx) {} // Exit a parse tree produced by SolidityParser#whileStatement.

  }, {
    key: "exitWhileStatement",
    value: function exitWhileStatement(ctx) {} // Enter a parse tree produced by SolidityParser#simpleStatement.

  }, {
    key: "enterSimpleStatement",
    value: function enterSimpleStatement(ctx) {} // Exit a parse tree produced by SolidityParser#simpleStatement.

  }, {
    key: "exitSimpleStatement",
    value: function exitSimpleStatement(ctx) {} // Enter a parse tree produced by SolidityParser#uncheckedStatement.

  }, {
    key: "enterUncheckedStatement",
    value: function enterUncheckedStatement(ctx) {} // Exit a parse tree produced by SolidityParser#uncheckedStatement.

  }, {
    key: "exitUncheckedStatement",
    value: function exitUncheckedStatement(ctx) {} // Enter a parse tree produced by SolidityParser#forStatement.

  }, {
    key: "enterForStatement",
    value: function enterForStatement(ctx) {} // Exit a parse tree produced by SolidityParser#forStatement.

  }, {
    key: "exitForStatement",
    value: function exitForStatement(ctx) {} // Enter a parse tree produced by SolidityParser#inlineAssemblyStatement.

  }, {
    key: "enterInlineAssemblyStatement",
    value: function enterInlineAssemblyStatement(ctx) {} // Exit a parse tree produced by SolidityParser#inlineAssemblyStatement.

  }, {
    key: "exitInlineAssemblyStatement",
    value: function exitInlineAssemblyStatement(ctx) {} // Enter a parse tree produced by SolidityParser#doWhileStatement.

  }, {
    key: "enterDoWhileStatement",
    value: function enterDoWhileStatement(ctx) {} // Exit a parse tree produced by SolidityParser#doWhileStatement.

  }, {
    key: "exitDoWhileStatement",
    value: function exitDoWhileStatement(ctx) {} // Enter a parse tree produced by SolidityParser#continueStatement.

  }, {
    key: "enterContinueStatement",
    value: function enterContinueStatement(ctx) {} // Exit a parse tree produced by SolidityParser#continueStatement.

  }, {
    key: "exitContinueStatement",
    value: function exitContinueStatement(ctx) {} // Enter a parse tree produced by SolidityParser#breakStatement.

  }, {
    key: "enterBreakStatement",
    value: function enterBreakStatement(ctx) {} // Exit a parse tree produced by SolidityParser#breakStatement.

  }, {
    key: "exitBreakStatement",
    value: function exitBreakStatement(ctx) {} // Enter a parse tree produced by SolidityParser#returnStatement.

  }, {
    key: "enterReturnStatement",
    value: function enterReturnStatement(ctx) {} // Exit a parse tree produced by SolidityParser#returnStatement.

  }, {
    key: "exitReturnStatement",
    value: function exitReturnStatement(ctx) {} // Enter a parse tree produced by SolidityParser#throwStatement.

  }, {
    key: "enterThrowStatement",
    value: function enterThrowStatement(ctx) {} // Exit a parse tree produced by SolidityParser#throwStatement.

  }, {
    key: "exitThrowStatement",
    value: function exitThrowStatement(ctx) {} // Enter a parse tree produced by SolidityParser#emitStatement.

  }, {
    key: "enterEmitStatement",
    value: function enterEmitStatement(ctx) {} // Exit a parse tree produced by SolidityParser#emitStatement.

  }, {
    key: "exitEmitStatement",
    value: function exitEmitStatement(ctx) {} // Enter a parse tree produced by SolidityParser#variableDeclarationStatement.

  }, {
    key: "enterVariableDeclarationStatement",
    value: function enterVariableDeclarationStatement(ctx) {} // Exit a parse tree produced by SolidityParser#variableDeclarationStatement.

  }, {
    key: "exitVariableDeclarationStatement",
    value: function exitVariableDeclarationStatement(ctx) {} // Enter a parse tree produced by SolidityParser#variableDeclarationList.

  }, {
    key: "enterVariableDeclarationList",
    value: function enterVariableDeclarationList(ctx) {} // Exit a parse tree produced by SolidityParser#variableDeclarationList.

  }, {
    key: "exitVariableDeclarationList",
    value: function exitVariableDeclarationList(ctx) {} // Enter a parse tree produced by SolidityParser#identifierList.

  }, {
    key: "enterIdentifierList",
    value: function enterIdentifierList(ctx) {} // Exit a parse tree produced by SolidityParser#identifierList.

  }, {
    key: "exitIdentifierList",
    value: function exitIdentifierList(ctx) {} // Enter a parse tree produced by SolidityParser#elementaryTypeName.

  }, {
    key: "enterElementaryTypeName",
    value: function enterElementaryTypeName(ctx) {} // Exit a parse tree produced by SolidityParser#elementaryTypeName.

  }, {
    key: "exitElementaryTypeName",
    value: function exitElementaryTypeName(ctx) {} // Enter a parse tree produced by SolidityParser#expression.

  }, {
    key: "enterExpression",
    value: function enterExpression(ctx) {} // Exit a parse tree produced by SolidityParser#expression.

  }, {
    key: "exitExpression",
    value: function exitExpression(ctx) {} // Enter a parse tree produced by SolidityParser#primaryExpression.

  }, {
    key: "enterPrimaryExpression",
    value: function enterPrimaryExpression(ctx) {} // Exit a parse tree produced by SolidityParser#primaryExpression.

  }, {
    key: "exitPrimaryExpression",
    value: function exitPrimaryExpression(ctx) {} // Enter a parse tree produced by SolidityParser#expressionList.

  }, {
    key: "enterExpressionList",
    value: function enterExpressionList(ctx) {} // Exit a parse tree produced by SolidityParser#expressionList.

  }, {
    key: "exitExpressionList",
    value: function exitExpressionList(ctx) {} // Enter a parse tree produced by SolidityParser#nameValueList.

  }, {
    key: "enterNameValueList",
    value: function enterNameValueList(ctx) {} // Exit a parse tree produced by SolidityParser#nameValueList.

  }, {
    key: "exitNameValueList",
    value: function exitNameValueList(ctx) {} // Enter a parse tree produced by SolidityParser#nameValue.

  }, {
    key: "enterNameValue",
    value: function enterNameValue(ctx) {} // Exit a parse tree produced by SolidityParser#nameValue.

  }, {
    key: "exitNameValue",
    value: function exitNameValue(ctx) {} // Enter a parse tree produced by SolidityParser#functionCallArguments.

  }, {
    key: "enterFunctionCallArguments",
    value: function enterFunctionCallArguments(ctx) {} // Exit a parse tree produced by SolidityParser#functionCallArguments.

  }, {
    key: "exitFunctionCallArguments",
    value: function exitFunctionCallArguments(ctx) {} // Enter a parse tree produced by SolidityParser#functionCall.

  }, {
    key: "enterFunctionCall",
    value: function enterFunctionCall(ctx) {} // Exit a parse tree produced by SolidityParser#functionCall.

  }, {
    key: "exitFunctionCall",
    value: function exitFunctionCall(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyBlock.

  }, {
    key: "enterAssemblyBlock",
    value: function enterAssemblyBlock(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyBlock.

  }, {
    key: "exitAssemblyBlock",
    value: function exitAssemblyBlock(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyItem.

  }, {
    key: "enterAssemblyItem",
    value: function enterAssemblyItem(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyItem.

  }, {
    key: "exitAssemblyItem",
    value: function exitAssemblyItem(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyExpression.

  }, {
    key: "enterAssemblyExpression",
    value: function enterAssemblyExpression(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyExpression.

  }, {
    key: "exitAssemblyExpression",
    value: function exitAssemblyExpression(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyMember.

  }, {
    key: "enterAssemblyMember",
    value: function enterAssemblyMember(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyMember.

  }, {
    key: "exitAssemblyMember",
    value: function exitAssemblyMember(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyCall.

  }, {
    key: "enterAssemblyCall",
    value: function enterAssemblyCall(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyCall.

  }, {
    key: "exitAssemblyCall",
    value: function exitAssemblyCall(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyLocalDefinition.

  }, {
    key: "enterAssemblyLocalDefinition",
    value: function enterAssemblyLocalDefinition(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyLocalDefinition.

  }, {
    key: "exitAssemblyLocalDefinition",
    value: function exitAssemblyLocalDefinition(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyAssignment.

  }, {
    key: "enterAssemblyAssignment",
    value: function enterAssemblyAssignment(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyAssignment.

  }, {
    key: "exitAssemblyAssignment",
    value: function exitAssemblyAssignment(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyIdentifierOrList.

  }, {
    key: "enterAssemblyIdentifierOrList",
    value: function enterAssemblyIdentifierOrList(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyIdentifierOrList.

  }, {
    key: "exitAssemblyIdentifierOrList",
    value: function exitAssemblyIdentifierOrList(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyIdentifierList.

  }, {
    key: "enterAssemblyIdentifierList",
    value: function enterAssemblyIdentifierList(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyIdentifierList.

  }, {
    key: "exitAssemblyIdentifierList",
    value: function exitAssemblyIdentifierList(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyStackAssignment.

  }, {
    key: "enterAssemblyStackAssignment",
    value: function enterAssemblyStackAssignment(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyStackAssignment.

  }, {
    key: "exitAssemblyStackAssignment",
    value: function exitAssemblyStackAssignment(ctx) {} // Enter a parse tree produced by SolidityParser#labelDefinition.

  }, {
    key: "enterLabelDefinition",
    value: function enterLabelDefinition(ctx) {} // Exit a parse tree produced by SolidityParser#labelDefinition.

  }, {
    key: "exitLabelDefinition",
    value: function exitLabelDefinition(ctx) {} // Enter a parse tree produced by SolidityParser#assemblySwitch.

  }, {
    key: "enterAssemblySwitch",
    value: function enterAssemblySwitch(ctx) {} // Exit a parse tree produced by SolidityParser#assemblySwitch.

  }, {
    key: "exitAssemblySwitch",
    value: function exitAssemblySwitch(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyCase.

  }, {
    key: "enterAssemblyCase",
    value: function enterAssemblyCase(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyCase.

  }, {
    key: "exitAssemblyCase",
    value: function exitAssemblyCase(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyFunctionDefinition.

  }, {
    key: "enterAssemblyFunctionDefinition",
    value: function enterAssemblyFunctionDefinition(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyFunctionDefinition.

  }, {
    key: "exitAssemblyFunctionDefinition",
    value: function exitAssemblyFunctionDefinition(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyFunctionReturns.

  }, {
    key: "enterAssemblyFunctionReturns",
    value: function enterAssemblyFunctionReturns(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyFunctionReturns.

  }, {
    key: "exitAssemblyFunctionReturns",
    value: function exitAssemblyFunctionReturns(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyFor.

  }, {
    key: "enterAssemblyFor",
    value: function enterAssemblyFor(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyFor.

  }, {
    key: "exitAssemblyFor",
    value: function exitAssemblyFor(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyIf.

  }, {
    key: "enterAssemblyIf",
    value: function enterAssemblyIf(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyIf.

  }, {
    key: "exitAssemblyIf",
    value: function exitAssemblyIf(ctx) {} // Enter a parse tree produced by SolidityParser#assemblyLiteral.

  }, {
    key: "enterAssemblyLiteral",
    value: function enterAssemblyLiteral(ctx) {} // Exit a parse tree produced by SolidityParser#assemblyLiteral.

  }, {
    key: "exitAssemblyLiteral",
    value: function exitAssemblyLiteral(ctx) {} // Enter a parse tree produced by SolidityParser#subAssembly.

  }, {
    key: "enterSubAssembly",
    value: function enterSubAssembly(ctx) {} // Exit a parse tree produced by SolidityParser#subAssembly.

  }, {
    key: "exitSubAssembly",
    value: function exitSubAssembly(ctx) {} // Enter a parse tree produced by SolidityParser#tupleExpression.

  }, {
    key: "enterTupleExpression",
    value: function enterTupleExpression(ctx) {} // Exit a parse tree produced by SolidityParser#tupleExpression.

  }, {
    key: "exitTupleExpression",
    value: function exitTupleExpression(ctx) {} // Enter a parse tree produced by SolidityParser#typeNameExpression.

  }, {
    key: "enterTypeNameExpression",
    value: function enterTypeNameExpression(ctx) {} // Exit a parse tree produced by SolidityParser#typeNameExpression.

  }, {
    key: "exitTypeNameExpression",
    value: function exitTypeNameExpression(ctx) {} // Enter a parse tree produced by SolidityParser#numberLiteral.

  }, {
    key: "enterNumberLiteral",
    value: function enterNumberLiteral(ctx) {} // Exit a parse tree produced by SolidityParser#numberLiteral.

  }, {
    key: "exitNumberLiteral",
    value: function exitNumberLiteral(ctx) {} // Enter a parse tree produced by SolidityParser#identifier.

  }, {
    key: "enterIdentifier",
    value: function enterIdentifier(ctx) {} // Exit a parse tree produced by SolidityParser#identifier.

  }, {
    key: "exitIdentifier",
    value: function exitIdentifier(ctx) {} // Enter a parse tree produced by SolidityParser#hexLiteral.

  }, {
    key: "enterHexLiteral",
    value: function enterHexLiteral(ctx) {} // Exit a parse tree produced by SolidityParser#hexLiteral.

  }, {
    key: "exitHexLiteral",
    value: function exitHexLiteral(ctx) {} // Enter a parse tree produced by SolidityParser#overrideSpecifier.

  }, {
    key: "enterOverrideSpecifier",
    value: function enterOverrideSpecifier(ctx) {} // Exit a parse tree produced by SolidityParser#overrideSpecifier.

  }, {
    key: "exitOverrideSpecifier",
    value: function exitOverrideSpecifier(ctx) {} // Enter a parse tree produced by SolidityParser#stringLiteral.

  }, {
    key: "enterStringLiteral",
    value: function enterStringLiteral(ctx) {} // Exit a parse tree produced by SolidityParser#stringLiteral.

  }, {
    key: "exitStringLiteral",
    value: function exitStringLiteral(ctx) {}
  }]);

  return SolidityListener;
}(antlr4.tree.ParseTreeListener);

var serializedATN$1 = ["\x03\u608B\uA72A\u8133\uB9ED\u417C\u3BE7\u7786", "\u5964\x03\x85\u044C\x04\x02\t\x02\x04\x03\t\x03\x04", "\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07\t", "\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\x0B\t\x0B\x04", "\f\t\f\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10", "\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04\x13\t\x13", "\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17", "\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A", "\x04\x1B\t\x1B\x04\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E", "\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#", "\t#\x04$\t$\x04%\t%\x04&\t&\x04'\t'\x04(\t(\x04)\t)\x04", "*\t*\x04+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x04", "1\t1\x042\t2\x043\t3\x044\t4\x045\t5\x046\t6\x047\t7\x04", "8\t8\x049\t9\x04:\t:\x04;\t;\x04<\t<\x04=\t=\x04>\t>\x04", "?\t?\x04@\t@\x04A\tA\x04B\tB\x04C\tC\x04D\tD\x04E\tE\x04", "F\tF\x04G\tG\x04H\tH\x04I\tI\x04J\tJ\x04K\tK\x04L\tL\x04", "M\tM\x04N\tN\x04O\tO\x04P\tP\x04Q\tQ\x04R\tR\x04S\tS\x04", "T\tT\x04U\tU\x04V\tV\x04W\tW\x04X\tX\x04Y\tY\x04Z\tZ\x04", "[\t[\x04\\\t\\\x04]\t]\x04^\t^\x03\x02\x03\x02\x03\x02", "\x03\x02\x03\x02\x03\x02\x03\x02\x07\x02\xC4\n", "\x02\f\x02\x0E\x02\xC7\x0B\x02\x03\x02\x03\x02", "\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x04", "\x03\x04\x03\x05\x03\x05\x05\x05\xD4\n\x05\x03", "\x06\x03\x06\x05\x06\xD8\n\x06\x03\x06\x07\x06", "\xDB\n\x06\f\x06\x0E\x06\xDE\x0B\x06\x03\x07\x03", "\x07\x03\b\x05\b\xE3\n\b\x03\b\x03\b\x05\b\xE7\n\b\x03", "\b\x05\b\xEA\n\b\x03\t\x03\t\x03\t\x05\t\xEF\n\t\x03", "\n\x03\n\x03\n\x03\n\x05\n\xF5\n\n\x03\n\x03\n\x03\n", "\x03\n\x05\n\xFB\n\n\x03\n\x03\n\x05\n\xFF\n\n\x03\n", "\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u0109", "\n\n\f\n\x0E\n\u010C\x0B\n\x03\n\x03\n\x03\n\x03\n\x03", "\n\x05\n\u0113\n\n\x03\x0B\x05\x0B\u0116\n\x0B\x03\x0B", "\x03\x0B\x03\x0B\x03\x0B\x03\x0B\x03\x0B\x07\x0B", "\u011E\n\x0B\f\x0B\x0E\x0B\u0121\x0B\x0B\x05\x0B\u0123", "\n\x0B\x03\x0B\x03\x0B\x07\x0B\u0127\n\x0B\f\x0B\x0E", "\x0B\u012A\x0B\x0B\x03\x0B\x03\x0B\x03\f\x03\f\x03", "\f\x05\f\u0131\n\f\x03\f\x05\f\u0134\n\f\x03\r\x03\r\x03", "\r\x03\r\x03\r\x03\r\x03\r\x05\r\u013D\n\r\x03\x0E\x03", "\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x07", "\x0E\u0146\n\x0E\f\x0E\x0E\x0E\u0149\x0B\x0E\x03\x0E", "\x03\x0E\x03\x0E\x05\x0E\u014E\n\x0E\x03\x0E\x03", "\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03", "\x0F\x03\x0F\x03\x10\x03\x10\x03\x10\x03\x10\x03", "\x10\x05\x10\u015E\n\x10\x03\x10\x03\x10\x03\x11", "\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11", "\x03\x11\x07\x11\u016A\n\x11\f\x11\x0E\x11\u016D\x0B", "\x11\x05\x11\u016F\n\x11\x03\x11\x03\x11\x03\x12", "\x03\x12\x03\x12\x05\x12\u0176\n\x12\x03\x12\x03", "\x12\x07\x12\u017A\n\x12\f\x12\x0E\x12\u017D\x0B\x12", "\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13\x05\x13", "\u0184\n\x13\x03\x13\x05\x13\u0187\n\x13\x03\x14\x03", "\x14\x03\x14\x03\x14\x05\x14\u018D\n\x14\x03\x14", "\x03\x14\x05\x14\u0191\n\x14\x03\x15\x03\x15\x05", "\x15\u0195\n\x15\x03\x15\x03\x15\x03\x15\x05\x15", "\u019A\n\x15\x03\x16\x03\x16\x03\x16\x03\x17\x03", "\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03", "\x17\x07\x17\u01A7\n\x17\f\x17\x0E\x17\u01AA\x0B\x17", "\x03\x18\x03\x18\x03\x18\x03\x18\x05\x18\u01B0\n", "\x18\x03\x18\x03\x18\x03\x19\x03\x19\x03\x1A\x03", "\x1A\x03\x1A\x03\x1A\x05\x1A\u01BA\n\x1A\x03\x1A", "\x03\x1A\x07\x1A\u01BE\n\x1A\f\x1A\x0E\x1A\u01C1\x0B", "\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1B\x03", "\x1B\x07\x1B\u01C9\n\x1B\f\x1B\x0E\x1B\u01CC\x0B\x1B", "\x05\x1B\u01CE\n\x1B\x03\x1B\x03\x1B\x03\x1C\x03", "\x1C\x05\x1C\u01D4\n\x1C\x03\x1C\x05\x1C\u01D7\n\x1C", "\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x07\x1D\u01DD\n", "\x1D\f\x1D\x0E\x1D\u01E0\x0B\x1D\x05\x1D\u01E2\n\x1D", "\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x05\x1E\u01E8\n", "\x1E\x03\x1E\x05\x1E\u01EB\n\x1E\x03\x1F\x03\x1F", "\x03\x1F\x03\x1F\x07\x1F\u01F1\n\x1F\f\x1F\x0E\x1F", "\u01F4\x0B\x1F\x05\x1F\u01F6\n\x1F\x03\x1F\x03\x1F", "\x03 \x03 \x05 \u01FC\n \x03!\x03!\x05!\u0200\n!\x03!", "\x03!\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x05", "\"\u020B\n\"\x03\"\x03\"\x03\"\x05\"\u0210\n\"\x03\"\x07", "\"\u0213\n\"\f\"\x0E\"\u0216\x0B\"\x03#\x03#\x03#\x07#\u021B", "\n#\f#\x0E#\u021E\x0B#\x03$\x03$\x05$\u0222\n$\x03%\x03", "%\x03%\x03%\x03%\x03%\x03%\x03&\x03&\x03&\x03&\x03", "&\x07&\u0230\n&\f&\x0E&\u0233\x0B&\x03&\x03&\x05&\u0237", "\n&\x03'\x03'\x03(\x03(\x03)\x03)\x07)\u023F\n)\f)\x0E", ")\u0242\x0B)\x03)\x03)\x03*\x03*\x03*\x03*\x03*\x03", "*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x05*\u0254", "\n*\x03+\x03+\x03+\x03,\x03,\x03,\x03,\x03,\x03,\x03", ",\x05,\u0260\n,\x03-\x03-\x03-\x05-\u0265\n-\x03-\x03", "-\x06-\u0269\n-\r-\x0E-\u026A\x03.\x03.\x05.\u026F\n.\x03", ".\x05.\u0272\n.\x03.\x03.\x03/\x03/\x03/\x03/\x03/\x03", "/\x030\x030\x050\u027E\n0\x031\x031\x031\x032\x032\x03", "2\x032\x052\u0287\n2\x032\x032\x052\u028B\n2\x032\x05", "2\u028E\n2\x032\x032\x032\x033\x033\x053\u0295\n3\x03", "3\x033\x034\x034\x034\x034\x034\x034\x034\x034\x03", "5\x035\x035\x036\x036\x036\x037\x037\x057\u02A9\n7\x03", "7\x037\x038\x038\x038\x039\x039\x039\x039\x03:\x03", ":\x03:\x03:\x03:\x03:\x03:\x05:\u02BB\n:\x03:\x03:\x05", ":\u02BF\n:\x03:\x03:\x03;\x05;\u02C4\n;\x03;\x03;\x05", ";\u02C8\n;\x07;\u02CA\n;\f;\x0E;\u02CD\x0B;\x03<\x03<\x05", "<\u02D1\n<\x03<\x07<\u02D4\n<\f<\x0E<\u02D7\x0B<\x03<\x05", "<\u02DA\n<\x03<\x03<\x03=\x03=\x03>\x03>\x03>\x03>\x03", ">\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03", ">\x03>\x03>\x03>\x05>\u02F2\n>\x03>\x03>\x03>\x03>\x03", ">\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03", ">\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03", ">\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03", ">\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03", ">\x03>\x03>\x05>\u0323\n>\x03>\x03>\x03>\x03>\x05>\u0329", "\n>\x03>\x03>\x05>\u032D\n>\x03>\x03>\x03>\x03>\x03", ">\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x03>\x07", ">\u033D\n>\f>\x0E>\u0340\x0B>\x03?\x03?\x03?\x03?\x03", "?\x03?\x03?\x05?\u0349\n?\x03?\x03?\x03?\x03?\x03?\x03", "?\x05?\u0351\n?\x05?\u0353\n?\x03@\x03@\x03@\x07@\u0358", "\n@\f@\x0E@\u035B\x0B@\x03A\x03A\x03A\x07A\u0360\nA\fA\x0E", "A\u0363\x0BA\x03A\x05A\u0366\nA\x03B\x03B\x03B\x03B\x03", "C\x03C\x05C\u036E\nC\x03C\x03C\x05C\u0372\nC\x05C\u0374", "\nC\x03D\x03D\x03D\x03D\x03D\x03E\x03E\x07E\u037D\n", "E\fE\x0EE\u0380\x0BE\x03E\x03E\x03F\x03F\x03F\x03F\x03", "F\x03F\x03F\x03F\x03F\x03F\x03F\x03F\x03F\x03F\x03", "F\x03F\x03F\x03F\x05F\u0396\nF\x03G\x03G\x03G\x05G\u039B", "\nG\x03H\x03H\x03H\x03H\x03I\x03I\x03I\x03I\x05I\u03A5", "\nI\x03I\x03I\x05I\u03A9\nI\x03I\x03I\x07I\u03AD\nI\fI\x0E", "I\u03B0\x0BI\x03I\x05I\u03B3\nI\x03J\x03J\x03J\x03J\x05", "J\u03B9\nJ\x03K\x03K\x03K\x03K\x03L\x03L\x03L\x03L\x03", "L\x03L\x05L\u03C5\nL\x03M\x03M\x03M\x07M\u03CA\nM\fM\x0E", "M\u03CD\x0BM\x03N\x03N\x03N\x03O\x03O\x03O\x03P\x03", "P\x03P\x07P\u03D8\nP\fP\x0EP\u03DB\x0BP\x03Q\x03Q\x03", "Q\x03Q\x03Q\x03Q\x05Q\u03E3\nQ\x03R\x03R\x03R\x03R\x05", "R\u03E9\nR\x03R\x03R\x05R\u03ED\nR\x03R\x03R\x03S\x03", "S\x03S\x03T\x03T\x03T\x05T\u03F7\nT\x03T\x03T\x03T\x05", "T\u03FC\nT\x03T\x03T\x03U\x03U\x03U\x03U\x03V\x03V\x03", "V\x03V\x05V\u0408\nV\x03W\x03W\x03W\x03W\x03X\x03X\x05", "X\u0410\nX\x03X\x03X\x05X\u0414\nX\x07X\u0416\nX\fX\x0EX\u0419", "\x0BX\x03X\x03X\x03X\x03X\x03X\x07X\u0420\nX\fX\x0E", "X\u0423\x0BX\x05X\u0425\nX\x03X\x05X\u0428\nX\x03Y\x03Y", "\x05Y\u042C\nY\x03Z\x03Z\x05Z\u0430\nZ\x03[\x03[\x03\\", "\x06\\\u0435\n\\\r\\\x0E\\\u0436\x03]\x03]\x03]\x03]\x03", "]\x07]\u043E\n]\f]\x0E]\u0441\x0B]\x03]\x03]\x05]\u0445", "\n]\x03^\x06^\u0448\n^\r^\x0E^\u0449\x03^\x02\x04Bz_\x02", "\x04\x06\b\n\f\x0E\x10\x12\x14\x16\x18\x1A\x1C\x1E", " \"$&(*,.02468:<>@BDFHJLNPRTVXZ\\^`bdfhjlnprtvxz|~\x80\x82\x84", "\x86\x88\x8A\x8C\x8E\x90\x92\x94\x96\x98\x9A\x9C", "\x9E\xA0\xA2\xA4\xA6\xA8\xAA\xAC\xAE\xB0\xB2\xB4", "\xB6\xB8\xBA\x02\x11\x03\x02\x06\f\x03\x02\x15", "\x17\x03\x02)+\x06\x02oovvzz||\x05\x02%%7:bf\x03\x02", ";<\x03\x02?@\x03\x02AB\x04\x02\x0F\x0FEF\x03\x02", "GH\x03\x02\b\x0B\x03\x02KL\x04\x02\f\fOX\x03\x02h", "i\b\x02\x10\x10++``rrvv\x7F\x80\x02\u04C8\x02\xC5\x03", "\x02\x02\x02\x04\xCA\x03\x02\x02\x02\x06\xCF\x03", "\x02\x02\x02\b\xD3\x03\x02\x02\x02\n\xD5\x03\x02", "\x02\x02\f\xDF\x03\x02\x02\x02\x0E\xE9\x03\x02", "\x02\x02\x10\xEB\x03\x02\x02\x02\x12\u0112\x03\x02", "\x02\x02\x14\u0115\x03\x02\x02\x02\x16\u012D\x03\x02", "\x02\x02\x18\u013C\x03\x02\x02\x02\x1A\u013E\x03\x02", "\x02\x02\x1C\u0151\x03\x02\x02\x02\x1E\u0158\x03\x02", "\x02\x02 \u0161\x03\x02\x02\x02\"\u0172\x03\x02\x02", "\x02$\u0180\x03\x02\x02\x02&\u0188\x03\x02\x02\x02", "(\u0199\x03\x02\x02\x02*\u019B\x03\x02\x02\x02,\u01A8", "\x03\x02\x02\x02.\u01AB\x03\x02\x02\x020\u01B3\x03", "\x02\x02\x022\u01B5\x03\x02\x02\x024\u01C4\x03\x02", "\x02\x026\u01D1\x03\x02\x02\x028\u01D8\x03\x02\x02", "\x02:\u01E5\x03\x02\x02\x02<\u01EC\x03\x02\x02\x02", ">\u01F9\x03\x02\x02\x02@\u01FD\x03\x02\x02\x02B\u020A", "\x03\x02\x02\x02D\u0217\x03\x02\x02\x02F\u0221\x03", "\x02\x02\x02H\u0223\x03\x02\x02\x02J\u022A\x03\x02", "\x02\x02L\u0238\x03\x02\x02\x02N\u023A\x03\x02\x02", "\x02P\u023C\x03\x02\x02\x02R\u0253\x03\x02\x02\x02", "T\u0255\x03\x02\x02\x02V\u0258\x03\x02\x02\x02X\u0261", "\x03\x02\x02\x02Z\u026C\x03\x02\x02\x02\\\u0275\x03", "\x02\x02\x02^\u027D\x03\x02\x02\x02`\u027F\x03\x02", "\x02\x02b\u0282\x03\x02\x02\x02d\u0292\x03\x02\x02", "\x02f\u0298\x03\x02\x02\x02h\u02A0\x03\x02\x02\x02", "j\u02A3\x03\x02\x02\x02l\u02A6\x03\x02\x02\x02n\u02AC", "\x03\x02\x02\x02p\u02AF\x03\x02\x02\x02r\u02BA\x03", "\x02\x02\x02t\u02C3\x03\x02\x02\x02v\u02CE\x03\x02", "\x02\x02x\u02DD\x03\x02\x02\x02z\u02F1\x03\x02\x02", "\x02|\u0352\x03\x02\x02\x02~\u0354\x03\x02\x02\x02", "\x80\u035C\x03\x02\x02\x02\x82\u0367\x03\x02\x02\x02", "\x84\u0373\x03\x02\x02\x02\x86\u0375\x03\x02\x02\x02", "\x88\u037A\x03\x02\x02\x02\x8A\u0395\x03\x02\x02\x02", "\x8C\u039A\x03\x02\x02\x02\x8E\u039C\x03\x02\x02\x02", "\x90\u03A4\x03\x02\x02\x02\x92\u03B4\x03\x02\x02\x02", "\x94\u03BA\x03\x02\x02\x02\x96\u03C4\x03\x02\x02\x02", "\x98\u03C6\x03\x02\x02\x02\x9A\u03CE\x03\x02\x02\x02", "\x9C\u03D1\x03\x02\x02\x02\x9E\u03D4\x03\x02\x02\x02", "\xA0\u03E2\x03\x02\x02\x02\xA2\u03E4\x03\x02\x02\x02", "\xA4\u03F0\x03\x02\x02\x02\xA6\u03F3\x03\x02\x02\x02", "\xA8\u03FF\x03\x02\x02\x02\xAA\u0407\x03\x02\x02\x02", "\xAC\u0409\x03\x02\x02\x02\xAE\u0427\x03\x02\x02\x02", "\xB0\u042B\x03\x02\x02\x02\xB2\u042D\x03\x02\x02\x02", "\xB4\u0431\x03\x02\x02\x02\xB6\u0434\x03\x02\x02\x02", "\xB8\u0438\x03\x02\x02\x02\xBA\u0447\x03\x02\x02\x02", "\xBC\xC4\x05\x04\x03\x02\xBD\xC4\x05\x12\n\x02", "\xBE\xC4\x05\x14\x0B\x02\xBF\xC4\x052\x1A\x02", "\xC0\xC4\x05 \x11\x02\xC1\xC4\x05&\x14\x02\xC2", "\xC4\x05\x1C\x0F\x02\xC3\xBC\x03\x02\x02\x02\xC3", "\xBD\x03\x02\x02\x02\xC3\xBE\x03\x02\x02\x02\xC3", "\xBF\x03\x02\x02\x02\xC3\xC0\x03\x02\x02\x02\xC3", "\xC1\x03\x02\x02\x02\xC3\xC2\x03\x02\x02\x02\xC4", "\xC7\x03\x02\x02\x02\xC5\xC3\x03\x02\x02\x02\xC5", "\xC6\x03\x02\x02\x02\xC6\xC8\x03\x02\x02\x02\xC7", "\xC5\x03\x02\x02\x02\xC8\xC9\x07\x02\x02\x03\xC9", "\x03\x03\x02\x02\x02\xCA\xCB\x07\x03\x02\x02\xCB", "\xCC\x05\x06\x04\x02\xCC\xCD\x05\b\x05\x02\xCD", "\xCE\x07\x04\x02\x02\xCE\x05\x03\x02\x02\x02\xCF", "\xD0\x05\xB4[\x02\xD0\x07\x03\x02\x02\x02\xD1", "\xD4\x05\n\x06\x02\xD2\xD4\x05z>\x02\xD3\xD1\x03", "\x02\x02\x02\xD3\xD2\x03\x02\x02\x02\xD4\t\x03", "\x02\x02\x02\xD5\xDC\x05\x0E\b\x02\xD6\xD8\x07", "\x05\x02\x02\xD7\xD6\x03\x02\x02\x02\xD7\xD8\x03", "\x02\x02\x02\xD8\xD9\x03\x02\x02\x02\xD9\xDB\x05", "\x0E\b\x02\xDA\xD7\x03\x02\x02\x02\xDB\xDE\x03", "\x02\x02\x02\xDC\xDA\x03\x02\x02\x02\xDC\xDD\x03", "\x02\x02\x02\xDD\x0B\x03\x02\x02\x02\xDE\xDC\x03", "\x02\x02\x02\xDF\xE0\t\x02\x02\x02\xE0\r\x03\x02", "\x02\x02\xE1\xE3\x05\f\x07\x02\xE2\xE1\x03\x02", "\x02\x02\xE2\xE3\x03\x02\x02\x02\xE3\xE4\x03\x02", "\x02\x02\xE4\xEA\x07\x82\x02\x02\xE5\xE7\x05\f", "\x07\x02\xE6\xE5\x03\x02\x02\x02\xE6\xE7\x03\x02", "\x02\x02\xE7\xE8\x03\x02\x02\x02\xE8\xEA\x07h", "\x02\x02\xE9\xE2\x03\x02\x02\x02\xE9\xE6\x03\x02", "\x02\x02\xEA\x0F\x03\x02\x02\x02\xEB\xEE\x05\xB4", "[\x02\xEC\xED\x07\r\x02\x02\xED\xEF\x05\xB4[\x02", "\xEE\xEC\x03\x02\x02\x02\xEE\xEF\x03\x02\x02\x02", "\xEF\x11\x03\x02\x02\x02\xF0\xF1\x07\x0E\x02\x02", "\xF1\xF4\x07\x81\x02\x02\xF2\xF3\x07\r\x02\x02", "\xF3\xF5\x05\xB4[\x02\xF4\xF2\x03\x02\x02\x02", "\xF4\xF5\x03\x02\x02\x02\xF5\xF6\x03\x02\x02\x02", "\xF6\u0113\x07\x04\x02\x02\xF7\xFA\x07\x0E\x02\x02", "\xF8\xFB\x07\x0F\x02\x02\xF9\xFB\x05\xB4[\x02", "\xFA\xF8\x03\x02\x02\x02\xFA\xF9\x03\x02\x02\x02", "\xFB\xFE\x03\x02\x02\x02\xFC\xFD\x07\r\x02\x02", "\xFD\xFF\x05\xB4[\x02\xFE\xFC\x03\x02\x02\x02", "\xFE\xFF\x03\x02\x02\x02\xFF\u0100\x03\x02\x02\x02", "\u0100\u0101\x07\x10\x02\x02\u0101\u0102\x07\x81\x02\x02", "\u0102\u0113\x07\x04\x02\x02\u0103\u0104\x07\x0E\x02\x02", "\u0104\u0105\x07\x11\x02\x02\u0105\u010A\x05\x10\t\x02", "\u0106\u0107\x07\x12\x02\x02\u0107\u0109\x05\x10\t\x02", "\u0108\u0106\x03\x02\x02\x02\u0109\u010C\x03\x02\x02\x02", "\u010A\u0108\x03\x02\x02\x02\u010A\u010B\x03\x02\x02\x02", "\u010B\u010D\x03\x02\x02\x02\u010C\u010A\x03\x02\x02\x02", "\u010D\u010E\x07\x13\x02\x02\u010E\u010F\x07\x10\x02\x02", "\u010F\u0110\x07\x81\x02\x02\u0110\u0111\x07\x04\x02\x02", "\u0111\u0113\x03\x02\x02\x02\u0112\xF0\x03\x02\x02\x02", "\u0112\xF7\x03\x02\x02\x02\u0112\u0103\x03\x02\x02\x02", "\u0113\x13\x03\x02\x02\x02\u0114\u0116\x07\x14\x02\x02", "\u0115\u0114\x03\x02\x02\x02\u0115\u0116\x03\x02\x02\x02", "\u0116\u0117\x03\x02\x02\x02\u0117\u0118\t\x03\x02\x02", "\u0118\u0122\x05\xB4[\x02\u0119\u011A\x07\x18\x02\x02", "\u011A\u011F\x05\x16\f\x02\u011B\u011C\x07\x12\x02\x02", "\u011C\u011E\x05\x16\f\x02\u011D\u011B\x03\x02\x02\x02", "\u011E\u0121\x03\x02\x02\x02\u011F\u011D\x03\x02\x02\x02", "\u011F\u0120\x03\x02\x02\x02\u0120\u0123\x03\x02\x02\x02", "\u0121\u011F\x03\x02\x02\x02\u0122\u0119\x03\x02\x02\x02", "\u0122\u0123\x03\x02\x02\x02\u0123\u0124\x03\x02\x02\x02", "\u0124\u0128\x07\x11\x02\x02\u0125\u0127\x05\x18\r\x02", "\u0126\u0125\x03\x02\x02\x02\u0127\u012A\x03\x02\x02\x02", "\u0128\u0126\x03\x02\x02\x02\u0128\u0129\x03\x02\x02\x02", "\u0129\u012B\x03\x02\x02\x02\u012A\u0128\x03\x02\x02\x02", "\u012B\u012C\x07\x13\x02\x02\u012C\x15\x03\x02\x02\x02", "\u012D\u0133\x05D#\x02\u012E\u0130\x07\x19\x02\x02\u012F", "\u0131\x05~@\x02\u0130\u012F\x03\x02\x02\x02\u0130\u0131", "\x03\x02\x02\x02\u0131\u0132\x03\x02\x02\x02\u0132\u0134", "\x07\x1A\x02\x02\u0133\u012E\x03\x02\x02\x02\u0133\u0134", "\x03\x02\x02\x02\u0134\x17\x03\x02\x02\x02\u0135\u013D", "\x05\x1A\x0E\x02\u0136\u013D\x05\x1E\x10\x02\u0137\u013D", "\x05 \x11\x02\u0138\u013D\x05\"\x12\x02\u0139\u013D\x05", "&\x14\x02\u013A\u013D\x05.\x18\x02\u013B\u013D\x052\x1A", "\x02\u013C\u0135\x03\x02\x02\x02\u013C\u0136\x03\x02\x02", "\x02\u013C\u0137\x03\x02\x02\x02\u013C\u0138\x03\x02\x02", "\x02\u013C\u0139\x03\x02\x02\x02\u013C\u013A\x03\x02\x02", "\x02\u013C\u013B\x03\x02\x02\x02\u013D\x19\x03\x02\x02", "\x02\u013E\u0147\x05B\"\x02\u013F\u0146\x07x\x02\x02\u0140", "\u0146\x07u\x02\x02\u0141\u0146\x07w\x02\x02\u0142\u0146", "\x07o\x02\x02\u0143\u0146\x07p\x02\x02\u0144\u0146\x05", "\xB8]\x02\u0145\u013F\x03\x02\x02\x02\u0145\u0140\x03", "\x02\x02\x02\u0145\u0141\x03\x02\x02\x02\u0145\u0142\x03", "\x02\x02\x02\u0145\u0143\x03\x02\x02\x02\u0145\u0144\x03", "\x02\x02\x02\u0146\u0149\x03\x02\x02\x02\u0147\u0145\x03", "\x02\x02\x02\u0147\u0148\x03\x02\x02\x02\u0148\u014A\x03", "\x02\x02\x02\u0149\u0147\x03\x02\x02\x02\u014A\u014D\x05", "\xB4[\x02\u014B\u014C\x07\f\x02\x02\u014C\u014E\x05z>\x02", "\u014D\u014B\x03\x02\x02\x02\u014D\u014E\x03\x02\x02\x02", "\u014E\u014F\x03\x02\x02\x02\u014F\u0150\x07\x04\x02\x02", "\u0150\x1B\x03\x02\x02\x02\u0151\u0152\x05B\"\x02\u0152", "\u0153\x07o\x02\x02\u0153\u0154\x05\xB4[\x02\u0154\u0155", "\x07\f\x02\x02\u0155\u0156\x05z>\x02\u0156\u0157\x07\x04", "\x02\x02\u0157\x1D\x03\x02\x02\x02\u0158\u0159\x07\x1B", "\x02\x02\u0159\u015A\x05\xB4[\x02\u015A\u015D\x07\x1C", "\x02\x02\u015B\u015E\x07\x0F\x02\x02\u015C\u015E\x05B", "\"\x02\u015D\u015B\x03\x02\x02\x02\u015D\u015C\x03\x02", "\x02\x02\u015E\u015F\x03\x02\x02\x02\u015F\u0160\x07\x04", "\x02\x02\u0160\x1F\x03\x02\x02\x02\u0161\u0162\x07\x1D", "\x02\x02\u0162\u0163\x05\xB4[\x02\u0163\u016E\x07\x11", "\x02\x02\u0164\u0165\x05@!\x02\u0165\u016B\x07\x04\x02", "\x02\u0166\u0167\x05@!\x02\u0167\u0168\x07\x04\x02\x02", "\u0168\u016A\x03\x02\x02\x02\u0169\u0166\x03\x02\x02\x02", "\u016A\u016D\x03\x02\x02\x02\u016B\u0169\x03\x02\x02\x02", "\u016B\u016C\x03\x02\x02\x02\u016C\u016F\x03\x02\x02\x02", "\u016D\u016B\x03\x02\x02\x02\u016E\u0164\x03\x02\x02\x02", "\u016E\u016F\x03\x02\x02\x02\u016F\u0170\x03\x02\x02\x02", "\u0170\u0171\x07\x13\x02\x02\u0171!\x03\x02\x02\x02", "\u0172\u0173\x07\x1E\x02\x02\u0173\u0175\x05\xB4[\x02", "\u0174\u0176\x054\x1B\x02\u0175\u0174\x03\x02\x02\x02", "\u0175\u0176\x03\x02\x02\x02\u0176\u017B\x03\x02\x02\x02", "\u0177\u017A\x07y\x02\x02\u0178\u017A\x05\xB8]\x02\u0179", "\u0177\x03\x02\x02\x02\u0179\u0178\x03\x02\x02\x02\u017A", "\u017D\x03\x02\x02\x02\u017B\u0179\x03\x02\x02\x02\u017B", "\u017C\x03\x02\x02\x02\u017C\u017E\x03\x02\x02\x02\u017D", "\u017B\x03\x02\x02\x02\u017E\u017F\x05P)\x02\u017F#\x03", "\x02\x02\x02\u0180\u0186\x05\xB4[\x02\u0181\u0183\x07", "\x19\x02\x02\u0182\u0184\x05~@\x02\u0183\u0182\x03\x02", "\x02\x02\u0183\u0184\x03\x02\x02\x02\u0184\u0185\x03\x02", "\x02\x02\u0185\u0187\x07\x1A\x02\x02\u0186\u0181\x03\x02", "\x02\x02\u0186\u0187\x03\x02\x02\x02\u0187%\x03\x02", "\x02\x02\u0188\u0189\x05(\x15\x02\u0189\u018A\x054\x1B", "\x02\u018A\u018C\x05,\x17\x02\u018B\u018D\x05*\x16\x02", "\u018C\u018B\x03\x02\x02\x02\u018C\u018D\x03\x02\x02\x02", "\u018D\u0190\x03\x02\x02\x02\u018E\u0191\x07\x04\x02\x02", "\u018F\u0191\x05P)\x02\u0190\u018E\x03\x02\x02\x02\u0190", "\u018F\x03\x02\x02\x02\u0191'\x03\x02\x02\x02\u0192", "\u0194\x07\x1F\x02\x02\u0193\u0195\x05\xB4[\x02\u0194", "\u0193\x03\x02\x02\x02\u0194\u0195\x03\x02\x02\x02\u0195", "\u019A\x03\x02\x02\x02\u0196\u019A\x07}\x02\x02\u0197", "\u019A\x07~\x02\x02\u0198\u019A\x07\x7F\x02\x02\u0199", "\u0192\x03\x02\x02\x02\u0199\u0196\x03\x02\x02\x02\u0199", "\u0197\x03\x02\x02\x02\u0199\u0198\x03\x02\x02\x02\u019A", ")\x03\x02\x02\x02\u019B\u019C\x07 \x02\x02\u019C\u019D", "\x054\x1B\x02\u019D+\x03\x02\x02\x02\u019E\u01A7\x07", "s\x02\x02\u019F\u01A7\x07x\x02\x02\u01A0\u01A7\x07u\x02", "\x02\u01A1\u01A7\x07w\x02\x02\u01A2\u01A7\x07y\x02\x02", "\u01A3\u01A7\x05N(\x02\u01A4\u01A7\x05$\x13\x02\u01A5\u01A7", "\x05\xB8]\x02\u01A6\u019E\x03\x02\x02\x02\u01A6\u019F", "\x03\x02\x02\x02\u01A6\u01A0\x03\x02\x02\x02\u01A6\u01A1", "\x03\x02\x02\x02\u01A6\u01A2\x03\x02\x02\x02\u01A6\u01A3", "\x03\x02\x02\x02\u01A6\u01A4\x03\x02\x02\x02\u01A6\u01A5", "\x03\x02\x02\x02\u01A7\u01AA\x03\x02\x02\x02\u01A8\u01A6", "\x03\x02\x02\x02\u01A8\u01A9\x03\x02\x02\x02\u01A9-", "\x03\x02\x02\x02\u01AA\u01A8\x03\x02\x02\x02\u01AB\u01AC", "\x07!\x02\x02\u01AC\u01AD\x05\xB4[\x02\u01AD\u01AF\x05", "8\x1D\x02\u01AE\u01B0\x07m\x02\x02\u01AF\u01AE\x03\x02", "\x02\x02\u01AF\u01B0\x03\x02\x02\x02\u01B0\u01B1\x03\x02", "\x02\x02\u01B1\u01B2\x07\x04\x02\x02\u01B2/\x03\x02", "\x02\x02\u01B3\u01B4\x05\xB4[\x02\u01B41\x03\x02\x02", "\x02\u01B5\u01B6\x07\"\x02\x02\u01B6\u01B7\x05\xB4[\x02", "\u01B7\u01B9\x07\x11\x02\x02\u01B8\u01BA\x050\x19\x02", "\u01B9\u01B8\x03\x02\x02\x02\u01B9\u01BA\x03\x02\x02\x02", "\u01BA\u01BF\x03\x02\x02\x02\u01BB\u01BC\x07\x12\x02\x02", "\u01BC\u01BE\x050\x19\x02\u01BD\u01BB\x03\x02\x02\x02", "\u01BE\u01C1\x03\x02\x02\x02\u01BF\u01BD\x03\x02\x02\x02", "\u01BF\u01C0\x03\x02\x02\x02\u01C0\u01C2\x03\x02\x02\x02", "\u01C1\u01BF\x03\x02\x02\x02\u01C2\u01C3\x07\x13\x02\x02", "\u01C33\x03\x02\x02\x02\u01C4\u01CD\x07\x19\x02\x02", "\u01C5\u01CA\x056\x1C\x02\u01C6\u01C7\x07\x12\x02\x02", "\u01C7\u01C9\x056\x1C\x02\u01C8\u01C6\x03\x02\x02\x02", "\u01C9\u01CC\x03\x02\x02\x02\u01CA\u01C8\x03\x02\x02\x02", "\u01CA\u01CB\x03\x02\x02\x02\u01CB\u01CE\x03\x02\x02\x02", "\u01CC\u01CA\x03\x02\x02\x02\u01CD\u01C5\x03\x02\x02\x02", "\u01CD\u01CE\x03\x02\x02\x02\u01CE\u01CF\x03\x02\x02\x02", "\u01CF\u01D0\x07\x1A\x02\x02\u01D05\x03\x02\x02\x02", "\u01D1\u01D3\x05B\"\x02\u01D2\u01D4\x05L'\x02\u01D3\u01D2\x03", "\x02\x02\x02\u01D3\u01D4\x03\x02\x02\x02\u01D4\u01D6\x03", "\x02\x02\x02\u01D5\u01D7\x05\xB4[\x02\u01D6\u01D5\x03", "\x02\x02\x02\u01D6\u01D7\x03\x02\x02\x02\u01D77\x03", "\x02\x02\x02\u01D8\u01E1\x07\x19\x02\x02\u01D9\u01DE\x05", ":\x1E\x02\u01DA\u01DB\x07\x12\x02\x02\u01DB\u01DD\x05", ":\x1E\x02\u01DC\u01DA\x03\x02\x02\x02\u01DD\u01E0\x03", "\x02\x02\x02\u01DE\u01DC\x03\x02\x02\x02\u01DE\u01DF\x03", "\x02\x02\x02\u01DF\u01E2\x03\x02\x02\x02\u01E0\u01DE\x03", "\x02\x02\x02\u01E1\u01D9\x03\x02\x02\x02\u01E1\u01E2\x03", "\x02\x02\x02\u01E2\u01E3\x03\x02\x02\x02\u01E3\u01E4\x07", "\x1A\x02\x02\u01E49\x03\x02\x02\x02\u01E5\u01E7\x05", "B\"\x02\u01E6\u01E8\x07t\x02\x02\u01E7\u01E6\x03\x02\x02", "\x02\u01E7\u01E8\x03\x02\x02\x02\u01E8\u01EA\x03\x02\x02", "\x02\u01E9\u01EB\x05\xB4[\x02\u01EA\u01E9\x03\x02\x02", "\x02\u01EA\u01EB\x03\x02\x02\x02\u01EB;\x03\x02\x02", "\x02\u01EC\u01F5\x07\x19\x02\x02\u01ED\u01F2\x05> \x02", "\u01EE\u01EF\x07\x12\x02\x02\u01EF\u01F1\x05> \x02\u01F0", "\u01EE\x03\x02\x02\x02\u01F1\u01F4\x03\x02\x02\x02\u01F2", "\u01F0\x03\x02\x02\x02\u01F2\u01F3\x03\x02\x02\x02\u01F3", "\u01F6\x03\x02\x02\x02\u01F4\u01F2\x03\x02\x02\x02\u01F5", "\u01ED\x03\x02\x02\x02\u01F5\u01F6\x03\x02\x02\x02\u01F6", "\u01F7\x03\x02\x02\x02\u01F7\u01F8\x07\x1A\x02\x02\u01F8", "=\x03\x02\x02\x02\u01F9\u01FB\x05B\"\x02\u01FA\u01FC\x05", "L'\x02\u01FB\u01FA\x03\x02\x02\x02\u01FB\u01FC\x03\x02", "\x02\x02\u01FC?\x03\x02\x02\x02\u01FD\u01FF\x05B\"\x02", "\u01FE\u0200\x05L'\x02\u01FF\u01FE\x03\x02\x02\x02\u01FF", "\u0200\x03\x02\x02\x02\u0200\u0201\x03\x02\x02\x02\u0201", "\u0202\x05\xB4[\x02\u0202A\x03\x02\x02\x02\u0203\u0204", "\b\"\x01\x02\u0204\u020B\x05x=\x02\u0205\u020B\x05D#\x02", "\u0206\u020B\x05H%\x02\u0207\u020B\x05J&\x02\u0208\u0209\x07", "%\x02\x02\u0209\u020B\x07v\x02\x02\u020A\u0203\x03\x02", "\x02\x02\u020A\u0205\x03\x02\x02\x02\u020A\u0206\x03\x02", "\x02\x02\u020A\u0207\x03\x02\x02\x02\u020A\u0208\x03\x02", "\x02\x02\u020B\u0214\x03\x02\x02\x02\u020C\u020D\f\x05", "\x02\x02\u020D\u020F\x07#\x02\x02\u020E\u0210\x05z>\x02", "\u020F\u020E\x03\x02\x02\x02\u020F\u0210\x03\x02\x02\x02", "\u0210\u0211\x03\x02\x02\x02\u0211\u0213\x07$\x02\x02", "\u0212\u020C\x03\x02\x02\x02\u0213\u0216\x03\x02\x02\x02", "\u0214\u0212\x03\x02\x02\x02\u0214\u0215\x03\x02\x02\x02", "\u0215C\x03\x02\x02\x02\u0216\u0214\x03\x02\x02\x02", "\u0217\u021C\x05\xB4[\x02\u0218\u0219\x07&\x02\x02\u0219", "\u021B\x05\xB4[\x02\u021A\u0218\x03\x02\x02\x02\u021B", "\u021E\x03\x02\x02\x02\u021C\u021A\x03\x02\x02\x02\u021C", "\u021D\x03\x02\x02\x02\u021DE\x03\x02\x02\x02\u021E", "\u021C\x03\x02\x02\x02\u021F\u0222\x05x=\x02\u0220\u0222", "\x05D#\x02\u0221\u021F\x03\x02\x02\x02\u0221\u0220\x03", "\x02\x02\x02\u0222G\x03\x02\x02\x02\u0223\u0224\x07", "'\x02\x02\u0224\u0225\x07\x19\x02\x02\u0225\u0226\x05", "F$\x02\u0226\u0227\x07(\x02\x02\u0227\u0228\x05B\"\x02\u0228", "\u0229\x07\x1A\x02\x02\u0229I\x03\x02\x02\x02\u022A", "\u022B\x07\x1F\x02\x02\u022B\u0231\x05<\x1F\x02\u022C", "\u0230\x07u\x02\x02\u022D\u0230\x07s\x02\x02\u022E\u0230", "\x05N(\x02\u022F\u022C\x03\x02\x02\x02\u022F\u022D\x03", "\x02\x02\x02\u022F\u022E\x03\x02\x02\x02\u0230\u0233\x03", "\x02\x02\x02\u0231\u022F\x03\x02\x02\x02\u0231\u0232\x03", "\x02\x02\x02\u0232\u0236\x03\x02\x02\x02\u0233\u0231\x03", "\x02\x02\x02\u0234\u0235\x07 \x02\x02\u0235\u0237\x05", "<\x1F\x02\u0236\u0234\x03\x02\x02\x02\u0236\u0237\x03", "\x02\x02\x02\u0237K\x03\x02\x02\x02\u0238\u0239\t\x04", "\x02\x02\u0239M\x03\x02\x02\x02\u023A\u023B\t\x05\x02", "\x02\u023BO\x03\x02\x02\x02\u023C\u0240\x07\x11\x02", "\x02\u023D\u023F\x05R*\x02\u023E\u023D\x03\x02\x02\x02", "\u023F\u0242\x03\x02\x02\x02\u0240\u023E\x03\x02\x02\x02", "\u0240\u0241\x03\x02\x02\x02\u0241\u0243\x03\x02\x02\x02", "\u0242\u0240\x03\x02\x02\x02\u0243\u0244\x07\x13\x02\x02", "\u0244Q\x03\x02\x02\x02\u0245\u0254\x05V,\x02\u0246\u0254", "\x05X-\x02\u0247\u0254\x05\\/\x02\u0248\u0254\x05b2\x02", "\u0249\u0254\x05P)\x02\u024A\u0254\x05d3\x02\u024B\u0254\x05", "f4\x02\u024C\u0254\x05h5\x02\u024D\u0254\x05j6\x02\u024E\u0254", "\x05l7\x02\u024F\u0254\x05n8\x02\u0250\u0254\x05p9\x02\u0251", "\u0254\x05^0\x02\u0252\u0254\x05`1\x02\u0253\u0245\x03\x02", "\x02\x02\u0253\u0246\x03\x02\x02\x02\u0253\u0247\x03\x02", "\x02\x02\u0253\u0248\x03\x02\x02\x02\u0253\u0249\x03\x02", "\x02\x02\u0253\u024A\x03\x02\x02\x02\u0253\u024B\x03\x02", "\x02\x02\u0253\u024C\x03\x02\x02\x02\u0253\u024D\x03\x02", "\x02\x02\u0253\u024E\x03\x02\x02\x02\u0253\u024F\x03\x02", "\x02\x02\u0253\u0250\x03\x02\x02\x02\u0253\u0251\x03\x02", "\x02\x02\u0253\u0252\x03\x02\x02\x02\u0254S\x03\x02", "\x02\x02\u0255\u0256\x05z>\x02\u0256\u0257\x07\x04\x02", "\x02\u0257U\x03\x02\x02\x02\u0258\u0259\x07,\x02\x02", "\u0259\u025A\x07\x19\x02\x02\u025A\u025B\x05z>\x02\u025B", "\u025C\x07\x1A\x02\x02\u025C\u025F\x05R*\x02\u025D\u025E", "\x07-\x02\x02\u025E\u0260\x05R*\x02\u025F\u025D\x03\x02", "\x02\x02\u025F\u0260\x03\x02\x02\x02\u0260W\x03\x02", "\x02\x02\u0261\u0262\x07.\x02\x02\u0262\u0264\x05z>\x02", "\u0263\u0265\x05*\x16\x02\u0264\u0263\x03\x02\x02\x02", "\u0264\u0265\x03\x02\x02\x02\u0265\u0266\x03\x02\x02\x02", "\u0266\u0268\x05P)\x02\u0267\u0269\x05Z.\x02\u0268\u0267\x03", "\x02\x02\x02\u0269\u026A\x03\x02\x02\x02\u026A\u0268\x03", "\x02\x02\x02\u026A\u026B\x03\x02\x02\x02\u026BY\x03", "\x02\x02\x02\u026C\u0271\x07/\x02\x02\u026D\u026F\x05", "\xB4[\x02\u026E\u026D\x03\x02\x02\x02\u026E\u026F\x03", "\x02\x02\x02\u026F\u0270\x03\x02\x02\x02\u0270\u0272\x05", "4\x1B\x02\u0271\u026E\x03\x02\x02\x02\u0271\u0272\x03", "\x02\x02\x02\u0272\u0273\x03\x02\x02\x02\u0273\u0274\x05", "P)\x02\u0274[\x03\x02\x02\x02\u0275\u0276\x070\x02\x02", "\u0276\u0277\x07\x19\x02\x02\u0277\u0278\x05z>\x02\u0278", "\u0279\x07\x1A\x02\x02\u0279\u027A\x05R*\x02\u027A]\x03", "\x02\x02\x02\u027B\u027E\x05r:\x02\u027C\u027E\x05T+\x02", "\u027D\u027B\x03\x02\x02\x02\u027D\u027C\x03\x02\x02\x02", "\u027E_\x03\x02\x02\x02\u027F\u0280\x071\x02\x02\u0280", "\u0281\x05P)\x02\u0281a\x03\x02\x02\x02\u0282\u0283\x07", "\x1C\x02\x02\u0283\u0286\x07\x19\x02\x02\u0284\u0287\x05", "^0\x02\u0285\u0287\x07\x04\x02\x02\u0286\u0284\x03\x02", "\x02\x02\u0286\u0285\x03\x02\x02\x02\u0287\u028A\x03\x02", "\x02\x02\u0288\u028B\x05T+\x02\u0289\u028B\x07\x04\x02", "\x02\u028A\u0288\x03\x02\x02\x02\u028A\u0289\x03\x02\x02", "\x02\u028B\u028D\x03\x02\x02\x02\u028C\u028E\x05z>\x02", "\u028D\u028C\x03\x02\x02\x02\u028D\u028E\x03\x02\x02\x02", "\u028E\u028F\x03\x02\x02\x02\u028F\u0290\x07\x1A\x02\x02", "\u0290\u0291\x05R*\x02\u0291c\x03\x02\x02\x02\u0292\u0294", "\x072\x02\x02\u0293\u0295\x07\x81\x02\x02\u0294\u0293", "\x03\x02\x02\x02\u0294\u0295\x03\x02\x02\x02\u0295\u0296", "\x03\x02\x02\x02\u0296\u0297\x05\x88E\x02\u0297e\x03", "\x02\x02\x02\u0298\u0299\x073\x02\x02\u0299\u029A\x05", "R*\x02\u029A\u029B\x070\x02\x02\u029B\u029C\x07\x19\x02", "\x02\u029C\u029D\x05z>\x02\u029D\u029E\x07\x1A\x02\x02", "\u029E\u029F\x07\x04\x02\x02\u029Fg\x03\x02\x02\x02", "\u02A0\u02A1\x07q\x02\x02\u02A1\u02A2\x07\x04\x02\x02", "\u02A2i\x03\x02\x02\x02\u02A3\u02A4\x07n\x02\x02\u02A4", "\u02A5\x07\x04\x02\x02\u02A5k\x03\x02\x02\x02\u02A6", "\u02A8\x074\x02\x02\u02A7\u02A9\x05z>\x02\u02A8\u02A7\x03", "\x02\x02\x02\u02A8\u02A9\x03\x02\x02\x02\u02A9\u02AA\x03", "\x02\x02\x02\u02AA\u02AB\x07\x04\x02\x02\u02ABm\x03", "\x02\x02\x02\u02AC\u02AD\x075\x02\x02\u02AD\u02AE\x07", "\x04\x02\x02\u02AEo\x03\x02\x02\x02\u02AF\u02B0\x07", "6\x02\x02\u02B0\u02B1\x05\x86D\x02\u02B1\u02B2\x07\x04", "\x02\x02\u02B2q\x03\x02\x02\x02\u02B3\u02B4\x077\x02", "\x02\u02B4\u02BB\x05v<\x02\u02B5\u02BB\x05@!\x02\u02B6\u02B7", "\x07\x19\x02\x02\u02B7\u02B8\x05t;\x02\u02B8\u02B9\x07", "\x1A\x02\x02\u02B9\u02BB\x03\x02\x02\x02\u02BA\u02B3\x03", "\x02\x02\x02\u02BA\u02B5\x03\x02\x02\x02\u02BA\u02B6\x03", "\x02\x02\x02\u02BB\u02BE\x03\x02\x02\x02\u02BC\u02BD\x07", "\f\x02\x02\u02BD\u02BF\x05z>\x02\u02BE\u02BC\x03\x02\x02", "\x02\u02BE\u02BF\x03\x02\x02\x02\u02BF\u02C0\x03\x02\x02", "\x02\u02C0\u02C1\x07\x04\x02\x02\u02C1s\x03\x02\x02", "\x02\u02C2\u02C4\x05@!\x02\u02C3\u02C2\x03\x02\x02\x02", "\u02C3\u02C4\x03\x02\x02\x02\u02C4\u02CB\x03\x02\x02\x02", "\u02C5\u02C7\x07\x12\x02\x02\u02C6\u02C8\x05@!\x02\u02C7", "\u02C6\x03\x02\x02\x02\u02C7\u02C8\x03\x02\x02\x02\u02C8", "\u02CA\x03\x02\x02\x02\u02C9\u02C5\x03\x02\x02\x02\u02CA", "\u02CD\x03\x02\x02\x02\u02CB\u02C9\x03\x02\x02\x02\u02CB", "\u02CC\x03\x02\x02\x02\u02CCu\x03\x02\x02\x02\u02CD", "\u02CB\x03\x02\x02\x02\u02CE\u02D5\x07\x19\x02\x02\u02CF", "\u02D1\x05\xB4[\x02\u02D0\u02CF\x03\x02\x02\x02\u02D0", "\u02D1\x03\x02\x02\x02\u02D1\u02D2\x03\x02\x02\x02\u02D2", "\u02D4\x07\x12\x02\x02\u02D3\u02D0\x03\x02\x02\x02\u02D4", "\u02D7\x03\x02\x02\x02\u02D5\u02D3\x03\x02\x02\x02\u02D5", "\u02D6\x03\x02\x02\x02\u02D6\u02D9\x03\x02\x02\x02\u02D7", "\u02D5\x03\x02\x02\x02\u02D8\u02DA\x05\xB4[\x02\u02D9", "\u02D8\x03\x02\x02\x02\u02D9\u02DA\x03\x02\x02\x02\u02DA", "\u02DB\x03\x02\x02\x02\u02DB\u02DC\x07\x1A\x02\x02\u02DC", "w\x03\x02\x02\x02\u02DD\u02DE\t\x06\x02\x02\u02DEy\x03", "\x02\x02\x02\u02DF\u02E0\b>\x01\x02\u02E0\u02E1\x07=\x02", "\x02\u02E1\u02F2\x05B\"\x02\u02E2\u02E3\x07\x19\x02\x02", "\u02E3\u02E4\x05z>\x02\u02E4\u02E5\x07\x1A\x02\x02\u02E5", "\u02F2\x03\x02\x02\x02\u02E6\u02E7\t\x07\x02\x02\u02E7", "\u02F2\x05z>\x15\u02E8\u02E9\t\b\x02\x02\u02E9\u02F2\x05z", ">\x14\u02EA\u02EB\t\t\x02\x02\u02EB\u02F2\x05z>\x13\u02EC", "\u02ED\x07C\x02\x02\u02ED\u02F2\x05z>\x12\u02EE\u02EF\x07", "\x07\x02\x02\u02EF\u02F2\x05z>\x11\u02F0\u02F2\x05|?\x02", "\u02F1\u02DF\x03\x02\x02\x02\u02F1\u02E2\x03\x02\x02\x02", "\u02F1\u02E6\x03\x02\x02\x02\u02F1\u02E8\x03\x02\x02\x02", "\u02F1\u02EA\x03\x02\x02\x02\u02F1\u02EC\x03\x02\x02\x02", "\u02F1\u02EE\x03\x02\x02\x02\u02F1\u02F0\x03\x02\x02\x02", "\u02F2\u033E\x03\x02\x02\x02\u02F3\u02F4\f\x10\x02\x02", "\u02F4\u02F5\x07D\x02\x02\u02F5\u033D\x05z>\x11\u02F6\u02F7", "\f\x0F\x02\x02\u02F7\u02F8\t\n\x02\x02\u02F8\u033D\x05z", ">\x10\u02F9\u02FA\f\x0E\x02\x02\u02FA\u02FB\t\b\x02\x02", "\u02FB\u033D\x05z>\x0F\u02FC\u02FD\f\r\x02\x02\u02FD\u02FE\t", "\x0B\x02\x02\u02FE\u033D\x05z>\x0E\u02FF\u0300\f\f\x02\x02", "\u0300\u0301\x07I\x02\x02\u0301\u033D\x05z>\r\u0302\u0303\f", "\x0B\x02\x02\u0303\u0304\x07\x06\x02\x02\u0304\u033D\x05", "z>\f\u0305\u0306\f\n\x02\x02\u0306\u0307\x07J\x02\x02\u0307", "\u033D\x05z>\x0B\u0308\u0309\f\t\x02\x02\u0309\u030A\t\f\x02", "\x02\u030A\u033D\x05z>\n\u030B\u030C\f\b\x02\x02\u030C\u030D", "\t\r\x02\x02\u030D\u033D\x05z>\t\u030E\u030F\f\x07\x02\x02", "\u030F\u0310\x07M\x02\x02\u0310\u033D\x05z>\b\u0311\u0312\f", "\x06\x02\x02\u0312\u0313\x07\x05\x02\x02\u0313\u033D\x05", "z>\x07\u0314\u0315\f\x05\x02\x02\u0315\u0316\x07N\x02\x02", "\u0316\u0317\x05z>\x02\u0317\u0318\x07>\x02\x02\u0318\u0319", "\x05z>\x06\u0319\u033D\x03\x02\x02\x02\u031A\u031B\f\x04", "\x02\x02\u031B\u031C\t\x0E\x02\x02\u031C\u033D\x05z>\x05", "\u031D\u031E\f\x1D\x02\x02\u031E\u033D\t\x07\x02\x02\u031F", "\u0320\f\x1B\x02\x02\u0320\u0322\x07#\x02\x02\u0321\u0323", "\x05z>\x02\u0322\u0321\x03\x02\x02\x02\u0322\u0323\x03", "\x02\x02\x02\u0323\u0324\x03\x02\x02\x02\u0324\u033D\x07", "$\x02\x02\u0325\u0326\f\x1A\x02\x02\u0326\u0328\x07#\x02", "\x02\u0327\u0329\x05z>\x02\u0328\u0327\x03\x02\x02\x02", "\u0328\u0329\x03\x02\x02\x02\u0329\u032A\x03\x02\x02\x02", "\u032A\u032C\x07>\x02\x02\u032B\u032D\x05z>\x02\u032C\u032B", "\x03\x02\x02\x02\u032C\u032D\x03\x02\x02\x02\u032D\u032E", "\x03\x02\x02\x02\u032E\u033D\x07$\x02\x02\u032F\u0330", "\f\x19\x02\x02\u0330\u0331\x07&\x02\x02\u0331\u033D\x05", "\xB4[\x02\u0332\u0333\f\x18\x02\x02\u0333\u0334\x07\x11", "\x02\x02\u0334\u0335\x05\x80A\x02\u0335\u0336\x07\x13", "\x02\x02\u0336\u033D\x03\x02\x02\x02\u0337\u0338\f\x17", "\x02\x02\u0338\u0339\x07\x19\x02\x02\u0339\u033A\x05\x84", "C\x02\u033A\u033B\x07\x1A\x02\x02\u033B\u033D\x03\x02", "\x02\x02\u033C\u02F3\x03\x02\x02\x02\u033C\u02F6\x03\x02", "\x02\x02\u033C\u02F9\x03\x02\x02\x02\u033C\u02FC\x03\x02", "\x02\x02\u033C\u02FF\x03\x02\x02\x02\u033C\u0302\x03\x02", "\x02\x02\u033C\u0305\x03\x02\x02\x02\u033C\u0308\x03\x02", "\x02\x02\u033C\u030B\x03\x02\x02\x02\u033C\u030E\x03\x02", "\x02\x02\u033C\u0311\x03\x02\x02\x02\u033C\u0314\x03\x02", "\x02\x02\u033C\u031A\x03\x02\x02\x02\u033C\u031D\x03\x02", "\x02\x02\u033C\u031F\x03\x02\x02\x02\u033C\u0325\x03\x02", "\x02\x02\u033C\u032F\x03\x02\x02\x02\u033C\u0332\x03\x02", "\x02\x02\u033C\u0337\x03\x02\x02\x02\u033D\u0340\x03\x02", "\x02\x02\u033E\u033C\x03\x02\x02\x02\u033E\u033F\x03\x02", "\x02\x02\u033F{\x03\x02\x02\x02\u0340\u033E\x03\x02", "\x02\x02\u0341\u0353\x07g\x02\x02\u0342\u0353\x05\xB2", "Z\x02\u0343\u0353\x05\xB6\\\x02\u0344\u0353\x05\xBA^\x02", "\u0345\u0348\x05\xB4[\x02\u0346\u0347\x07#\x02\x02\u0347", "\u0349\x07$\x02\x02\u0348\u0346\x03\x02\x02\x02\u0348", "\u0349\x03\x02\x02\x02\u0349\u0353\x03\x02\x02\x02\u034A", "\u0353\x07{\x02\x02\u034B\u0353\x07v\x02\x02\u034C\u0353", "\x05\xAEX\x02\u034D\u0350\x05\xB0Y\x02\u034E\u034F\x07", "#\x02\x02\u034F\u0351\x07$\x02\x02\u0350\u034E\x03\x02", "\x02\x02\u0350\u0351\x03\x02\x02\x02\u0351\u0353\x03\x02", "\x02\x02\u0352\u0341\x03\x02\x02\x02\u0352\u0342\x03\x02", "\x02\x02\u0352\u0343\x03\x02\x02\x02\u0352\u0344\x03\x02", "\x02\x02\u0352\u0345\x03\x02\x02\x02\u0352\u034A\x03\x02", "\x02\x02\u0352\u034B\x03\x02\x02\x02\u0352\u034C\x03\x02", "\x02\x02\u0352\u034D\x03\x02\x02\x02\u0353}\x03\x02", "\x02\x02\u0354\u0359\x05z>\x02\u0355\u0356\x07\x12\x02", "\x02\u0356\u0358\x05z>\x02\u0357\u0355\x03\x02\x02\x02", "\u0358\u035B\x03\x02\x02\x02\u0359\u0357\x03\x02\x02\x02", "\u0359\u035A\x03\x02\x02\x02\u035A\x7F\x03\x02\x02\x02", "\u035B\u0359\x03\x02\x02\x02\u035C\u0361\x05\x82B\x02", "\u035D\u035E\x07\x12\x02\x02\u035E\u0360\x05\x82B\x02", "\u035F\u035D\x03\x02\x02\x02\u0360\u0363\x03\x02\x02\x02", "\u0361\u035F\x03\x02\x02\x02\u0361\u0362\x03\x02\x02\x02", "\u0362\u0365\x03\x02\x02\x02\u0363\u0361\x03\x02\x02\x02", "\u0364\u0366\x07\x12\x02\x02\u0365\u0364\x03\x02\x02\x02", "\u0365\u0366\x03\x02\x02\x02\u0366\x81\x03\x02\x02\x02", "\u0367\u0368\x05\xB4[\x02\u0368\u0369\x07>\x02\x02\u0369", "\u036A\x05z>\x02\u036A\x83\x03\x02\x02\x02\u036B\u036D", "\x07\x11\x02\x02\u036C\u036E\x05\x80A\x02\u036D\u036C", "\x03\x02\x02\x02\u036D\u036E\x03\x02\x02\x02\u036E\u036F", "\x03\x02\x02\x02\u036F\u0374\x07\x13\x02\x02\u0370\u0372", "\x05~@\x02\u0371\u0370\x03\x02\x02\x02\u0371\u0372\x03", "\x02\x02\x02\u0372\u0374\x03\x02\x02\x02\u0373\u036B\x03", "\x02\x02\x02\u0373\u0371\x03\x02\x02\x02\u0374\x85\x03", "\x02\x02\x02\u0375\u0376\x05z>\x02\u0376\u0377\x07\x19", "\x02\x02\u0377\u0378\x05\x84C\x02\u0378\u0379\x07\x1A", "\x02\x02\u0379\x87\x03\x02\x02\x02\u037A\u037E\x07\x11", "\x02\x02\u037B\u037D\x05\x8AF\x02\u037C\u037B\x03\x02", "\x02\x02\u037D\u0380\x03\x02\x02\x02\u037E\u037C\x03\x02", "\x02\x02\u037E\u037F\x03\x02\x02\x02\u037F\u0381\x03\x02", "\x02\x02\u0380\u037E\x03\x02\x02\x02\u0381\u0382\x07\x13", "\x02\x02\u0382\x89\x03\x02\x02\x02\u0383\u0396\x05\xB4", "[\x02\u0384\u0396\x05\x88E\x02\u0385\u0396\x05\x8CG\x02", "\u0386\u0396\x05\x92J\x02\u0387\u0396\x05\x94K\x02\u0388", "\u0396\x05\x9AN\x02\u0389\u0396\x05\x9CO\x02\u038A\u0396", "\x05\x9EP\x02\u038B\u0396\x05\xA2R\x02\u038C\u0396\x05", "\xA6T\x02\u038D\u0396\x05\xA8U\x02\u038E\u0396\x07n\x02", "\x02\u038F\u0396\x07q\x02\x02\u0390\u0396\x07r\x02\x02", "\u0391\u0396\x05\xACW\x02\u0392\u0396\x05\xB2Z\x02\u0393", "\u0396\x05\xBA^\x02\u0394\u0396\x05\xB6\\\x02\u0395\u0383", "\x03\x02\x02\x02\u0395\u0384\x03\x02\x02\x02\u0395\u0385", "\x03\x02\x02\x02\u0395\u0386\x03\x02\x02\x02\u0395\u0387", "\x03\x02\x02\x02\u0395\u0388\x03\x02\x02\x02\u0395\u0389", "\x03\x02\x02\x02\u0395\u038A\x03\x02\x02\x02\u0395\u038B", "\x03\x02\x02\x02\u0395\u038C\x03\x02\x02\x02\u0395\u038D", "\x03\x02\x02\x02\u0395\u038E\x03\x02\x02\x02\u0395\u038F", "\x03\x02\x02\x02\u0395\u0390\x03\x02\x02\x02\u0395\u0391", "\x03\x02\x02\x02\u0395\u0392\x03\x02\x02\x02\u0395\u0393", "\x03\x02\x02\x02\u0395\u0394\x03\x02\x02\x02\u0396\x8B", "\x03\x02\x02\x02\u0397\u039B\x05\x90I\x02\u0398\u039B", "\x05\xAAV\x02\u0399\u039B\x05\x8EH\x02\u039A\u0397\x03", "\x02\x02\x02\u039A\u0398\x03\x02\x02\x02\u039A\u0399\x03", "\x02\x02\x02\u039B\x8D\x03\x02\x02\x02\u039C\u039D\x05", "\xB4[\x02\u039D\u039E\x07&\x02\x02\u039E\u039F\x05\xB4", "[\x02\u039F\x8F\x03\x02\x02\x02\u03A0\u03A5\x074\x02", "\x02\u03A1\u03A5\x07%\x02\x02\u03A2\u03A5\x07:\x02\x02", "\u03A3\u03A5\x05\xB4[\x02\u03A4\u03A0\x03\x02\x02\x02", "\u03A4\u03A1\x03\x02\x02\x02\u03A4\u03A2\x03\x02\x02\x02", "\u03A4\u03A3\x03\x02\x02\x02\u03A5\u03B2\x03\x02\x02\x02", "\u03A6\u03A8\x07\x19\x02\x02\u03A7\u03A9\x05\x8CG\x02", "\u03A8\u03A7\x03\x02\x02\x02\u03A8\u03A9\x03\x02\x02\x02", "\u03A9\u03AE\x03\x02\x02\x02\u03AA\u03AB\x07\x12\x02\x02", "\u03AB\u03AD\x05\x8CG\x02\u03AC\u03AA\x03\x02\x02\x02", "\u03AD\u03B0\x03\x02\x02\x02\u03AE\u03AC\x03\x02\x02\x02", "\u03AE\u03AF\x03\x02\x02\x02\u03AF\u03B1\x03\x02\x02\x02", "\u03B0\u03AE\x03\x02\x02\x02\u03B1\u03B3\x07\x1A\x02\x02", "\u03B2\u03A6\x03\x02\x02\x02\u03B2\u03B3\x03\x02\x02\x02", "\u03B3\x91\x03\x02\x02\x02\u03B4\u03B5\x07Y\x02\x02", "\u03B5\u03B8\x05\x96L\x02\u03B6\u03B7\x07Z\x02\x02\u03B7", "\u03B9\x05\x8CG\x02\u03B8\u03B6\x03\x02\x02\x02\u03B8", "\u03B9\x03\x02\x02\x02\u03B9\x93\x03\x02\x02\x02\u03BA", "\u03BB\x05\x96L\x02\u03BB\u03BC\x07Z\x02\x02\u03BC\u03BD", "\x05\x8CG\x02\u03BD\x95\x03\x02\x02\x02\u03BE\u03C5", "\x05\xB4[\x02\u03BF\u03C5\x05\x8EH\x02\u03C0\u03C1\x07", "\x19\x02\x02\u03C1\u03C2\x05\x98M\x02\u03C2\u03C3\x07", "\x1A\x02\x02\u03C3\u03C5\x03\x02\x02\x02\u03C4\u03BE\x03", "\x02\x02\x02\u03C4\u03BF\x03\x02\x02\x02\u03C4\u03C0\x03", "\x02\x02\x02\u03C5\x97\x03\x02\x02\x02\u03C6\u03CB\x05", "\xB4[\x02\u03C7\u03C8\x07\x12\x02\x02\u03C8\u03CA\x05", "\xB4[\x02\u03C9\u03C7\x03\x02\x02\x02\u03CA\u03CD\x03", "\x02\x02\x02\u03CB\u03C9\x03\x02\x02\x02\u03CB\u03CC\x03", "\x02\x02\x02\u03CC\x99\x03\x02\x02\x02\u03CD\u03CB\x03", "\x02\x02\x02\u03CE\u03CF\x07[\x02\x02\u03CF\u03D0\x05", "\xB4[\x02\u03D0\x9B\x03\x02\x02\x02\u03D1\u03D2\x05", "\xB4[\x02\u03D2\u03D3\x07>\x02\x02\u03D3\x9D\x03\x02", "\x02\x02\u03D4\u03D5\x07\\\x02\x02\u03D5\u03D9\x05\x8C", "G\x02\u03D6\u03D8\x05\xA0Q\x02\u03D7\u03D6\x03\x02\x02", "\x02\u03D8\u03DB\x03\x02\x02\x02\u03D9\u03D7\x03\x02\x02", "\x02\u03D9\u03DA\x03\x02\x02\x02\u03DA\x9F\x03\x02\x02", "\x02\u03DB\u03D9\x03\x02\x02\x02\u03DC\u03DD\x07]\x02", "\x02\u03DD\u03DE\x05\xAAV\x02\u03DE\u03DF\x05\x88E\x02", "\u03DF\u03E3\x03\x02\x02\x02\u03E0\u03E1\x07^\x02\x02", "\u03E1\u03E3\x05\x88E\x02\u03E2\u03DC\x03\x02\x02\x02", "\u03E2\u03E0\x03\x02\x02\x02\u03E3\xA1\x03\x02\x02\x02", "\u03E4\u03E5\x07\x1F\x02\x02\u03E5\u03E6\x05\xB4[\x02", "\u03E6\u03E8\x07\x19\x02\x02\u03E7\u03E9\x05\x98M\x02", "\u03E8\u03E7\x03\x02\x02\x02\u03E8\u03E9\x03\x02\x02\x02", "\u03E9\u03EA\x03\x02\x02\x02\u03EA\u03EC\x07\x1A\x02\x02", "\u03EB\u03ED\x05\xA4S\x02\u03EC\u03EB\x03\x02\x02\x02", "\u03EC\u03ED\x03\x02\x02\x02\u03ED\u03EE\x03\x02\x02\x02", "\u03EE\u03EF\x05\x88E\x02\u03EF\xA3\x03\x02\x02\x02", "\u03F0\u03F1\x07_\x02\x02\u03F1\u03F2\x05\x98M\x02\u03F2", "\xA5\x03\x02\x02\x02\u03F3\u03F6\x07\x1C\x02\x02\u03F4", "\u03F7\x05\x88E\x02\u03F5\u03F7\x05\x8CG\x02\u03F6\u03F4", "\x03\x02\x02\x02\u03F6\u03F5\x03\x02\x02\x02\u03F7\u03F8", "\x03\x02\x02\x02\u03F8\u03FB\x05\x8CG\x02\u03F9\u03FC", "\x05\x88E\x02\u03FA\u03FC\x05\x8CG\x02\u03FB\u03F9\x03", "\x02\x02\x02\u03FB\u03FA\x03\x02\x02\x02\u03FC\u03FD\x03", "\x02\x02\x02\u03FD\u03FE\x05\x88E\x02\u03FE\xA7\x03", "\x02\x02\x02\u03FF\u0400\x07,\x02\x02\u0400\u0401\x05", "\x8CG\x02\u0401\u0402\x05\x88E\x02\u0402\xA9\x03\x02", "\x02\x02\u0403\u0408\x05\xBA^\x02\u0404\u0408\x07h\x02", "\x02\u0405\u0408\x07i\x02\x02\u0406\u0408\x05\xB6\\\x02", "\u0407\u0403\x03\x02\x02\x02\u0407\u0404\x03\x02\x02\x02", "\u0407\u0405\x03\x02\x02\x02\u0407\u0406\x03\x02\x02\x02", "\u0408\xAB\x03\x02\x02\x02\u0409\u040A\x072\x02\x02", "\u040A\u040B\x05\xB4[\x02\u040B\u040C\x05\x88E\x02\u040C", "\xAD\x03\x02\x02\x02\u040D\u040F\x07\x19\x02\x02\u040E", "\u0410\x05z>\x02\u040F\u040E\x03\x02\x02\x02\u040F\u0410", "\x03\x02\x02\x02\u0410\u0417\x03\x02\x02\x02\u0411\u0413", "\x07\x12\x02\x02\u0412\u0414\x05z>\x02\u0413\u0412\x03", "\x02\x02\x02\u0413\u0414\x03\x02\x02\x02\u0414\u0416\x03", "\x02\x02\x02\u0415\u0411\x03\x02\x02\x02\u0416\u0419\x03", "\x02\x02\x02\u0417\u0415\x03\x02\x02\x02\u0417\u0418\x03", "\x02\x02\x02\u0418\u041A\x03\x02\x02\x02\u0419\u0417\x03", "\x02\x02\x02\u041A\u0428\x07\x1A\x02\x02\u041B\u0424\x07", "#\x02\x02\u041C\u0421\x05z>\x02\u041D\u041E\x07\x12\x02", "\x02\u041E\u0420\x05z>\x02\u041F\u041D\x03\x02\x02\x02", "\u0420\u0423\x03\x02\x02\x02\u0421\u041F\x03\x02\x02\x02", "\u0421\u0422\x03\x02\x02\x02\u0422\u0425\x03\x02\x02\x02", "\u0423\u0421\x03\x02\x02\x02\u0424\u041C\x03\x02\x02\x02", "\u0424\u0425\x03\x02\x02\x02\u0425\u0426\x03\x02\x02\x02", "\u0426\u0428\x07$\x02\x02\u0427\u040D\x03\x02\x02\x02", "\u0427\u041B\x03\x02\x02\x02\u0428\xAF\x03\x02\x02\x02", "\u0429\u042C\x05x=\x02\u042A\u042C\x05D#\x02\u042B\u0429\x03", "\x02\x02\x02\u042B\u042A\x03\x02\x02\x02\u042C\xB1\x03", "\x02\x02\x02\u042D\u042F\t\x0F\x02\x02\u042E\u0430\x07", "j\x02\x02\u042F\u042E\x03\x02\x02\x02\u042F\u0430\x03", "\x02\x02\x02\u0430\xB3\x03\x02\x02\x02\u0431\u0432\t", "\x10\x02\x02\u0432\xB5\x03\x02\x02\x02\u0433\u0435\x07", "k\x02\x02\u0434\u0433\x03\x02\x02\x02\u0435\u0436\x03", "\x02\x02\x02\u0436\u0434\x03\x02\x02\x02\u0436\u0437\x03", "\x02\x02\x02\u0437\xB7\x03\x02\x02\x02\u0438\u0444\x07", "a\x02\x02\u0439\u043A\x07\x19\x02\x02\u043A\u043F\x05", "D#\x02\u043B\u043C\x07\x12\x02\x02\u043C\u043E\x05D#\x02", "\u043D\u043B\x03\x02\x02\x02\u043E\u0441\x03\x02\x02\x02", "\u043F\u043D\x03\x02\x02\x02\u043F\u0440\x03\x02\x02\x02", "\u0440\u0442\x03\x02\x02\x02\u0441\u043F\x03\x02\x02\x02", "\u0442\u0443\x07\x1A\x02\x02\u0443\u0445\x03\x02\x02\x02", "\u0444\u0439\x03\x02\x02\x02\u0444\u0445\x03\x02\x02\x02", "\u0445\xB9\x03\x02\x02\x02\u0446\u0448\x07\x81\x02\x02", "\u0447\u0446\x03\x02\x02\x02\u0448\u0449\x03\x02\x02\x02", "\u0449\u0447\x03\x02\x02\x02\u0449\u044A\x03\x02\x02\x02", "\u044A\xBB\x03\x02\x02\x02\x80\xC3\xC5\xD3\xD7\xDC", "\xE2\xE6\xE9\xEE\xF4\xFA\xFE\u010A\u0112\u0115\u011F\u0122", "\u0128\u0130\u0133\u013C\u0145\u0147\u014D\u015D\u016B\u016E\u0175\u0179", "\u017B\u0183\u0186\u018C\u0190\u0194\u0199\u01A6\u01A8\u01AF\u01B9\u01BF", "\u01CA\u01CD\u01D3\u01D6\u01DE\u01E1\u01E7\u01EA\u01F2\u01F5\u01FB\u01FF", "\u020A\u020F\u0214\u021C\u0221\u022F\u0231\u0236\u0240\u0253\u025F\u0264", "\u026A\u026E\u0271\u027D\u0286\u028A\u028D\u0294\u02A8\u02BA\u02BE\u02C3", "\u02C7\u02CB\u02D0\u02D5\u02D9\u02F1\u0322\u0328\u032C\u033C\u033E\u0348", "\u0350\u0352\u0359\u0361\u0365\u036D\u0371\u0373\u037E\u0395\u039A\u03A4", "\u03A8\u03AE\u03B2\u03B8\u03C4\u03CB\u03D9\u03E2\u03E8\u03EC\u03F6\u03FB", "\u0407\u040F\u0413\u0417\u0421\u0424\u0427\u042B\u042F\u0436\u043F\u0444", "\u0449"].join("");
var atn$3 = new antlr4.atn.ATNDeserializer().deserialize(serializedATN$1);
var decisionsToDFA$1 = atn$3.decisionToState.map(function (ds, index) {
  return new antlr4.dfa.DFA(ds, index);
});
var sharedContextCache = new antlr4.PredictionContextCache();

var SolidityParser = /*#__PURE__*/function (_antlr4$Parser) {
  _inherits(SolidityParser, _antlr4$Parser);

  var _super = _createSuper(SolidityParser);

  function SolidityParser(input) {
    var _this;

    _classCallCheck(this, SolidityParser);

    _this = _super.call(this, input);
    _this._interp = new antlr4.atn.ParserATNSimulator(_assertThisInitialized(_this), atn$3, decisionsToDFA$1, sharedContextCache);
    _this.ruleNames = SolidityParser.ruleNames;
    _this.literalNames = SolidityParser.literalNames;
    _this.symbolicNames = SolidityParser.symbolicNames;
    return _this;
  }

  _createClass(SolidityParser, [{
    key: "sempred",
    value: function sempred(localctx, ruleIndex, predIndex) {
      switch (ruleIndex) {
        case 32:
          return this.typeName_sempred(localctx, predIndex);

        case 60:
          return this.expression_sempred(localctx, predIndex);

        default:
          throw "No predicate with index:" + ruleIndex;
      }
    }
  }, {
    key: "typeName_sempred",
    value: function typeName_sempred(localctx, predIndex) {
      switch (predIndex) {
        case 0:
          return this.precpred(this._ctx, 3);

        default:
          throw "No predicate with index:" + predIndex;
      }
    }
  }, {
    key: "expression_sempred",
    value: function expression_sempred(localctx, predIndex) {
      switch (predIndex) {
        case 1:
          return this.precpred(this._ctx, 14);

        case 2:
          return this.precpred(this._ctx, 13);

        case 3:
          return this.precpred(this._ctx, 12);

        case 4:
          return this.precpred(this._ctx, 11);

        case 5:
          return this.precpred(this._ctx, 10);

        case 6:
          return this.precpred(this._ctx, 9);

        case 7:
          return this.precpred(this._ctx, 8);

        case 8:
          return this.precpred(this._ctx, 7);

        case 9:
          return this.precpred(this._ctx, 6);

        case 10:
          return this.precpred(this._ctx, 5);

        case 11:
          return this.precpred(this._ctx, 4);

        case 12:
          return this.precpred(this._ctx, 3);

        case 13:
          return this.precpred(this._ctx, 2);

        case 14:
          return this.precpred(this._ctx, 27);

        case 15:
          return this.precpred(this._ctx, 25);

        case 16:
          return this.precpred(this._ctx, 24);

        case 17:
          return this.precpred(this._ctx, 23);

        case 18:
          return this.precpred(this._ctx, 22);

        case 19:
          return this.precpred(this._ctx, 21);

        default:
          throw "No predicate with index:" + predIndex;
      }
    }
  }, {
    key: "sourceUnit",
    value: function sourceUnit() {
      var localctx = new SourceUnitContext(this, this._ctx, this.state);
      this.enterRule(localctx, 0, SolidityParser.RULE_sourceUnit);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 195;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__0 | 1 << SolidityParser.T__11 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__17 | 1 << SolidityParser.T__18 | 1 << SolidityParser.T__19 | 1 << SolidityParser.T__20 | 1 << SolidityParser.T__26 | 1 << SolidityParser.T__28)) !== 0 || (_la - 32 & ~0x1f) == 0 && (1 << _la - 32 & (1 << SolidityParser.T__31 - 32 | 1 << SolidityParser.T__34 - 32 | 1 << SolidityParser.T__36 - 32 | 1 << SolidityParser.T__40 - 32 | 1 << SolidityParser.T__52 - 32 | 1 << SolidityParser.T__53 - 32 | 1 << SolidityParser.T__54 - 32 | 1 << SolidityParser.T__55 - 32)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.Int - 94 | 1 << SolidityParser.Uint - 94 | 1 << SolidityParser.Byte - 94 | 1 << SolidityParser.Fixed - 94 | 1 << SolidityParser.Ufixed - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ConstructorKeyword - 94 | 1 << SolidityParser.FallbackKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 193;

          this._errHandler.sync(this);

          var la_ = this._interp.adaptivePredict(this._input, 0, this._ctx);

          switch (la_) {
            case 1:
              this.state = 186;
              this.pragmaDirective();
              break;

            case 2:
              this.state = 187;
              this.importDirective();
              break;

            case 3:
              this.state = 188;
              this.contractDefinition();
              break;

            case 4:
              this.state = 189;
              this.enumDefinition();
              break;

            case 5:
              this.state = 190;
              this.structDefinition();
              break;

            case 6:
              this.state = 191;
              this.functionDefinition();
              break;

            case 7:
              this.state = 192;
              this.fileLevelConstant();
              break;
          }

          this.state = 197;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }

        this.state = 198;
        this.match(SolidityParser.EOF);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "pragmaDirective",
    value: function pragmaDirective() {
      var localctx = new PragmaDirectiveContext(this, this._ctx, this.state);
      this.enterRule(localctx, 2, SolidityParser.RULE_pragmaDirective);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 200;
        this.match(SolidityParser.T__0);
        this.state = 201;
        this.pragmaName();
        this.state = 202;
        this.pragmaValue();
        this.state = 203;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "pragmaName",
    value: function pragmaName() {
      var localctx = new PragmaNameContext(this, this._ctx, this.state);
      this.enterRule(localctx, 4, SolidityParser.RULE_pragmaName);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 205;
        this.identifier();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "pragmaValue",
    value: function pragmaValue() {
      var localctx = new PragmaValueContext(this, this._ctx, this.state);
      this.enterRule(localctx, 6, SolidityParser.RULE_pragmaValue);

      try {
        this.state = 209;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 2, this._ctx);

        switch (la_) {
          case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 207;
            this.version();
            break;

          case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 208;
            this.expression(0);
            break;
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "version",
    value: function version() {
      var localctx = new VersionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 8, SolidityParser.RULE_version);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 211;
        this.versionConstraint();
        this.state = 218;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__2 | 1 << SolidityParser.T__3 | 1 << SolidityParser.T__4 | 1 << SolidityParser.T__5 | 1 << SolidityParser.T__6 | 1 << SolidityParser.T__7 | 1 << SolidityParser.T__8 | 1 << SolidityParser.T__9)) !== 0 || _la === SolidityParser.DecimalNumber || _la === SolidityParser.VersionLiteral) {
          this.state = 213;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          if (_la === SolidityParser.T__2) {
            this.state = 212;
            this.match(SolidityParser.T__2);
          }

          this.state = 215;
          this.versionConstraint();
          this.state = 220;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "versionOperator",
    value: function versionOperator() {
      var localctx = new VersionOperatorContext(this, this._ctx, this.state);
      this.enterRule(localctx, 10, SolidityParser.RULE_versionOperator);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 221;
        _la = this._input.LA(1);

        if (!((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__3 | 1 << SolidityParser.T__4 | 1 << SolidityParser.T__5 | 1 << SolidityParser.T__6 | 1 << SolidityParser.T__7 | 1 << SolidityParser.T__8 | 1 << SolidityParser.T__9)) !== 0)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);

          this.consume();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "versionConstraint",
    value: function versionConstraint() {
      var localctx = new VersionConstraintContext(this, this._ctx, this.state);
      this.enterRule(localctx, 12, SolidityParser.RULE_versionConstraint);
      var _la = 0; // Token type

      try {
        this.state = 231;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 7, this._ctx);

        switch (la_) {
          case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 224;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__3 | 1 << SolidityParser.T__4 | 1 << SolidityParser.T__5 | 1 << SolidityParser.T__6 | 1 << SolidityParser.T__7 | 1 << SolidityParser.T__8 | 1 << SolidityParser.T__9)) !== 0) {
              this.state = 223;
              this.versionOperator();
            }

            this.state = 226;
            this.match(SolidityParser.VersionLiteral);
            break;

          case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 228;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__3 | 1 << SolidityParser.T__4 | 1 << SolidityParser.T__5 | 1 << SolidityParser.T__6 | 1 << SolidityParser.T__7 | 1 << SolidityParser.T__8 | 1 << SolidityParser.T__9)) !== 0) {
              this.state = 227;
              this.versionOperator();
            }

            this.state = 230;
            this.match(SolidityParser.DecimalNumber);
            break;
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "importDeclaration",
    value: function importDeclaration() {
      var localctx = new ImportDeclarationContext(this, this._ctx, this.state);
      this.enterRule(localctx, 14, SolidityParser.RULE_importDeclaration);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 233;
        this.identifier();
        this.state = 236;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__10) {
          this.state = 234;
          this.match(SolidityParser.T__10);
          this.state = 235;
          this.identifier();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "importDirective",
    value: function importDirective() {
      var localctx = new ImportDirectiveContext(this, this._ctx, this.state);
      this.enterRule(localctx, 16, SolidityParser.RULE_importDirective);
      var _la = 0; // Token type

      try {
        this.state = 272;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 13, this._ctx);

        switch (la_) {
          case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 238;
            this.match(SolidityParser.T__11);
            this.state = 239;
            this.match(SolidityParser.StringLiteralFragment);
            this.state = 242;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if (_la === SolidityParser.T__10) {
              this.state = 240;
              this.match(SolidityParser.T__10);
              this.state = 241;
              this.identifier();
            }

            this.state = 244;
            this.match(SolidityParser.T__1);
            break;

          case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 245;
            this.match(SolidityParser.T__11);
            this.state = 248;

            this._errHandler.sync(this);

            switch (this._input.LA(1)) {
              case SolidityParser.T__12:
                this.state = 246;
                this.match(SolidityParser.T__12);
                break;

              case SolidityParser.T__13:
              case SolidityParser.T__40:
              case SolidityParser.T__93:
              case SolidityParser.LeaveKeyword:
              case SolidityParser.PayableKeyword:
              case SolidityParser.ReceiveKeyword:
              case SolidityParser.Identifier:
                this.state = 247;
                this.identifier();
                break;

              default:
                throw new antlr4.error.NoViableAltException(this);
            }

            this.state = 252;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if (_la === SolidityParser.T__10) {
              this.state = 250;
              this.match(SolidityParser.T__10);
              this.state = 251;
              this.identifier();
            }

            this.state = 254;
            this.match(SolidityParser.T__13);
            this.state = 255;
            this.match(SolidityParser.StringLiteralFragment);
            this.state = 256;
            this.match(SolidityParser.T__1);
            break;

          case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 257;
            this.match(SolidityParser.T__11);
            this.state = 258;
            this.match(SolidityParser.T__14);
            this.state = 259;
            this.importDeclaration();
            this.state = 264;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            while (_la === SolidityParser.T__15) {
              this.state = 260;
              this.match(SolidityParser.T__15);
              this.state = 261;
              this.importDeclaration();
              this.state = 266;

              this._errHandler.sync(this);

              _la = this._input.LA(1);
            }

            this.state = 267;
            this.match(SolidityParser.T__16);
            this.state = 268;
            this.match(SolidityParser.T__13);
            this.state = 269;
            this.match(SolidityParser.StringLiteralFragment);
            this.state = 270;
            this.match(SolidityParser.T__1);
            break;
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "contractDefinition",
    value: function contractDefinition() {
      var localctx = new ContractDefinitionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 18, SolidityParser.RULE_contractDefinition);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 275;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__17) {
          this.state = 274;
          this.match(SolidityParser.T__17);
        }

        this.state = 277;
        _la = this._input.LA(1);

        if (!((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__18 | 1 << SolidityParser.T__19 | 1 << SolidityParser.T__20)) !== 0)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);

          this.consume();
        }

        this.state = 278;
        this.identifier();
        this.state = 288;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__21) {
          this.state = 279;
          this.match(SolidityParser.T__21);
          this.state = 280;
          this.inheritanceSpecifier();
          this.state = 285;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === SolidityParser.T__15) {
            this.state = 281;
            this.match(SolidityParser.T__15);
            this.state = 282;
            this.inheritanceSpecifier();
            this.state = 287;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }
        }

        this.state = 290;
        this.match(SolidityParser.T__14);
        this.state = 294;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__13 | 1 << SolidityParser.T__24 | 1 << SolidityParser.T__26 | 1 << SolidityParser.T__27 | 1 << SolidityParser.T__28 | 1 << SolidityParser.T__30)) !== 0 || (_la - 32 & ~0x1f) == 0 && (1 << _la - 32 & (1 << SolidityParser.T__31 - 32 | 1 << SolidityParser.T__34 - 32 | 1 << SolidityParser.T__36 - 32 | 1 << SolidityParser.T__40 - 32 | 1 << SolidityParser.T__52 - 32 | 1 << SolidityParser.T__53 - 32 | 1 << SolidityParser.T__54 - 32 | 1 << SolidityParser.T__55 - 32)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.Int - 94 | 1 << SolidityParser.Uint - 94 | 1 << SolidityParser.Byte - 94 | 1 << SolidityParser.Fixed - 94 | 1 << SolidityParser.Ufixed - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ConstructorKeyword - 94 | 1 << SolidityParser.FallbackKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 291;
          this.contractPart();
          this.state = 296;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }

        this.state = 297;
        this.match(SolidityParser.T__16);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "inheritanceSpecifier",
    value: function inheritanceSpecifier() {
      var localctx = new InheritanceSpecifierContext(this, this._ctx, this.state);
      this.enterRule(localctx, 20, SolidityParser.RULE_inheritanceSpecifier);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 299;
        this.userDefinedTypeName();
        this.state = 305;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__22) {
          this.state = 300;
          this.match(SolidityParser.T__22);
          this.state = 302;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
            this.state = 301;
            this.expressionList();
          }

          this.state = 304;
          this.match(SolidityParser.T__23);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "contractPart",
    value: function contractPart() {
      var localctx = new ContractPartContext(this, this._ctx, this.state);
      this.enterRule(localctx, 22, SolidityParser.RULE_contractPart);

      try {
        this.state = 314;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 20, this._ctx);

        switch (la_) {
          case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 307;
            this.stateVariableDeclaration();
            break;

          case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 308;
            this.usingForDeclaration();
            break;

          case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 309;
            this.structDefinition();
            break;

          case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 310;
            this.modifierDefinition();
            break;

          case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 311;
            this.functionDefinition();
            break;

          case 6:
            this.enterOuterAlt(localctx, 6);
            this.state = 312;
            this.eventDefinition();
            break;

          case 7:
            this.enterOuterAlt(localctx, 7);
            this.state = 313;
            this.enumDefinition();
            break;
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "stateVariableDeclaration",
    value: function stateVariableDeclaration() {
      var localctx = new StateVariableDeclarationContext(this, this._ctx, this.state);
      this.enterRule(localctx, 24, SolidityParser.RULE_stateVariableDeclaration);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 316;
        this.typeName(0);
        this.state = 325;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while ((_la - 95 & ~0x1f) == 0 && (1 << _la - 95 & (1 << SolidityParser.T__94 - 95 | 1 << SolidityParser.ConstantKeyword - 95 | 1 << SolidityParser.ImmutableKeyword - 95 | 1 << SolidityParser.InternalKeyword - 95 | 1 << SolidityParser.PrivateKeyword - 95 | 1 << SolidityParser.PublicKeyword - 95)) !== 0) {
          this.state = 323;

          this._errHandler.sync(this);

          switch (this._input.LA(1)) {
            case SolidityParser.PublicKeyword:
              this.state = 317;
              this.match(SolidityParser.PublicKeyword);
              break;

            case SolidityParser.InternalKeyword:
              this.state = 318;
              this.match(SolidityParser.InternalKeyword);
              break;

            case SolidityParser.PrivateKeyword:
              this.state = 319;
              this.match(SolidityParser.PrivateKeyword);
              break;

            case SolidityParser.ConstantKeyword:
              this.state = 320;
              this.match(SolidityParser.ConstantKeyword);
              break;

            case SolidityParser.ImmutableKeyword:
              this.state = 321;
              this.match(SolidityParser.ImmutableKeyword);
              break;

            case SolidityParser.T__94:
              this.state = 322;
              this.overrideSpecifier();
              break;

            default:
              throw new antlr4.error.NoViableAltException(this);
          }

          this.state = 327;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }

        this.state = 328;
        this.identifier();
        this.state = 331;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__9) {
          this.state = 329;
          this.match(SolidityParser.T__9);
          this.state = 330;
          this.expression(0);
        }

        this.state = 333;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "fileLevelConstant",
    value: function fileLevelConstant() {
      var localctx = new FileLevelConstantContext(this, this._ctx, this.state);
      this.enterRule(localctx, 26, SolidityParser.RULE_fileLevelConstant);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 335;
        this.typeName(0);
        this.state = 336;
        this.match(SolidityParser.ConstantKeyword);
        this.state = 337;
        this.identifier();
        this.state = 338;
        this.match(SolidityParser.T__9);
        this.state = 339;
        this.expression(0);
        this.state = 340;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "usingForDeclaration",
    value: function usingForDeclaration() {
      var localctx = new UsingForDeclarationContext(this, this._ctx, this.state);
      this.enterRule(localctx, 28, SolidityParser.RULE_usingForDeclaration);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 342;
        this.match(SolidityParser.T__24);
        this.state = 343;
        this.identifier();
        this.state = 344;
        this.match(SolidityParser.T__25);
        this.state = 347;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__12:
            this.state = 345;
            this.match(SolidityParser.T__12);
            break;

          case SolidityParser.T__13:
          case SolidityParser.T__28:
          case SolidityParser.T__34:
          case SolidityParser.T__36:
          case SolidityParser.T__40:
          case SolidityParser.T__52:
          case SolidityParser.T__53:
          case SolidityParser.T__54:
          case SolidityParser.T__55:
          case SolidityParser.T__93:
          case SolidityParser.Int:
          case SolidityParser.Uint:
          case SolidityParser.Byte:
          case SolidityParser.Fixed:
          case SolidityParser.Ufixed:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
            this.state = 346;
            this.typeName(0);
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }

        this.state = 349;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "structDefinition",
    value: function structDefinition() {
      var localctx = new StructDefinitionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 30, SolidityParser.RULE_structDefinition);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 351;
        this.match(SolidityParser.T__26);
        this.state = 352;
        this.identifier();
        this.state = 353;
        this.match(SolidityParser.T__14);
        this.state = 364;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__28 || (_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__36 - 35 | 1 << SolidityParser.T__40 - 35 | 1 << SolidityParser.T__52 - 35 | 1 << SolidityParser.T__53 - 35 | 1 << SolidityParser.T__54 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.Int - 94 | 1 << SolidityParser.Uint - 94 | 1 << SolidityParser.Byte - 94 | 1 << SolidityParser.Fixed - 94 | 1 << SolidityParser.Ufixed - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 354;
          this.variableDeclaration();
          this.state = 355;
          this.match(SolidityParser.T__1);
          this.state = 361;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === SolidityParser.T__13 || _la === SolidityParser.T__28 || (_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__36 - 35 | 1 << SolidityParser.T__40 - 35 | 1 << SolidityParser.T__52 - 35 | 1 << SolidityParser.T__53 - 35 | 1 << SolidityParser.T__54 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.Int - 94 | 1 << SolidityParser.Uint - 94 | 1 << SolidityParser.Byte - 94 | 1 << SolidityParser.Fixed - 94 | 1 << SolidityParser.Ufixed - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
            this.state = 356;
            this.variableDeclaration();
            this.state = 357;
            this.match(SolidityParser.T__1);
            this.state = 363;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }
        }

        this.state = 366;
        this.match(SolidityParser.T__16);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "modifierDefinition",
    value: function modifierDefinition() {
      var localctx = new ModifierDefinitionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 32, SolidityParser.RULE_modifierDefinition);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 368;
        this.match(SolidityParser.T__27);
        this.state = 369;
        this.identifier();
        this.state = 371;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__22) {
          this.state = 370;
          this.parameterList();
        }

        this.state = 377;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while (_la === SolidityParser.T__94 || _la === SolidityParser.VirtualKeyword) {
          this.state = 375;

          this._errHandler.sync(this);

          switch (this._input.LA(1)) {
            case SolidityParser.VirtualKeyword:
              this.state = 373;
              this.match(SolidityParser.VirtualKeyword);
              break;

            case SolidityParser.T__94:
              this.state = 374;
              this.overrideSpecifier();
              break;

            default:
              throw new antlr4.error.NoViableAltException(this);
          }

          this.state = 379;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }

        this.state = 380;
        this.block();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "modifierInvocation",
    value: function modifierInvocation() {
      var localctx = new ModifierInvocationContext(this, this._ctx, this.state);
      this.enterRule(localctx, 34, SolidityParser.RULE_modifierInvocation);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 382;
        this.identifier();
        this.state = 388;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__22) {
          this.state = 383;
          this.match(SolidityParser.T__22);
          this.state = 385;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
            this.state = 384;
            this.expressionList();
          }

          this.state = 387;
          this.match(SolidityParser.T__23);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "functionDefinition",
    value: function functionDefinition() {
      var localctx = new FunctionDefinitionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 36, SolidityParser.RULE_functionDefinition);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 390;
        this.functionDescriptor();
        this.state = 391;
        this.parameterList();
        this.state = 392;
        this.modifierList();
        this.state = 394;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__29) {
          this.state = 393;
          this.returnParameters();
        }

        this.state = 398;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__1:
            this.state = 396;
            this.match(SolidityParser.T__1);
            break;

          case SolidityParser.T__14:
            this.state = 397;
            this.block();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "functionDescriptor",
    value: function functionDescriptor() {
      var localctx = new FunctionDescriptorContext(this, this._ctx, this.state);
      this.enterRule(localctx, 38, SolidityParser.RULE_functionDescriptor);
      var _la = 0; // Token type

      try {
        this.state = 407;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__28:
            this.enterOuterAlt(localctx, 1);
            this.state = 400;
            this.match(SolidityParser.T__28);
            this.state = 402;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
              this.state = 401;
              this.identifier();
            }

            break;

          case SolidityParser.ConstructorKeyword:
            this.enterOuterAlt(localctx, 2);
            this.state = 404;
            this.match(SolidityParser.ConstructorKeyword);
            break;

          case SolidityParser.FallbackKeyword:
            this.enterOuterAlt(localctx, 3);
            this.state = 405;
            this.match(SolidityParser.FallbackKeyword);
            break;

          case SolidityParser.ReceiveKeyword:
            this.enterOuterAlt(localctx, 4);
            this.state = 406;
            this.match(SolidityParser.ReceiveKeyword);
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "returnParameters",
    value: function returnParameters() {
      var localctx = new ReturnParametersContext(this, this._ctx, this.state);
      this.enterRule(localctx, 40, SolidityParser.RULE_returnParameters);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 409;
        this.match(SolidityParser.T__29);
        this.state = 410;
        this.parameterList();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "modifierList",
    value: function modifierList() {
      var localctx = new ModifierListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 42, SolidityParser.RULE_modifierList);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 422;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.T__94 - 94 | 1 << SolidityParser.ConstantKeyword - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.ExternalKeyword - 94 | 1 << SolidityParser.InternalKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.PrivateKeyword - 94 | 1 << SolidityParser.PublicKeyword - 94 | 1 << SolidityParser.VirtualKeyword - 94 | 1 << SolidityParser.PureKeyword - 94 | 1 << SolidityParser.ViewKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 420;

          this._errHandler.sync(this);

          var la_ = this._interp.adaptivePredict(this._input, 36, this._ctx);

          switch (la_) {
            case 1:
              this.state = 412;
              this.match(SolidityParser.ExternalKeyword);
              break;

            case 2:
              this.state = 413;
              this.match(SolidityParser.PublicKeyword);
              break;

            case 3:
              this.state = 414;
              this.match(SolidityParser.InternalKeyword);
              break;

            case 4:
              this.state = 415;
              this.match(SolidityParser.PrivateKeyword);
              break;

            case 5:
              this.state = 416;
              this.match(SolidityParser.VirtualKeyword);
              break;

            case 6:
              this.state = 417;
              this.stateMutability();
              break;

            case 7:
              this.state = 418;
              this.modifierInvocation();
              break;

            case 8:
              this.state = 419;
              this.overrideSpecifier();
              break;
          }

          this.state = 424;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "eventDefinition",
    value: function eventDefinition() {
      var localctx = new EventDefinitionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 44, SolidityParser.RULE_eventDefinition);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 425;
        this.match(SolidityParser.T__30);
        this.state = 426;
        this.identifier();
        this.state = 427;
        this.eventParameterList();
        this.state = 429;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.AnonymousKeyword) {
          this.state = 428;
          this.match(SolidityParser.AnonymousKeyword);
        }

        this.state = 431;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "enumValue",
    value: function enumValue() {
      var localctx = new EnumValueContext(this, this._ctx, this.state);
      this.enterRule(localctx, 46, SolidityParser.RULE_enumValue);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 433;
        this.identifier();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "enumDefinition",
    value: function enumDefinition() {
      var localctx = new EnumDefinitionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 48, SolidityParser.RULE_enumDefinition);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 435;
        this.match(SolidityParser.T__31);
        this.state = 436;
        this.identifier();
        this.state = 437;
        this.match(SolidityParser.T__14);
        this.state = 439;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 438;
          this.enumValue();
        }

        this.state = 445;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while (_la === SolidityParser.T__15) {
          this.state = 441;
          this.match(SolidityParser.T__15);
          this.state = 442;
          this.enumValue();
          this.state = 447;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }

        this.state = 448;
        this.match(SolidityParser.T__16);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "parameterList",
    value: function parameterList() {
      var localctx = new ParameterListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 50, SolidityParser.RULE_parameterList);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 450;
        this.match(SolidityParser.T__22);
        this.state = 459;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__28 || (_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__36 - 35 | 1 << SolidityParser.T__40 - 35 | 1 << SolidityParser.T__52 - 35 | 1 << SolidityParser.T__53 - 35 | 1 << SolidityParser.T__54 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.Int - 94 | 1 << SolidityParser.Uint - 94 | 1 << SolidityParser.Byte - 94 | 1 << SolidityParser.Fixed - 94 | 1 << SolidityParser.Ufixed - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 451;
          this.parameter();
          this.state = 456;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === SolidityParser.T__15) {
            this.state = 452;
            this.match(SolidityParser.T__15);
            this.state = 453;
            this.parameter();
            this.state = 458;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }
        }

        this.state = 461;
        this.match(SolidityParser.T__23);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "parameter",
    value: function parameter() {
      var localctx = new ParameterContext(this, this._ctx, this.state);
      this.enterRule(localctx, 52, SolidityParser.RULE_parameter);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 463;
        this.typeName(0);
        this.state = 465;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 43, this._ctx);

        if (la_ === 1) {
          this.state = 464;
          this.storageLocation();
        }

        this.state = 468;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 467;
          this.identifier();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "eventParameterList",
    value: function eventParameterList() {
      var localctx = new EventParameterListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 54, SolidityParser.RULE_eventParameterList);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 470;
        this.match(SolidityParser.T__22);
        this.state = 479;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__28 || (_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__36 - 35 | 1 << SolidityParser.T__40 - 35 | 1 << SolidityParser.T__52 - 35 | 1 << SolidityParser.T__53 - 35 | 1 << SolidityParser.T__54 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.Int - 94 | 1 << SolidityParser.Uint - 94 | 1 << SolidityParser.Byte - 94 | 1 << SolidityParser.Fixed - 94 | 1 << SolidityParser.Ufixed - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 471;
          this.eventParameter();
          this.state = 476;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === SolidityParser.T__15) {
            this.state = 472;
            this.match(SolidityParser.T__15);
            this.state = 473;
            this.eventParameter();
            this.state = 478;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }
        }

        this.state = 481;
        this.match(SolidityParser.T__23);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "eventParameter",
    value: function eventParameter() {
      var localctx = new EventParameterContext(this, this._ctx, this.state);
      this.enterRule(localctx, 56, SolidityParser.RULE_eventParameter);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 483;
        this.typeName(0);
        this.state = 485;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.IndexedKeyword) {
          this.state = 484;
          this.match(SolidityParser.IndexedKeyword);
        }

        this.state = 488;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 487;
          this.identifier();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "functionTypeParameterList",
    value: function functionTypeParameterList() {
      var localctx = new FunctionTypeParameterListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 58, SolidityParser.RULE_functionTypeParameterList);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 490;
        this.match(SolidityParser.T__22);
        this.state = 499;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__28 || (_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__36 - 35 | 1 << SolidityParser.T__40 - 35 | 1 << SolidityParser.T__52 - 35 | 1 << SolidityParser.T__53 - 35 | 1 << SolidityParser.T__54 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.Int - 94 | 1 << SolidityParser.Uint - 94 | 1 << SolidityParser.Byte - 94 | 1 << SolidityParser.Fixed - 94 | 1 << SolidityParser.Ufixed - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 491;
          this.functionTypeParameter();
          this.state = 496;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === SolidityParser.T__15) {
            this.state = 492;
            this.match(SolidityParser.T__15);
            this.state = 493;
            this.functionTypeParameter();
            this.state = 498;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }
        }

        this.state = 501;
        this.match(SolidityParser.T__23);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "functionTypeParameter",
    value: function functionTypeParameter() {
      var localctx = new FunctionTypeParameterContext(this, this._ctx, this.state);
      this.enterRule(localctx, 60, SolidityParser.RULE_functionTypeParameter);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 503;
        this.typeName(0);
        this.state = 505;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if ((_la - 39 & ~0x1f) == 0 && (1 << _la - 39 & (1 << SolidityParser.T__38 - 39 | 1 << SolidityParser.T__39 - 39 | 1 << SolidityParser.T__40 - 39)) !== 0) {
          this.state = 504;
          this.storageLocation();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "variableDeclaration",
    value: function variableDeclaration() {
      var localctx = new VariableDeclarationContext(this, this._ctx, this.state);
      this.enterRule(localctx, 62, SolidityParser.RULE_variableDeclaration);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 507;
        this.typeName(0);
        this.state = 509;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 52, this._ctx);

        if (la_ === 1) {
          this.state = 508;
          this.storageLocation();
        }

        this.state = 511;
        this.identifier();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "typeName",
    value: function typeName(_p) {
      if (_p === undefined) {
        _p = 0;
      }

      var _parentctx = this._ctx;
      var _parentState = this.state;
      var localctx = new TypeNameContext(this, this._ctx, _parentState);
      var _prevctx = localctx;
      var _startState = 64;
      this.enterRecursionRule(localctx, 64, SolidityParser.RULE_typeName, _p);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 520;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 53, this._ctx);

        switch (la_) {
          case 1:
            this.state = 514;
            this.elementaryTypeName();
            break;

          case 2:
            this.state = 515;
            this.userDefinedTypeName();
            break;

          case 3:
            this.state = 516;
            this.mapping();
            break;

          case 4:
            this.state = 517;
            this.functionTypeName();
            break;

          case 5:
            this.state = 518;
            this.match(SolidityParser.T__34);
            this.state = 519;
            this.match(SolidityParser.PayableKeyword);
            break;
        }

        this._ctx.stop = this._input.LT(-1);
        this.state = 530;

        this._errHandler.sync(this);

        var _alt = this._interp.adaptivePredict(this._input, 55, this._ctx);

        while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            if (this._parseListeners !== null) {
              this.triggerExitRuleEvent();
            }

            _prevctx = localctx;
            localctx = new TypeNameContext(this, _parentctx, _parentState);
            this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_typeName);
            this.state = 522;

            if (!this.precpred(this._ctx, 3)) {
              throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
            }

            this.state = 523;
            this.match(SolidityParser.T__32);
            this.state = 525;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
              this.state = 524;
              this.expression(0);
            }

            this.state = 527;
            this.match(SolidityParser.T__33);
          }

          this.state = 532;

          this._errHandler.sync(this);

          _alt = this._interp.adaptivePredict(this._input, 55, this._ctx);
        }
      } catch (error) {
        if (error instanceof antlr4.error.RecognitionException) {
          localctx.exception = error;

          this._errHandler.reportError(this, error);

          this._errHandler.recover(this, error);
        } else {
          throw error;
        }
      } finally {
        this.unrollRecursionContexts(_parentctx);
      }

      return localctx;
    }
  }, {
    key: "userDefinedTypeName",
    value: function userDefinedTypeName() {
      var localctx = new UserDefinedTypeNameContext(this, this._ctx, this.state);
      this.enterRule(localctx, 66, SolidityParser.RULE_userDefinedTypeName);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 533;
        this.identifier();
        this.state = 538;

        this._errHandler.sync(this);

        var _alt = this._interp.adaptivePredict(this._input, 56, this._ctx);

        while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            this.state = 534;
            this.match(SolidityParser.T__35);
            this.state = 535;
            this.identifier();
          }

          this.state = 540;

          this._errHandler.sync(this);

          _alt = this._interp.adaptivePredict(this._input, 56, this._ctx);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "mappingKey",
    value: function mappingKey() {
      var localctx = new MappingKeyContext(this, this._ctx, this.state);
      this.enterRule(localctx, 68, SolidityParser.RULE_mappingKey);

      try {
        this.state = 543;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__34:
          case SolidityParser.T__52:
          case SolidityParser.T__53:
          case SolidityParser.T__54:
          case SolidityParser.T__55:
          case SolidityParser.Int:
          case SolidityParser.Uint:
          case SolidityParser.Byte:
          case SolidityParser.Fixed:
          case SolidityParser.Ufixed:
            this.enterOuterAlt(localctx, 1);
            this.state = 541;
            this.elementaryTypeName();
            break;

          case SolidityParser.T__13:
          case SolidityParser.T__40:
          case SolidityParser.T__93:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
            this.enterOuterAlt(localctx, 2);
            this.state = 542;
            this.userDefinedTypeName();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "mapping",
    value: function mapping() {
      var localctx = new MappingContext(this, this._ctx, this.state);
      this.enterRule(localctx, 70, SolidityParser.RULE_mapping);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 545;
        this.match(SolidityParser.T__36);
        this.state = 546;
        this.match(SolidityParser.T__22);
        this.state = 547;
        this.mappingKey();
        this.state = 548;
        this.match(SolidityParser.T__37);
        this.state = 549;
        this.typeName(0);
        this.state = 550;
        this.match(SolidityParser.T__23);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "functionTypeName",
    value: function functionTypeName() {
      var localctx = new FunctionTypeNameContext(this, this._ctx, this.state);
      this.enterRule(localctx, 72, SolidityParser.RULE_functionTypeName);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 552;
        this.match(SolidityParser.T__28);
        this.state = 553;
        this.functionTypeParameterList();
        this.state = 559;

        this._errHandler.sync(this);

        var _alt = this._interp.adaptivePredict(this._input, 59, this._ctx);

        while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            this.state = 557;

            this._errHandler.sync(this);

            switch (this._input.LA(1)) {
              case SolidityParser.InternalKeyword:
                this.state = 554;
                this.match(SolidityParser.InternalKeyword);
                break;

              case SolidityParser.ExternalKeyword:
                this.state = 555;
                this.match(SolidityParser.ExternalKeyword);
                break;

              case SolidityParser.ConstantKeyword:
              case SolidityParser.PayableKeyword:
              case SolidityParser.PureKeyword:
              case SolidityParser.ViewKeyword:
                this.state = 556;
                this.stateMutability();
                break;

              default:
                throw new antlr4.error.NoViableAltException(this);
            }
          }

          this.state = 561;

          this._errHandler.sync(this);

          _alt = this._interp.adaptivePredict(this._input, 59, this._ctx);
        }

        this.state = 564;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 60, this._ctx);

        if (la_ === 1) {
          this.state = 562;
          this.match(SolidityParser.T__29);
          this.state = 563;
          this.functionTypeParameterList();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "storageLocation",
    value: function storageLocation() {
      var localctx = new StorageLocationContext(this, this._ctx, this.state);
      this.enterRule(localctx, 74, SolidityParser.RULE_storageLocation);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 566;
        _la = this._input.LA(1);

        if (!((_la - 39 & ~0x1f) == 0 && (1 << _la - 39 & (1 << SolidityParser.T__38 - 39 | 1 << SolidityParser.T__39 - 39 | 1 << SolidityParser.T__40 - 39)) !== 0)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);

          this.consume();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "stateMutability",
    value: function stateMutability() {
      var localctx = new StateMutabilityContext(this, this._ctx, this.state);
      this.enterRule(localctx, 76, SolidityParser.RULE_stateMutability);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 568;
        _la = this._input.LA(1);

        if (!((_la - 109 & ~0x1f) == 0 && (1 << _la - 109 & (1 << SolidityParser.ConstantKeyword - 109 | 1 << SolidityParser.PayableKeyword - 109 | 1 << SolidityParser.PureKeyword - 109 | 1 << SolidityParser.ViewKeyword - 109)) !== 0)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);

          this.consume();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "block",
    value: function block() {
      var localctx = new BlockContext(this, this._ctx, this.state);
      this.enterRule(localctx, 78, SolidityParser.RULE_block);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 570;
        this.match(SolidityParser.T__14);
        this.state = 574;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__14 | 1 << SolidityParser.T__22 | 1 << SolidityParser.T__25 | 1 << SolidityParser.T__28)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__36 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__41 - 33 | 1 << SolidityParser.T__43 - 33 | 1 << SolidityParser.T__45 - 33 | 1 << SolidityParser.T__46 - 33 | 1 << SolidityParser.T__47 - 33 | 1 << SolidityParser.T__48 - 33 | 1 << SolidityParser.T__49 - 33 | 1 << SolidityParser.T__50 - 33 | 1 << SolidityParser.T__51 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.BreakKeyword - 97 | 1 << SolidityParser.ContinueKeyword - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
          this.state = 571;
          this.statement();
          this.state = 576;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }

        this.state = 577;
        this.match(SolidityParser.T__16);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "statement",
    value: function statement() {
      var localctx = new StatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 80, SolidityParser.RULE_statement);

      try {
        this.state = 593;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__41:
            this.enterOuterAlt(localctx, 1);
            this.state = 579;
            this.ifStatement();
            break;

          case SolidityParser.T__43:
            this.enterOuterAlt(localctx, 2);
            this.state = 580;
            this.tryStatement();
            break;

          case SolidityParser.T__45:
            this.enterOuterAlt(localctx, 3);
            this.state = 581;
            this.whileStatement();
            break;

          case SolidityParser.T__25:
            this.enterOuterAlt(localctx, 4);
            this.state = 582;
            this.forStatement();
            break;

          case SolidityParser.T__14:
            this.enterOuterAlt(localctx, 5);
            this.state = 583;
            this.block();
            break;

          case SolidityParser.T__47:
            this.enterOuterAlt(localctx, 6);
            this.state = 584;
            this.inlineAssemblyStatement();
            break;

          case SolidityParser.T__48:
            this.enterOuterAlt(localctx, 7);
            this.state = 585;
            this.doWhileStatement();
            break;

          case SolidityParser.ContinueKeyword:
            this.enterOuterAlt(localctx, 8);
            this.state = 586;
            this.continueStatement();
            break;

          case SolidityParser.BreakKeyword:
            this.enterOuterAlt(localctx, 9);
            this.state = 587;
            this.breakStatement();
            break;

          case SolidityParser.T__49:
            this.enterOuterAlt(localctx, 10);
            this.state = 588;
            this.returnStatement();
            break;

          case SolidityParser.T__50:
            this.enterOuterAlt(localctx, 11);
            this.state = 589;
            this.throwStatement();
            break;

          case SolidityParser.T__51:
            this.enterOuterAlt(localctx, 12);
            this.state = 590;
            this.emitStatement();
            break;

          case SolidityParser.T__4:
          case SolidityParser.T__13:
          case SolidityParser.T__22:
          case SolidityParser.T__28:
          case SolidityParser.T__32:
          case SolidityParser.T__34:
          case SolidityParser.T__36:
          case SolidityParser.T__40:
          case SolidityParser.T__52:
          case SolidityParser.T__53:
          case SolidityParser.T__54:
          case SolidityParser.T__55:
          case SolidityParser.T__56:
          case SolidityParser.T__57:
          case SolidityParser.T__58:
          case SolidityParser.T__60:
          case SolidityParser.T__61:
          case SolidityParser.T__62:
          case SolidityParser.T__63:
          case SolidityParser.T__64:
          case SolidityParser.T__93:
          case SolidityParser.Int:
          case SolidityParser.Uint:
          case SolidityParser.Byte:
          case SolidityParser.Fixed:
          case SolidityParser.Ufixed:
          case SolidityParser.BooleanLiteral:
          case SolidityParser.DecimalNumber:
          case SolidityParser.HexNumber:
          case SolidityParser.HexLiteralFragment:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.TypeKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
          case SolidityParser.StringLiteralFragment:
            this.enterOuterAlt(localctx, 13);
            this.state = 591;
            this.simpleStatement();
            break;

          case SolidityParser.T__46:
            this.enterOuterAlt(localctx, 14);
            this.state = 592;
            this.uncheckedStatement();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "expressionStatement",
    value: function expressionStatement() {
      var localctx = new ExpressionStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 82, SolidityParser.RULE_expressionStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 595;
        this.expression(0);
        this.state = 596;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "ifStatement",
    value: function ifStatement() {
      var localctx = new IfStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 84, SolidityParser.RULE_ifStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 598;
        this.match(SolidityParser.T__41);
        this.state = 599;
        this.match(SolidityParser.T__22);
        this.state = 600;
        this.expression(0);
        this.state = 601;
        this.match(SolidityParser.T__23);
        this.state = 602;
        this.statement();
        this.state = 605;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 63, this._ctx);

        if (la_ === 1) {
          this.state = 603;
          this.match(SolidityParser.T__42);
          this.state = 604;
          this.statement();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "tryStatement",
    value: function tryStatement() {
      var localctx = new TryStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 86, SolidityParser.RULE_tryStatement);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 607;
        this.match(SolidityParser.T__43);
        this.state = 608;
        this.expression(0);
        this.state = 610;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__29) {
          this.state = 609;
          this.returnParameters();
        }

        this.state = 612;
        this.block();
        this.state = 614;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        do {
          this.state = 613;
          this.catchClause();
          this.state = 616;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        } while (_la === SolidityParser.T__44);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "catchClause",
    value: function catchClause() {
      var localctx = new CatchClauseContext(this, this._ctx, this.state);
      this.enterRule(localctx, 88, SolidityParser.RULE_catchClause);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 618;
        this.match(SolidityParser.T__44);
        this.state = 623;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if ((_la - 14 & ~0x1f) == 0 && (1 << _la - 14 & (1 << SolidityParser.T__13 - 14 | 1 << SolidityParser.T__22 - 14 | 1 << SolidityParser.T__40 - 14)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 620;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          if (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
            this.state = 619;
            this.identifier();
          }

          this.state = 622;
          this.parameterList();
        }

        this.state = 625;
        this.block();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "whileStatement",
    value: function whileStatement() {
      var localctx = new WhileStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 90, SolidityParser.RULE_whileStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 627;
        this.match(SolidityParser.T__45);
        this.state = 628;
        this.match(SolidityParser.T__22);
        this.state = 629;
        this.expression(0);
        this.state = 630;
        this.match(SolidityParser.T__23);
        this.state = 631;
        this.statement();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "simpleStatement",
    value: function simpleStatement() {
      var localctx = new SimpleStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 92, SolidityParser.RULE_simpleStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 635;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 68, this._ctx);

        switch (la_) {
          case 1:
            this.state = 633;
            this.variableDeclarationStatement();
            break;

          case 2:
            this.state = 634;
            this.expressionStatement();
            break;
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "uncheckedStatement",
    value: function uncheckedStatement() {
      var localctx = new UncheckedStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 94, SolidityParser.RULE_uncheckedStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 637;
        this.match(SolidityParser.T__46);
        this.state = 638;
        this.block();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "forStatement",
    value: function forStatement() {
      var localctx = new ForStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 96, SolidityParser.RULE_forStatement);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 640;
        this.match(SolidityParser.T__25);
        this.state = 641;
        this.match(SolidityParser.T__22);
        this.state = 644;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__4:
          case SolidityParser.T__13:
          case SolidityParser.T__22:
          case SolidityParser.T__28:
          case SolidityParser.T__32:
          case SolidityParser.T__34:
          case SolidityParser.T__36:
          case SolidityParser.T__40:
          case SolidityParser.T__52:
          case SolidityParser.T__53:
          case SolidityParser.T__54:
          case SolidityParser.T__55:
          case SolidityParser.T__56:
          case SolidityParser.T__57:
          case SolidityParser.T__58:
          case SolidityParser.T__60:
          case SolidityParser.T__61:
          case SolidityParser.T__62:
          case SolidityParser.T__63:
          case SolidityParser.T__64:
          case SolidityParser.T__93:
          case SolidityParser.Int:
          case SolidityParser.Uint:
          case SolidityParser.Byte:
          case SolidityParser.Fixed:
          case SolidityParser.Ufixed:
          case SolidityParser.BooleanLiteral:
          case SolidityParser.DecimalNumber:
          case SolidityParser.HexNumber:
          case SolidityParser.HexLiteralFragment:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.TypeKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
          case SolidityParser.StringLiteralFragment:
            this.state = 642;
            this.simpleStatement();
            break;

          case SolidityParser.T__1:
            this.state = 643;
            this.match(SolidityParser.T__1);
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }

        this.state = 648;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__4:
          case SolidityParser.T__13:
          case SolidityParser.T__22:
          case SolidityParser.T__32:
          case SolidityParser.T__34:
          case SolidityParser.T__40:
          case SolidityParser.T__52:
          case SolidityParser.T__53:
          case SolidityParser.T__54:
          case SolidityParser.T__55:
          case SolidityParser.T__56:
          case SolidityParser.T__57:
          case SolidityParser.T__58:
          case SolidityParser.T__60:
          case SolidityParser.T__61:
          case SolidityParser.T__62:
          case SolidityParser.T__63:
          case SolidityParser.T__64:
          case SolidityParser.T__93:
          case SolidityParser.Int:
          case SolidityParser.Uint:
          case SolidityParser.Byte:
          case SolidityParser.Fixed:
          case SolidityParser.Ufixed:
          case SolidityParser.BooleanLiteral:
          case SolidityParser.DecimalNumber:
          case SolidityParser.HexNumber:
          case SolidityParser.HexLiteralFragment:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.TypeKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
          case SolidityParser.StringLiteralFragment:
            this.state = 646;
            this.expressionStatement();
            break;

          case SolidityParser.T__1:
            this.state = 647;
            this.match(SolidityParser.T__1);
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }

        this.state = 651;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
          this.state = 650;
          this.expression(0);
        }

        this.state = 653;
        this.match(SolidityParser.T__23);
        this.state = 654;
        this.statement();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "inlineAssemblyStatement",
    value: function inlineAssemblyStatement() {
      var localctx = new InlineAssemblyStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 98, SolidityParser.RULE_inlineAssemblyStatement);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 656;
        this.match(SolidityParser.T__47);
        this.state = 658;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.StringLiteralFragment) {
          this.state = 657;
          this.match(SolidityParser.StringLiteralFragment);
        }

        this.state = 660;
        this.assemblyBlock();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "doWhileStatement",
    value: function doWhileStatement() {
      var localctx = new DoWhileStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 100, SolidityParser.RULE_doWhileStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 662;
        this.match(SolidityParser.T__48);
        this.state = 663;
        this.statement();
        this.state = 664;
        this.match(SolidityParser.T__45);
        this.state = 665;
        this.match(SolidityParser.T__22);
        this.state = 666;
        this.expression(0);
        this.state = 667;
        this.match(SolidityParser.T__23);
        this.state = 668;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "continueStatement",
    value: function continueStatement() {
      var localctx = new ContinueStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 102, SolidityParser.RULE_continueStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 670;
        this.match(SolidityParser.ContinueKeyword);
        this.state = 671;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "breakStatement",
    value: function breakStatement() {
      var localctx = new BreakStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 104, SolidityParser.RULE_breakStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 673;
        this.match(SolidityParser.BreakKeyword);
        this.state = 674;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "returnStatement",
    value: function returnStatement() {
      var localctx = new ReturnStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 106, SolidityParser.RULE_returnStatement);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 676;
        this.match(SolidityParser.T__49);
        this.state = 678;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
          this.state = 677;
          this.expression(0);
        }

        this.state = 680;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "throwStatement",
    value: function throwStatement() {
      var localctx = new ThrowStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 108, SolidityParser.RULE_throwStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 682;
        this.match(SolidityParser.T__50);
        this.state = 683;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "emitStatement",
    value: function emitStatement() {
      var localctx = new EmitStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 110, SolidityParser.RULE_emitStatement);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 685;
        this.match(SolidityParser.T__51);
        this.state = 686;
        this.functionCall();
        this.state = 687;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "variableDeclarationStatement",
    value: function variableDeclarationStatement() {
      var localctx = new VariableDeclarationStatementContext(this, this._ctx, this.state);
      this.enterRule(localctx, 112, SolidityParser.RULE_variableDeclarationStatement);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 696;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 74, this._ctx);

        switch (la_) {
          case 1:
            this.state = 689;
            this.match(SolidityParser.T__52);
            this.state = 690;
            this.identifierList();
            break;

          case 2:
            this.state = 691;
            this.variableDeclaration();
            break;

          case 3:
            this.state = 692;
            this.match(SolidityParser.T__22);
            this.state = 693;
            this.variableDeclarationList();
            this.state = 694;
            this.match(SolidityParser.T__23);
            break;
        }

        this.state = 700;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__9) {
          this.state = 698;
          this.match(SolidityParser.T__9);
          this.state = 699;
          this.expression(0);
        }

        this.state = 702;
        this.match(SolidityParser.T__1);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "variableDeclarationList",
    value: function variableDeclarationList() {
      var localctx = new VariableDeclarationListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 114, SolidityParser.RULE_variableDeclarationList);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 705;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__28 || (_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__36 - 35 | 1 << SolidityParser.T__40 - 35 | 1 << SolidityParser.T__52 - 35 | 1 << SolidityParser.T__53 - 35 | 1 << SolidityParser.T__54 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.Int - 94 | 1 << SolidityParser.Uint - 94 | 1 << SolidityParser.Byte - 94 | 1 << SolidityParser.Fixed - 94 | 1 << SolidityParser.Ufixed - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 704;
          this.variableDeclaration();
        }

        this.state = 713;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while (_la === SolidityParser.T__15) {
          this.state = 707;
          this.match(SolidityParser.T__15);
          this.state = 709;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          if (_la === SolidityParser.T__13 || _la === SolidityParser.T__28 || (_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__36 - 35 | 1 << SolidityParser.T__40 - 35 | 1 << SolidityParser.T__52 - 35 | 1 << SolidityParser.T__53 - 35 | 1 << SolidityParser.T__54 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.Int - 94 | 1 << SolidityParser.Uint - 94 | 1 << SolidityParser.Byte - 94 | 1 << SolidityParser.Fixed - 94 | 1 << SolidityParser.Ufixed - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
            this.state = 708;
            this.variableDeclaration();
          }

          this.state = 715;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "identifierList",
    value: function identifierList() {
      var localctx = new IdentifierListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 116, SolidityParser.RULE_identifierList);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 716;
        this.match(SolidityParser.T__22);
        this.state = 723;

        this._errHandler.sync(this);

        var _alt = this._interp.adaptivePredict(this._input, 80, this._ctx);

        while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            this.state = 718;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
              this.state = 717;
              this.identifier();
            }

            this.state = 720;
            this.match(SolidityParser.T__15);
          }

          this.state = 725;

          this._errHandler.sync(this);

          _alt = this._interp.adaptivePredict(this._input, 80, this._ctx);
        }

        this.state = 727;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 726;
          this.identifier();
        }

        this.state = 729;
        this.match(SolidityParser.T__23);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "elementaryTypeName",
    value: function elementaryTypeName() {
      var localctx = new ElementaryTypeNameContext(this, this._ctx, this.state);
      this.enterRule(localctx, 118, SolidityParser.RULE_elementaryTypeName);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 731;
        _la = this._input.LA(1);

        if (!((_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__52 - 35 | 1 << SolidityParser.T__53 - 35 | 1 << SolidityParser.T__54 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 96 & ~0x1f) == 0 && (1 << _la - 96 & (1 << SolidityParser.Int - 96 | 1 << SolidityParser.Uint - 96 | 1 << SolidityParser.Byte - 96 | 1 << SolidityParser.Fixed - 96 | 1 << SolidityParser.Ufixed - 96)) !== 0)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);

          this.consume();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "expression",
    value: function expression(_p) {
      if (_p === undefined) {
        _p = 0;
      }

      var _parentctx = this._ctx;
      var _parentState = this.state;
      var localctx = new ExpressionContext(this, this._ctx, _parentState);
      var _prevctx = localctx;
      var _startState = 120;
      this.enterRecursionRule(localctx, 120, SolidityParser.RULE_expression, _p);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 751;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 82, this._ctx);

        switch (la_) {
          case 1:
            this.state = 734;
            this.match(SolidityParser.T__58);
            this.state = 735;
            this.typeName(0);
            break;

          case 2:
            this.state = 736;
            this.match(SolidityParser.T__22);
            this.state = 737;
            this.expression(0);
            this.state = 738;
            this.match(SolidityParser.T__23);
            break;

          case 3:
            this.state = 740;
            _la = this._input.LA(1);

            if (!(_la === SolidityParser.T__56 || _la === SolidityParser.T__57)) {
              this._errHandler.recoverInline(this);
            } else {
              this._errHandler.reportMatch(this);

              this.consume();
            }

            this.state = 741;
            this.expression(19);
            break;

          case 4:
            this.state = 742;
            _la = this._input.LA(1);

            if (!(_la === SolidityParser.T__60 || _la === SolidityParser.T__61)) {
              this._errHandler.recoverInline(this);
            } else {
              this._errHandler.reportMatch(this);

              this.consume();
            }

            this.state = 743;
            this.expression(18);
            break;

          case 5:
            this.state = 744;
            _la = this._input.LA(1);

            if (!(_la === SolidityParser.T__62 || _la === SolidityParser.T__63)) {
              this._errHandler.recoverInline(this);
            } else {
              this._errHandler.reportMatch(this);

              this.consume();
            }

            this.state = 745;
            this.expression(17);
            break;

          case 6:
            this.state = 746;
            this.match(SolidityParser.T__64);
            this.state = 747;
            this.expression(16);
            break;

          case 7:
            this.state = 748;
            this.match(SolidityParser.T__4);
            this.state = 749;
            this.expression(15);
            break;

          case 8:
            this.state = 750;
            this.primaryExpression();
            break;
        }

        this._ctx.stop = this._input.LT(-1);
        this.state = 828;

        this._errHandler.sync(this);

        var _alt = this._interp.adaptivePredict(this._input, 87, this._ctx);

        while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            if (this._parseListeners !== null) {
              this.triggerExitRuleEvent();
            }

            _prevctx = localctx;
            this.state = 826;

            this._errHandler.sync(this);

            var la_ = this._interp.adaptivePredict(this._input, 86, this._ctx);

            switch (la_) {
              case 1:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 753;

                if (!this.precpred(this._ctx, 14)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 14)");
                }

                this.state = 754;
                this.match(SolidityParser.T__65);
                this.state = 755;
                this.expression(15);
                break;

              case 2:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 756;

                if (!this.precpred(this._ctx, 13)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 13)");
                }

                this.state = 757;
                _la = this._input.LA(1);

                if (!(_la === SolidityParser.T__12 || _la === SolidityParser.T__66 || _la === SolidityParser.T__67)) {
                  this._errHandler.recoverInline(this);
                } else {
                  this._errHandler.reportMatch(this);

                  this.consume();
                }

                this.state = 758;
                this.expression(14);
                break;

              case 3:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 759;

                if (!this.precpred(this._ctx, 12)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 12)");
                }

                this.state = 760;
                _la = this._input.LA(1);

                if (!(_la === SolidityParser.T__60 || _la === SolidityParser.T__61)) {
                  this._errHandler.recoverInline(this);
                } else {
                  this._errHandler.reportMatch(this);

                  this.consume();
                }

                this.state = 761;
                this.expression(13);
                break;

              case 4:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 762;

                if (!this.precpred(this._ctx, 11)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 11)");
                }

                this.state = 763;
                _la = this._input.LA(1);

                if (!(_la === SolidityParser.T__68 || _la === SolidityParser.T__69)) {
                  this._errHandler.recoverInline(this);
                } else {
                  this._errHandler.reportMatch(this);

                  this.consume();
                }

                this.state = 764;
                this.expression(12);
                break;

              case 5:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 765;

                if (!this.precpred(this._ctx, 10)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
                }

                this.state = 766;
                this.match(SolidityParser.T__70);
                this.state = 767;
                this.expression(11);
                break;

              case 6:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 768;

                if (!this.precpred(this._ctx, 9)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
                }

                this.state = 769;
                this.match(SolidityParser.T__3);
                this.state = 770;
                this.expression(10);
                break;

              case 7:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 771;

                if (!this.precpred(this._ctx, 8)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
                }

                this.state = 772;
                this.match(SolidityParser.T__71);
                this.state = 773;
                this.expression(9);
                break;

              case 8:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 774;

                if (!this.precpred(this._ctx, 7)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
                }

                this.state = 775;
                _la = this._input.LA(1);

                if (!((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__5 | 1 << SolidityParser.T__6 | 1 << SolidityParser.T__7 | 1 << SolidityParser.T__8)) !== 0)) {
                  this._errHandler.recoverInline(this);
                } else {
                  this._errHandler.reportMatch(this);

                  this.consume();
                }

                this.state = 776;
                this.expression(8);
                break;

              case 9:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 777;

                if (!this.precpred(this._ctx, 6)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
                }

                this.state = 778;
                _la = this._input.LA(1);

                if (!(_la === SolidityParser.T__72 || _la === SolidityParser.T__73)) {
                  this._errHandler.recoverInline(this);
                } else {
                  this._errHandler.reportMatch(this);

                  this.consume();
                }

                this.state = 779;
                this.expression(7);
                break;

              case 10:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 780;

                if (!this.precpred(this._ctx, 5)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
                }

                this.state = 781;
                this.match(SolidityParser.T__74);
                this.state = 782;
                this.expression(6);
                break;

              case 11:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 783;

                if (!this.precpred(this._ctx, 4)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
                }

                this.state = 784;
                this.match(SolidityParser.T__2);
                this.state = 785;
                this.expression(5);
                break;

              case 12:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 786;

                if (!this.precpred(this._ctx, 3)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
                }

                this.state = 787;
                this.match(SolidityParser.T__75);
                this.state = 788;
                this.expression(0);
                this.state = 789;
                this.match(SolidityParser.T__59);
                this.state = 790;
                this.expression(4);
                break;

              case 13:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 792;

                if (!this.precpred(this._ctx, 2)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 2)");
                }

                this.state = 793;
                _la = this._input.LA(1);

                if (!(_la === SolidityParser.T__9 || (_la - 77 & ~0x1f) == 0 && (1 << _la - 77 & (1 << SolidityParser.T__76 - 77 | 1 << SolidityParser.T__77 - 77 | 1 << SolidityParser.T__78 - 77 | 1 << SolidityParser.T__79 - 77 | 1 << SolidityParser.T__80 - 77 | 1 << SolidityParser.T__81 - 77 | 1 << SolidityParser.T__82 - 77 | 1 << SolidityParser.T__83 - 77 | 1 << SolidityParser.T__84 - 77 | 1 << SolidityParser.T__85 - 77)) !== 0)) {
                  this._errHandler.recoverInline(this);
                } else {
                  this._errHandler.reportMatch(this);

                  this.consume();
                }

                this.state = 794;
                this.expression(3);
                break;

              case 14:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 795;

                if (!this.precpred(this._ctx, 27)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 27)");
                }

                this.state = 796;
                _la = this._input.LA(1);

                if (!(_la === SolidityParser.T__56 || _la === SolidityParser.T__57)) {
                  this._errHandler.recoverInline(this);
                } else {
                  this._errHandler.reportMatch(this);

                  this.consume();
                }

                break;

              case 15:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 797;

                if (!this.precpred(this._ctx, 25)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 25)");
                }

                this.state = 798;
                this.match(SolidityParser.T__32);
                this.state = 800;

                this._errHandler.sync(this);

                _la = this._input.LA(1);

                if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
                  this.state = 799;
                  this.expression(0);
                }

                this.state = 802;
                this.match(SolidityParser.T__33);
                break;

              case 16:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 803;

                if (!this.precpred(this._ctx, 24)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 24)");
                }

                this.state = 804;
                this.match(SolidityParser.T__32);
                this.state = 806;

                this._errHandler.sync(this);

                _la = this._input.LA(1);

                if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
                  this.state = 805;
                  this.expression(0);
                }

                this.state = 808;
                this.match(SolidityParser.T__59);
                this.state = 810;

                this._errHandler.sync(this);

                _la = this._input.LA(1);

                if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
                  this.state = 809;
                  this.expression(0);
                }

                this.state = 812;
                this.match(SolidityParser.T__33);
                break;

              case 17:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 813;

                if (!this.precpred(this._ctx, 23)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 23)");
                }

                this.state = 814;
                this.match(SolidityParser.T__35);
                this.state = 815;
                this.identifier();
                break;

              case 18:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 816;

                if (!this.precpred(this._ctx, 22)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 22)");
                }

                this.state = 817;
                this.match(SolidityParser.T__14);
                this.state = 818;
                this.nameValueList();
                this.state = 819;
                this.match(SolidityParser.T__16);
                break;

              case 19:
                localctx = new ExpressionContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, SolidityParser.RULE_expression);
                this.state = 821;

                if (!this.precpred(this._ctx, 21)) {
                  throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 21)");
                }

                this.state = 822;
                this.match(SolidityParser.T__22);
                this.state = 823;
                this.functionCallArguments();
                this.state = 824;
                this.match(SolidityParser.T__23);
                break;
            }
          }

          this.state = 830;

          this._errHandler.sync(this);

          _alt = this._interp.adaptivePredict(this._input, 87, this._ctx);
        }
      } catch (error) {
        if (error instanceof antlr4.error.RecognitionException) {
          localctx.exception = error;

          this._errHandler.reportError(this, error);

          this._errHandler.recover(this, error);
        } else {
          throw error;
        }
      } finally {
        this.unrollRecursionContexts(_parentctx);
      }

      return localctx;
    }
  }, {
    key: "primaryExpression",
    value: function primaryExpression() {
      var localctx = new PrimaryExpressionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 122, SolidityParser.RULE_primaryExpression);

      try {
        this.state = 848;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 90, this._ctx);

        switch (la_) {
          case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 831;
            this.match(SolidityParser.BooleanLiteral);
            break;

          case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 832;
            this.numberLiteral();
            break;

          case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 833;
            this.hexLiteral();
            break;

          case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 834;
            this.stringLiteral();
            break;

          case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 835;
            this.identifier();
            this.state = 838;

            this._errHandler.sync(this);

            var la_ = this._interp.adaptivePredict(this._input, 88, this._ctx);

            if (la_ === 1) {
              this.state = 836;
              this.match(SolidityParser.T__32);
              this.state = 837;
              this.match(SolidityParser.T__33);
            }

            break;

          case 6:
            this.enterOuterAlt(localctx, 6);
            this.state = 840;
            this.match(SolidityParser.TypeKeyword);
            break;

          case 7:
            this.enterOuterAlt(localctx, 7);
            this.state = 841;
            this.match(SolidityParser.PayableKeyword);
            break;

          case 8:
            this.enterOuterAlt(localctx, 8);
            this.state = 842;
            this.tupleExpression();
            break;

          case 9:
            this.enterOuterAlt(localctx, 9);
            this.state = 843;
            this.typeNameExpression();
            this.state = 846;

            this._errHandler.sync(this);

            var la_ = this._interp.adaptivePredict(this._input, 89, this._ctx);

            if (la_ === 1) {
              this.state = 844;
              this.match(SolidityParser.T__32);
              this.state = 845;
              this.match(SolidityParser.T__33);
            }

            break;
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "expressionList",
    value: function expressionList() {
      var localctx = new ExpressionListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 124, SolidityParser.RULE_expressionList);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 850;
        this.expression(0);
        this.state = 855;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while (_la === SolidityParser.T__15) {
          this.state = 851;
          this.match(SolidityParser.T__15);
          this.state = 852;
          this.expression(0);
          this.state = 857;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "nameValueList",
    value: function nameValueList() {
      var localctx = new NameValueListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 126, SolidityParser.RULE_nameValueList);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 858;
        this.nameValue();
        this.state = 863;

        this._errHandler.sync(this);

        var _alt = this._interp.adaptivePredict(this._input, 92, this._ctx);

        while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            this.state = 859;
            this.match(SolidityParser.T__15);
            this.state = 860;
            this.nameValue();
          }

          this.state = 865;

          this._errHandler.sync(this);

          _alt = this._interp.adaptivePredict(this._input, 92, this._ctx);
        }

        this.state = 867;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__15) {
          this.state = 866;
          this.match(SolidityParser.T__15);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "nameValue",
    value: function nameValue() {
      var localctx = new NameValueContext(this, this._ctx, this.state);
      this.enterRule(localctx, 128, SolidityParser.RULE_nameValue);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 869;
        this.identifier();
        this.state = 870;
        this.match(SolidityParser.T__59);
        this.state = 871;
        this.expression(0);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "functionCallArguments",
    value: function functionCallArguments() {
      var localctx = new FunctionCallArgumentsContext(this, this._ctx, this.state);
      this.enterRule(localctx, 130, SolidityParser.RULE_functionCallArguments);
      var _la = 0; // Token type

      try {
        this.state = 881;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__14:
            this.enterOuterAlt(localctx, 1);
            this.state = 873;
            this.match(SolidityParser.T__14);
            this.state = 875;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
              this.state = 874;
              this.nameValueList();
            }

            this.state = 877;
            this.match(SolidityParser.T__16);
            break;

          case SolidityParser.T__4:
          case SolidityParser.T__13:
          case SolidityParser.T__22:
          case SolidityParser.T__23:
          case SolidityParser.T__32:
          case SolidityParser.T__34:
          case SolidityParser.T__40:
          case SolidityParser.T__52:
          case SolidityParser.T__53:
          case SolidityParser.T__54:
          case SolidityParser.T__55:
          case SolidityParser.T__56:
          case SolidityParser.T__57:
          case SolidityParser.T__58:
          case SolidityParser.T__60:
          case SolidityParser.T__61:
          case SolidityParser.T__62:
          case SolidityParser.T__63:
          case SolidityParser.T__64:
          case SolidityParser.T__93:
          case SolidityParser.Int:
          case SolidityParser.Uint:
          case SolidityParser.Byte:
          case SolidityParser.Fixed:
          case SolidityParser.Ufixed:
          case SolidityParser.BooleanLiteral:
          case SolidityParser.DecimalNumber:
          case SolidityParser.HexNumber:
          case SolidityParser.HexLiteralFragment:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.TypeKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
          case SolidityParser.StringLiteralFragment:
            this.enterOuterAlt(localctx, 2);
            this.state = 879;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
              this.state = 878;
              this.expressionList();
            }

            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "functionCall",
    value: function functionCall() {
      var localctx = new FunctionCallContext(this, this._ctx, this.state);
      this.enterRule(localctx, 132, SolidityParser.RULE_functionCall);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 883;
        this.expression(0);
        this.state = 884;
        this.match(SolidityParser.T__22);
        this.state = 885;
        this.functionCallArguments();
        this.state = 886;
        this.match(SolidityParser.T__23);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyBlock",
    value: function assemblyBlock() {
      var localctx = new AssemblyBlockContext(this, this._ctx, this.state);
      this.enterRule(localctx, 134, SolidityParser.RULE_assemblyBlock);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 888;
        this.match(SolidityParser.T__14);
        this.state = 892;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__13 | 1 << SolidityParser.T__14 | 1 << SolidityParser.T__22 | 1 << SolidityParser.T__25 | 1 << SolidityParser.T__28)) !== 0 || (_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__40 - 35 | 1 << SolidityParser.T__41 - 35 | 1 << SolidityParser.T__47 - 35 | 1 << SolidityParser.T__49 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 87 & ~0x1f) == 0 && (1 << _la - 87 & (1 << SolidityParser.T__86 - 87 | 1 << SolidityParser.T__88 - 87 | 1 << SolidityParser.T__89 - 87 | 1 << SolidityParser.T__93 - 87 | 1 << SolidityParser.DecimalNumber - 87 | 1 << SolidityParser.HexNumber - 87 | 1 << SolidityParser.HexLiteralFragment - 87 | 1 << SolidityParser.BreakKeyword - 87 | 1 << SolidityParser.ContinueKeyword - 87 | 1 << SolidityParser.LeaveKeyword - 87 | 1 << SolidityParser.PayableKeyword - 87)) !== 0 || (_la - 125 & ~0x1f) == 0 && (1 << _la - 125 & (1 << SolidityParser.ReceiveKeyword - 125 | 1 << SolidityParser.Identifier - 125 | 1 << SolidityParser.StringLiteralFragment - 125)) !== 0) {
          this.state = 889;
          this.assemblyItem();
          this.state = 894;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }

        this.state = 895;
        this.match(SolidityParser.T__16);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyItem",
    value: function assemblyItem() {
      var localctx = new AssemblyItemContext(this, this._ctx, this.state);
      this.enterRule(localctx, 136, SolidityParser.RULE_assemblyItem);

      try {
        this.state = 915;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 98, this._ctx);

        switch (la_) {
          case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 897;
            this.identifier();
            break;

          case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 898;
            this.assemblyBlock();
            break;

          case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 899;
            this.assemblyExpression();
            break;

          case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 900;
            this.assemblyLocalDefinition();
            break;

          case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 901;
            this.assemblyAssignment();
            break;

          case 6:
            this.enterOuterAlt(localctx, 6);
            this.state = 902;
            this.assemblyStackAssignment();
            break;

          case 7:
            this.enterOuterAlt(localctx, 7);
            this.state = 903;
            this.labelDefinition();
            break;

          case 8:
            this.enterOuterAlt(localctx, 8);
            this.state = 904;
            this.assemblySwitch();
            break;

          case 9:
            this.enterOuterAlt(localctx, 9);
            this.state = 905;
            this.assemblyFunctionDefinition();
            break;

          case 10:
            this.enterOuterAlt(localctx, 10);
            this.state = 906;
            this.assemblyFor();
            break;

          case 11:
            this.enterOuterAlt(localctx, 11);
            this.state = 907;
            this.assemblyIf();
            break;

          case 12:
            this.enterOuterAlt(localctx, 12);
            this.state = 908;
            this.match(SolidityParser.BreakKeyword);
            break;

          case 13:
            this.enterOuterAlt(localctx, 13);
            this.state = 909;
            this.match(SolidityParser.ContinueKeyword);
            break;

          case 14:
            this.enterOuterAlt(localctx, 14);
            this.state = 910;
            this.match(SolidityParser.LeaveKeyword);
            break;

          case 15:
            this.enterOuterAlt(localctx, 15);
            this.state = 911;
            this.subAssembly();
            break;

          case 16:
            this.enterOuterAlt(localctx, 16);
            this.state = 912;
            this.numberLiteral();
            break;

          case 17:
            this.enterOuterAlt(localctx, 17);
            this.state = 913;
            this.stringLiteral();
            break;

          case 18:
            this.enterOuterAlt(localctx, 18);
            this.state = 914;
            this.hexLiteral();
            break;
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyExpression",
    value: function assemblyExpression() {
      var localctx = new AssemblyExpressionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 138, SolidityParser.RULE_assemblyExpression);

      try {
        this.state = 920;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 99, this._ctx);

        switch (la_) {
          case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 917;
            this.assemblyCall();
            break;

          case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 918;
            this.assemblyLiteral();
            break;

          case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 919;
            this.assemblyMember();
            break;
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyMember",
    value: function assemblyMember() {
      var localctx = new AssemblyMemberContext(this, this._ctx, this.state);
      this.enterRule(localctx, 140, SolidityParser.RULE_assemblyMember);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 922;
        this.identifier();
        this.state = 923;
        this.match(SolidityParser.T__35);
        this.state = 924;
        this.identifier();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyCall",
    value: function assemblyCall() {
      var localctx = new AssemblyCallContext(this, this._ctx, this.state);
      this.enterRule(localctx, 142, SolidityParser.RULE_assemblyCall);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 930;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__49:
            this.state = 926;
            this.match(SolidityParser.T__49);
            break;

          case SolidityParser.T__34:
            this.state = 927;
            this.match(SolidityParser.T__34);
            break;

          case SolidityParser.T__55:
            this.state = 928;
            this.match(SolidityParser.T__55);
            break;

          case SolidityParser.T__13:
          case SolidityParser.T__40:
          case SolidityParser.T__93:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
            this.state = 929;
            this.identifier();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }

        this.state = 944;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 103, this._ctx);

        if (la_ === 1) {
          this.state = 932;
          this.match(SolidityParser.T__22);
          this.state = 934;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          if (_la === SolidityParser.T__13 || (_la - 35 & ~0x1f) == 0 && (1 << _la - 35 & (1 << SolidityParser.T__34 - 35 | 1 << SolidityParser.T__40 - 35 | 1 << SolidityParser.T__49 - 35 | 1 << SolidityParser.T__55 - 35)) !== 0 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.DecimalNumber - 94 | 1 << SolidityParser.HexNumber - 94 | 1 << SolidityParser.HexLiteralFragment - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier || _la === SolidityParser.StringLiteralFragment) {
            this.state = 933;
            this.assemblyExpression();
          }

          this.state = 940;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === SolidityParser.T__15) {
            this.state = 936;
            this.match(SolidityParser.T__15);
            this.state = 937;
            this.assemblyExpression();
            this.state = 942;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }

          this.state = 943;
          this.match(SolidityParser.T__23);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyLocalDefinition",
    value: function assemblyLocalDefinition() {
      var localctx = new AssemblyLocalDefinitionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 144, SolidityParser.RULE_assemblyLocalDefinition);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 946;
        this.match(SolidityParser.T__86);
        this.state = 947;
        this.assemblyIdentifierOrList();
        this.state = 950;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__87) {
          this.state = 948;
          this.match(SolidityParser.T__87);
          this.state = 949;
          this.assemblyExpression();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyAssignment",
    value: function assemblyAssignment() {
      var localctx = new AssemblyAssignmentContext(this, this._ctx, this.state);
      this.enterRule(localctx, 146, SolidityParser.RULE_assemblyAssignment);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 952;
        this.assemblyIdentifierOrList();
        this.state = 953;
        this.match(SolidityParser.T__87);
        this.state = 954;
        this.assemblyExpression();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyIdentifierOrList",
    value: function assemblyIdentifierOrList() {
      var localctx = new AssemblyIdentifierOrListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 148, SolidityParser.RULE_assemblyIdentifierOrList);

      try {
        this.state = 962;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 105, this._ctx);

        switch (la_) {
          case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 956;
            this.identifier();
            break;

          case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 957;
            this.assemblyMember();
            break;

          case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 958;
            this.match(SolidityParser.T__22);
            this.state = 959;
            this.assemblyIdentifierList();
            this.state = 960;
            this.match(SolidityParser.T__23);
            break;
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyIdentifierList",
    value: function assemblyIdentifierList() {
      var localctx = new AssemblyIdentifierListContext(this, this._ctx, this.state);
      this.enterRule(localctx, 150, SolidityParser.RULE_assemblyIdentifierList);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 964;
        this.identifier();
        this.state = 969;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while (_la === SolidityParser.T__15) {
          this.state = 965;
          this.match(SolidityParser.T__15);
          this.state = 966;
          this.identifier();
          this.state = 971;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyStackAssignment",
    value: function assemblyStackAssignment() {
      var localctx = new AssemblyStackAssignmentContext(this, this._ctx, this.state);
      this.enterRule(localctx, 152, SolidityParser.RULE_assemblyStackAssignment);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 972;
        this.match(SolidityParser.T__88);
        this.state = 973;
        this.identifier();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "labelDefinition",
    value: function labelDefinition() {
      var localctx = new LabelDefinitionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 154, SolidityParser.RULE_labelDefinition);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 975;
        this.identifier();
        this.state = 976;
        this.match(SolidityParser.T__59);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblySwitch",
    value: function assemblySwitch() {
      var localctx = new AssemblySwitchContext(this, this._ctx, this.state);
      this.enterRule(localctx, 156, SolidityParser.RULE_assemblySwitch);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 978;
        this.match(SolidityParser.T__89);
        this.state = 979;
        this.assemblyExpression();
        this.state = 983;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while (_la === SolidityParser.T__90 || _la === SolidityParser.T__91) {
          this.state = 980;
          this.assemblyCase();
          this.state = 985;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyCase",
    value: function assemblyCase() {
      var localctx = new AssemblyCaseContext(this, this._ctx, this.state);
      this.enterRule(localctx, 158, SolidityParser.RULE_assemblyCase);

      try {
        this.state = 992;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__90:
            this.enterOuterAlt(localctx, 1);
            this.state = 986;
            this.match(SolidityParser.T__90);
            this.state = 987;
            this.assemblyLiteral();
            this.state = 988;
            this.assemblyBlock();
            break;

          case SolidityParser.T__91:
            this.enterOuterAlt(localctx, 2);
            this.state = 990;
            this.match(SolidityParser.T__91);
            this.state = 991;
            this.assemblyBlock();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyFunctionDefinition",
    value: function assemblyFunctionDefinition() {
      var localctx = new AssemblyFunctionDefinitionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 160, SolidityParser.RULE_assemblyFunctionDefinition);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 994;
        this.match(SolidityParser.T__28);
        this.state = 995;
        this.identifier();
        this.state = 996;
        this.match(SolidityParser.T__22);
        this.state = 998;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier) {
          this.state = 997;
          this.assemblyIdentifierList();
        }

        this.state = 1000;
        this.match(SolidityParser.T__23);
        this.state = 1002;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__92) {
          this.state = 1001;
          this.assemblyFunctionReturns();
        }

        this.state = 1004;
        this.assemblyBlock();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyFunctionReturns",
    value: function assemblyFunctionReturns() {
      var localctx = new AssemblyFunctionReturnsContext(this, this._ctx, this.state);
      this.enterRule(localctx, 162, SolidityParser.RULE_assemblyFunctionReturns);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1006;
        this.match(SolidityParser.T__92);
        this.state = 1007;
        this.assemblyIdentifierList();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyFor",
    value: function assemblyFor() {
      var localctx = new AssemblyForContext(this, this._ctx, this.state);
      this.enterRule(localctx, 164, SolidityParser.RULE_assemblyFor);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1009;
        this.match(SolidityParser.T__25);
        this.state = 1012;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__14:
            this.state = 1010;
            this.assemblyBlock();
            break;

          case SolidityParser.T__13:
          case SolidityParser.T__34:
          case SolidityParser.T__40:
          case SolidityParser.T__49:
          case SolidityParser.T__55:
          case SolidityParser.T__93:
          case SolidityParser.DecimalNumber:
          case SolidityParser.HexNumber:
          case SolidityParser.HexLiteralFragment:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
          case SolidityParser.StringLiteralFragment:
            this.state = 1011;
            this.assemblyExpression();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }

        this.state = 1014;
        this.assemblyExpression();
        this.state = 1017;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__14:
            this.state = 1015;
            this.assemblyBlock();
            break;

          case SolidityParser.T__13:
          case SolidityParser.T__34:
          case SolidityParser.T__40:
          case SolidityParser.T__49:
          case SolidityParser.T__55:
          case SolidityParser.T__93:
          case SolidityParser.DecimalNumber:
          case SolidityParser.HexNumber:
          case SolidityParser.HexLiteralFragment:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
          case SolidityParser.StringLiteralFragment:
            this.state = 1016;
            this.assemblyExpression();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }

        this.state = 1019;
        this.assemblyBlock();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyIf",
    value: function assemblyIf() {
      var localctx = new AssemblyIfContext(this, this._ctx, this.state);
      this.enterRule(localctx, 166, SolidityParser.RULE_assemblyIf);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1021;
        this.match(SolidityParser.T__41);
        this.state = 1022;
        this.assemblyExpression();
        this.state = 1023;
        this.assemblyBlock();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "assemblyLiteral",
    value: function assemblyLiteral() {
      var localctx = new AssemblyLiteralContext(this, this._ctx, this.state);
      this.enterRule(localctx, 168, SolidityParser.RULE_assemblyLiteral);

      try {
        this.state = 1029;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.StringLiteralFragment:
            this.enterOuterAlt(localctx, 1);
            this.state = 1025;
            this.stringLiteral();
            break;

          case SolidityParser.DecimalNumber:
            this.enterOuterAlt(localctx, 2);
            this.state = 1026;
            this.match(SolidityParser.DecimalNumber);
            break;

          case SolidityParser.HexNumber:
            this.enterOuterAlt(localctx, 3);
            this.state = 1027;
            this.match(SolidityParser.HexNumber);
            break;

          case SolidityParser.HexLiteralFragment:
            this.enterOuterAlt(localctx, 4);
            this.state = 1028;
            this.hexLiteral();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "subAssembly",
    value: function subAssembly() {
      var localctx = new SubAssemblyContext(this, this._ctx, this.state);
      this.enterRule(localctx, 170, SolidityParser.RULE_subAssembly);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1031;
        this.match(SolidityParser.T__47);
        this.state = 1032;
        this.identifier();
        this.state = 1033;
        this.assemblyBlock();
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "tupleExpression",
    value: function tupleExpression() {
      var localctx = new TupleExpressionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 172, SolidityParser.RULE_tupleExpression);
      var _la = 0; // Token type

      try {
        this.state = 1061;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__22:
            this.enterOuterAlt(localctx, 1);
            this.state = 1035;
            this.match(SolidityParser.T__22);
            this.state = 1037;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
              this.state = 1036;
              this.expression(0);
            }

            this.state = 1045;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            while (_la === SolidityParser.T__15) {
              this.state = 1039;
              this.match(SolidityParser.T__15);
              this.state = 1041;

              this._errHandler.sync(this);

              _la = this._input.LA(1);

              if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
                this.state = 1040;
                this.expression(0);
              }

              this.state = 1047;

              this._errHandler.sync(this);

              _la = this._input.LA(1);
            }

            this.state = 1048;
            this.match(SolidityParser.T__23);
            break;

          case SolidityParser.T__32:
            this.enterOuterAlt(localctx, 2);
            this.state = 1049;
            this.match(SolidityParser.T__32);
            this.state = 1058;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            if ((_la & ~0x1f) == 0 && (1 << _la & (1 << SolidityParser.T__4 | 1 << SolidityParser.T__13 | 1 << SolidityParser.T__22)) !== 0 || (_la - 33 & ~0x1f) == 0 && (1 << _la - 33 & (1 << SolidityParser.T__32 - 33 | 1 << SolidityParser.T__34 - 33 | 1 << SolidityParser.T__40 - 33 | 1 << SolidityParser.T__52 - 33 | 1 << SolidityParser.T__53 - 33 | 1 << SolidityParser.T__54 - 33 | 1 << SolidityParser.T__55 - 33 | 1 << SolidityParser.T__56 - 33 | 1 << SolidityParser.T__57 - 33 | 1 << SolidityParser.T__58 - 33 | 1 << SolidityParser.T__60 - 33 | 1 << SolidityParser.T__61 - 33 | 1 << SolidityParser.T__62 - 33 | 1 << SolidityParser.T__63 - 33)) !== 0 || (_la - 65 & ~0x1f) == 0 && (1 << _la - 65 & (1 << SolidityParser.T__64 - 65 | 1 << SolidityParser.T__93 - 65 | 1 << SolidityParser.Int - 65)) !== 0 || (_la - 97 & ~0x1f) == 0 && (1 << _la - 97 & (1 << SolidityParser.Uint - 97 | 1 << SolidityParser.Byte - 97 | 1 << SolidityParser.Fixed - 97 | 1 << SolidityParser.Ufixed - 97 | 1 << SolidityParser.BooleanLiteral - 97 | 1 << SolidityParser.DecimalNumber - 97 | 1 << SolidityParser.HexNumber - 97 | 1 << SolidityParser.HexLiteralFragment - 97 | 1 << SolidityParser.LeaveKeyword - 97 | 1 << SolidityParser.PayableKeyword - 97 | 1 << SolidityParser.TypeKeyword - 97 | 1 << SolidityParser.ReceiveKeyword - 97 | 1 << SolidityParser.Identifier - 97 | 1 << SolidityParser.StringLiteralFragment - 97)) !== 0) {
              this.state = 1050;
              this.expression(0);
              this.state = 1055;

              this._errHandler.sync(this);

              _la = this._input.LA(1);

              while (_la === SolidityParser.T__15) {
                this.state = 1051;
                this.match(SolidityParser.T__15);
                this.state = 1052;
                this.expression(0);
                this.state = 1057;

                this._errHandler.sync(this);

                _la = this._input.LA(1);
              }
            }

            this.state = 1060;
            this.match(SolidityParser.T__33);
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "typeNameExpression",
    value: function typeNameExpression() {
      var localctx = new TypeNameExpressionContext(this, this._ctx, this.state);
      this.enterRule(localctx, 174, SolidityParser.RULE_typeNameExpression);

      try {
        this.state = 1065;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case SolidityParser.T__34:
          case SolidityParser.T__52:
          case SolidityParser.T__53:
          case SolidityParser.T__54:
          case SolidityParser.T__55:
          case SolidityParser.Int:
          case SolidityParser.Uint:
          case SolidityParser.Byte:
          case SolidityParser.Fixed:
          case SolidityParser.Ufixed:
            this.enterOuterAlt(localctx, 1);
            this.state = 1063;
            this.elementaryTypeName();
            break;

          case SolidityParser.T__13:
          case SolidityParser.T__40:
          case SolidityParser.T__93:
          case SolidityParser.LeaveKeyword:
          case SolidityParser.PayableKeyword:
          case SolidityParser.ReceiveKeyword:
          case SolidityParser.Identifier:
            this.enterOuterAlt(localctx, 2);
            this.state = 1064;
            this.userDefinedTypeName();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "numberLiteral",
    value: function numberLiteral() {
      var localctx = new NumberLiteralContext(this, this._ctx, this.state);
      this.enterRule(localctx, 176, SolidityParser.RULE_numberLiteral);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1067;
        _la = this._input.LA(1);

        if (!(_la === SolidityParser.DecimalNumber || _la === SolidityParser.HexNumber)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);

          this.consume();
        }

        this.state = 1069;

        this._errHandler.sync(this);

        var la_ = this._interp.adaptivePredict(this._input, 121, this._ctx);

        if (la_ === 1) {
          this.state = 1068;
          this.match(SolidityParser.NumberUnit);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "identifier",
    value: function identifier() {
      var localctx = new IdentifierContext(this, this._ctx, this.state);
      this.enterRule(localctx, 178, SolidityParser.RULE_identifier);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1071;
        _la = this._input.LA(1);

        if (!(_la === SolidityParser.T__13 || _la === SolidityParser.T__40 || (_la - 94 & ~0x1f) == 0 && (1 << _la - 94 & (1 << SolidityParser.T__93 - 94 | 1 << SolidityParser.LeaveKeyword - 94 | 1 << SolidityParser.PayableKeyword - 94 | 1 << SolidityParser.ReceiveKeyword - 94)) !== 0 || _la === SolidityParser.Identifier)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);

          this.consume();
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "hexLiteral",
    value: function hexLiteral() {
      var localctx = new HexLiteralContext(this, this._ctx, this.state);
      this.enterRule(localctx, 180, SolidityParser.RULE_hexLiteral);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1074;

        this._errHandler.sync(this);

        var _alt = 1;

        do {
          switch (_alt) {
            case 1:
              this.state = 1073;
              this.match(SolidityParser.HexLiteralFragment);
              break;

            default:
              throw new antlr4.error.NoViableAltException(this);
          }

          this.state = 1076;

          this._errHandler.sync(this);

          _alt = this._interp.adaptivePredict(this._input, 122, this._ctx);
        } while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "overrideSpecifier",
    value: function overrideSpecifier() {
      var localctx = new OverrideSpecifierContext(this, this._ctx, this.state);
      this.enterRule(localctx, 182, SolidityParser.RULE_overrideSpecifier);
      var _la = 0; // Token type

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1078;
        this.match(SolidityParser.T__94);
        this.state = 1090;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        if (_la === SolidityParser.T__22) {
          this.state = 1079;
          this.match(SolidityParser.T__22);
          this.state = 1080;
          this.userDefinedTypeName();
          this.state = 1085;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === SolidityParser.T__15) {
            this.state = 1081;
            this.match(SolidityParser.T__15);
            this.state = 1082;
            this.userDefinedTypeName();
            this.state = 1087;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }

          this.state = 1088;
          this.match(SolidityParser.T__23);
        }
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "stringLiteral",
    value: function stringLiteral() {
      var localctx = new StringLiteralContext(this, this._ctx, this.state);
      this.enterRule(localctx, 184, SolidityParser.RULE_stringLiteral);

      try {
        this.enterOuterAlt(localctx, 1);
        this.state = 1093;

        this._errHandler.sync(this);

        var _alt = 1;

        do {
          switch (_alt) {
            case 1:
              this.state = 1092;
              this.match(SolidityParser.StringLiteralFragment);
              break;

            default:
              throw new antlr4.error.NoViableAltException(this);
          }

          this.state = 1095;

          this._errHandler.sync(this);

          _alt = this._interp.adaptivePredict(this._input, 125, this._ctx);
        } while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER);
      } catch (re) {
        if (re instanceof antlr4.error.RecognitionException) {
          localctx.exception = re;

          this._errHandler.reportError(this, re);

          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }

      return localctx;
    }
  }, {
    key: "atn",
    get: function get() {
      return atn$3;
    }
  }]);

  return SolidityParser;
}(antlr4.Parser);

_defineProperty(SolidityParser, "grammarFileName", "Solidity.g4");

_defineProperty(SolidityParser, "literalNames", [null, "'pragma'", "';'", "'||'", "'^'", "'~'", "'>='", "'>'", "'<'", "'<='", "'='", "'as'", "'import'", "'*'", "'from'", "'{'", "','", "'}'", "'abstract'", "'contract'", "'interface'", "'library'", "'is'", "'('", "')'", "'using'", "'for'", "'struct'", "'modifier'", "'function'", "'returns'", "'event'", "'enum'", "'['", "']'", "'address'", "'.'", "'mapping'", "'=>'", "'memory'", "'storage'", "'calldata'", "'if'", "'else'", "'try'", "'catch'", "'while'", "'unchecked'", "'assembly'", "'do'", "'return'", "'throw'", "'emit'", "'var'", "'bool'", "'string'", "'byte'", "'++'", "'--'", "'new'", "':'", "'+'", "'-'", "'after'", "'delete'", "'!'", "'**'", "'/'", "'%'", "'<<'", "'>>'", "'&'", "'|'", "'=='", "'!='", "'&&'", "'?'", "'|='", "'^='", "'&='", "'<<='", "'>>='", "'+='", "'-='", "'*='", "'/='", "'%='", "'let'", "':='", "'=:'", "'switch'", "'case'", "'default'", "'->'", "'callback'", "'override'", null, null, null, null, null, null, null, null, null, null, null, "'anonymous'", "'break'", "'constant'", "'immutable'", "'continue'", "'leave'", "'external'", "'indexed'", "'internal'", "'payable'", "'private'", "'public'", "'virtual'", "'pure'", "'type'", "'view'", "'constructor'", "'fallback'", "'receive'"]);

_defineProperty(SolidityParser, "symbolicNames", [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "Int", "Uint", "Byte", "Fixed", "Ufixed", "BooleanLiteral", "DecimalNumber", "HexNumber", "NumberUnit", "HexLiteralFragment", "ReservedKeyword", "AnonymousKeyword", "BreakKeyword", "ConstantKeyword", "ImmutableKeyword", "ContinueKeyword", "LeaveKeyword", "ExternalKeyword", "IndexedKeyword", "InternalKeyword", "PayableKeyword", "PrivateKeyword", "PublicKeyword", "VirtualKeyword", "PureKeyword", "TypeKeyword", "ViewKeyword", "ConstructorKeyword", "FallbackKeyword", "ReceiveKeyword", "Identifier", "StringLiteralFragment", "VersionLiteral", "WS", "COMMENT", "LINE_COMMENT"]);

_defineProperty(SolidityParser, "ruleNames", ["sourceUnit", "pragmaDirective", "pragmaName", "pragmaValue", "version", "versionOperator", "versionConstraint", "importDeclaration", "importDirective", "contractDefinition", "inheritanceSpecifier", "contractPart", "stateVariableDeclaration", "fileLevelConstant", "usingForDeclaration", "structDefinition", "modifierDefinition", "modifierInvocation", "functionDefinition", "functionDescriptor", "returnParameters", "modifierList", "eventDefinition", "enumValue", "enumDefinition", "parameterList", "parameter", "eventParameterList", "eventParameter", "functionTypeParameterList", "functionTypeParameter", "variableDeclaration", "typeName", "userDefinedTypeName", "mappingKey", "mapping", "functionTypeName", "storageLocation", "stateMutability", "block", "statement", "expressionStatement", "ifStatement", "tryStatement", "catchClause", "whileStatement", "simpleStatement", "uncheckedStatement", "forStatement", "inlineAssemblyStatement", "doWhileStatement", "continueStatement", "breakStatement", "returnStatement", "throwStatement", "emitStatement", "variableDeclarationStatement", "variableDeclarationList", "identifierList", "elementaryTypeName", "expression", "primaryExpression", "expressionList", "nameValueList", "nameValue", "functionCallArguments", "functionCall", "assemblyBlock", "assemblyItem", "assemblyExpression", "assemblyMember", "assemblyCall", "assemblyLocalDefinition", "assemblyAssignment", "assemblyIdentifierOrList", "assemblyIdentifierList", "assemblyStackAssignment", "labelDefinition", "assemblySwitch", "assemblyCase", "assemblyFunctionDefinition", "assemblyFunctionReturns", "assemblyFor", "assemblyIf", "assemblyLiteral", "subAssembly", "tupleExpression", "typeNameExpression", "numberLiteral", "identifier", "hexLiteral", "overrideSpecifier", "stringLiteral"]);
SolidityParser.EOF = antlr4.Token.EOF;
SolidityParser.T__0 = 1;
SolidityParser.T__1 = 2;
SolidityParser.T__2 = 3;
SolidityParser.T__3 = 4;
SolidityParser.T__4 = 5;
SolidityParser.T__5 = 6;
SolidityParser.T__6 = 7;
SolidityParser.T__7 = 8;
SolidityParser.T__8 = 9;
SolidityParser.T__9 = 10;
SolidityParser.T__10 = 11;
SolidityParser.T__11 = 12;
SolidityParser.T__12 = 13;
SolidityParser.T__13 = 14;
SolidityParser.T__14 = 15;
SolidityParser.T__15 = 16;
SolidityParser.T__16 = 17;
SolidityParser.T__17 = 18;
SolidityParser.T__18 = 19;
SolidityParser.T__19 = 20;
SolidityParser.T__20 = 21;
SolidityParser.T__21 = 22;
SolidityParser.T__22 = 23;
SolidityParser.T__23 = 24;
SolidityParser.T__24 = 25;
SolidityParser.T__25 = 26;
SolidityParser.T__26 = 27;
SolidityParser.T__27 = 28;
SolidityParser.T__28 = 29;
SolidityParser.T__29 = 30;
SolidityParser.T__30 = 31;
SolidityParser.T__31 = 32;
SolidityParser.T__32 = 33;
SolidityParser.T__33 = 34;
SolidityParser.T__34 = 35;
SolidityParser.T__35 = 36;
SolidityParser.T__36 = 37;
SolidityParser.T__37 = 38;
SolidityParser.T__38 = 39;
SolidityParser.T__39 = 40;
SolidityParser.T__40 = 41;
SolidityParser.T__41 = 42;
SolidityParser.T__42 = 43;
SolidityParser.T__43 = 44;
SolidityParser.T__44 = 45;
SolidityParser.T__45 = 46;
SolidityParser.T__46 = 47;
SolidityParser.T__47 = 48;
SolidityParser.T__48 = 49;
SolidityParser.T__49 = 50;
SolidityParser.T__50 = 51;
SolidityParser.T__51 = 52;
SolidityParser.T__52 = 53;
SolidityParser.T__53 = 54;
SolidityParser.T__54 = 55;
SolidityParser.T__55 = 56;
SolidityParser.T__56 = 57;
SolidityParser.T__57 = 58;
SolidityParser.T__58 = 59;
SolidityParser.T__59 = 60;
SolidityParser.T__60 = 61;
SolidityParser.T__61 = 62;
SolidityParser.T__62 = 63;
SolidityParser.T__63 = 64;
SolidityParser.T__64 = 65;
SolidityParser.T__65 = 66;
SolidityParser.T__66 = 67;
SolidityParser.T__67 = 68;
SolidityParser.T__68 = 69;
SolidityParser.T__69 = 70;
SolidityParser.T__70 = 71;
SolidityParser.T__71 = 72;
SolidityParser.T__72 = 73;
SolidityParser.T__73 = 74;
SolidityParser.T__74 = 75;
SolidityParser.T__75 = 76;
SolidityParser.T__76 = 77;
SolidityParser.T__77 = 78;
SolidityParser.T__78 = 79;
SolidityParser.T__79 = 80;
SolidityParser.T__80 = 81;
SolidityParser.T__81 = 82;
SolidityParser.T__82 = 83;
SolidityParser.T__83 = 84;
SolidityParser.T__84 = 85;
SolidityParser.T__85 = 86;
SolidityParser.T__86 = 87;
SolidityParser.T__87 = 88;
SolidityParser.T__88 = 89;
SolidityParser.T__89 = 90;
SolidityParser.T__90 = 91;
SolidityParser.T__91 = 92;
SolidityParser.T__92 = 93;
SolidityParser.T__93 = 94;
SolidityParser.T__94 = 95;
SolidityParser.Int = 96;
SolidityParser.Uint = 97;
SolidityParser.Byte = 98;
SolidityParser.Fixed = 99;
SolidityParser.Ufixed = 100;
SolidityParser.BooleanLiteral = 101;
SolidityParser.DecimalNumber = 102;
SolidityParser.HexNumber = 103;
SolidityParser.NumberUnit = 104;
SolidityParser.HexLiteralFragment = 105;
SolidityParser.ReservedKeyword = 106;
SolidityParser.AnonymousKeyword = 107;
SolidityParser.BreakKeyword = 108;
SolidityParser.ConstantKeyword = 109;
SolidityParser.ImmutableKeyword = 110;
SolidityParser.ContinueKeyword = 111;
SolidityParser.LeaveKeyword = 112;
SolidityParser.ExternalKeyword = 113;
SolidityParser.IndexedKeyword = 114;
SolidityParser.InternalKeyword = 115;
SolidityParser.PayableKeyword = 116;
SolidityParser.PrivateKeyword = 117;
SolidityParser.PublicKeyword = 118;
SolidityParser.VirtualKeyword = 119;
SolidityParser.PureKeyword = 120;
SolidityParser.TypeKeyword = 121;
SolidityParser.ViewKeyword = 122;
SolidityParser.ConstructorKeyword = 123;
SolidityParser.FallbackKeyword = 124;
SolidityParser.ReceiveKeyword = 125;
SolidityParser.Identifier = 126;
SolidityParser.StringLiteralFragment = 127;
SolidityParser.VersionLiteral = 128;
SolidityParser.WS = 129;
SolidityParser.COMMENT = 130;
SolidityParser.LINE_COMMENT = 131;
SolidityParser.RULE_sourceUnit = 0;
SolidityParser.RULE_pragmaDirective = 1;
SolidityParser.RULE_pragmaName = 2;
SolidityParser.RULE_pragmaValue = 3;
SolidityParser.RULE_version = 4;
SolidityParser.RULE_versionOperator = 5;
SolidityParser.RULE_versionConstraint = 6;
SolidityParser.RULE_importDeclaration = 7;
SolidityParser.RULE_importDirective = 8;
SolidityParser.RULE_contractDefinition = 9;
SolidityParser.RULE_inheritanceSpecifier = 10;
SolidityParser.RULE_contractPart = 11;
SolidityParser.RULE_stateVariableDeclaration = 12;
SolidityParser.RULE_fileLevelConstant = 13;
SolidityParser.RULE_usingForDeclaration = 14;
SolidityParser.RULE_structDefinition = 15;
SolidityParser.RULE_modifierDefinition = 16;
SolidityParser.RULE_modifierInvocation = 17;
SolidityParser.RULE_functionDefinition = 18;
SolidityParser.RULE_functionDescriptor = 19;
SolidityParser.RULE_returnParameters = 20;
SolidityParser.RULE_modifierList = 21;
SolidityParser.RULE_eventDefinition = 22;
SolidityParser.RULE_enumValue = 23;
SolidityParser.RULE_enumDefinition = 24;
SolidityParser.RULE_parameterList = 25;
SolidityParser.RULE_parameter = 26;
SolidityParser.RULE_eventParameterList = 27;
SolidityParser.RULE_eventParameter = 28;
SolidityParser.RULE_functionTypeParameterList = 29;
SolidityParser.RULE_functionTypeParameter = 30;
SolidityParser.RULE_variableDeclaration = 31;
SolidityParser.RULE_typeName = 32;
SolidityParser.RULE_userDefinedTypeName = 33;
SolidityParser.RULE_mappingKey = 34;
SolidityParser.RULE_mapping = 35;
SolidityParser.RULE_functionTypeName = 36;
SolidityParser.RULE_storageLocation = 37;
SolidityParser.RULE_stateMutability = 38;
SolidityParser.RULE_block = 39;
SolidityParser.RULE_statement = 40;
SolidityParser.RULE_expressionStatement = 41;
SolidityParser.RULE_ifStatement = 42;
SolidityParser.RULE_tryStatement = 43;
SolidityParser.RULE_catchClause = 44;
SolidityParser.RULE_whileStatement = 45;
SolidityParser.RULE_simpleStatement = 46;
SolidityParser.RULE_uncheckedStatement = 47;
SolidityParser.RULE_forStatement = 48;
SolidityParser.RULE_inlineAssemblyStatement = 49;
SolidityParser.RULE_doWhileStatement = 50;
SolidityParser.RULE_continueStatement = 51;
SolidityParser.RULE_breakStatement = 52;
SolidityParser.RULE_returnStatement = 53;
SolidityParser.RULE_throwStatement = 54;
SolidityParser.RULE_emitStatement = 55;
SolidityParser.RULE_variableDeclarationStatement = 56;
SolidityParser.RULE_variableDeclarationList = 57;
SolidityParser.RULE_identifierList = 58;
SolidityParser.RULE_elementaryTypeName = 59;
SolidityParser.RULE_expression = 60;
SolidityParser.RULE_primaryExpression = 61;
SolidityParser.RULE_expressionList = 62;
SolidityParser.RULE_nameValueList = 63;
SolidityParser.RULE_nameValue = 64;
SolidityParser.RULE_functionCallArguments = 65;
SolidityParser.RULE_functionCall = 66;
SolidityParser.RULE_assemblyBlock = 67;
SolidityParser.RULE_assemblyItem = 68;
SolidityParser.RULE_assemblyExpression = 69;
SolidityParser.RULE_assemblyMember = 70;
SolidityParser.RULE_assemblyCall = 71;
SolidityParser.RULE_assemblyLocalDefinition = 72;
SolidityParser.RULE_assemblyAssignment = 73;
SolidityParser.RULE_assemblyIdentifierOrList = 74;
SolidityParser.RULE_assemblyIdentifierList = 75;
SolidityParser.RULE_assemblyStackAssignment = 76;
SolidityParser.RULE_labelDefinition = 77;
SolidityParser.RULE_assemblySwitch = 78;
SolidityParser.RULE_assemblyCase = 79;
SolidityParser.RULE_assemblyFunctionDefinition = 80;
SolidityParser.RULE_assemblyFunctionReturns = 81;
SolidityParser.RULE_assemblyFor = 82;
SolidityParser.RULE_assemblyIf = 83;
SolidityParser.RULE_assemblyLiteral = 84;
SolidityParser.RULE_subAssembly = 85;
SolidityParser.RULE_tupleExpression = 86;
SolidityParser.RULE_typeNameExpression = 87;
SolidityParser.RULE_numberLiteral = 88;
SolidityParser.RULE_identifier = 89;
SolidityParser.RULE_hexLiteral = 90;
SolidityParser.RULE_overrideSpecifier = 91;
SolidityParser.RULE_stringLiteral = 92;

var SourceUnitContext = /*#__PURE__*/function (_antlr4$ParserRuleCon) {
  _inherits(SourceUnitContext, _antlr4$ParserRuleCon);

  var _super2 = _createSuper(SourceUnitContext);

  function SourceUnitContext(parser, parent, invokingState) {
    var _this2;

    _classCallCheck(this, SourceUnitContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this2 = _super2.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this2), "pragmaDirective", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(PragmaDirectiveContext);
      } else {
        return this.getTypedRuleContext(PragmaDirectiveContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this2), "importDirective", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(ImportDirectiveContext);
      } else {
        return this.getTypedRuleContext(ImportDirectiveContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this2), "contractDefinition", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(ContractDefinitionContext);
      } else {
        return this.getTypedRuleContext(ContractDefinitionContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this2), "enumDefinition", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(EnumDefinitionContext);
      } else {
        return this.getTypedRuleContext(EnumDefinitionContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this2), "structDefinition", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(StructDefinitionContext);
      } else {
        return this.getTypedRuleContext(StructDefinitionContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this2), "functionDefinition", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(FunctionDefinitionContext);
      } else {
        return this.getTypedRuleContext(FunctionDefinitionContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this2), "fileLevelConstant", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(FileLevelConstantContext);
      } else {
        return this.getTypedRuleContext(FileLevelConstantContext, i);
      }
    });

    _this2.parser = parser;
    _this2.ruleIndex = SolidityParser.RULE_sourceUnit;
    return _this2;
  }

  _createClass(SourceUnitContext, [{
    key: "EOF",
    value: function EOF() {
      return this.getToken(SolidityParser.EOF, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterSourceUnit(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitSourceUnit(this);
      }
    }
  }]);

  return SourceUnitContext;
}(antlr4.ParserRuleContext);

var PragmaDirectiveContext = /*#__PURE__*/function (_antlr4$ParserRuleCon2) {
  _inherits(PragmaDirectiveContext, _antlr4$ParserRuleCon2);

  var _super3 = _createSuper(PragmaDirectiveContext);

  function PragmaDirectiveContext(parser, parent, invokingState) {
    var _this3;

    _classCallCheck(this, PragmaDirectiveContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this3 = _super3.call(this, parent, invokingState);
    _this3.parser = parser;
    _this3.ruleIndex = SolidityParser.RULE_pragmaDirective;
    return _this3;
  }

  _createClass(PragmaDirectiveContext, [{
    key: "pragmaName",
    value: function pragmaName() {
      return this.getTypedRuleContext(PragmaNameContext, 0);
    }
  }, {
    key: "pragmaValue",
    value: function pragmaValue() {
      return this.getTypedRuleContext(PragmaValueContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterPragmaDirective(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitPragmaDirective(this);
      }
    }
  }]);

  return PragmaDirectiveContext;
}(antlr4.ParserRuleContext);

var PragmaNameContext = /*#__PURE__*/function (_antlr4$ParserRuleCon3) {
  _inherits(PragmaNameContext, _antlr4$ParserRuleCon3);

  var _super4 = _createSuper(PragmaNameContext);

  function PragmaNameContext(parser, parent, invokingState) {
    var _this4;

    _classCallCheck(this, PragmaNameContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this4 = _super4.call(this, parent, invokingState);
    _this4.parser = parser;
    _this4.ruleIndex = SolidityParser.RULE_pragmaName;
    return _this4;
  }

  _createClass(PragmaNameContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterPragmaName(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitPragmaName(this);
      }
    }
  }]);

  return PragmaNameContext;
}(antlr4.ParserRuleContext);

var PragmaValueContext = /*#__PURE__*/function (_antlr4$ParserRuleCon4) {
  _inherits(PragmaValueContext, _antlr4$ParserRuleCon4);

  var _super5 = _createSuper(PragmaValueContext);

  function PragmaValueContext(parser, parent, invokingState) {
    var _this5;

    _classCallCheck(this, PragmaValueContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this5 = _super5.call(this, parent, invokingState);
    _this5.parser = parser;
    _this5.ruleIndex = SolidityParser.RULE_pragmaValue;
    return _this5;
  }

  _createClass(PragmaValueContext, [{
    key: "version",
    value: function version() {
      return this.getTypedRuleContext(VersionContext, 0);
    }
  }, {
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterPragmaValue(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitPragmaValue(this);
      }
    }
  }]);

  return PragmaValueContext;
}(antlr4.ParserRuleContext);

var VersionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon5) {
  _inherits(VersionContext, _antlr4$ParserRuleCon5);

  var _super6 = _createSuper(VersionContext);

  function VersionContext(parser, parent, invokingState) {
    var _this6;

    _classCallCheck(this, VersionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this6 = _super6.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this6), "versionConstraint", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(VersionConstraintContext);
      } else {
        return this.getTypedRuleContext(VersionConstraintContext, i);
      }
    });

    _this6.parser = parser;
    _this6.ruleIndex = SolidityParser.RULE_version;
    return _this6;
  }

  _createClass(VersionContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterVersion(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitVersion(this);
      }
    }
  }]);

  return VersionContext;
}(antlr4.ParserRuleContext);

var VersionOperatorContext = /*#__PURE__*/function (_antlr4$ParserRuleCon6) {
  _inherits(VersionOperatorContext, _antlr4$ParserRuleCon6);

  var _super7 = _createSuper(VersionOperatorContext);

  function VersionOperatorContext(parser, parent, invokingState) {
    var _this7;

    _classCallCheck(this, VersionOperatorContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this7 = _super7.call(this, parent, invokingState);
    _this7.parser = parser;
    _this7.ruleIndex = SolidityParser.RULE_versionOperator;
    return _this7;
  }

  _createClass(VersionOperatorContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterVersionOperator(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitVersionOperator(this);
      }
    }
  }]);

  return VersionOperatorContext;
}(antlr4.ParserRuleContext);

var VersionConstraintContext = /*#__PURE__*/function (_antlr4$ParserRuleCon7) {
  _inherits(VersionConstraintContext, _antlr4$ParserRuleCon7);

  var _super8 = _createSuper(VersionConstraintContext);

  function VersionConstraintContext(parser, parent, invokingState) {
    var _this8;

    _classCallCheck(this, VersionConstraintContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this8 = _super8.call(this, parent, invokingState);
    _this8.parser = parser;
    _this8.ruleIndex = SolidityParser.RULE_versionConstraint;
    return _this8;
  }

  _createClass(VersionConstraintContext, [{
    key: "VersionLiteral",
    value: function VersionLiteral() {
      return this.getToken(SolidityParser.VersionLiteral, 0);
    }
  }, {
    key: "versionOperator",
    value: function versionOperator() {
      return this.getTypedRuleContext(VersionOperatorContext, 0);
    }
  }, {
    key: "DecimalNumber",
    value: function DecimalNumber() {
      return this.getToken(SolidityParser.DecimalNumber, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterVersionConstraint(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitVersionConstraint(this);
      }
    }
  }]);

  return VersionConstraintContext;
}(antlr4.ParserRuleContext);

var ImportDeclarationContext = /*#__PURE__*/function (_antlr4$ParserRuleCon8) {
  _inherits(ImportDeclarationContext, _antlr4$ParserRuleCon8);

  var _super9 = _createSuper(ImportDeclarationContext);

  function ImportDeclarationContext(parser, parent, invokingState) {
    var _this9;

    _classCallCheck(this, ImportDeclarationContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this9 = _super9.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this9), "identifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(IdentifierContext);
      } else {
        return this.getTypedRuleContext(IdentifierContext, i);
      }
    });

    _this9.parser = parser;
    _this9.ruleIndex = SolidityParser.RULE_importDeclaration;
    return _this9;
  }

  _createClass(ImportDeclarationContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterImportDeclaration(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitImportDeclaration(this);
      }
    }
  }]);

  return ImportDeclarationContext;
}(antlr4.ParserRuleContext);

var ImportDirectiveContext = /*#__PURE__*/function (_antlr4$ParserRuleCon9) {
  _inherits(ImportDirectiveContext, _antlr4$ParserRuleCon9);

  var _super10 = _createSuper(ImportDirectiveContext);

  function ImportDirectiveContext(parser, parent, invokingState) {
    var _this10;

    _classCallCheck(this, ImportDirectiveContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this10 = _super10.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this10), "identifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(IdentifierContext);
      } else {
        return this.getTypedRuleContext(IdentifierContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this10), "importDeclaration", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(ImportDeclarationContext);
      } else {
        return this.getTypedRuleContext(ImportDeclarationContext, i);
      }
    });

    _this10.parser = parser;
    _this10.ruleIndex = SolidityParser.RULE_importDirective;
    return _this10;
  }

  _createClass(ImportDirectiveContext, [{
    key: "StringLiteralFragment",
    value: function StringLiteralFragment() {
      return this.getToken(SolidityParser.StringLiteralFragment, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterImportDirective(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitImportDirective(this);
      }
    }
  }]);

  return ImportDirectiveContext;
}(antlr4.ParserRuleContext);

var ContractDefinitionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon10) {
  _inherits(ContractDefinitionContext, _antlr4$ParserRuleCon10);

  var _super11 = _createSuper(ContractDefinitionContext);

  function ContractDefinitionContext(parser, parent, invokingState) {
    var _this11;

    _classCallCheck(this, ContractDefinitionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this11 = _super11.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this11), "inheritanceSpecifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(InheritanceSpecifierContext);
      } else {
        return this.getTypedRuleContext(InheritanceSpecifierContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this11), "contractPart", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(ContractPartContext);
      } else {
        return this.getTypedRuleContext(ContractPartContext, i);
      }
    });

    _this11.parser = parser;
    _this11.ruleIndex = SolidityParser.RULE_contractDefinition;
    return _this11;
  }

  _createClass(ContractDefinitionContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterContractDefinition(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitContractDefinition(this);
      }
    }
  }]);

  return ContractDefinitionContext;
}(antlr4.ParserRuleContext);

var InheritanceSpecifierContext = /*#__PURE__*/function (_antlr4$ParserRuleCon11) {
  _inherits(InheritanceSpecifierContext, _antlr4$ParserRuleCon11);

  var _super12 = _createSuper(InheritanceSpecifierContext);

  function InheritanceSpecifierContext(parser, parent, invokingState) {
    var _this12;

    _classCallCheck(this, InheritanceSpecifierContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this12 = _super12.call(this, parent, invokingState);
    _this12.parser = parser;
    _this12.ruleIndex = SolidityParser.RULE_inheritanceSpecifier;
    return _this12;
  }

  _createClass(InheritanceSpecifierContext, [{
    key: "userDefinedTypeName",
    value: function userDefinedTypeName() {
      return this.getTypedRuleContext(UserDefinedTypeNameContext, 0);
    }
  }, {
    key: "expressionList",
    value: function expressionList() {
      return this.getTypedRuleContext(ExpressionListContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterInheritanceSpecifier(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitInheritanceSpecifier(this);
      }
    }
  }]);

  return InheritanceSpecifierContext;
}(antlr4.ParserRuleContext);

var ContractPartContext = /*#__PURE__*/function (_antlr4$ParserRuleCon12) {
  _inherits(ContractPartContext, _antlr4$ParserRuleCon12);

  var _super13 = _createSuper(ContractPartContext);

  function ContractPartContext(parser, parent, invokingState) {
    var _this13;

    _classCallCheck(this, ContractPartContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this13 = _super13.call(this, parent, invokingState);
    _this13.parser = parser;
    _this13.ruleIndex = SolidityParser.RULE_contractPart;
    return _this13;
  }

  _createClass(ContractPartContext, [{
    key: "stateVariableDeclaration",
    value: function stateVariableDeclaration() {
      return this.getTypedRuleContext(StateVariableDeclarationContext, 0);
    }
  }, {
    key: "usingForDeclaration",
    value: function usingForDeclaration() {
      return this.getTypedRuleContext(UsingForDeclarationContext, 0);
    }
  }, {
    key: "structDefinition",
    value: function structDefinition() {
      return this.getTypedRuleContext(StructDefinitionContext, 0);
    }
  }, {
    key: "modifierDefinition",
    value: function modifierDefinition() {
      return this.getTypedRuleContext(ModifierDefinitionContext, 0);
    }
  }, {
    key: "functionDefinition",
    value: function functionDefinition() {
      return this.getTypedRuleContext(FunctionDefinitionContext, 0);
    }
  }, {
    key: "eventDefinition",
    value: function eventDefinition() {
      return this.getTypedRuleContext(EventDefinitionContext, 0);
    }
  }, {
    key: "enumDefinition",
    value: function enumDefinition() {
      return this.getTypedRuleContext(EnumDefinitionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterContractPart(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitContractPart(this);
      }
    }
  }]);

  return ContractPartContext;
}(antlr4.ParserRuleContext);

var StateVariableDeclarationContext = /*#__PURE__*/function (_antlr4$ParserRuleCon13) {
  _inherits(StateVariableDeclarationContext, _antlr4$ParserRuleCon13);

  var _super14 = _createSuper(StateVariableDeclarationContext);

  function StateVariableDeclarationContext(parser, parent, invokingState) {
    var _this14;

    _classCallCheck(this, StateVariableDeclarationContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this14 = _super14.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this14), "PublicKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.PublicKeyword);
      } else {
        return this.getToken(SolidityParser.PublicKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this14), "InternalKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.InternalKeyword);
      } else {
        return this.getToken(SolidityParser.InternalKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this14), "PrivateKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.PrivateKeyword);
      } else {
        return this.getToken(SolidityParser.PrivateKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this14), "ConstantKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.ConstantKeyword);
      } else {
        return this.getToken(SolidityParser.ConstantKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this14), "ImmutableKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.ImmutableKeyword);
      } else {
        return this.getToken(SolidityParser.ImmutableKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this14), "overrideSpecifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(OverrideSpecifierContext);
      } else {
        return this.getTypedRuleContext(OverrideSpecifierContext, i);
      }
    });

    _this14.parser = parser;
    _this14.ruleIndex = SolidityParser.RULE_stateVariableDeclaration;
    return _this14;
  }

  _createClass(StateVariableDeclarationContext, [{
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterStateVariableDeclaration(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitStateVariableDeclaration(this);
      }
    }
  }]);

  return StateVariableDeclarationContext;
}(antlr4.ParserRuleContext);

var FileLevelConstantContext = /*#__PURE__*/function (_antlr4$ParserRuleCon14) {
  _inherits(FileLevelConstantContext, _antlr4$ParserRuleCon14);

  var _super15 = _createSuper(FileLevelConstantContext);

  function FileLevelConstantContext(parser, parent, invokingState) {
    var _this15;

    _classCallCheck(this, FileLevelConstantContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this15 = _super15.call(this, parent, invokingState);
    _this15.parser = parser;
    _this15.ruleIndex = SolidityParser.RULE_fileLevelConstant;
    return _this15;
  }

  _createClass(FileLevelConstantContext, [{
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "ConstantKeyword",
    value: function ConstantKeyword() {
      return this.getToken(SolidityParser.ConstantKeyword, 0);
    }
  }, {
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterFileLevelConstant(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitFileLevelConstant(this);
      }
    }
  }]);

  return FileLevelConstantContext;
}(antlr4.ParserRuleContext);

var UsingForDeclarationContext = /*#__PURE__*/function (_antlr4$ParserRuleCon15) {
  _inherits(UsingForDeclarationContext, _antlr4$ParserRuleCon15);

  var _super16 = _createSuper(UsingForDeclarationContext);

  function UsingForDeclarationContext(parser, parent, invokingState) {
    var _this16;

    _classCallCheck(this, UsingForDeclarationContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this16 = _super16.call(this, parent, invokingState);
    _this16.parser = parser;
    _this16.ruleIndex = SolidityParser.RULE_usingForDeclaration;
    return _this16;
  }

  _createClass(UsingForDeclarationContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterUsingForDeclaration(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitUsingForDeclaration(this);
      }
    }
  }]);

  return UsingForDeclarationContext;
}(antlr4.ParserRuleContext);

var StructDefinitionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon16) {
  _inherits(StructDefinitionContext, _antlr4$ParserRuleCon16);

  var _super17 = _createSuper(StructDefinitionContext);

  function StructDefinitionContext(parser, parent, invokingState) {
    var _this17;

    _classCallCheck(this, StructDefinitionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this17 = _super17.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this17), "variableDeclaration", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(VariableDeclarationContext);
      } else {
        return this.getTypedRuleContext(VariableDeclarationContext, i);
      }
    });

    _this17.parser = parser;
    _this17.ruleIndex = SolidityParser.RULE_structDefinition;
    return _this17;
  }

  _createClass(StructDefinitionContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterStructDefinition(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitStructDefinition(this);
      }
    }
  }]);

  return StructDefinitionContext;
}(antlr4.ParserRuleContext);

var ModifierDefinitionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon17) {
  _inherits(ModifierDefinitionContext, _antlr4$ParserRuleCon17);

  var _super18 = _createSuper(ModifierDefinitionContext);

  function ModifierDefinitionContext(parser, parent, invokingState) {
    var _this18;

    _classCallCheck(this, ModifierDefinitionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this18 = _super18.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this18), "VirtualKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.VirtualKeyword);
      } else {
        return this.getToken(SolidityParser.VirtualKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this18), "overrideSpecifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(OverrideSpecifierContext);
      } else {
        return this.getTypedRuleContext(OverrideSpecifierContext, i);
      }
    });

    _this18.parser = parser;
    _this18.ruleIndex = SolidityParser.RULE_modifierDefinition;
    return _this18;
  }

  _createClass(ModifierDefinitionContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "block",
    value: function block() {
      return this.getTypedRuleContext(BlockContext, 0);
    }
  }, {
    key: "parameterList",
    value: function parameterList() {
      return this.getTypedRuleContext(ParameterListContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterModifierDefinition(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitModifierDefinition(this);
      }
    }
  }]);

  return ModifierDefinitionContext;
}(antlr4.ParserRuleContext);

var ModifierInvocationContext = /*#__PURE__*/function (_antlr4$ParserRuleCon18) {
  _inherits(ModifierInvocationContext, _antlr4$ParserRuleCon18);

  var _super19 = _createSuper(ModifierInvocationContext);

  function ModifierInvocationContext(parser, parent, invokingState) {
    var _this19;

    _classCallCheck(this, ModifierInvocationContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this19 = _super19.call(this, parent, invokingState);
    _this19.parser = parser;
    _this19.ruleIndex = SolidityParser.RULE_modifierInvocation;
    return _this19;
  }

  _createClass(ModifierInvocationContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "expressionList",
    value: function expressionList() {
      return this.getTypedRuleContext(ExpressionListContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterModifierInvocation(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitModifierInvocation(this);
      }
    }
  }]);

  return ModifierInvocationContext;
}(antlr4.ParserRuleContext);

var FunctionDefinitionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon19) {
  _inherits(FunctionDefinitionContext, _antlr4$ParserRuleCon19);

  var _super20 = _createSuper(FunctionDefinitionContext);

  function FunctionDefinitionContext(parser, parent, invokingState) {
    var _this20;

    _classCallCheck(this, FunctionDefinitionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this20 = _super20.call(this, parent, invokingState);
    _this20.parser = parser;
    _this20.ruleIndex = SolidityParser.RULE_functionDefinition;
    return _this20;
  }

  _createClass(FunctionDefinitionContext, [{
    key: "functionDescriptor",
    value: function functionDescriptor() {
      return this.getTypedRuleContext(FunctionDescriptorContext, 0);
    }
  }, {
    key: "parameterList",
    value: function parameterList() {
      return this.getTypedRuleContext(ParameterListContext, 0);
    }
  }, {
    key: "modifierList",
    value: function modifierList() {
      return this.getTypedRuleContext(ModifierListContext, 0);
    }
  }, {
    key: "block",
    value: function block() {
      return this.getTypedRuleContext(BlockContext, 0);
    }
  }, {
    key: "returnParameters",
    value: function returnParameters() {
      return this.getTypedRuleContext(ReturnParametersContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterFunctionDefinition(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitFunctionDefinition(this);
      }
    }
  }]);

  return FunctionDefinitionContext;
}(antlr4.ParserRuleContext);

var FunctionDescriptorContext = /*#__PURE__*/function (_antlr4$ParserRuleCon20) {
  _inherits(FunctionDescriptorContext, _antlr4$ParserRuleCon20);

  var _super21 = _createSuper(FunctionDescriptorContext);

  function FunctionDescriptorContext(parser, parent, invokingState) {
    var _this21;

    _classCallCheck(this, FunctionDescriptorContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this21 = _super21.call(this, parent, invokingState);
    _this21.parser = parser;
    _this21.ruleIndex = SolidityParser.RULE_functionDescriptor;
    return _this21;
  }

  _createClass(FunctionDescriptorContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "ConstructorKeyword",
    value: function ConstructorKeyword() {
      return this.getToken(SolidityParser.ConstructorKeyword, 0);
    }
  }, {
    key: "FallbackKeyword",
    value: function FallbackKeyword() {
      return this.getToken(SolidityParser.FallbackKeyword, 0);
    }
  }, {
    key: "ReceiveKeyword",
    value: function ReceiveKeyword() {
      return this.getToken(SolidityParser.ReceiveKeyword, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterFunctionDescriptor(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitFunctionDescriptor(this);
      }
    }
  }]);

  return FunctionDescriptorContext;
}(antlr4.ParserRuleContext);

var ReturnParametersContext = /*#__PURE__*/function (_antlr4$ParserRuleCon21) {
  _inherits(ReturnParametersContext, _antlr4$ParserRuleCon21);

  var _super22 = _createSuper(ReturnParametersContext);

  function ReturnParametersContext(parser, parent, invokingState) {
    var _this22;

    _classCallCheck(this, ReturnParametersContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this22 = _super22.call(this, parent, invokingState);
    _this22.parser = parser;
    _this22.ruleIndex = SolidityParser.RULE_returnParameters;
    return _this22;
  }

  _createClass(ReturnParametersContext, [{
    key: "parameterList",
    value: function parameterList() {
      return this.getTypedRuleContext(ParameterListContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterReturnParameters(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitReturnParameters(this);
      }
    }
  }]);

  return ReturnParametersContext;
}(antlr4.ParserRuleContext);

var ModifierListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon22) {
  _inherits(ModifierListContext, _antlr4$ParserRuleCon22);

  var _super23 = _createSuper(ModifierListContext);

  function ModifierListContext(parser, parent, invokingState) {
    var _this23;

    _classCallCheck(this, ModifierListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this23 = _super23.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this23), "ExternalKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.ExternalKeyword);
      } else {
        return this.getToken(SolidityParser.ExternalKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this23), "PublicKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.PublicKeyword);
      } else {
        return this.getToken(SolidityParser.PublicKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this23), "InternalKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.InternalKeyword);
      } else {
        return this.getToken(SolidityParser.InternalKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this23), "PrivateKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.PrivateKeyword);
      } else {
        return this.getToken(SolidityParser.PrivateKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this23), "VirtualKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.VirtualKeyword);
      } else {
        return this.getToken(SolidityParser.VirtualKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this23), "stateMutability", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(StateMutabilityContext);
      } else {
        return this.getTypedRuleContext(StateMutabilityContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this23), "modifierInvocation", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(ModifierInvocationContext);
      } else {
        return this.getTypedRuleContext(ModifierInvocationContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this23), "overrideSpecifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(OverrideSpecifierContext);
      } else {
        return this.getTypedRuleContext(OverrideSpecifierContext, i);
      }
    });

    _this23.parser = parser;
    _this23.ruleIndex = SolidityParser.RULE_modifierList;
    return _this23;
  }

  _createClass(ModifierListContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterModifierList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitModifierList(this);
      }
    }
  }]);

  return ModifierListContext;
}(antlr4.ParserRuleContext);

var EventDefinitionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon23) {
  _inherits(EventDefinitionContext, _antlr4$ParserRuleCon23);

  var _super24 = _createSuper(EventDefinitionContext);

  function EventDefinitionContext(parser, parent, invokingState) {
    var _this24;

    _classCallCheck(this, EventDefinitionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this24 = _super24.call(this, parent, invokingState);
    _this24.parser = parser;
    _this24.ruleIndex = SolidityParser.RULE_eventDefinition;
    return _this24;
  }

  _createClass(EventDefinitionContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "eventParameterList",
    value: function eventParameterList() {
      return this.getTypedRuleContext(EventParameterListContext, 0);
    }
  }, {
    key: "AnonymousKeyword",
    value: function AnonymousKeyword() {
      return this.getToken(SolidityParser.AnonymousKeyword, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterEventDefinition(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitEventDefinition(this);
      }
    }
  }]);

  return EventDefinitionContext;
}(antlr4.ParserRuleContext);

var EnumValueContext = /*#__PURE__*/function (_antlr4$ParserRuleCon24) {
  _inherits(EnumValueContext, _antlr4$ParserRuleCon24);

  var _super25 = _createSuper(EnumValueContext);

  function EnumValueContext(parser, parent, invokingState) {
    var _this25;

    _classCallCheck(this, EnumValueContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this25 = _super25.call(this, parent, invokingState);
    _this25.parser = parser;
    _this25.ruleIndex = SolidityParser.RULE_enumValue;
    return _this25;
  }

  _createClass(EnumValueContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterEnumValue(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitEnumValue(this);
      }
    }
  }]);

  return EnumValueContext;
}(antlr4.ParserRuleContext);

var EnumDefinitionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon25) {
  _inherits(EnumDefinitionContext, _antlr4$ParserRuleCon25);

  var _super26 = _createSuper(EnumDefinitionContext);

  function EnumDefinitionContext(parser, parent, invokingState) {
    var _this26;

    _classCallCheck(this, EnumDefinitionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this26 = _super26.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this26), "enumValue", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(EnumValueContext);
      } else {
        return this.getTypedRuleContext(EnumValueContext, i);
      }
    });

    _this26.parser = parser;
    _this26.ruleIndex = SolidityParser.RULE_enumDefinition;
    return _this26;
  }

  _createClass(EnumDefinitionContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterEnumDefinition(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitEnumDefinition(this);
      }
    }
  }]);

  return EnumDefinitionContext;
}(antlr4.ParserRuleContext);

var ParameterListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon26) {
  _inherits(ParameterListContext, _antlr4$ParserRuleCon26);

  var _super27 = _createSuper(ParameterListContext);

  function ParameterListContext(parser, parent, invokingState) {
    var _this27;

    _classCallCheck(this, ParameterListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this27 = _super27.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this27), "parameter", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(ParameterContext);
      } else {
        return this.getTypedRuleContext(ParameterContext, i);
      }
    });

    _this27.parser = parser;
    _this27.ruleIndex = SolidityParser.RULE_parameterList;
    return _this27;
  }

  _createClass(ParameterListContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterParameterList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitParameterList(this);
      }
    }
  }]);

  return ParameterListContext;
}(antlr4.ParserRuleContext);

var ParameterContext = /*#__PURE__*/function (_antlr4$ParserRuleCon27) {
  _inherits(ParameterContext, _antlr4$ParserRuleCon27);

  var _super28 = _createSuper(ParameterContext);

  function ParameterContext(parser, parent, invokingState) {
    var _this28;

    _classCallCheck(this, ParameterContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this28 = _super28.call(this, parent, invokingState);
    _this28.parser = parser;
    _this28.ruleIndex = SolidityParser.RULE_parameter;
    return _this28;
  }

  _createClass(ParameterContext, [{
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "storageLocation",
    value: function storageLocation() {
      return this.getTypedRuleContext(StorageLocationContext, 0);
    }
  }, {
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterParameter(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitParameter(this);
      }
    }
  }]);

  return ParameterContext;
}(antlr4.ParserRuleContext);

var EventParameterListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon28) {
  _inherits(EventParameterListContext, _antlr4$ParserRuleCon28);

  var _super29 = _createSuper(EventParameterListContext);

  function EventParameterListContext(parser, parent, invokingState) {
    var _this29;

    _classCallCheck(this, EventParameterListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this29 = _super29.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this29), "eventParameter", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(EventParameterContext);
      } else {
        return this.getTypedRuleContext(EventParameterContext, i);
      }
    });

    _this29.parser = parser;
    _this29.ruleIndex = SolidityParser.RULE_eventParameterList;
    return _this29;
  }

  _createClass(EventParameterListContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterEventParameterList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitEventParameterList(this);
      }
    }
  }]);

  return EventParameterListContext;
}(antlr4.ParserRuleContext);

var EventParameterContext = /*#__PURE__*/function (_antlr4$ParserRuleCon29) {
  _inherits(EventParameterContext, _antlr4$ParserRuleCon29);

  var _super30 = _createSuper(EventParameterContext);

  function EventParameterContext(parser, parent, invokingState) {
    var _this30;

    _classCallCheck(this, EventParameterContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this30 = _super30.call(this, parent, invokingState);
    _this30.parser = parser;
    _this30.ruleIndex = SolidityParser.RULE_eventParameter;
    return _this30;
  }

  _createClass(EventParameterContext, [{
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "IndexedKeyword",
    value: function IndexedKeyword() {
      return this.getToken(SolidityParser.IndexedKeyword, 0);
    }
  }, {
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterEventParameter(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitEventParameter(this);
      }
    }
  }]);

  return EventParameterContext;
}(antlr4.ParserRuleContext);

var FunctionTypeParameterListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon30) {
  _inherits(FunctionTypeParameterListContext, _antlr4$ParserRuleCon30);

  var _super31 = _createSuper(FunctionTypeParameterListContext);

  function FunctionTypeParameterListContext(parser, parent, invokingState) {
    var _this31;

    _classCallCheck(this, FunctionTypeParameterListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this31 = _super31.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this31), "functionTypeParameter", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(FunctionTypeParameterContext);
      } else {
        return this.getTypedRuleContext(FunctionTypeParameterContext, i);
      }
    });

    _this31.parser = parser;
    _this31.ruleIndex = SolidityParser.RULE_functionTypeParameterList;
    return _this31;
  }

  _createClass(FunctionTypeParameterListContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterFunctionTypeParameterList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitFunctionTypeParameterList(this);
      }
    }
  }]);

  return FunctionTypeParameterListContext;
}(antlr4.ParserRuleContext);

var FunctionTypeParameterContext = /*#__PURE__*/function (_antlr4$ParserRuleCon31) {
  _inherits(FunctionTypeParameterContext, _antlr4$ParserRuleCon31);

  var _super32 = _createSuper(FunctionTypeParameterContext);

  function FunctionTypeParameterContext(parser, parent, invokingState) {
    var _this32;

    _classCallCheck(this, FunctionTypeParameterContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this32 = _super32.call(this, parent, invokingState);
    _this32.parser = parser;
    _this32.ruleIndex = SolidityParser.RULE_functionTypeParameter;
    return _this32;
  }

  _createClass(FunctionTypeParameterContext, [{
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "storageLocation",
    value: function storageLocation() {
      return this.getTypedRuleContext(StorageLocationContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterFunctionTypeParameter(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitFunctionTypeParameter(this);
      }
    }
  }]);

  return FunctionTypeParameterContext;
}(antlr4.ParserRuleContext);

var VariableDeclarationContext = /*#__PURE__*/function (_antlr4$ParserRuleCon32) {
  _inherits(VariableDeclarationContext, _antlr4$ParserRuleCon32);

  var _super33 = _createSuper(VariableDeclarationContext);

  function VariableDeclarationContext(parser, parent, invokingState) {
    var _this33;

    _classCallCheck(this, VariableDeclarationContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this33 = _super33.call(this, parent, invokingState);
    _this33.parser = parser;
    _this33.ruleIndex = SolidityParser.RULE_variableDeclaration;
    return _this33;
  }

  _createClass(VariableDeclarationContext, [{
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "storageLocation",
    value: function storageLocation() {
      return this.getTypedRuleContext(StorageLocationContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterVariableDeclaration(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitVariableDeclaration(this);
      }
    }
  }]);

  return VariableDeclarationContext;
}(antlr4.ParserRuleContext);

var TypeNameContext = /*#__PURE__*/function (_antlr4$ParserRuleCon33) {
  _inherits(TypeNameContext, _antlr4$ParserRuleCon33);

  var _super34 = _createSuper(TypeNameContext);

  function TypeNameContext(parser, parent, invokingState) {
    var _this34;

    _classCallCheck(this, TypeNameContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this34 = _super34.call(this, parent, invokingState);
    _this34.parser = parser;
    _this34.ruleIndex = SolidityParser.RULE_typeName;
    return _this34;
  }

  _createClass(TypeNameContext, [{
    key: "elementaryTypeName",
    value: function elementaryTypeName() {
      return this.getTypedRuleContext(ElementaryTypeNameContext, 0);
    }
  }, {
    key: "userDefinedTypeName",
    value: function userDefinedTypeName() {
      return this.getTypedRuleContext(UserDefinedTypeNameContext, 0);
    }
  }, {
    key: "mapping",
    value: function mapping() {
      return this.getTypedRuleContext(MappingContext, 0);
    }
  }, {
    key: "functionTypeName",
    value: function functionTypeName() {
      return this.getTypedRuleContext(FunctionTypeNameContext, 0);
    }
  }, {
    key: "PayableKeyword",
    value: function PayableKeyword() {
      return this.getToken(SolidityParser.PayableKeyword, 0);
    }
  }, {
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterTypeName(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitTypeName(this);
      }
    }
  }]);

  return TypeNameContext;
}(antlr4.ParserRuleContext);

var UserDefinedTypeNameContext = /*#__PURE__*/function (_antlr4$ParserRuleCon34) {
  _inherits(UserDefinedTypeNameContext, _antlr4$ParserRuleCon34);

  var _super35 = _createSuper(UserDefinedTypeNameContext);

  function UserDefinedTypeNameContext(parser, parent, invokingState) {
    var _this35;

    _classCallCheck(this, UserDefinedTypeNameContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this35 = _super35.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this35), "identifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(IdentifierContext);
      } else {
        return this.getTypedRuleContext(IdentifierContext, i);
      }
    });

    _this35.parser = parser;
    _this35.ruleIndex = SolidityParser.RULE_userDefinedTypeName;
    return _this35;
  }

  _createClass(UserDefinedTypeNameContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterUserDefinedTypeName(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitUserDefinedTypeName(this);
      }
    }
  }]);

  return UserDefinedTypeNameContext;
}(antlr4.ParserRuleContext);

var MappingKeyContext = /*#__PURE__*/function (_antlr4$ParserRuleCon35) {
  _inherits(MappingKeyContext, _antlr4$ParserRuleCon35);

  var _super36 = _createSuper(MappingKeyContext);

  function MappingKeyContext(parser, parent, invokingState) {
    var _this36;

    _classCallCheck(this, MappingKeyContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this36 = _super36.call(this, parent, invokingState);
    _this36.parser = parser;
    _this36.ruleIndex = SolidityParser.RULE_mappingKey;
    return _this36;
  }

  _createClass(MappingKeyContext, [{
    key: "elementaryTypeName",
    value: function elementaryTypeName() {
      return this.getTypedRuleContext(ElementaryTypeNameContext, 0);
    }
  }, {
    key: "userDefinedTypeName",
    value: function userDefinedTypeName() {
      return this.getTypedRuleContext(UserDefinedTypeNameContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterMappingKey(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitMappingKey(this);
      }
    }
  }]);

  return MappingKeyContext;
}(antlr4.ParserRuleContext);

var MappingContext = /*#__PURE__*/function (_antlr4$ParserRuleCon36) {
  _inherits(MappingContext, _antlr4$ParserRuleCon36);

  var _super37 = _createSuper(MappingContext);

  function MappingContext(parser, parent, invokingState) {
    var _this37;

    _classCallCheck(this, MappingContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this37 = _super37.call(this, parent, invokingState);
    _this37.parser = parser;
    _this37.ruleIndex = SolidityParser.RULE_mapping;
    return _this37;
  }

  _createClass(MappingContext, [{
    key: "mappingKey",
    value: function mappingKey() {
      return this.getTypedRuleContext(MappingKeyContext, 0);
    }
  }, {
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterMapping(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitMapping(this);
      }
    }
  }]);

  return MappingContext;
}(antlr4.ParserRuleContext);

var FunctionTypeNameContext = /*#__PURE__*/function (_antlr4$ParserRuleCon37) {
  _inherits(FunctionTypeNameContext, _antlr4$ParserRuleCon37);

  var _super38 = _createSuper(FunctionTypeNameContext);

  function FunctionTypeNameContext(parser, parent, invokingState) {
    var _this38;

    _classCallCheck(this, FunctionTypeNameContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this38 = _super38.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this38), "functionTypeParameterList", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(FunctionTypeParameterListContext);
      } else {
        return this.getTypedRuleContext(FunctionTypeParameterListContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this38), "InternalKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.InternalKeyword);
      } else {
        return this.getToken(SolidityParser.InternalKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this38), "ExternalKeyword", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.ExternalKeyword);
      } else {
        return this.getToken(SolidityParser.ExternalKeyword, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this38), "stateMutability", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(StateMutabilityContext);
      } else {
        return this.getTypedRuleContext(StateMutabilityContext, i);
      }
    });

    _this38.parser = parser;
    _this38.ruleIndex = SolidityParser.RULE_functionTypeName;
    return _this38;
  }

  _createClass(FunctionTypeNameContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterFunctionTypeName(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitFunctionTypeName(this);
      }
    }
  }]);

  return FunctionTypeNameContext;
}(antlr4.ParserRuleContext);

var StorageLocationContext = /*#__PURE__*/function (_antlr4$ParserRuleCon38) {
  _inherits(StorageLocationContext, _antlr4$ParserRuleCon38);

  var _super39 = _createSuper(StorageLocationContext);

  function StorageLocationContext(parser, parent, invokingState) {
    var _this39;

    _classCallCheck(this, StorageLocationContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this39 = _super39.call(this, parent, invokingState);
    _this39.parser = parser;
    _this39.ruleIndex = SolidityParser.RULE_storageLocation;
    return _this39;
  }

  _createClass(StorageLocationContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterStorageLocation(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitStorageLocation(this);
      }
    }
  }]);

  return StorageLocationContext;
}(antlr4.ParserRuleContext);

var StateMutabilityContext = /*#__PURE__*/function (_antlr4$ParserRuleCon39) {
  _inherits(StateMutabilityContext, _antlr4$ParserRuleCon39);

  var _super40 = _createSuper(StateMutabilityContext);

  function StateMutabilityContext(parser, parent, invokingState) {
    var _this40;

    _classCallCheck(this, StateMutabilityContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this40 = _super40.call(this, parent, invokingState);
    _this40.parser = parser;
    _this40.ruleIndex = SolidityParser.RULE_stateMutability;
    return _this40;
  }

  _createClass(StateMutabilityContext, [{
    key: "PureKeyword",
    value: function PureKeyword() {
      return this.getToken(SolidityParser.PureKeyword, 0);
    }
  }, {
    key: "ConstantKeyword",
    value: function ConstantKeyword() {
      return this.getToken(SolidityParser.ConstantKeyword, 0);
    }
  }, {
    key: "ViewKeyword",
    value: function ViewKeyword() {
      return this.getToken(SolidityParser.ViewKeyword, 0);
    }
  }, {
    key: "PayableKeyword",
    value: function PayableKeyword() {
      return this.getToken(SolidityParser.PayableKeyword, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterStateMutability(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitStateMutability(this);
      }
    }
  }]);

  return StateMutabilityContext;
}(antlr4.ParserRuleContext);

var BlockContext = /*#__PURE__*/function (_antlr4$ParserRuleCon40) {
  _inherits(BlockContext, _antlr4$ParserRuleCon40);

  var _super41 = _createSuper(BlockContext);

  function BlockContext(parser, parent, invokingState) {
    var _this41;

    _classCallCheck(this, BlockContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this41 = _super41.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this41), "statement", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(StatementContext);
      } else {
        return this.getTypedRuleContext(StatementContext, i);
      }
    });

    _this41.parser = parser;
    _this41.ruleIndex = SolidityParser.RULE_block;
    return _this41;
  }

  _createClass(BlockContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterBlock(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitBlock(this);
      }
    }
  }]);

  return BlockContext;
}(antlr4.ParserRuleContext);

var StatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon41) {
  _inherits(StatementContext, _antlr4$ParserRuleCon41);

  var _super42 = _createSuper(StatementContext);

  function StatementContext(parser, parent, invokingState) {
    var _this42;

    _classCallCheck(this, StatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this42 = _super42.call(this, parent, invokingState);
    _this42.parser = parser;
    _this42.ruleIndex = SolidityParser.RULE_statement;
    return _this42;
  }

  _createClass(StatementContext, [{
    key: "ifStatement",
    value: function ifStatement() {
      return this.getTypedRuleContext(IfStatementContext, 0);
    }
  }, {
    key: "tryStatement",
    value: function tryStatement() {
      return this.getTypedRuleContext(TryStatementContext, 0);
    }
  }, {
    key: "whileStatement",
    value: function whileStatement() {
      return this.getTypedRuleContext(WhileStatementContext, 0);
    }
  }, {
    key: "forStatement",
    value: function forStatement() {
      return this.getTypedRuleContext(ForStatementContext, 0);
    }
  }, {
    key: "block",
    value: function block() {
      return this.getTypedRuleContext(BlockContext, 0);
    }
  }, {
    key: "inlineAssemblyStatement",
    value: function inlineAssemblyStatement() {
      return this.getTypedRuleContext(InlineAssemblyStatementContext, 0);
    }
  }, {
    key: "doWhileStatement",
    value: function doWhileStatement() {
      return this.getTypedRuleContext(DoWhileStatementContext, 0);
    }
  }, {
    key: "continueStatement",
    value: function continueStatement() {
      return this.getTypedRuleContext(ContinueStatementContext, 0);
    }
  }, {
    key: "breakStatement",
    value: function breakStatement() {
      return this.getTypedRuleContext(BreakStatementContext, 0);
    }
  }, {
    key: "returnStatement",
    value: function returnStatement() {
      return this.getTypedRuleContext(ReturnStatementContext, 0);
    }
  }, {
    key: "throwStatement",
    value: function throwStatement() {
      return this.getTypedRuleContext(ThrowStatementContext, 0);
    }
  }, {
    key: "emitStatement",
    value: function emitStatement() {
      return this.getTypedRuleContext(EmitStatementContext, 0);
    }
  }, {
    key: "simpleStatement",
    value: function simpleStatement() {
      return this.getTypedRuleContext(SimpleStatementContext, 0);
    }
  }, {
    key: "uncheckedStatement",
    value: function uncheckedStatement() {
      return this.getTypedRuleContext(UncheckedStatementContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitStatement(this);
      }
    }
  }]);

  return StatementContext;
}(antlr4.ParserRuleContext);

var ExpressionStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon42) {
  _inherits(ExpressionStatementContext, _antlr4$ParserRuleCon42);

  var _super43 = _createSuper(ExpressionStatementContext);

  function ExpressionStatementContext(parser, parent, invokingState) {
    var _this43;

    _classCallCheck(this, ExpressionStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this43 = _super43.call(this, parent, invokingState);
    _this43.parser = parser;
    _this43.ruleIndex = SolidityParser.RULE_expressionStatement;
    return _this43;
  }

  _createClass(ExpressionStatementContext, [{
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterExpressionStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitExpressionStatement(this);
      }
    }
  }]);

  return ExpressionStatementContext;
}(antlr4.ParserRuleContext);

var IfStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon43) {
  _inherits(IfStatementContext, _antlr4$ParserRuleCon43);

  var _super44 = _createSuper(IfStatementContext);

  function IfStatementContext(parser, parent, invokingState) {
    var _this44;

    _classCallCheck(this, IfStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this44 = _super44.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this44), "statement", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(StatementContext);
      } else {
        return this.getTypedRuleContext(StatementContext, i);
      }
    });

    _this44.parser = parser;
    _this44.ruleIndex = SolidityParser.RULE_ifStatement;
    return _this44;
  }

  _createClass(IfStatementContext, [{
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterIfStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitIfStatement(this);
      }
    }
  }]);

  return IfStatementContext;
}(antlr4.ParserRuleContext);

var TryStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon44) {
  _inherits(TryStatementContext, _antlr4$ParserRuleCon44);

  var _super45 = _createSuper(TryStatementContext);

  function TryStatementContext(parser, parent, invokingState) {
    var _this45;

    _classCallCheck(this, TryStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this45 = _super45.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this45), "catchClause", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(CatchClauseContext);
      } else {
        return this.getTypedRuleContext(CatchClauseContext, i);
      }
    });

    _this45.parser = parser;
    _this45.ruleIndex = SolidityParser.RULE_tryStatement;
    return _this45;
  }

  _createClass(TryStatementContext, [{
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "block",
    value: function block() {
      return this.getTypedRuleContext(BlockContext, 0);
    }
  }, {
    key: "returnParameters",
    value: function returnParameters() {
      return this.getTypedRuleContext(ReturnParametersContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterTryStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitTryStatement(this);
      }
    }
  }]);

  return TryStatementContext;
}(antlr4.ParserRuleContext);

var CatchClauseContext = /*#__PURE__*/function (_antlr4$ParserRuleCon45) {
  _inherits(CatchClauseContext, _antlr4$ParserRuleCon45);

  var _super46 = _createSuper(CatchClauseContext);

  function CatchClauseContext(parser, parent, invokingState) {
    var _this46;

    _classCallCheck(this, CatchClauseContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this46 = _super46.call(this, parent, invokingState);
    _this46.parser = parser;
    _this46.ruleIndex = SolidityParser.RULE_catchClause;
    return _this46;
  }

  _createClass(CatchClauseContext, [{
    key: "block",
    value: function block() {
      return this.getTypedRuleContext(BlockContext, 0);
    }
  }, {
    key: "parameterList",
    value: function parameterList() {
      return this.getTypedRuleContext(ParameterListContext, 0);
    }
  }, {
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterCatchClause(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitCatchClause(this);
      }
    }
  }]);

  return CatchClauseContext;
}(antlr4.ParserRuleContext);

var WhileStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon46) {
  _inherits(WhileStatementContext, _antlr4$ParserRuleCon46);

  var _super47 = _createSuper(WhileStatementContext);

  function WhileStatementContext(parser, parent, invokingState) {
    var _this47;

    _classCallCheck(this, WhileStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this47 = _super47.call(this, parent, invokingState);
    _this47.parser = parser;
    _this47.ruleIndex = SolidityParser.RULE_whileStatement;
    return _this47;
  }

  _createClass(WhileStatementContext, [{
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "statement",
    value: function statement() {
      return this.getTypedRuleContext(StatementContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterWhileStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitWhileStatement(this);
      }
    }
  }]);

  return WhileStatementContext;
}(antlr4.ParserRuleContext);

var SimpleStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon47) {
  _inherits(SimpleStatementContext, _antlr4$ParserRuleCon47);

  var _super48 = _createSuper(SimpleStatementContext);

  function SimpleStatementContext(parser, parent, invokingState) {
    var _this48;

    _classCallCheck(this, SimpleStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this48 = _super48.call(this, parent, invokingState);
    _this48.parser = parser;
    _this48.ruleIndex = SolidityParser.RULE_simpleStatement;
    return _this48;
  }

  _createClass(SimpleStatementContext, [{
    key: "variableDeclarationStatement",
    value: function variableDeclarationStatement() {
      return this.getTypedRuleContext(VariableDeclarationStatementContext, 0);
    }
  }, {
    key: "expressionStatement",
    value: function expressionStatement() {
      return this.getTypedRuleContext(ExpressionStatementContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterSimpleStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitSimpleStatement(this);
      }
    }
  }]);

  return SimpleStatementContext;
}(antlr4.ParserRuleContext);

var UncheckedStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon48) {
  _inherits(UncheckedStatementContext, _antlr4$ParserRuleCon48);

  var _super49 = _createSuper(UncheckedStatementContext);

  function UncheckedStatementContext(parser, parent, invokingState) {
    var _this49;

    _classCallCheck(this, UncheckedStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this49 = _super49.call(this, parent, invokingState);
    _this49.parser = parser;
    _this49.ruleIndex = SolidityParser.RULE_uncheckedStatement;
    return _this49;
  }

  _createClass(UncheckedStatementContext, [{
    key: "block",
    value: function block() {
      return this.getTypedRuleContext(BlockContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterUncheckedStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitUncheckedStatement(this);
      }
    }
  }]);

  return UncheckedStatementContext;
}(antlr4.ParserRuleContext);

var ForStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon49) {
  _inherits(ForStatementContext, _antlr4$ParserRuleCon49);

  var _super50 = _createSuper(ForStatementContext);

  function ForStatementContext(parser, parent, invokingState) {
    var _this50;

    _classCallCheck(this, ForStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this50 = _super50.call(this, parent, invokingState);
    _this50.parser = parser;
    _this50.ruleIndex = SolidityParser.RULE_forStatement;
    return _this50;
  }

  _createClass(ForStatementContext, [{
    key: "statement",
    value: function statement() {
      return this.getTypedRuleContext(StatementContext, 0);
    }
  }, {
    key: "simpleStatement",
    value: function simpleStatement() {
      return this.getTypedRuleContext(SimpleStatementContext, 0);
    }
  }, {
    key: "expressionStatement",
    value: function expressionStatement() {
      return this.getTypedRuleContext(ExpressionStatementContext, 0);
    }
  }, {
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterForStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitForStatement(this);
      }
    }
  }]);

  return ForStatementContext;
}(antlr4.ParserRuleContext);

var InlineAssemblyStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon50) {
  _inherits(InlineAssemblyStatementContext, _antlr4$ParserRuleCon50);

  var _super51 = _createSuper(InlineAssemblyStatementContext);

  function InlineAssemblyStatementContext(parser, parent, invokingState) {
    var _this51;

    _classCallCheck(this, InlineAssemblyStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this51 = _super51.call(this, parent, invokingState);
    _this51.parser = parser;
    _this51.ruleIndex = SolidityParser.RULE_inlineAssemblyStatement;
    return _this51;
  }

  _createClass(InlineAssemblyStatementContext, [{
    key: "assemblyBlock",
    value: function assemblyBlock() {
      return this.getTypedRuleContext(AssemblyBlockContext, 0);
    }
  }, {
    key: "StringLiteralFragment",
    value: function StringLiteralFragment() {
      return this.getToken(SolidityParser.StringLiteralFragment, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterInlineAssemblyStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitInlineAssemblyStatement(this);
      }
    }
  }]);

  return InlineAssemblyStatementContext;
}(antlr4.ParserRuleContext);

var DoWhileStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon51) {
  _inherits(DoWhileStatementContext, _antlr4$ParserRuleCon51);

  var _super52 = _createSuper(DoWhileStatementContext);

  function DoWhileStatementContext(parser, parent, invokingState) {
    var _this52;

    _classCallCheck(this, DoWhileStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this52 = _super52.call(this, parent, invokingState);
    _this52.parser = parser;
    _this52.ruleIndex = SolidityParser.RULE_doWhileStatement;
    return _this52;
  }

  _createClass(DoWhileStatementContext, [{
    key: "statement",
    value: function statement() {
      return this.getTypedRuleContext(StatementContext, 0);
    }
  }, {
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterDoWhileStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitDoWhileStatement(this);
      }
    }
  }]);

  return DoWhileStatementContext;
}(antlr4.ParserRuleContext);

var ContinueStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon52) {
  _inherits(ContinueStatementContext, _antlr4$ParserRuleCon52);

  var _super53 = _createSuper(ContinueStatementContext);

  function ContinueStatementContext(parser, parent, invokingState) {
    var _this53;

    _classCallCheck(this, ContinueStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this53 = _super53.call(this, parent, invokingState);
    _this53.parser = parser;
    _this53.ruleIndex = SolidityParser.RULE_continueStatement;
    return _this53;
  }

  _createClass(ContinueStatementContext, [{
    key: "ContinueKeyword",
    value: function ContinueKeyword() {
      return this.getToken(SolidityParser.ContinueKeyword, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterContinueStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitContinueStatement(this);
      }
    }
  }]);

  return ContinueStatementContext;
}(antlr4.ParserRuleContext);

var BreakStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon53) {
  _inherits(BreakStatementContext, _antlr4$ParserRuleCon53);

  var _super54 = _createSuper(BreakStatementContext);

  function BreakStatementContext(parser, parent, invokingState) {
    var _this54;

    _classCallCheck(this, BreakStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this54 = _super54.call(this, parent, invokingState);
    _this54.parser = parser;
    _this54.ruleIndex = SolidityParser.RULE_breakStatement;
    return _this54;
  }

  _createClass(BreakStatementContext, [{
    key: "BreakKeyword",
    value: function BreakKeyword() {
      return this.getToken(SolidityParser.BreakKeyword, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterBreakStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitBreakStatement(this);
      }
    }
  }]);

  return BreakStatementContext;
}(antlr4.ParserRuleContext);

var ReturnStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon54) {
  _inherits(ReturnStatementContext, _antlr4$ParserRuleCon54);

  var _super55 = _createSuper(ReturnStatementContext);

  function ReturnStatementContext(parser, parent, invokingState) {
    var _this55;

    _classCallCheck(this, ReturnStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this55 = _super55.call(this, parent, invokingState);
    _this55.parser = parser;
    _this55.ruleIndex = SolidityParser.RULE_returnStatement;
    return _this55;
  }

  _createClass(ReturnStatementContext, [{
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterReturnStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitReturnStatement(this);
      }
    }
  }]);

  return ReturnStatementContext;
}(antlr4.ParserRuleContext);

var ThrowStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon55) {
  _inherits(ThrowStatementContext, _antlr4$ParserRuleCon55);

  var _super56 = _createSuper(ThrowStatementContext);

  function ThrowStatementContext(parser, parent, invokingState) {
    var _this56;

    _classCallCheck(this, ThrowStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this56 = _super56.call(this, parent, invokingState);
    _this56.parser = parser;
    _this56.ruleIndex = SolidityParser.RULE_throwStatement;
    return _this56;
  }

  _createClass(ThrowStatementContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterThrowStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitThrowStatement(this);
      }
    }
  }]);

  return ThrowStatementContext;
}(antlr4.ParserRuleContext);

var EmitStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon56) {
  _inherits(EmitStatementContext, _antlr4$ParserRuleCon56);

  var _super57 = _createSuper(EmitStatementContext);

  function EmitStatementContext(parser, parent, invokingState) {
    var _this57;

    _classCallCheck(this, EmitStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this57 = _super57.call(this, parent, invokingState);
    _this57.parser = parser;
    _this57.ruleIndex = SolidityParser.RULE_emitStatement;
    return _this57;
  }

  _createClass(EmitStatementContext, [{
    key: "functionCall",
    value: function functionCall() {
      return this.getTypedRuleContext(FunctionCallContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterEmitStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitEmitStatement(this);
      }
    }
  }]);

  return EmitStatementContext;
}(antlr4.ParserRuleContext);

var VariableDeclarationStatementContext = /*#__PURE__*/function (_antlr4$ParserRuleCon57) {
  _inherits(VariableDeclarationStatementContext, _antlr4$ParserRuleCon57);

  var _super58 = _createSuper(VariableDeclarationStatementContext);

  function VariableDeclarationStatementContext(parser, parent, invokingState) {
    var _this58;

    _classCallCheck(this, VariableDeclarationStatementContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this58 = _super58.call(this, parent, invokingState);
    _this58.parser = parser;
    _this58.ruleIndex = SolidityParser.RULE_variableDeclarationStatement;
    return _this58;
  }

  _createClass(VariableDeclarationStatementContext, [{
    key: "identifierList",
    value: function identifierList() {
      return this.getTypedRuleContext(IdentifierListContext, 0);
    }
  }, {
    key: "variableDeclaration",
    value: function variableDeclaration() {
      return this.getTypedRuleContext(VariableDeclarationContext, 0);
    }
  }, {
    key: "variableDeclarationList",
    value: function variableDeclarationList() {
      return this.getTypedRuleContext(VariableDeclarationListContext, 0);
    }
  }, {
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterVariableDeclarationStatement(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitVariableDeclarationStatement(this);
      }
    }
  }]);

  return VariableDeclarationStatementContext;
}(antlr4.ParserRuleContext);

var VariableDeclarationListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon58) {
  _inherits(VariableDeclarationListContext, _antlr4$ParserRuleCon58);

  var _super59 = _createSuper(VariableDeclarationListContext);

  function VariableDeclarationListContext(parser, parent, invokingState) {
    var _this59;

    _classCallCheck(this, VariableDeclarationListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this59 = _super59.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this59), "variableDeclaration", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(VariableDeclarationContext);
      } else {
        return this.getTypedRuleContext(VariableDeclarationContext, i);
      }
    });

    _this59.parser = parser;
    _this59.ruleIndex = SolidityParser.RULE_variableDeclarationList;
    return _this59;
  }

  _createClass(VariableDeclarationListContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterVariableDeclarationList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitVariableDeclarationList(this);
      }
    }
  }]);

  return VariableDeclarationListContext;
}(antlr4.ParserRuleContext);

var IdentifierListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon59) {
  _inherits(IdentifierListContext, _antlr4$ParserRuleCon59);

  var _super60 = _createSuper(IdentifierListContext);

  function IdentifierListContext(parser, parent, invokingState) {
    var _this60;

    _classCallCheck(this, IdentifierListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this60 = _super60.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this60), "identifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(IdentifierContext);
      } else {
        return this.getTypedRuleContext(IdentifierContext, i);
      }
    });

    _this60.parser = parser;
    _this60.ruleIndex = SolidityParser.RULE_identifierList;
    return _this60;
  }

  _createClass(IdentifierListContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterIdentifierList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitIdentifierList(this);
      }
    }
  }]);

  return IdentifierListContext;
}(antlr4.ParserRuleContext);

var ElementaryTypeNameContext = /*#__PURE__*/function (_antlr4$ParserRuleCon60) {
  _inherits(ElementaryTypeNameContext, _antlr4$ParserRuleCon60);

  var _super61 = _createSuper(ElementaryTypeNameContext);

  function ElementaryTypeNameContext(parser, parent, invokingState) {
    var _this61;

    _classCallCheck(this, ElementaryTypeNameContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this61 = _super61.call(this, parent, invokingState);
    _this61.parser = parser;
    _this61.ruleIndex = SolidityParser.RULE_elementaryTypeName;
    return _this61;
  }

  _createClass(ElementaryTypeNameContext, [{
    key: "Int",
    value: function Int() {
      return this.getToken(SolidityParser.Int, 0);
    }
  }, {
    key: "Uint",
    value: function Uint() {
      return this.getToken(SolidityParser.Uint, 0);
    }
  }, {
    key: "Byte",
    value: function Byte() {
      return this.getToken(SolidityParser.Byte, 0);
    }
  }, {
    key: "Fixed",
    value: function Fixed() {
      return this.getToken(SolidityParser.Fixed, 0);
    }
  }, {
    key: "Ufixed",
    value: function Ufixed() {
      return this.getToken(SolidityParser.Ufixed, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterElementaryTypeName(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitElementaryTypeName(this);
      }
    }
  }]);

  return ElementaryTypeNameContext;
}(antlr4.ParserRuleContext);

var ExpressionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon61) {
  _inherits(ExpressionContext, _antlr4$ParserRuleCon61);

  var _super62 = _createSuper(ExpressionContext);

  function ExpressionContext(parser, parent, invokingState) {
    var _this62;

    _classCallCheck(this, ExpressionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this62 = _super62.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this62), "expression", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(ExpressionContext);
      } else {
        return this.getTypedRuleContext(ExpressionContext, i);
      }
    });

    _this62.parser = parser;
    _this62.ruleIndex = SolidityParser.RULE_expression;
    return _this62;
  }

  _createClass(ExpressionContext, [{
    key: "typeName",
    value: function typeName() {
      return this.getTypedRuleContext(TypeNameContext, 0);
    }
  }, {
    key: "primaryExpression",
    value: function primaryExpression() {
      return this.getTypedRuleContext(PrimaryExpressionContext, 0);
    }
  }, {
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "nameValueList",
    value: function nameValueList() {
      return this.getTypedRuleContext(NameValueListContext, 0);
    }
  }, {
    key: "functionCallArguments",
    value: function functionCallArguments() {
      return this.getTypedRuleContext(FunctionCallArgumentsContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterExpression(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitExpression(this);
      }
    }
  }]);

  return ExpressionContext;
}(antlr4.ParserRuleContext);

var PrimaryExpressionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon62) {
  _inherits(PrimaryExpressionContext, _antlr4$ParserRuleCon62);

  var _super63 = _createSuper(PrimaryExpressionContext);

  function PrimaryExpressionContext(parser, parent, invokingState) {
    var _this63;

    _classCallCheck(this, PrimaryExpressionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this63 = _super63.call(this, parent, invokingState);
    _this63.parser = parser;
    _this63.ruleIndex = SolidityParser.RULE_primaryExpression;
    return _this63;
  }

  _createClass(PrimaryExpressionContext, [{
    key: "BooleanLiteral",
    value: function BooleanLiteral() {
      return this.getToken(SolidityParser.BooleanLiteral, 0);
    }
  }, {
    key: "numberLiteral",
    value: function numberLiteral() {
      return this.getTypedRuleContext(NumberLiteralContext, 0);
    }
  }, {
    key: "hexLiteral",
    value: function hexLiteral() {
      return this.getTypedRuleContext(HexLiteralContext, 0);
    }
  }, {
    key: "stringLiteral",
    value: function stringLiteral() {
      return this.getTypedRuleContext(StringLiteralContext, 0);
    }
  }, {
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "TypeKeyword",
    value: function TypeKeyword() {
      return this.getToken(SolidityParser.TypeKeyword, 0);
    }
  }, {
    key: "PayableKeyword",
    value: function PayableKeyword() {
      return this.getToken(SolidityParser.PayableKeyword, 0);
    }
  }, {
    key: "tupleExpression",
    value: function tupleExpression() {
      return this.getTypedRuleContext(TupleExpressionContext, 0);
    }
  }, {
    key: "typeNameExpression",
    value: function typeNameExpression() {
      return this.getTypedRuleContext(TypeNameExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterPrimaryExpression(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitPrimaryExpression(this);
      }
    }
  }]);

  return PrimaryExpressionContext;
}(antlr4.ParserRuleContext);

var ExpressionListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon63) {
  _inherits(ExpressionListContext, _antlr4$ParserRuleCon63);

  var _super64 = _createSuper(ExpressionListContext);

  function ExpressionListContext(parser, parent, invokingState) {
    var _this64;

    _classCallCheck(this, ExpressionListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this64 = _super64.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this64), "expression", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(ExpressionContext);
      } else {
        return this.getTypedRuleContext(ExpressionContext, i);
      }
    });

    _this64.parser = parser;
    _this64.ruleIndex = SolidityParser.RULE_expressionList;
    return _this64;
  }

  _createClass(ExpressionListContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterExpressionList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitExpressionList(this);
      }
    }
  }]);

  return ExpressionListContext;
}(antlr4.ParserRuleContext);

var NameValueListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon64) {
  _inherits(NameValueListContext, _antlr4$ParserRuleCon64);

  var _super65 = _createSuper(NameValueListContext);

  function NameValueListContext(parser, parent, invokingState) {
    var _this65;

    _classCallCheck(this, NameValueListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this65 = _super65.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this65), "nameValue", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(NameValueContext);
      } else {
        return this.getTypedRuleContext(NameValueContext, i);
      }
    });

    _this65.parser = parser;
    _this65.ruleIndex = SolidityParser.RULE_nameValueList;
    return _this65;
  }

  _createClass(NameValueListContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterNameValueList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitNameValueList(this);
      }
    }
  }]);

  return NameValueListContext;
}(antlr4.ParserRuleContext);

var NameValueContext = /*#__PURE__*/function (_antlr4$ParserRuleCon65) {
  _inherits(NameValueContext, _antlr4$ParserRuleCon65);

  var _super66 = _createSuper(NameValueContext);

  function NameValueContext(parser, parent, invokingState) {
    var _this66;

    _classCallCheck(this, NameValueContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this66 = _super66.call(this, parent, invokingState);
    _this66.parser = parser;
    _this66.ruleIndex = SolidityParser.RULE_nameValue;
    return _this66;
  }

  _createClass(NameValueContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterNameValue(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitNameValue(this);
      }
    }
  }]);

  return NameValueContext;
}(antlr4.ParserRuleContext);

var FunctionCallArgumentsContext = /*#__PURE__*/function (_antlr4$ParserRuleCon66) {
  _inherits(FunctionCallArgumentsContext, _antlr4$ParserRuleCon66);

  var _super67 = _createSuper(FunctionCallArgumentsContext);

  function FunctionCallArgumentsContext(parser, parent, invokingState) {
    var _this67;

    _classCallCheck(this, FunctionCallArgumentsContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this67 = _super67.call(this, parent, invokingState);
    _this67.parser = parser;
    _this67.ruleIndex = SolidityParser.RULE_functionCallArguments;
    return _this67;
  }

  _createClass(FunctionCallArgumentsContext, [{
    key: "nameValueList",
    value: function nameValueList() {
      return this.getTypedRuleContext(NameValueListContext, 0);
    }
  }, {
    key: "expressionList",
    value: function expressionList() {
      return this.getTypedRuleContext(ExpressionListContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterFunctionCallArguments(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitFunctionCallArguments(this);
      }
    }
  }]);

  return FunctionCallArgumentsContext;
}(antlr4.ParserRuleContext);

var FunctionCallContext = /*#__PURE__*/function (_antlr4$ParserRuleCon67) {
  _inherits(FunctionCallContext, _antlr4$ParserRuleCon67);

  var _super68 = _createSuper(FunctionCallContext);

  function FunctionCallContext(parser, parent, invokingState) {
    var _this68;

    _classCallCheck(this, FunctionCallContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this68 = _super68.call(this, parent, invokingState);
    _this68.parser = parser;
    _this68.ruleIndex = SolidityParser.RULE_functionCall;
    return _this68;
  }

  _createClass(FunctionCallContext, [{
    key: "expression",
    value: function expression() {
      return this.getTypedRuleContext(ExpressionContext, 0);
    }
  }, {
    key: "functionCallArguments",
    value: function functionCallArguments() {
      return this.getTypedRuleContext(FunctionCallArgumentsContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterFunctionCall(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitFunctionCall(this);
      }
    }
  }]);

  return FunctionCallContext;
}(antlr4.ParserRuleContext);

var AssemblyBlockContext = /*#__PURE__*/function (_antlr4$ParserRuleCon68) {
  _inherits(AssemblyBlockContext, _antlr4$ParserRuleCon68);

  var _super69 = _createSuper(AssemblyBlockContext);

  function AssemblyBlockContext(parser, parent, invokingState) {
    var _this69;

    _classCallCheck(this, AssemblyBlockContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this69 = _super69.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this69), "assemblyItem", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(AssemblyItemContext);
      } else {
        return this.getTypedRuleContext(AssemblyItemContext, i);
      }
    });

    _this69.parser = parser;
    _this69.ruleIndex = SolidityParser.RULE_assemblyBlock;
    return _this69;
  }

  _createClass(AssemblyBlockContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyBlock(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyBlock(this);
      }
    }
  }]);

  return AssemblyBlockContext;
}(antlr4.ParserRuleContext);

var AssemblyItemContext = /*#__PURE__*/function (_antlr4$ParserRuleCon69) {
  _inherits(AssemblyItemContext, _antlr4$ParserRuleCon69);

  var _super70 = _createSuper(AssemblyItemContext);

  function AssemblyItemContext(parser, parent, invokingState) {
    var _this70;

    _classCallCheck(this, AssemblyItemContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this70 = _super70.call(this, parent, invokingState);
    _this70.parser = parser;
    _this70.ruleIndex = SolidityParser.RULE_assemblyItem;
    return _this70;
  }

  _createClass(AssemblyItemContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "assemblyBlock",
    value: function assemblyBlock() {
      return this.getTypedRuleContext(AssemblyBlockContext, 0);
    }
  }, {
    key: "assemblyExpression",
    value: function assemblyExpression() {
      return this.getTypedRuleContext(AssemblyExpressionContext, 0);
    }
  }, {
    key: "assemblyLocalDefinition",
    value: function assemblyLocalDefinition() {
      return this.getTypedRuleContext(AssemblyLocalDefinitionContext, 0);
    }
  }, {
    key: "assemblyAssignment",
    value: function assemblyAssignment() {
      return this.getTypedRuleContext(AssemblyAssignmentContext, 0);
    }
  }, {
    key: "assemblyStackAssignment",
    value: function assemblyStackAssignment() {
      return this.getTypedRuleContext(AssemblyStackAssignmentContext, 0);
    }
  }, {
    key: "labelDefinition",
    value: function labelDefinition() {
      return this.getTypedRuleContext(LabelDefinitionContext, 0);
    }
  }, {
    key: "assemblySwitch",
    value: function assemblySwitch() {
      return this.getTypedRuleContext(AssemblySwitchContext, 0);
    }
  }, {
    key: "assemblyFunctionDefinition",
    value: function assemblyFunctionDefinition() {
      return this.getTypedRuleContext(AssemblyFunctionDefinitionContext, 0);
    }
  }, {
    key: "assemblyFor",
    value: function assemblyFor() {
      return this.getTypedRuleContext(AssemblyForContext, 0);
    }
  }, {
    key: "assemblyIf",
    value: function assemblyIf() {
      return this.getTypedRuleContext(AssemblyIfContext, 0);
    }
  }, {
    key: "BreakKeyword",
    value: function BreakKeyword() {
      return this.getToken(SolidityParser.BreakKeyword, 0);
    }
  }, {
    key: "ContinueKeyword",
    value: function ContinueKeyword() {
      return this.getToken(SolidityParser.ContinueKeyword, 0);
    }
  }, {
    key: "LeaveKeyword",
    value: function LeaveKeyword() {
      return this.getToken(SolidityParser.LeaveKeyword, 0);
    }
  }, {
    key: "subAssembly",
    value: function subAssembly() {
      return this.getTypedRuleContext(SubAssemblyContext, 0);
    }
  }, {
    key: "numberLiteral",
    value: function numberLiteral() {
      return this.getTypedRuleContext(NumberLiteralContext, 0);
    }
  }, {
    key: "stringLiteral",
    value: function stringLiteral() {
      return this.getTypedRuleContext(StringLiteralContext, 0);
    }
  }, {
    key: "hexLiteral",
    value: function hexLiteral() {
      return this.getTypedRuleContext(HexLiteralContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyItem(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyItem(this);
      }
    }
  }]);

  return AssemblyItemContext;
}(antlr4.ParserRuleContext);

var AssemblyExpressionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon70) {
  _inherits(AssemblyExpressionContext, _antlr4$ParserRuleCon70);

  var _super71 = _createSuper(AssemblyExpressionContext);

  function AssemblyExpressionContext(parser, parent, invokingState) {
    var _this71;

    _classCallCheck(this, AssemblyExpressionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this71 = _super71.call(this, parent, invokingState);
    _this71.parser = parser;
    _this71.ruleIndex = SolidityParser.RULE_assemblyExpression;
    return _this71;
  }

  _createClass(AssemblyExpressionContext, [{
    key: "assemblyCall",
    value: function assemblyCall() {
      return this.getTypedRuleContext(AssemblyCallContext, 0);
    }
  }, {
    key: "assemblyLiteral",
    value: function assemblyLiteral() {
      return this.getTypedRuleContext(AssemblyLiteralContext, 0);
    }
  }, {
    key: "assemblyMember",
    value: function assemblyMember() {
      return this.getTypedRuleContext(AssemblyMemberContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyExpression(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyExpression(this);
      }
    }
  }]);

  return AssemblyExpressionContext;
}(antlr4.ParserRuleContext);

var AssemblyMemberContext = /*#__PURE__*/function (_antlr4$ParserRuleCon71) {
  _inherits(AssemblyMemberContext, _antlr4$ParserRuleCon71);

  var _super72 = _createSuper(AssemblyMemberContext);

  function AssemblyMemberContext(parser, parent, invokingState) {
    var _this72;

    _classCallCheck(this, AssemblyMemberContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this72 = _super72.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this72), "identifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(IdentifierContext);
      } else {
        return this.getTypedRuleContext(IdentifierContext, i);
      }
    });

    _this72.parser = parser;
    _this72.ruleIndex = SolidityParser.RULE_assemblyMember;
    return _this72;
  }

  _createClass(AssemblyMemberContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyMember(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyMember(this);
      }
    }
  }]);

  return AssemblyMemberContext;
}(antlr4.ParserRuleContext);

var AssemblyCallContext = /*#__PURE__*/function (_antlr4$ParserRuleCon72) {
  _inherits(AssemblyCallContext, _antlr4$ParserRuleCon72);

  var _super73 = _createSuper(AssemblyCallContext);

  function AssemblyCallContext(parser, parent, invokingState) {
    var _this73;

    _classCallCheck(this, AssemblyCallContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this73 = _super73.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this73), "assemblyExpression", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(AssemblyExpressionContext);
      } else {
        return this.getTypedRuleContext(AssemblyExpressionContext, i);
      }
    });

    _this73.parser = parser;
    _this73.ruleIndex = SolidityParser.RULE_assemblyCall;
    return _this73;
  }

  _createClass(AssemblyCallContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyCall(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyCall(this);
      }
    }
  }]);

  return AssemblyCallContext;
}(antlr4.ParserRuleContext);

var AssemblyLocalDefinitionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon73) {
  _inherits(AssemblyLocalDefinitionContext, _antlr4$ParserRuleCon73);

  var _super74 = _createSuper(AssemblyLocalDefinitionContext);

  function AssemblyLocalDefinitionContext(parser, parent, invokingState) {
    var _this74;

    _classCallCheck(this, AssemblyLocalDefinitionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this74 = _super74.call(this, parent, invokingState);
    _this74.parser = parser;
    _this74.ruleIndex = SolidityParser.RULE_assemblyLocalDefinition;
    return _this74;
  }

  _createClass(AssemblyLocalDefinitionContext, [{
    key: "assemblyIdentifierOrList",
    value: function assemblyIdentifierOrList() {
      return this.getTypedRuleContext(AssemblyIdentifierOrListContext, 0);
    }
  }, {
    key: "assemblyExpression",
    value: function assemblyExpression() {
      return this.getTypedRuleContext(AssemblyExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyLocalDefinition(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyLocalDefinition(this);
      }
    }
  }]);

  return AssemblyLocalDefinitionContext;
}(antlr4.ParserRuleContext);

var AssemblyAssignmentContext = /*#__PURE__*/function (_antlr4$ParserRuleCon74) {
  _inherits(AssemblyAssignmentContext, _antlr4$ParserRuleCon74);

  var _super75 = _createSuper(AssemblyAssignmentContext);

  function AssemblyAssignmentContext(parser, parent, invokingState) {
    var _this75;

    _classCallCheck(this, AssemblyAssignmentContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this75 = _super75.call(this, parent, invokingState);
    _this75.parser = parser;
    _this75.ruleIndex = SolidityParser.RULE_assemblyAssignment;
    return _this75;
  }

  _createClass(AssemblyAssignmentContext, [{
    key: "assemblyIdentifierOrList",
    value: function assemblyIdentifierOrList() {
      return this.getTypedRuleContext(AssemblyIdentifierOrListContext, 0);
    }
  }, {
    key: "assemblyExpression",
    value: function assemblyExpression() {
      return this.getTypedRuleContext(AssemblyExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyAssignment(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyAssignment(this);
      }
    }
  }]);

  return AssemblyAssignmentContext;
}(antlr4.ParserRuleContext);

var AssemblyIdentifierOrListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon75) {
  _inherits(AssemblyIdentifierOrListContext, _antlr4$ParserRuleCon75);

  var _super76 = _createSuper(AssemblyIdentifierOrListContext);

  function AssemblyIdentifierOrListContext(parser, parent, invokingState) {
    var _this76;

    _classCallCheck(this, AssemblyIdentifierOrListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this76 = _super76.call(this, parent, invokingState);
    _this76.parser = parser;
    _this76.ruleIndex = SolidityParser.RULE_assemblyIdentifierOrList;
    return _this76;
  }

  _createClass(AssemblyIdentifierOrListContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "assemblyMember",
    value: function assemblyMember() {
      return this.getTypedRuleContext(AssemblyMemberContext, 0);
    }
  }, {
    key: "assemblyIdentifierList",
    value: function assemblyIdentifierList() {
      return this.getTypedRuleContext(AssemblyIdentifierListContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyIdentifierOrList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyIdentifierOrList(this);
      }
    }
  }]);

  return AssemblyIdentifierOrListContext;
}(antlr4.ParserRuleContext);

var AssemblyIdentifierListContext = /*#__PURE__*/function (_antlr4$ParserRuleCon76) {
  _inherits(AssemblyIdentifierListContext, _antlr4$ParserRuleCon76);

  var _super77 = _createSuper(AssemblyIdentifierListContext);

  function AssemblyIdentifierListContext(parser, parent, invokingState) {
    var _this77;

    _classCallCheck(this, AssemblyIdentifierListContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this77 = _super77.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this77), "identifier", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(IdentifierContext);
      } else {
        return this.getTypedRuleContext(IdentifierContext, i);
      }
    });

    _this77.parser = parser;
    _this77.ruleIndex = SolidityParser.RULE_assemblyIdentifierList;
    return _this77;
  }

  _createClass(AssemblyIdentifierListContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyIdentifierList(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyIdentifierList(this);
      }
    }
  }]);

  return AssemblyIdentifierListContext;
}(antlr4.ParserRuleContext);

var AssemblyStackAssignmentContext = /*#__PURE__*/function (_antlr4$ParserRuleCon77) {
  _inherits(AssemblyStackAssignmentContext, _antlr4$ParserRuleCon77);

  var _super78 = _createSuper(AssemblyStackAssignmentContext);

  function AssemblyStackAssignmentContext(parser, parent, invokingState) {
    var _this78;

    _classCallCheck(this, AssemblyStackAssignmentContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this78 = _super78.call(this, parent, invokingState);
    _this78.parser = parser;
    _this78.ruleIndex = SolidityParser.RULE_assemblyStackAssignment;
    return _this78;
  }

  _createClass(AssemblyStackAssignmentContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyStackAssignment(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyStackAssignment(this);
      }
    }
  }]);

  return AssemblyStackAssignmentContext;
}(antlr4.ParserRuleContext);

var LabelDefinitionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon78) {
  _inherits(LabelDefinitionContext, _antlr4$ParserRuleCon78);

  var _super79 = _createSuper(LabelDefinitionContext);

  function LabelDefinitionContext(parser, parent, invokingState) {
    var _this79;

    _classCallCheck(this, LabelDefinitionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this79 = _super79.call(this, parent, invokingState);
    _this79.parser = parser;
    _this79.ruleIndex = SolidityParser.RULE_labelDefinition;
    return _this79;
  }

  _createClass(LabelDefinitionContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterLabelDefinition(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitLabelDefinition(this);
      }
    }
  }]);

  return LabelDefinitionContext;
}(antlr4.ParserRuleContext);

var AssemblySwitchContext = /*#__PURE__*/function (_antlr4$ParserRuleCon79) {
  _inherits(AssemblySwitchContext, _antlr4$ParserRuleCon79);

  var _super80 = _createSuper(AssemblySwitchContext);

  function AssemblySwitchContext(parser, parent, invokingState) {
    var _this80;

    _classCallCheck(this, AssemblySwitchContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this80 = _super80.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this80), "assemblyCase", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(AssemblyCaseContext);
      } else {
        return this.getTypedRuleContext(AssemblyCaseContext, i);
      }
    });

    _this80.parser = parser;
    _this80.ruleIndex = SolidityParser.RULE_assemblySwitch;
    return _this80;
  }

  _createClass(AssemblySwitchContext, [{
    key: "assemblyExpression",
    value: function assemblyExpression() {
      return this.getTypedRuleContext(AssemblyExpressionContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblySwitch(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblySwitch(this);
      }
    }
  }]);

  return AssemblySwitchContext;
}(antlr4.ParserRuleContext);

var AssemblyCaseContext = /*#__PURE__*/function (_antlr4$ParserRuleCon80) {
  _inherits(AssemblyCaseContext, _antlr4$ParserRuleCon80);

  var _super81 = _createSuper(AssemblyCaseContext);

  function AssemblyCaseContext(parser, parent, invokingState) {
    var _this81;

    _classCallCheck(this, AssemblyCaseContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this81 = _super81.call(this, parent, invokingState);
    _this81.parser = parser;
    _this81.ruleIndex = SolidityParser.RULE_assemblyCase;
    return _this81;
  }

  _createClass(AssemblyCaseContext, [{
    key: "assemblyLiteral",
    value: function assemblyLiteral() {
      return this.getTypedRuleContext(AssemblyLiteralContext, 0);
    }
  }, {
    key: "assemblyBlock",
    value: function assemblyBlock() {
      return this.getTypedRuleContext(AssemblyBlockContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyCase(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyCase(this);
      }
    }
  }]);

  return AssemblyCaseContext;
}(antlr4.ParserRuleContext);

var AssemblyFunctionDefinitionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon81) {
  _inherits(AssemblyFunctionDefinitionContext, _antlr4$ParserRuleCon81);

  var _super82 = _createSuper(AssemblyFunctionDefinitionContext);

  function AssemblyFunctionDefinitionContext(parser, parent, invokingState) {
    var _this82;

    _classCallCheck(this, AssemblyFunctionDefinitionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this82 = _super82.call(this, parent, invokingState);
    _this82.parser = parser;
    _this82.ruleIndex = SolidityParser.RULE_assemblyFunctionDefinition;
    return _this82;
  }

  _createClass(AssemblyFunctionDefinitionContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "assemblyBlock",
    value: function assemblyBlock() {
      return this.getTypedRuleContext(AssemblyBlockContext, 0);
    }
  }, {
    key: "assemblyIdentifierList",
    value: function assemblyIdentifierList() {
      return this.getTypedRuleContext(AssemblyIdentifierListContext, 0);
    }
  }, {
    key: "assemblyFunctionReturns",
    value: function assemblyFunctionReturns() {
      return this.getTypedRuleContext(AssemblyFunctionReturnsContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyFunctionDefinition(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyFunctionDefinition(this);
      }
    }
  }]);

  return AssemblyFunctionDefinitionContext;
}(antlr4.ParserRuleContext);

var AssemblyFunctionReturnsContext = /*#__PURE__*/function (_antlr4$ParserRuleCon82) {
  _inherits(AssemblyFunctionReturnsContext, _antlr4$ParserRuleCon82);

  var _super83 = _createSuper(AssemblyFunctionReturnsContext);

  function AssemblyFunctionReturnsContext(parser, parent, invokingState) {
    var _this83;

    _classCallCheck(this, AssemblyFunctionReturnsContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this83 = _super83.call(this, parent, invokingState);
    _this83.parser = parser;
    _this83.ruleIndex = SolidityParser.RULE_assemblyFunctionReturns;
    return _this83;
  }

  _createClass(AssemblyFunctionReturnsContext, [{
    key: "assemblyIdentifierList",
    value: function assemblyIdentifierList() {
      return this.getTypedRuleContext(AssemblyIdentifierListContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyFunctionReturns(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyFunctionReturns(this);
      }
    }
  }]);

  return AssemblyFunctionReturnsContext;
}(antlr4.ParserRuleContext);

var AssemblyForContext = /*#__PURE__*/function (_antlr4$ParserRuleCon83) {
  _inherits(AssemblyForContext, _antlr4$ParserRuleCon83);

  var _super84 = _createSuper(AssemblyForContext);

  function AssemblyForContext(parser, parent, invokingState) {
    var _this84;

    _classCallCheck(this, AssemblyForContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this84 = _super84.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this84), "assemblyExpression", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(AssemblyExpressionContext);
      } else {
        return this.getTypedRuleContext(AssemblyExpressionContext, i);
      }
    });

    _defineProperty(_assertThisInitialized(_this84), "assemblyBlock", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(AssemblyBlockContext);
      } else {
        return this.getTypedRuleContext(AssemblyBlockContext, i);
      }
    });

    _this84.parser = parser;
    _this84.ruleIndex = SolidityParser.RULE_assemblyFor;
    return _this84;
  }

  _createClass(AssemblyForContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyFor(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyFor(this);
      }
    }
  }]);

  return AssemblyForContext;
}(antlr4.ParserRuleContext);

var AssemblyIfContext = /*#__PURE__*/function (_antlr4$ParserRuleCon84) {
  _inherits(AssemblyIfContext, _antlr4$ParserRuleCon84);

  var _super85 = _createSuper(AssemblyIfContext);

  function AssemblyIfContext(parser, parent, invokingState) {
    var _this85;

    _classCallCheck(this, AssemblyIfContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this85 = _super85.call(this, parent, invokingState);
    _this85.parser = parser;
    _this85.ruleIndex = SolidityParser.RULE_assemblyIf;
    return _this85;
  }

  _createClass(AssemblyIfContext, [{
    key: "assemblyExpression",
    value: function assemblyExpression() {
      return this.getTypedRuleContext(AssemblyExpressionContext, 0);
    }
  }, {
    key: "assemblyBlock",
    value: function assemblyBlock() {
      return this.getTypedRuleContext(AssemblyBlockContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyIf(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyIf(this);
      }
    }
  }]);

  return AssemblyIfContext;
}(antlr4.ParserRuleContext);

var AssemblyLiteralContext = /*#__PURE__*/function (_antlr4$ParserRuleCon85) {
  _inherits(AssemblyLiteralContext, _antlr4$ParserRuleCon85);

  var _super86 = _createSuper(AssemblyLiteralContext);

  function AssemblyLiteralContext(parser, parent, invokingState) {
    var _this86;

    _classCallCheck(this, AssemblyLiteralContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this86 = _super86.call(this, parent, invokingState);
    _this86.parser = parser;
    _this86.ruleIndex = SolidityParser.RULE_assemblyLiteral;
    return _this86;
  }

  _createClass(AssemblyLiteralContext, [{
    key: "stringLiteral",
    value: function stringLiteral() {
      return this.getTypedRuleContext(StringLiteralContext, 0);
    }
  }, {
    key: "DecimalNumber",
    value: function DecimalNumber() {
      return this.getToken(SolidityParser.DecimalNumber, 0);
    }
  }, {
    key: "HexNumber",
    value: function HexNumber() {
      return this.getToken(SolidityParser.HexNumber, 0);
    }
  }, {
    key: "hexLiteral",
    value: function hexLiteral() {
      return this.getTypedRuleContext(HexLiteralContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterAssemblyLiteral(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitAssemblyLiteral(this);
      }
    }
  }]);

  return AssemblyLiteralContext;
}(antlr4.ParserRuleContext);

var SubAssemblyContext = /*#__PURE__*/function (_antlr4$ParserRuleCon86) {
  _inherits(SubAssemblyContext, _antlr4$ParserRuleCon86);

  var _super87 = _createSuper(SubAssemblyContext);

  function SubAssemblyContext(parser, parent, invokingState) {
    var _this87;

    _classCallCheck(this, SubAssemblyContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this87 = _super87.call(this, parent, invokingState);
    _this87.parser = parser;
    _this87.ruleIndex = SolidityParser.RULE_subAssembly;
    return _this87;
  }

  _createClass(SubAssemblyContext, [{
    key: "identifier",
    value: function identifier() {
      return this.getTypedRuleContext(IdentifierContext, 0);
    }
  }, {
    key: "assemblyBlock",
    value: function assemblyBlock() {
      return this.getTypedRuleContext(AssemblyBlockContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterSubAssembly(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitSubAssembly(this);
      }
    }
  }]);

  return SubAssemblyContext;
}(antlr4.ParserRuleContext);

var TupleExpressionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon87) {
  _inherits(TupleExpressionContext, _antlr4$ParserRuleCon87);

  var _super88 = _createSuper(TupleExpressionContext);

  function TupleExpressionContext(parser, parent, invokingState) {
    var _this88;

    _classCallCheck(this, TupleExpressionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this88 = _super88.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this88), "expression", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(ExpressionContext);
      } else {
        return this.getTypedRuleContext(ExpressionContext, i);
      }
    });

    _this88.parser = parser;
    _this88.ruleIndex = SolidityParser.RULE_tupleExpression;
    return _this88;
  }

  _createClass(TupleExpressionContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterTupleExpression(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitTupleExpression(this);
      }
    }
  }]);

  return TupleExpressionContext;
}(antlr4.ParserRuleContext);

var TypeNameExpressionContext = /*#__PURE__*/function (_antlr4$ParserRuleCon88) {
  _inherits(TypeNameExpressionContext, _antlr4$ParserRuleCon88);

  var _super89 = _createSuper(TypeNameExpressionContext);

  function TypeNameExpressionContext(parser, parent, invokingState) {
    var _this89;

    _classCallCheck(this, TypeNameExpressionContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this89 = _super89.call(this, parent, invokingState);
    _this89.parser = parser;
    _this89.ruleIndex = SolidityParser.RULE_typeNameExpression;
    return _this89;
  }

  _createClass(TypeNameExpressionContext, [{
    key: "elementaryTypeName",
    value: function elementaryTypeName() {
      return this.getTypedRuleContext(ElementaryTypeNameContext, 0);
    }
  }, {
    key: "userDefinedTypeName",
    value: function userDefinedTypeName() {
      return this.getTypedRuleContext(UserDefinedTypeNameContext, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterTypeNameExpression(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitTypeNameExpression(this);
      }
    }
  }]);

  return TypeNameExpressionContext;
}(antlr4.ParserRuleContext);

var NumberLiteralContext = /*#__PURE__*/function (_antlr4$ParserRuleCon89) {
  _inherits(NumberLiteralContext, _antlr4$ParserRuleCon89);

  var _super90 = _createSuper(NumberLiteralContext);

  function NumberLiteralContext(parser, parent, invokingState) {
    var _this90;

    _classCallCheck(this, NumberLiteralContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this90 = _super90.call(this, parent, invokingState);
    _this90.parser = parser;
    _this90.ruleIndex = SolidityParser.RULE_numberLiteral;
    return _this90;
  }

  _createClass(NumberLiteralContext, [{
    key: "DecimalNumber",
    value: function DecimalNumber() {
      return this.getToken(SolidityParser.DecimalNumber, 0);
    }
  }, {
    key: "HexNumber",
    value: function HexNumber() {
      return this.getToken(SolidityParser.HexNumber, 0);
    }
  }, {
    key: "NumberUnit",
    value: function NumberUnit() {
      return this.getToken(SolidityParser.NumberUnit, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterNumberLiteral(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitNumberLiteral(this);
      }
    }
  }]);

  return NumberLiteralContext;
}(antlr4.ParserRuleContext);

var IdentifierContext = /*#__PURE__*/function (_antlr4$ParserRuleCon90) {
  _inherits(IdentifierContext, _antlr4$ParserRuleCon90);

  var _super91 = _createSuper(IdentifierContext);

  function IdentifierContext(parser, parent, invokingState) {
    var _this91;

    _classCallCheck(this, IdentifierContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this91 = _super91.call(this, parent, invokingState);
    _this91.parser = parser;
    _this91.ruleIndex = SolidityParser.RULE_identifier;
    return _this91;
  }

  _createClass(IdentifierContext, [{
    key: "ReceiveKeyword",
    value: function ReceiveKeyword() {
      return this.getToken(SolidityParser.ReceiveKeyword, 0);
    }
  }, {
    key: "PayableKeyword",
    value: function PayableKeyword() {
      return this.getToken(SolidityParser.PayableKeyword, 0);
    }
  }, {
    key: "LeaveKeyword",
    value: function LeaveKeyword() {
      return this.getToken(SolidityParser.LeaveKeyword, 0);
    }
  }, {
    key: "Identifier",
    value: function Identifier() {
      return this.getToken(SolidityParser.Identifier, 0);
    }
  }, {
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterIdentifier(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitIdentifier(this);
      }
    }
  }]);

  return IdentifierContext;
}(antlr4.ParserRuleContext);

var HexLiteralContext = /*#__PURE__*/function (_antlr4$ParserRuleCon91) {
  _inherits(HexLiteralContext, _antlr4$ParserRuleCon91);

  var _super92 = _createSuper(HexLiteralContext);

  function HexLiteralContext(parser, parent, invokingState) {
    var _this92;

    _classCallCheck(this, HexLiteralContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this92 = _super92.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this92), "HexLiteralFragment", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.HexLiteralFragment);
      } else {
        return this.getToken(SolidityParser.HexLiteralFragment, i);
      }
    });

    _this92.parser = parser;
    _this92.ruleIndex = SolidityParser.RULE_hexLiteral;
    return _this92;
  }

  _createClass(HexLiteralContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterHexLiteral(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitHexLiteral(this);
      }
    }
  }]);

  return HexLiteralContext;
}(antlr4.ParserRuleContext);

var OverrideSpecifierContext = /*#__PURE__*/function (_antlr4$ParserRuleCon92) {
  _inherits(OverrideSpecifierContext, _antlr4$ParserRuleCon92);

  var _super93 = _createSuper(OverrideSpecifierContext);

  function OverrideSpecifierContext(parser, parent, invokingState) {
    var _this93;

    _classCallCheck(this, OverrideSpecifierContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this93 = _super93.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this93), "userDefinedTypeName", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(UserDefinedTypeNameContext);
      } else {
        return this.getTypedRuleContext(UserDefinedTypeNameContext, i);
      }
    });

    _this93.parser = parser;
    _this93.ruleIndex = SolidityParser.RULE_overrideSpecifier;
    return _this93;
  }

  _createClass(OverrideSpecifierContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterOverrideSpecifier(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitOverrideSpecifier(this);
      }
    }
  }]);

  return OverrideSpecifierContext;
}(antlr4.ParserRuleContext);

var StringLiteralContext = /*#__PURE__*/function (_antlr4$ParserRuleCon93) {
  _inherits(StringLiteralContext, _antlr4$ParserRuleCon93);

  var _super94 = _createSuper(StringLiteralContext);

  function StringLiteralContext(parser, parent, invokingState) {
    var _this94;

    _classCallCheck(this, StringLiteralContext);

    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    _this94 = _super94.call(this, parent, invokingState);

    _defineProperty(_assertThisInitialized(_this94), "StringLiteralFragment", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(SolidityParser.StringLiteralFragment);
      } else {
        return this.getToken(SolidityParser.StringLiteralFragment, i);
      }
    });

    _this94.parser = parser;
    _this94.ruleIndex = SolidityParser.RULE_stringLiteral;
    return _this94;
  }

  _createClass(StringLiteralContext, [{
    key: "enterRule",
    value: function enterRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.enterStringLiteral(this);
      }
    }
  }, {
    key: "exitRule",
    value: function exitRule(listener) {
      if (listener instanceof SolidityListener) {
        listener.exitStringLiteral(this);
      }
    }
  }]);

  return StringLiteralContext;
}(antlr4.ParserRuleContext);

SolidityParser.SourceUnitContext = SourceUnitContext;
SolidityParser.PragmaDirectiveContext = PragmaDirectiveContext;
SolidityParser.PragmaNameContext = PragmaNameContext;
SolidityParser.PragmaValueContext = PragmaValueContext;
SolidityParser.VersionContext = VersionContext;
SolidityParser.VersionOperatorContext = VersionOperatorContext;
SolidityParser.VersionConstraintContext = VersionConstraintContext;
SolidityParser.ImportDeclarationContext = ImportDeclarationContext;
SolidityParser.ImportDirectiveContext = ImportDirectiveContext;
SolidityParser.ContractDefinitionContext = ContractDefinitionContext;
SolidityParser.InheritanceSpecifierContext = InheritanceSpecifierContext;
SolidityParser.ContractPartContext = ContractPartContext;
SolidityParser.StateVariableDeclarationContext = StateVariableDeclarationContext;
SolidityParser.FileLevelConstantContext = FileLevelConstantContext;
SolidityParser.UsingForDeclarationContext = UsingForDeclarationContext;
SolidityParser.StructDefinitionContext = StructDefinitionContext;
SolidityParser.ModifierDefinitionContext = ModifierDefinitionContext;
SolidityParser.ModifierInvocationContext = ModifierInvocationContext;
SolidityParser.FunctionDefinitionContext = FunctionDefinitionContext;
SolidityParser.FunctionDescriptorContext = FunctionDescriptorContext;
SolidityParser.ReturnParametersContext = ReturnParametersContext;
SolidityParser.ModifierListContext = ModifierListContext;
SolidityParser.EventDefinitionContext = EventDefinitionContext;
SolidityParser.EnumValueContext = EnumValueContext;
SolidityParser.EnumDefinitionContext = EnumDefinitionContext;
SolidityParser.ParameterListContext = ParameterListContext;
SolidityParser.ParameterContext = ParameterContext;
SolidityParser.EventParameterListContext = EventParameterListContext;
SolidityParser.EventParameterContext = EventParameterContext;
SolidityParser.FunctionTypeParameterListContext = FunctionTypeParameterListContext;
SolidityParser.FunctionTypeParameterContext = FunctionTypeParameterContext;
SolidityParser.VariableDeclarationContext = VariableDeclarationContext;
SolidityParser.TypeNameContext = TypeNameContext;
SolidityParser.UserDefinedTypeNameContext = UserDefinedTypeNameContext;
SolidityParser.MappingKeyContext = MappingKeyContext;
SolidityParser.MappingContext = MappingContext;
SolidityParser.FunctionTypeNameContext = FunctionTypeNameContext;
SolidityParser.StorageLocationContext = StorageLocationContext;
SolidityParser.StateMutabilityContext = StateMutabilityContext;
SolidityParser.BlockContext = BlockContext;
SolidityParser.StatementContext = StatementContext;
SolidityParser.ExpressionStatementContext = ExpressionStatementContext;
SolidityParser.IfStatementContext = IfStatementContext;
SolidityParser.TryStatementContext = TryStatementContext;
SolidityParser.CatchClauseContext = CatchClauseContext;
SolidityParser.WhileStatementContext = WhileStatementContext;
SolidityParser.SimpleStatementContext = SimpleStatementContext;
SolidityParser.UncheckedStatementContext = UncheckedStatementContext;
SolidityParser.ForStatementContext = ForStatementContext;
SolidityParser.InlineAssemblyStatementContext = InlineAssemblyStatementContext;
SolidityParser.DoWhileStatementContext = DoWhileStatementContext;
SolidityParser.ContinueStatementContext = ContinueStatementContext;
SolidityParser.BreakStatementContext = BreakStatementContext;
SolidityParser.ReturnStatementContext = ReturnStatementContext;
SolidityParser.ThrowStatementContext = ThrowStatementContext;
SolidityParser.EmitStatementContext = EmitStatementContext;
SolidityParser.VariableDeclarationStatementContext = VariableDeclarationStatementContext;
SolidityParser.VariableDeclarationListContext = VariableDeclarationListContext;
SolidityParser.IdentifierListContext = IdentifierListContext;
SolidityParser.ElementaryTypeNameContext = ElementaryTypeNameContext;
SolidityParser.ExpressionContext = ExpressionContext;
SolidityParser.PrimaryExpressionContext = PrimaryExpressionContext;
SolidityParser.ExpressionListContext = ExpressionListContext;
SolidityParser.NameValueListContext = NameValueListContext;
SolidityParser.NameValueContext = NameValueContext;
SolidityParser.FunctionCallArgumentsContext = FunctionCallArgumentsContext;
SolidityParser.FunctionCallContext = FunctionCallContext;
SolidityParser.AssemblyBlockContext = AssemblyBlockContext;
SolidityParser.AssemblyItemContext = AssemblyItemContext;
SolidityParser.AssemblyExpressionContext = AssemblyExpressionContext;
SolidityParser.AssemblyMemberContext = AssemblyMemberContext;
SolidityParser.AssemblyCallContext = AssemblyCallContext;
SolidityParser.AssemblyLocalDefinitionContext = AssemblyLocalDefinitionContext;
SolidityParser.AssemblyAssignmentContext = AssemblyAssignmentContext;
SolidityParser.AssemblyIdentifierOrListContext = AssemblyIdentifierOrListContext;
SolidityParser.AssemblyIdentifierListContext = AssemblyIdentifierListContext;
SolidityParser.AssemblyStackAssignmentContext = AssemblyStackAssignmentContext;
SolidityParser.LabelDefinitionContext = LabelDefinitionContext;
SolidityParser.AssemblySwitchContext = AssemblySwitchContext;
SolidityParser.AssemblyCaseContext = AssemblyCaseContext;
SolidityParser.AssemblyFunctionDefinitionContext = AssemblyFunctionDefinitionContext;
SolidityParser.AssemblyFunctionReturnsContext = AssemblyFunctionReturnsContext;
SolidityParser.AssemblyForContext = AssemblyForContext;
SolidityParser.AssemblyIfContext = AssemblyIfContext;
SolidityParser.AssemblyLiteralContext = AssemblyLiteralContext;
SolidityParser.SubAssemblyContext = SubAssemblyContext;
SolidityParser.TupleExpressionContext = TupleExpressionContext;
SolidityParser.TypeNameExpressionContext = TypeNameExpressionContext;
SolidityParser.NumberLiteralContext = NumberLiteralContext;
SolidityParser.IdentifierContext = IdentifierContext;
SolidityParser.HexLiteralContext = HexLiteralContext;
SolidityParser.OverrideSpecifierContext = OverrideSpecifierContext;
SolidityParser.StringLiteralContext = StringLiteralContext;

/* babel-plugin-inline-import './lib/Solidity.tokens' */
// This is an indirect file to import the tokens string
// It needs to be a js file so that tsc doesn't complain
var tokens = "T__0=1\nT__1=2\nT__2=3\nT__3=4\nT__4=5\nT__5=6\nT__6=7\nT__7=8\nT__8=9\nT__9=10\nT__10=11\nT__11=12\nT__12=13\nT__13=14\nT__14=15\nT__15=16\nT__16=17\nT__17=18\nT__18=19\nT__19=20\nT__20=21\nT__21=22\nT__22=23\nT__23=24\nT__24=25\nT__25=26\nT__26=27\nT__27=28\nT__28=29\nT__29=30\nT__30=31\nT__31=32\nT__32=33\nT__33=34\nT__34=35\nT__35=36\nT__36=37\nT__37=38\nT__38=39\nT__39=40\nT__40=41\nT__41=42\nT__42=43\nT__43=44\nT__44=45\nT__45=46\nT__46=47\nT__47=48\nT__48=49\nT__49=50\nT__50=51\nT__51=52\nT__52=53\nT__53=54\nT__54=55\nT__55=56\nT__56=57\nT__57=58\nT__58=59\nT__59=60\nT__60=61\nT__61=62\nT__62=63\nT__63=64\nT__64=65\nT__65=66\nT__66=67\nT__67=68\nT__68=69\nT__69=70\nT__70=71\nT__71=72\nT__72=73\nT__73=74\nT__74=75\nT__75=76\nT__76=77\nT__77=78\nT__78=79\nT__79=80\nT__80=81\nT__81=82\nT__82=83\nT__83=84\nT__84=85\nT__85=86\nT__86=87\nT__87=88\nT__88=89\nT__89=90\nT__90=91\nT__91=92\nT__92=93\nT__93=94\nT__94=95\nInt=96\nUint=97\nByte=98\nFixed=99\nUfixed=100\nBooleanLiteral=101\nDecimalNumber=102\nHexNumber=103\nNumberUnit=104\nHexLiteralFragment=105\nReservedKeyword=106\nAnonymousKeyword=107\nBreakKeyword=108\nConstantKeyword=109\nImmutableKeyword=110\nContinueKeyword=111\nLeaveKeyword=112\nExternalKeyword=113\nIndexedKeyword=114\nInternalKeyword=115\nPayableKeyword=116\nPrivateKeyword=117\nPublicKeyword=118\nVirtualKeyword=119\nPureKeyword=120\nTypeKeyword=121\nViewKeyword=122\nConstructorKeyword=123\nFallbackKeyword=124\nReceiveKeyword=125\nIdentifier=126\nStringLiteralFragment=127\nVersionLiteral=128\nWS=129\nCOMMENT=130\nLINE_COMMENT=131\n'pragma'=1\n';'=2\n'||'=3\n'^'=4\n'~'=5\n'>='=6\n'>'=7\n'<'=8\n'<='=9\n'='=10\n'as'=11\n'import'=12\n'*'=13\n'from'=14\n'{'=15\n','=16\n'}'=17\n'abstract'=18\n'contract'=19\n'interface'=20\n'library'=21\n'is'=22\n'('=23\n')'=24\n'using'=25\n'for'=26\n'struct'=27\n'modifier'=28\n'function'=29\n'returns'=30\n'event'=31\n'enum'=32\n'['=33\n']'=34\n'address'=35\n'.'=36\n'mapping'=37\n'=>'=38\n'memory'=39\n'storage'=40\n'calldata'=41\n'if'=42\n'else'=43\n'try'=44\n'catch'=45\n'while'=46\n'unchecked'=47\n'assembly'=48\n'do'=49\n'return'=50\n'throw'=51\n'emit'=52\n'var'=53\n'bool'=54\n'string'=55\n'byte'=56\n'++'=57\n'--'=58\n'new'=59\n':'=60\n'+'=61\n'-'=62\n'after'=63\n'delete'=64\n'!'=65\n'**'=66\n'/'=67\n'%'=68\n'<<'=69\n'>>'=70\n'&'=71\n'|'=72\n'=='=73\n'!='=74\n'&&'=75\n'?'=76\n'|='=77\n'^='=78\n'&='=79\n'<<='=80\n'>>='=81\n'+='=82\n'-='=83\n'*='=84\n'/='=85\n'%='=86\n'let'=87\n':='=88\n'=:'=89\n'switch'=90\n'case'=91\n'default'=92\n'->'=93\n'callback'=94\n'override'=95\n'anonymous'=107\n'break'=108\n'constant'=109\n'immutable'=110\n'continue'=111\n'leave'=112\n'external'=113\n'indexed'=114\n'internal'=115\n'payable'=116\n'private'=117\n'public'=118\n'virtual'=119\n'pure'=120\n'type'=121\n'view'=122\n'constructor'=123\n'fallback'=124\n'receive'=125\n";

var tokens$1 = tokens;
var TYPE_TOKENS = ['var', 'bool', 'address', 'string', 'Int', 'Uint', 'Byte', 'Fixed', 'UFixed'];

function rsplit(str, value) {
  var index = str.lastIndexOf(value);
  return [str.substring(0, index), str.substring(index + 1, str.length)];
}

function normalizeTokenType(value) {
  if (value.endsWith("'")) {
    value = value.substring(0, value.length - 1);
  }

  if (value.startsWith("'")) {
    value = value.substring(1, value.length);
  }

  return value;
}

function getTokenType(value) {
  if (value === 'Identifier' || value === 'from') {
    return 'Identifier';
  } else if (value === 'TrueLiteral' || value === 'FalseLiteral') {
    return 'Boolean';
  } else if (value === 'VersionLiteral') {
    return 'Version';
  } else if (value === 'StringLiteral') {
    return 'String';
  } else if (TYPE_TOKENS.includes(value)) {
    return 'Type';
  } else if (value === 'NumberUnit') {
    return 'Subdenomination';
  } else if (value === 'DecimalNumber') {
    return 'Numeric';
  } else if (value === 'HexLiteral') {
    return 'Hex';
  } else if (value === 'ReservedKeyword') {
    return 'Reserved';
  } else if (/^\W+$/.test(value)) {
    return 'Punctuator';
  } else {
    return 'Keyword';
  }
}

function getTokenTypeMap() {
  return tokens$1.split('\n').map(function (line) {
    return rsplit(line, '=');
  }).reduce(function (acum, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        value = _ref2[0],
        key = _ref2[1];

    acum[parseInt(key, 10)] = normalizeTokenType(value);
    return acum;
  }, {});
}

function buildTokenList(tokens, options) {
  var tokenTypes = getTokenTypeMap();
  var result = tokens.map(function (token) {
    var type = getTokenType(tokenTypes[token.type]);
    var node = {
      type: type,
      value: token.text
    };

    if (options.range === true) {
      node.range = [token.start, token.stop + 1];
    }

    if (options.loc === true) {
      node.loc = {
        start: {
          line: token.line,
          column: token.column
        },
        end: {
          line: token.line,
          column: token.column + token.text.length
        }
      };
    }

    return node;
  });
  return result;
}

function toText(ctx) {
  if (ctx !== null) {
    return ctx.getText();
  }

  return null;
}

function mapCommasToNulls(children) {
  if (children.length === 0) {
    return [];
  }

  var values = [];
  var comma = true;

  var _iterator = _createForOfIteratorHelper(children),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var el = _step.value;

      if (comma) {
        if (toText(el) === ',') {
          values.push(null);
        } else {
          values.push(el);
          comma = false;
        }
      } else {
        if (toText(el) !== ',') {
          throw new Error('expected comma');
        }

        comma = true;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  if (comma) {
    values.push(null);
  }

  return values;
}

function isBinOp(op) {
  var binOps = ['+', '-', '*', '/', '**', '%', '<<', '>>', '&&', '||', '&', '|', '^', '<', '>', '<=', '>=', '==', '!=', '=', '|=', '^=', '&=', '<<=', '>>=', '+=', '-=', '*=', '/=', '%='];
  return binOps.includes(op);
}

var transformAST = {
  SourceUnit: function SourceUnit(ctx) {
    // last element is EOF terminal node
    return {
      type: 'SourceUnit',
      children: this.visit(ctx.children.slice(0, -1))
    };
  },
  EnumDefinition: function EnumDefinition(ctx) {
    return {
      type: 'EnumDefinition',
      name: toText(ctx.identifier()),
      members: this.visit(ctx.enumValue())
    };
  },
  EnumValue: function EnumValue(ctx) {
    return {
      name: toText(ctx.identifier())
    };
  },
  UsingForDeclaration: function UsingForDeclaration(ctx) {
    var typeName = null;

    if (toText(ctx.getChild(3)) !== '*') {
      typeName = this.visit(ctx.getChild(3));
    }

    return {
      typeName: typeName,
      libraryName: toText(ctx.identifier())
    };
  },
  PragmaDirective: function PragmaDirective(ctx) {
    // this converts something like >= 0.5.0  <0.7.0
    // in >=0.5.0 <0.7.0
    var value = ctx.pragmaValue().children[0].children.map(function (x) {
      return toText(x);
    }).join(' ');
    return {
      name: toText(ctx.pragmaName()),
      value: value
    };
  },
  ContractDefinition: function ContractDefinition(ctx) {
    var name = toText(ctx.identifier());
    var kind = toText(ctx.getChild(0));
    this._currentContract = name;
    return {
      name: name,
      baseContracts: this.visit(ctx.inheritanceSpecifier()),
      subNodes: this.visit(ctx.contractPart()),
      kind: kind
    };
  },
  InheritanceSpecifier: function InheritanceSpecifier(ctx) {
    var exprList = ctx.expressionList();
    var args = exprList != null ? this.visit(exprList.expression()) : [];
    return {
      baseName: this.visit(ctx.userDefinedTypeName()),
      arguments: args
    };
  },
  ContractPart: function ContractPart(ctx) {
    return this.visit(ctx.children[0]);
  },
  FunctionDefinition: function FunctionDefinition(ctx) {
    var _this = this;

    var isConstructor = false;
    var isFallback = false;
    var isReceiveEther = false;
    var isVirtual = false;
    var name = null;
    var parameters = [];
    var returnParameters = null;
    var visibility = 'default';
    var block = null;

    if (ctx.block()) {
      block = this.visit(ctx.block());
    }

    var modifiers = ctx.modifierList().modifierInvocation().map(function (mod) {
      return _this.visit(mod);
    });
    var stateMutability = null;

    if (ctx.modifierList().stateMutability(0)) {
      stateMutability = toText(ctx.modifierList().stateMutability(0));
    } // see what type of function we're dealing with


    switch (toText(ctx.functionDescriptor().getChild(0))) {
      case 'constructor':
        parameters = this.visit(ctx.parameterList());

        if (ctx.returnParameters() && ctx.returnParameters().parameterList().parameter().length > 0) {
          throw new Error('Constructors cannot have return parameters');
        } // error out on incorrect function visibility


        if (ctx.modifierList().InternalKeyword(0)) {
          visibility = 'internal';
        } else if (ctx.modifierList().PublicKeyword(0)) {
          visibility = 'public';
        } else {
          visibility = 'default';
        }

        isConstructor = true;
        break;

      case 'fallback':
        if (ctx.parameterList().parameter().length > 0) {
          throw new Error('Fallback functions cannot have parameters');
        }

        if (ctx.returnParameters() && ctx.returnParameters().parameterList().parameter().length > 0) {
          throw new Error('Fallback functions cannot have return parameters');
        } // error out on incorrect function visibility


        if (!ctx.modifierList().ExternalKeyword(0)) {
          throw new Error('Fallback functions have to be declared "external"');
        }

        visibility = 'external';
        isFallback = true;
        break;

      case 'receive':
        if (ctx.parameterList().parameter().length > 0) {
          throw new Error('Receive Ether functions cannot have parameters');
        }

        if (ctx.returnParameters() && ctx.returnParameters().parameterList().parameter().length > 0) {
          throw new Error('Receive Ether functions cannot have return parameters');
        } // error out on incorrect function visibility


        if (!ctx.modifierList().ExternalKeyword(0)) {
          throw new Error('Receive Ether functions have to be declared "external"');
        }

        visibility = 'external'; // error out on incorrect function payability

        if (!ctx.modifierList().stateMutability(0) || !ctx.modifierList().stateMutability(0).PayableKeyword(0)) {
          throw new Error('Receive Ether functions have to be declared "payable"');
        }

        isReceiveEther = true;
        break;

      case 'function':
        name = ctx.functionDescriptor().identifier(0) ? toText(ctx.functionDescriptor().identifier(0)) : '';
        parameters = this.visit(ctx.parameterList());
        returnParameters = this.visit(ctx.returnParameters()); // parse function visibility

        if (ctx.modifierList().ExternalKeyword(0)) {
          visibility = 'external';
        } else if (ctx.modifierList().InternalKeyword(0)) {
          visibility = 'internal';
        } else if (ctx.modifierList().PublicKeyword(0)) {
          visibility = 'public';
        } else if (ctx.modifierList().PrivateKeyword(0)) {
          visibility = 'private';
        } // check if function is virtual


        if (ctx.modifierList().VirtualKeyword(0)) {
          isVirtual = true;
        }

        isConstructor = name === this._currentContract;
        isFallback = name === '';
        break;
    }

    var override;
    var overrideSpecifier = ctx.modifierList().overrideSpecifier();

    if (overrideSpecifier.length === 0) {
      override = null;
    } else {
      override = this.visit(overrideSpecifier[0].userDefinedTypeName());
    }

    return {
      name: name,
      parameters: parameters,
      returnParameters: returnParameters,
      body: block,
      visibility: visibility,
      modifiers: modifiers,
      override: override,
      isConstructor: isConstructor,
      isReceiveEther: isReceiveEther,
      isFallback: isFallback,
      isVirtual: isVirtual,
      stateMutability: stateMutability
    };
  },
  ModifierInvocation: function ModifierInvocation(ctx) {
    var exprList = ctx.expressionList();
    var args;

    if (exprList != null) {
      args = this.visit(exprList.expression());
    } else if (ctx.children.length > 1) {
      args = [];
    } else {
      args = null;
    }

    return {
      name: toText(ctx.identifier()),
      arguments: args
    };
  },
  TypeNameExpression: function TypeNameExpression(ctx) {
    var typeName = ctx.elementaryTypeName();

    if (!typeName) {
      typeName = ctx.userDefinedTypeName();
    }

    return {
      typeName: this.visit(typeName)
    };
  },
  TypeName: function TypeName(ctx) {
    if (ctx.children.length > 2) {
      var length = null;

      if (ctx.children.length === 4) {
        length = this.visit(ctx.getChild(2));
      }

      return {
        type: 'ArrayTypeName',
        baseTypeName: this.visit(ctx.typeName()),
        length: length
      };
    }

    if (ctx.children.length === 2) {
      return {
        type: 'ElementaryTypeName',
        name: toText(ctx.getChild(0)),
        stateMutability: toText(ctx.getChild(1))
      };
    }

    return this.visit(ctx.getChild(0));
  },
  FunctionTypeName: function FunctionTypeName(ctx) {
    var _this2 = this;

    var parameterTypes = ctx.functionTypeParameterList(0).functionTypeParameter().map(function (typeCtx) {
      return _this2.visit(typeCtx);
    });
    var returnTypes = [];

    if (ctx.functionTypeParameterList(1)) {
      returnTypes = ctx.functionTypeParameterList(1).functionTypeParameter().map(function (typeCtx) {
        return _this2.visit(typeCtx);
      });
    }

    var visibility = 'default';

    if (ctx.InternalKeyword(0)) {
      visibility = 'internal';
    } else if (ctx.ExternalKeyword(0)) {
      visibility = 'external';
    }

    var stateMutability = null;

    if (ctx.stateMutability(0)) {
      stateMutability = toText(ctx.stateMutability(0));
    }

    return {
      parameterTypes: parameterTypes,
      returnTypes: returnTypes,
      visibility: visibility,
      stateMutability: stateMutability
    };
  },
  ReturnStatement: function ReturnStatement(ctx) {
    var expression = null;

    if (ctx.expression()) {
      expression = this.visit(ctx.expression());
    }

    return {
      expression: expression
    };
  },
  EmitStatement: function EmitStatement(ctx) {
    return {
      eventCall: this.visit(ctx.functionCall())
    };
  },
  FunctionCall: function FunctionCall(ctx) {
    var _this3 = this;

    var args = [];
    var names = [];
    var ctxArgs = ctx.functionCallArguments();

    if (ctxArgs.expressionList()) {
      args = ctxArgs.expressionList().expression().map(function (exprCtx) {
        return _this3.visit(exprCtx);
      });
    } else if (ctxArgs.nameValueList()) {
      var _iterator2 = _createForOfIteratorHelper(ctxArgs.nameValueList().nameValue()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var nameValue = _step2.value;
          args.push(this.visit(nameValue.expression()));
          names.push(toText(nameValue.identifier()));
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    return {
      expression: this.visit(ctx.expression()),
      arguments: args,
      names: names
    };
  },
  StructDefinition: function StructDefinition(ctx) {
    return {
      name: toText(ctx.identifier()),
      members: this.visit(ctx.variableDeclaration())
    };
  },
  VariableDeclaration: function VariableDeclaration(ctx) {
    var storageLocation = null;

    if (ctx.storageLocation()) {
      storageLocation = toText(ctx.storageLocation());
    }

    return {
      typeName: this.visit(ctx.typeName()),
      name: toText(ctx.identifier()),
      storageLocation: storageLocation,
      isStateVar: false,
      isIndexed: false
    };
  },
  EventParameter: function EventParameter(ctx) {
    var storageLocation = null;

    if (ctx.storageLocation(0)) {
      storageLocation = toText(ctx.storageLocation(0));
    }

    return {
      type: 'VariableDeclaration',
      typeName: this.visit(ctx.typeName()),
      name: toText(ctx.identifier()),
      storageLocation: storageLocation,
      isStateVar: false,
      isIndexed: !!ctx.IndexedKeyword(0)
    };
  },
  FunctionTypeParameter: function FunctionTypeParameter(ctx) {
    var storageLocation = null;

    if (ctx.storageLocation()) {
      storageLocation = toText(ctx.storageLocation());
    }

    return {
      type: 'VariableDeclaration',
      typeName: this.visit(ctx.typeName()),
      name: null,
      storageLocation: storageLocation,
      isStateVar: false,
      isIndexed: false
    };
  },
  WhileStatement: function WhileStatement(ctx) {
    return {
      condition: this.visit(ctx.expression()),
      body: this.visit(ctx.statement())
    };
  },
  DoWhileStatement: function DoWhileStatement(ctx) {
    return {
      condition: this.visit(ctx.expression()),
      body: this.visit(ctx.statement())
    };
  },
  IfStatement: function IfStatement(ctx) {
    var trueBody = this.visit(ctx.statement(0));
    var falseBody = null;

    if (ctx.statement().length > 1) {
      falseBody = this.visit(ctx.statement(1));
    }

    return {
      condition: this.visit(ctx.expression()),
      trueBody: trueBody,
      falseBody: falseBody
    };
  },
  TryStatement: function TryStatement(ctx) {
    var _this4 = this;

    var returnParameters = null;

    if (ctx.returnParameters()) {
      returnParameters = this.visit(ctx.returnParameters());
    }

    var catchClauses = ctx.catchClause().map(function (exprCtx) {
      return _this4.visit(exprCtx);
    });
    return {
      expression: this.visit(ctx.expression()),
      returnParameters: returnParameters,
      body: this.visit(ctx.block()),
      catchClauses: catchClauses
    };
  },
  CatchClause: function CatchClause(ctx) {
    var parameters = null;

    if (ctx.parameterList()) {
      parameters = this.visit(ctx.parameterList());
    }

    if (ctx.identifier() && toText(ctx.identifier()) !== 'Error') {
      throw new Error('Expected "Error" identifier in catch clause');
    }

    return {
      isReasonStringType: !!ctx.identifier() && toText(ctx.identifier()) === 'Error',
      parameters: parameters,
      body: this.visit(ctx.block())
    };
  },
  UserDefinedTypeName: function UserDefinedTypeName(ctx) {
    return {
      namePath: toText(ctx)
    };
  },
  ElementaryTypeName: function ElementaryTypeName(ctx) {
    return {
      name: toText(ctx)
    };
  },
  Block: function Block(ctx) {
    return {
      statements: this.visit(ctx.statement())
    };
  },
  ExpressionStatement: function ExpressionStatement(ctx) {
    return {
      expression: this.visit(ctx.expression())
    };
  },
  NumberLiteral: function NumberLiteral(ctx) {
    var number = toText(ctx.getChild(0));
    var subdenomination = null;

    if (ctx.children.length === 2) {
      subdenomination = toText(ctx.getChild(1));
    }

    return {
      number: number,
      subdenomination: subdenomination
    };
  },
  MappingKey: function MappingKey(ctx) {
    if (ctx.elementaryTypeName()) {
      return this.visit(ctx.elementaryTypeName());
    } else if (ctx.userDefinedTypeName()) {
      return this.visit(ctx.userDefinedTypeName());
    } else {
      throw new Error('Expected MappingKey to have either ' + 'elementaryTypeName or userDefinedTypeName');
    }
  },
  Mapping: function Mapping(ctx) {
    return {
      keyType: this.visit(ctx.mappingKey()),
      valueType: this.visit(ctx.typeName())
    };
  },
  ModifierDefinition: function ModifierDefinition(ctx) {
    var parameters = null;

    if (ctx.parameterList()) {
      parameters = this.visit(ctx.parameterList());
    }

    var isVirtual = false;

    if (ctx.VirtualKeyword(0)) {
      isVirtual = true;
    }

    var override;
    var overrideSpecifier = ctx.overrideSpecifier();

    if (overrideSpecifier.length === 0) {
      override = null;
    } else {
      override = this.visit(overrideSpecifier[0].userDefinedTypeName());
    }

    return {
      name: toText(ctx.identifier()),
      parameters: parameters,
      body: this.visit(ctx.block()),
      isVirtual: isVirtual,
      override: override
    };
  },
  Statement: function Statement(ctx) {
    return this.visit(ctx.getChild(0));
  },
  SimpleStatement: function SimpleStatement(ctx) {
    return this.visit(ctx.getChild(0));
  },
  UncheckedStatement: function UncheckedStatement(ctx) {
    return {
      block: this.visit(ctx.block())
    };
  },
  Expression: function Expression(ctx) {
    var _this5 = this;

    var op;

    switch (ctx.children.length) {
      case 1:
        // primary expression
        return this.visit(ctx.getChild(0));

      case 2:
        op = toText(ctx.getChild(0)); // new expression

        if (op === 'new') {
          return {
            type: 'NewExpression',
            typeName: this.visit(ctx.typeName())
          };
        } // prefix operators


        if (['+', '-', '++', '--', '!', '~', 'after', 'delete'].includes(op)) {
          return {
            type: 'UnaryOperation',
            operator: op,
            subExpression: this.visit(ctx.getChild(1)),
            isPrefix: true
          };
        }

        op = toText(ctx.getChild(1)); // postfix operators

        if (['++', '--'].includes(op)) {
          return {
            type: 'UnaryOperation',
            operator: op,
            subExpression: this.visit(ctx.getChild(0)),
            isPrefix: false
          };
        }

        break;

      case 3:
        // treat parenthesis as no-op
        if (toText(ctx.getChild(0)) === '(' && toText(ctx.getChild(2)) === ')') {
          return {
            type: 'TupleExpression',
            components: [this.visit(ctx.getChild(1))],
            isArray: false
          };
        } // if square parenthesis are present it can only be
        // a typename expression


        if (toText(ctx.getChild(1)) === '[' && toText(ctx.getChild(2)) === ']') {
          return {
            type: 'TypeNameExpression',
            typeName: {
              type: 'ArrayTypeName',
              baseTypeName: this.visit(ctx.getChild(0)),
              length: null
            }
          };
        }

        op = toText(ctx.getChild(1)); // tuple separator

        if (op === ',') {
          return {
            type: 'TupleExpression',
            components: [this.visit(ctx.getChild(0)), this.visit(ctx.getChild(2))],
            isArray: false
          };
        } // member access


        if (op === '.') {
          return {
            type: 'MemberAccess',
            expression: this.visit(ctx.getChild(0)),
            memberName: toText(ctx.getChild(2))
          };
        }

        if (isBinOp(op)) {
          return {
            type: 'BinaryOperation',
            operator: op,
            left: this.visit(ctx.getChild(0)),
            right: this.visit(ctx.getChild(2))
          };
        }

        break;

      case 4:
        // function call
        if (toText(ctx.getChild(1)) === '(' && toText(ctx.getChild(3)) === ')') {
          var args = [];
          var names = [];
          var ctxArgs = ctx.functionCallArguments();

          if (ctxArgs.expressionList()) {
            args = ctxArgs.expressionList().expression().map(function (exprCtx) {
              return _this5.visit(exprCtx);
            });
          } else if (ctxArgs.nameValueList()) {
            var _iterator3 = _createForOfIteratorHelper(ctxArgs.nameValueList().nameValue()),
                _step3;

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var nameValue = _step3.value;
                args.push(this.visit(nameValue.expression()));
                names.push(toText(nameValue.identifier()));
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
          }

          return {
            type: 'FunctionCall',
            expression: this.visit(ctx.getChild(0)),
            arguments: args,
            names: names
          };
        } // index access


        if (toText(ctx.getChild(1)) === '[' && toText(ctx.getChild(3)) === ']') {
          return {
            type: 'IndexAccess',
            base: this.visit(ctx.getChild(0)),
            index: this.visit(ctx.getChild(2))
          };
        } // expression with nameValueList


        if (toText(ctx.getChild(1)) === '{' && toText(ctx.getChild(3)) === '}') {
          return {
            type: 'NameValueExpression',
            expression: this.visit(ctx.getChild(0)),
            arguments: this.visit(ctx.getChild(2))
          };
        }

        break;

      case 5:
        // ternary operator
        if (toText(ctx.getChild(1)) === '?' && toText(ctx.getChild(3)) === ':') {
          return {
            type: 'Conditional',
            condition: this.visit(ctx.getChild(0)),
            trueExpression: this.visit(ctx.getChild(2)),
            falseExpression: this.visit(ctx.getChild(4))
          };
        } // index range access


        if (toText(ctx.getChild(1)) === '[' && toText(ctx.getChild(2)) === ':' && toText(ctx.getChild(4)) === ']') {
          return {
            type: 'IndexRangeAccess',
            base: this.visit(ctx.getChild(0)),
            indexEnd: this.visit(ctx.getChild(3))
          };
        } else if (toText(ctx.getChild(1)) === '[' && toText(ctx.getChild(3)) === ':' && toText(ctx.getChild(4)) === ']') {
          return {
            type: 'IndexRangeAccess',
            base: this.visit(ctx.getChild(0)),
            indexStart: this.visit(ctx.getChild(2))
          };
        }

        break;

      case 6:
        // index range access
        if (toText(ctx.getChild(1)) === '[' && toText(ctx.getChild(3)) === ':' && toText(ctx.getChild(5)) === ']') {
          return {
            type: 'IndexRangeAccess',
            base: this.visit(ctx.getChild(0)),
            indexStart: this.visit(ctx.getChild(2)),
            indexEnd: this.visit(ctx.getChild(4))
          };
        }

        break;
    }

    throw new Error('Unrecognized expression');
  },
  NameValueList: function NameValueList(ctx) {
    var names = [];
    var args = [];

    var _iterator4 = _createForOfIteratorHelper(ctx.nameValue()),
        _step4;

    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var nameValue = _step4.value;
        names.push(toText(nameValue.identifier()));
        args.push(this.visit(nameValue.expression()));
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }

    return {
      type: 'NameValueList',
      names: names,
      arguments: args
    };
  },
  StateVariableDeclaration: function StateVariableDeclaration(ctx) {
    var type = this.visit(ctx.typeName());
    var iden = ctx.identifier();
    var name = toText(iden);
    var expression = null;

    if (ctx.expression()) {
      expression = this.visit(ctx.expression());
    }

    var visibility = 'default';

    if (ctx.InternalKeyword(0)) {
      visibility = 'internal';
    } else if (ctx.PublicKeyword(0)) {
      visibility = 'public';
    } else if (ctx.PrivateKeyword(0)) {
      visibility = 'private';
    }

    var isDeclaredConst = false;

    if (ctx.ConstantKeyword(0)) {
      isDeclaredConst = true;
    }

    var override;
    var overrideSpecifier = ctx.overrideSpecifier();

    if (overrideSpecifier.length === 0) {
      override = null;
    } else {
      override = this.visit(overrideSpecifier[0].userDefinedTypeName());
    }

    var isImmutable = false;

    if (ctx.ImmutableKeyword(0)) {
      isImmutable = true;
    }

    var decl = this.createNode({
      type: 'VariableDeclaration',
      typeName: type,
      name: name,
      expression: expression,
      visibility: visibility,
      isStateVar: true,
      isDeclaredConst: isDeclaredConst,
      isIndexed: false,
      isImmutable: isImmutable,
      override: override
    }, iden);
    return {
      variables: [decl],
      initialValue: expression
    };
  },
  FileLevelConstant: function FileLevelConstant(ctx) {
    var type = this.visit(ctx.typeName());
    var iden = ctx.identifier();
    var name = toText(iden);
    var expression = null;

    if (ctx.expression()) {
      expression = this.visit(ctx.expression());
    }

    return {
      typeName: type,
      name: name,
      initialValue: expression
    };
  },
  ForStatement: function ForStatement(ctx) {
    var conditionExpression = this.visit(ctx.expressionStatement());

    if (conditionExpression) {
      conditionExpression = conditionExpression.expression;
    }

    return {
      initExpression: this.visit(ctx.simpleStatement()),
      conditionExpression: conditionExpression,
      loopExpression: {
        type: 'ExpressionStatement',
        expression: this.visit(ctx.expression())
      },
      body: this.visit(ctx.statement())
    };
  },
  HexLiteral: function HexLiteral(ctx) {
    var parts = ctx.HexLiteralFragment().map(toText).map(function (x) {
      return x.substring(4, x.length - 1);
    });
    return {
      type: 'HexLiteral',
      value: parts.join(''),
      parts: parts
    };
  },
  PrimaryExpression: function PrimaryExpression(ctx) {
    if (ctx.BooleanLiteral()) {
      return {
        type: 'BooleanLiteral',
        value: toText(ctx.BooleanLiteral()) === 'true'
      };
    }

    if (ctx.hexLiteral()) {
      return this.visit(ctx.hexLiteral());
    }

    if (ctx.stringLiteral()) {
      var parts = ctx.stringLiteral().StringLiteralFragment().map(function (stringLiteralFragmentCtx) {
        var text = toText(stringLiteralFragmentCtx);
        var singleQuotes = text[0] === "'";
        var textWithoutQuotes = text.substring(1, text.length - 1);
        var value = singleQuotes ? textWithoutQuotes.replace(new RegExp("\\\\'", 'g'), "'") : textWithoutQuotes.replace(new RegExp('\\\\"', 'g'), '"');
        return value;
      });
      return {
        type: 'StringLiteral',
        value: parts.join(''),
        parts: parts
      };
    }

    if (ctx.TypeKeyword()) {
      return {
        type: 'Identifier',
        name: 'type'
      };
    }

    if (ctx.children.length == 3 && toText(ctx.getChild(1)) === '[' && toText(ctx.getChild(2)) === ']') {
      var node = this.visit(ctx.getChild(0));

      if (node.type === 'Identifier') {
        node = {
          type: 'UserDefinedTypeName',
          namePath: node.name
        };
      } else if (node.type == 'TypeNameExpression') {
        node = node.typeName;
      } else {
        node = {
          type: 'ElementaryTypeName',
          name: toText(ctx.getChild(0))
        };
      }

      var typeName = {
        type: 'ArrayTypeName',
        baseTypeName: node,
        length: null
      };
      return {
        type: 'TypeNameExpression',
        typeName: typeName
      };
    }

    return this.visit(ctx.getChild(0));
  },
  Identifier: function Identifier(ctx) {
    return {
      name: toText(ctx)
    };
  },
  TupleExpression: function TupleExpression(ctx) {
    var _this6 = this;

    // remove parentheses
    var children = ctx.children.slice(1, -1);
    var components = mapCommasToNulls(children).map(function (expr) {
      // add a null for each empty value
      if (!expr) {
        return null;
      }

      return _this6.visit(expr);
    });
    return {
      components: components,
      isArray: toText(ctx.getChild(0)) === '['
    };
  },
  IdentifierList: function IdentifierList(ctx) {
    var _this7 = this;

    // remove parentheses
    var children = ctx.children.slice(1, -1);
    return mapCommasToNulls(children).map(function (iden) {
      // add a null for each empty value
      if (!iden) {
        return null;
      }

      return _this7.createNode({
        type: 'VariableDeclaration',
        name: toText(iden),
        storageLocation: null,
        typeName: null,
        isStateVar: false,
        isIndexed: false
      }, iden);
    });
  },
  VariableDeclarationList: function VariableDeclarationList(ctx) {
    var _this8 = this;

    // remove parentheses
    return mapCommasToNulls(ctx.children).map(function (decl) {
      // add a null for each empty value
      if (!decl) {
        return null;
      }

      var storageLocation = null;

      if (decl.storageLocation()) {
        storageLocation = toText(decl.storageLocation());
      }

      return _this8.createNode({
        type: 'VariableDeclaration',
        name: toText(decl.identifier()),
        typeName: _this8.visit(decl.typeName()),
        storageLocation: storageLocation,
        isStateVar: false,
        isIndexed: false
      }, decl);
    });
  },
  VariableDeclarationStatement: function VariableDeclarationStatement(ctx) {
    var variables;

    if (ctx.variableDeclaration()) {
      variables = [this.visit(ctx.variableDeclaration())];
    } else if (ctx.identifierList()) {
      variables = this.visit(ctx.identifierList());
    } else if (ctx.variableDeclarationList()) {
      variables = this.visit(ctx.variableDeclarationList());
    }

    var initialValue = null;

    if (ctx.expression()) {
      initialValue = this.visit(ctx.expression());
    }

    return {
      variables: variables,
      initialValue: initialValue
    };
  },
  ImportDirective: function ImportDirective(ctx) {
    var pathString = toText(ctx.StringLiteralFragment());
    var unitAlias = null;
    var symbolAliases = null;

    if (ctx.importDeclaration().length > 0) {
      symbolAliases = ctx.importDeclaration().map(function (decl) {
        var symbol = toText(decl.identifier(0));
        var alias = null;

        if (decl.identifier(1)) {
          alias = toText(decl.identifier(1));
        }

        return [symbol, alias];
      });
    } else if (ctx.children.length === 7) {
      unitAlias = toText(ctx.getChild(3));
    } else if (ctx.children.length === 5) {
      unitAlias = toText(ctx.getChild(3));
    }

    return {
      path: pathString.substring(1, pathString.length - 1),
      unitAlias: unitAlias,
      symbolAliases: symbolAliases
    };
  },
  EventDefinition: function EventDefinition(ctx) {
    return {
      name: toText(ctx.identifier()),
      parameters: this.visit(ctx.eventParameterList()),
      isAnonymous: !!ctx.AnonymousKeyword()
    };
  },
  EventParameterList: function EventParameterList(ctx) {
    var _this9 = this;

    return ctx.eventParameter().map(function (paramCtx) {
      var type = _this9.visit(paramCtx.typeName());

      var name = null;

      if (paramCtx.identifier()) {
        name = toText(paramCtx.identifier());
      }

      return _this9.createNode({
        type: 'VariableDeclaration',
        typeName: type,
        name: name,
        isStateVar: false,
        isIndexed: !!paramCtx.IndexedKeyword(0)
      }, paramCtx);
    }, this);
  },
  ReturnParameters: function ReturnParameters(ctx) {
    return this.visit(ctx.parameterList());
  },
  ParameterList: function ParameterList(ctx) {
    var _this10 = this;

    return ctx.parameter().map(function (paramCtx) {
      return _this10.visit(paramCtx);
    });
  },
  Parameter: function Parameter(ctx) {
    var storageLocation = null;

    if (ctx.storageLocation()) {
      storageLocation = toText(ctx.storageLocation());
    }

    var name = null;

    if (ctx.identifier()) {
      name = toText(ctx.identifier());
    }

    return {
      type: 'VariableDeclaration',
      typeName: this.visit(ctx.typeName()),
      name: name,
      storageLocation: storageLocation,
      isStateVar: false,
      isIndexed: false
    };
  },
  InlineAssemblyStatement: function InlineAssemblyStatement(ctx) {
    var language = null;

    if (ctx.StringLiteralFragment()) {
      language = toText(ctx.StringLiteralFragment());
      language = language.substring(1, language.length - 1);
    }

    return {
      language: language,
      body: this.visit(ctx.assemblyBlock())
    };
  },
  AssemblyBlock: function AssemblyBlock(ctx) {
    var _this11 = this;

    var operations = ctx.assemblyItem().map(function (it) {
      return _this11.visit(it);
    });
    return {
      operations: operations
    };
  },
  AssemblyItem: function AssemblyItem(ctx) {
    var text;

    if (ctx.hexLiteral()) {
      return this.visit(ctx.hexLiteral());
    }

    if (ctx.stringLiteral()) {
      text = toText(ctx.stringLiteral());
      var value = text.substring(1, text.length - 1);
      return {
        type: 'StringLiteral',
        value: value,
        parts: [value]
      };
    }

    if (ctx.BreakKeyword()) {
      return {
        type: 'Break'
      };
    }

    if (ctx.ContinueKeyword()) {
      return {
        type: 'Continue'
      };
    }

    return this.visit(ctx.getChild(0));
  },
  AssemblyExpression: function AssemblyExpression(ctx) {
    return this.visit(ctx.getChild(0));
  },
  AssemblyCall: function AssemblyCall(ctx) {
    var _this12 = this;

    var functionName = toText(ctx.getChild(0));
    var args = ctx.assemblyExpression().map(function (arg) {
      return _this12.visit(arg);
    });
    return {
      functionName: functionName,
      arguments: args
    };
  },
  AssemblyLiteral: function AssemblyLiteral(ctx) {
    var text;

    if (ctx.stringLiteral()) {
      text = toText(ctx);
      var value = text.substring(1, text.length - 1);
      return {
        type: 'StringLiteral',
        value: value,
        parts: [value]
      };
    }

    if (ctx.DecimalNumber()) {
      return {
        type: 'DecimalNumber',
        value: toText(ctx)
      };
    }

    if (ctx.HexNumber()) {
      return {
        type: 'HexNumber',
        value: toText(ctx)
      };
    }

    if (ctx.hexLiteral()) {
      return this.visit(ctx.hexLiteral());
    }
  },
  AssemblySwitch: function AssemblySwitch(ctx) {
    var _this13 = this;

    return {
      expression: this.visit(ctx.assemblyExpression()),
      cases: ctx.assemblyCase().map(function (c) {
        return _this13.visit(c);
      })
    };
  },
  AssemblyCase: function AssemblyCase(ctx) {
    var value = null;

    if (toText(ctx.getChild(0)) === 'case') {
      value = this.visit(ctx.assemblyLiteral());
    }

    var node = {
      block: this.visit(ctx.assemblyBlock())
    };

    if (value) {
      node.value = value;
    } else {
      node["default"] = true;
    }

    return node;
  },
  AssemblyLocalDefinition: function AssemblyLocalDefinition(ctx) {
    var names = ctx.assemblyIdentifierOrList();

    if (names.identifier()) {
      names = [this.visit(names.identifier())];
    } else if (names.assemblyMember()) {
      names = [this.visit(names.assemblyMember())];
    } else {
      names = this.visit(names.assemblyIdentifierList().identifier());
    }

    return {
      names: names,
      expression: this.visit(ctx.assemblyExpression())
    };
  },
  AssemblyFunctionDefinition: function AssemblyFunctionDefinition(ctx) {
    var args = ctx.assemblyIdentifierList();
    args = args ? this.visit(args.identifier()) : [];
    var returnArgs = ctx.assemblyFunctionReturns();
    returnArgs = returnArgs ? this.visit(returnArgs.assemblyIdentifierList().identifier()) : [];
    return {
      name: toText(ctx.identifier()),
      arguments: args,
      returnArguments: returnArgs,
      body: this.visit(ctx.assemblyBlock())
    };
  },
  AssemblyAssignment: function AssemblyAssignment(ctx) {
    var names = ctx.assemblyIdentifierOrList();

    if (names.identifier()) {
      names = [this.visit(names.identifier())];
    } else if (names.assemblyMember()) {
      names = [this.visit(names.assemblyMember())];
    } else {
      names = this.visit(names.assemblyIdentifierList().identifier());
    }

    return {
      names: names,
      expression: this.visit(ctx.assemblyExpression())
    };
  },
  AssemblyMember: function AssemblyMember(ctx) {
    var _ctx$identifier = ctx.identifier(),
        _ctx$identifier2 = _slicedToArray(_ctx$identifier, 2),
        accessed = _ctx$identifier2[0],
        member = _ctx$identifier2[1];

    return {
      type: 'AssemblyMemberAccess',
      expression: this.visit(accessed),
      memberName: this.visit(member)
    };
  },
  LabelDefinition: function LabelDefinition(ctx) {
    return {
      name: toText(ctx.identifier())
    };
  },
  AssemblyStackAssignment: function AssemblyStackAssignment(ctx) {
    return {
      name: toText(ctx.identifier())
    };
  },
  AssemblyFor: function AssemblyFor(ctx) {
    return {
      pre: this.visit(ctx.getChild(1)),
      condition: this.visit(ctx.getChild(2)),
      post: this.visit(ctx.getChild(3)),
      body: this.visit(ctx.getChild(4))
    };
  },
  AssemblyIf: function AssemblyIf(ctx) {
    return {
      condition: this.visit(ctx.assemblyExpression()),
      body: this.visit(ctx.assemblyBlock())
    };
  }
};

var ASTBuilder = /*#__PURE__*/function (_antlr4$tree$ParseTre) {
  _inherits(ASTBuilder, _antlr4$tree$ParseTre);

  var _super = _createSuper(ASTBuilder);

  function ASTBuilder(options) {
    var _this14;

    _classCallCheck(this, ASTBuilder);

    _this14 = _super.call(this, options);

    _defineProperty(_assertThisInitialized(_this14), "options", void 0);

    _this14.options = options;
    return _this14;
  }

  _createClass(ASTBuilder, [{
    key: "_loc",
    value: function _loc(ctx) {
      var sourceLocation = {
        start: {
          line: ctx.start.line,
          column: ctx.start.column
        },
        end: {
          line: ctx.stop ? ctx.stop.line : ctx.start.line,
          column: ctx.stop ? ctx.stop.column : ctx.start.column
        }
      };
      return {
        loc: sourceLocation
      };
    }
  }, {
    key: "_range",
    value: function _range(ctx) {
      return {
        range: [ctx.start.start, ctx.stop.stop]
      };
    }
  }, {
    key: "meta",
    value: function meta(ctx) {
      var ret = {};

      if (this.options.loc === true) {
        Object.assign(ret, this._loc(ctx));
      }

      if (this.options.range === true) {
        Object.assign(ret, this._range(ctx));
      }

      return ret;
    }
  }, {
    key: "createNode",
    value: function createNode(obj, ctx) {
      return Object.assign(obj, this.meta(ctx));
    }
  }, {
    key: "visit",
    value: function visit(ctx) {
      var _this15 = this;

      if (!ctx) {
        return null;
      }

      if (Array.isArray(ctx)) {
        return ctx.map(function (child) {
          return _this15.visit(child);
        }, this);
      }

      var name = ctx.constructor.name;

      if (name.endsWith('Context')) {
        name = name.substring(0, name.length - 'Context'.length);
      }

      var node = {
        type: name
      };

      if (name in transformAST) {
        var visited = transformAST[name].call(this, ctx);

        if (Array.isArray(visited)) {
          return visited;
        }

        Object.assign(node, visited);
      }

      return this.createNode(node, ctx);
    }
  }]);

  return ASTBuilder;
}(antlr4.tree.ParseTreeVisitor);

var ErrorListener$3 = /*#__PURE__*/function (_antlr4$error$ErrorLi) {
  _inherits(ErrorListener, _antlr4$error$ErrorLi);

  var _super = _createSuper(ErrorListener);

  function ErrorListener() {
    var _this;

    _classCallCheck(this, ErrorListener);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "_errors", void 0);

    _this._errors = [];
    return _this;
  }

  _createClass(ErrorListener, [{
    key: "syntaxError",
    value: function syntaxError(recognizer, offendingSymbol, line, column, message) {
      this._errors.push({
        message: message,
        line: line,
        column: column
      });
    }
  }, {
    key: "getErrors",
    value: function getErrors() {
      return this._errors;
    }
  }, {
    key: "hasErrors",
    value: function hasErrors() {
      return this._errors.length > 0;
    }
  }]);

  return ErrorListener;
}(antlr4.error.ErrorListener);

var ParserError = /*#__PURE__*/function (_Error) {
  _inherits(ParserError, _Error);

  var _super = _createSuper(ParserError);

  function ParserError(args) {
    var _this;

    _classCallCheck(this, ParserError);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "errors", void 0);

    var _args$errors$ = args.errors[0],
        message = _args$errors$.message,
        line = _args$errors$.line,
        column = _args$errors$.column;
    _this.message = "".concat(message, " (").concat(line, ":").concat(column, ")");
    _this.errors = args.errors;

    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(_assertThisInitialized(_this), _this.constructor);
    } else {
      _this.stack = new Error().stack;
    }

    return _this;
  }

  return ParserError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
function tokenize(input) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var chars = new antlr4.InputStream(input);
  var lexer = new SolidityLexer(chars);
  var tokens = new antlr4.CommonTokenStream(lexer);
  return buildTokenList(tokens.tokenSource.getAllTokens(), options);
}
function parse(input) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var chars = new antlr4.InputStream(input);
  var listener = new ErrorListener$3();
  var lexer = new SolidityLexer(chars);
  lexer.removeErrorListeners();
  lexer.addErrorListener(listener);
  var tokens = new antlr4.CommonTokenStream(lexer);
  var parser = new SolidityParser(tokens);
  parser.removeErrorListeners();
  parser.addErrorListener(listener);
  parser.buildParseTrees = true;
  var tree = parser.sourceUnit();
  var tokenList = [];

  if (options.tokens === true) {
    var tokenSource = tokens.tokenSource;
    tokenSource.reset();
    tokenList = buildTokenList(tokenSource.getAllTokens(), options);
  }

  if (options.tolerant !== true && listener.hasErrors()) {
    throw new ParserError({
      errors: listener.getErrors()
    });
  }

  var visitor = new ASTBuilder(options);
  var ast = visitor.visit(tree);

  if (options.tolerant === true && listener.hasErrors()) {
    ast.errors = listener.getErrors();
  }

  if (options.tokens === true) {
    ast.tokens = tokenList;
  }

  return ast;
}

function _isASTNode(node) {
  return node !== null && _typeof(node) === 'object' && Object.prototype.hasOwnProperty.call(node, 'type');
}

function visit(node, visitor) {
  if (Array.isArray(node)) {
    node.forEach(function (child) {
      return visit(child, visitor);
    });
  }

  if (!_isASTNode(node)) return;
  var cont = true;

  if (visitor[node.type] !== undefined) {
    cont = visitor[node.type](node);
  }

  if (cont === false) return;

  for (var prop in node) {
    if (Object.prototype.hasOwnProperty.call(node, prop)) {
      visit(node[prop], visitor);
    }
  }

  var selector = node.type + ':exit';

  if (visitor[selector] !== undefined) {
    visitor[selector](node);
  }
}

exports.ParserError = ParserError;
exports.parse = parse;
exports.tokenize = tokenize;
exports.visit = visit;
//# sourceMappingURL=index.cjs.js.map
