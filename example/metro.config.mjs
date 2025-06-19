const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '..');

const config = getDefaultConfig(projectRoot);

// 👇 Watch the local src directory
config.watchFolders = [path.resolve(workspaceRoot, 'src')];

// 👇 Fix hoisted deps
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
