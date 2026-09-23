import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const backendDir = fileURLToPath(new URL('../', import.meta.url));
export const defaultDataDir = resolve(backendDir, 'data');
export const defaultDistDir = resolve(backendDir, '../dist');
export const configuredDataDir = () => resolve(backendDir, process.env.DATA_DIR || 'data');
