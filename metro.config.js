const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

// Configure the transformer for SVG and hashAssetFiles for font and other assets
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Configure resolver to handle additional file extensions
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter(ext => ext !== 'svg').concat(['ttf', 'png', 'jpg', 'jpeg']),  // Handle fonts and images
  sourceExts: [...resolver.sourceExts, 'svg'],  // Handle SVG files
};

module.exports = config;
