// Babel: Expo + NativeWind v4 + Reanimated
// Eslatma: reanimated plugin oxirida bo'lishi shart.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
