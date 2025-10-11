const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable bytecode generation to avoid the InternalBytecode.js issue
config.transformer.enableBabelRCLookup = false;
config.transformer.unstable_disableES6Transforms = false;

module.exports = config;
