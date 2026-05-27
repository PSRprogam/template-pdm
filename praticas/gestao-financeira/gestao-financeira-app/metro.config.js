const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const prevGetPolyfills = config.serializer?.getPolyfills ?? (() => []);
config.serializer = {
  ...config.serializer,
  getPolyfills: (ctx) => [
    path.resolve(__dirname, 'polyfills.js'),
    ...prevGetPolyfills(ctx),
  ],
};

module.exports = config;
