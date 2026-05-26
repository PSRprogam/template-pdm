// Polyfills carregam ANTES de qualquer import/require do app
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'DOMException';
    }
  };
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) { return new Uint8Array([...str].map((c) => c.charCodeAt(0))); }
  };
}

require('expo/AppEntry');
