const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable bytecode generation to avoid the InternalBytecode.js issue
config.transformer.enableBabelRCLookup = false;
config.transformer.unstable_disableES6Transforms = false;

config.transformer.minifierConfig = {
  compress: {
    drop_console: true, // Remove console logs in production
    pure_funcs: ['console.log', 'console.debug'], // Remove specific console methods
  },
};

// Add react-native-maps transformer
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Add resolver for react-native-maps
config.resolver.extraNodeModules = {
  'react-native-maps': require.resolve('react-native-maps'),
};

module.exports = config;
