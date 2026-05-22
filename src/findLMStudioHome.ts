/**
 * Locate LM Studio installation directory across platforms
 */

import * as path from 'path';

export interface LMStudioLocation {
  homePath: string;
  platform: 'win32' | 'darwin' | 'linux';
  confidence: number; // 0-1 confidence score
}

/**
 * Find LM Studio installation based on platform and common locations
 */
export function findLMStudioHome(): LMStudioLocation[] {
  const platform = process.platform as 'win32' | 'darwin' | 'linux';
  const candidates: LMStudioLocation[] = [];
  
  if (platform === 'win32') {
    // Windows common locations
    candidates.push({
      homePath: path.join(process.env.APPDATA || '', 'LM Studio'),
      platform,
      confidence: 0.8,
    });
    candidates.push({
      homePath: path.join(process.env.LOCALAPPDATA || '', 'Programs', 'LM Studio'),
      platform,
      confidence: 0.6,
    });
    candidates.push({
      homePath: path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'LM Studio'),
      platform,
      confidence: 0.5,
    });
  } else if (platform === 'darwin') {
    // macOS common locations
    candidates.push({
      homePath: path.join(process.env.HOME || '', 'Library', 'Application Support', 'LM Studio'),
      platform,
      confidence: 0.8,
    });
    candidates.push({
      homePath: '/Applications/LM Studio.app',
      platform,
      confidence: 0.7,
    });
  } else {
    // Linux common locations
    candidates.push({
      homePath: path.join(process.env.HOME || '', '.local', 'share', 'LM Studio'),
      platform,
      confidence: 0.6,
    });
    candidates.push({
      homePath: '/opt/LM Studio',
      platform,
      confidence: 0.4,
    });
  }
  
  return candidates;
}

/**
 * Verify if a path is actually LM Studio installation
 */
export function verifyLMStudioLocation(homePath: string): boolean {
  // In a real implementation, we'd check filesystem for LM Studio indicators
  // For now, return confidence based on path structure
  return homePath.includes('LM Studio') || homePath.toLowerCase().includes('lmstudio');
}

/**
 * Get the most likely LM Studio location
 */
export function getMostLikelyLocation(): LMStudioLocation | null {
  const locations = findLMStudioHome();
  if (locations.length === 0) return null;
  
  // Sort by confidence and return highest
  locations.sort((a, b) => b.confidence - a.confidence);
  return locations[0];
}