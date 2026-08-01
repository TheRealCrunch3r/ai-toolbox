/**
 * Aggregator for all Utility tools.
 * Consolidates multiple small tool modules into a single registration function 
 * to reduce import count in the main provider file.
 */

import type { Tool } from '@lmstudio/sdk';
import type { PluginConfig } from '../config.js';

import { registerBackupTools } from './backupTools.js';
import { registerCleanupBackupsTool } from './cleanupBackupsTool.js';
import { registerDataVisualizationTools } from './dataVisualizationTools.js';
import { registerLineOperationsTools } from './lineOperations.js';
import { registerMarkdownPreviewTools } from './markdownPreviewTools.js';

/**
 * Registers all utility tools.
 */
export function registerUtilityTools(config: PluginConfig): Tool[] {
  return [
    ...registerBackupTools(config),
    ...registerCleanupBackupsTool(config),
    ...registerDataVisualizationTools(config),
    ...registerLineOperationsTools(config),
    ...registerMarkdownPreviewTools(config),
  ];
}
