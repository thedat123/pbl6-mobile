module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ['@babel/plugin-transform-private-methods', { loose: true }],
      '@babel/plugin-transform-runtime',
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          allowlist: null,
          blocklist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
