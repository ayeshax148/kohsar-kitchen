// Clearly labelled demonstration switches (see the "Demo controls" panel in the footer).
// They let a marker reproduce loading failure, an empty dataset and changed availability.
import { readJSON, writeJSON } from './storage.js';

const DEMO_KEY = 'kk-demo-settings-v1';

export const DEFAULT_DEMO_SETTINGS = {
  failLoading: false,
  emptyMenu: false,
  availabilityChanged: false,
};

export function getDemoSettings() {
  const saved = readJSON(DEMO_KEY, DEFAULT_DEMO_SETTINGS);
  return { ...DEFAULT_DEMO_SETTINGS, ...(saved && typeof saved === 'object' ? saved : {}) };
}

export function saveDemoSettings(settings) {
  writeJSON(DEMO_KEY, settings);
}
