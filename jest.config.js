module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|mjs|ts|tsx)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$':
      '@react-native/jest-preset/jest/assetFileTransformer.js',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-worklets|react-native-screens|react-native-svg|react-native-safe-area-context|react-native-mmkv|react-native-nitro-modules|react-native-webview|nativewind|react-native-css-interop|react-redux|redux-persist|lucide-react-native|immer|@reduxjs/toolkit)/)',
  ],
};
