import path from 'path';
import { getDefaultConfig } from '@expo/metro-config';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '..');

const config = getDefaultConfig(projectRoot);

// Fix hoisted deps
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];

// Disable package exports for Expo SDK 53 compatibility
config.resolver.unstable_enablePackageExports = false;

export default config;
