module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Must be listed last per Reanimated docs
      // This plugin includes worklets support needed for draggable-flatlist
      'react-native-reanimated/plugin',
    ],
  };
};

