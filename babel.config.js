module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated v4 moved its worklet compilation into the
    // separate react-native-worklets package — this must be listed last.
    plugins: ['react-native-worklets/plugin'],
  };
};
