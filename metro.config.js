// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude the backend directory from bundling
// This prevents Node.js backend code (MongoDB, Express, etc.) from being bundled with React Native
config.resolver.blockList = [
  // Block all files in the backend directory
  /app[\/\\]\(tabs\)[\/\\]account[\/\\]backend[\/\\].*/,
];

module.exports = config;

