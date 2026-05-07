import path from 'path';
import { getDefaultConfig } from '@expo/metro-config';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '..');

const config = getDefaultConfig(projectRoot);

// Watch parent workspace
config.watchFolders = [workspaceRoot];

// Block ONLY the library's source directory (not compiled lib)
config.resolver.blockList = [
  new RegExp(`^${workspaceRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/src/`),
];

// Fix hoisted deps
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];

// Disable package exports for Expo SDK 53 compatibility
config.resolver.unstable_enablePackageExports = false;

export default config;
