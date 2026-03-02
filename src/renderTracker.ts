import { useSyncExternalStore } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RenderLogEntry {
  id: number;
  label: string;
  renders: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Global render counter
// ─────────────────────────────────────────────────────────────────────────────

let renderCount = 0;

/**
 * Call at the top of each tracked component's render body.
 * Increments the global cumulative render counter.
 */
export function trackRender(): void {
  renderCount++;
}

/** Returns the current cumulative render count. */
export function getRenderCount(): number {
  return renderCount;
}

// ─────────────────────────────────────────────────────────────────────────────
// Render log (external store consumed via useSyncExternalStore)
// ─────────────────────────────────────────────────────────────────────────────

let logEntries: RenderLogEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emitChange(): void {
  listeners.forEach((l) => l());
}

/**
 * Push a new entry into the render log.
 * `baseline` is the value of `getRenderCount()` captured *before* the action
 * that triggered re-renders. The delta (renderCount − baseline) is stored.
 */
export function pushLogEntry(label: string, baseline: number): void {
  const renders = renderCount - baseline;
  logEntries = [...logEntries, { id: nextId++, label, renders }];
  emitChange();
}

/**
 * Convenience: captures a baseline snapshot now, then pushes the log entry
 * after a short delay so that all cascaded re-renders (including those from
 * useEffect chains) have time to settle.
 */
export function scheduleLogEntry(label: string): void {
  const baseline = renderCount;
  setTimeout(() => {
    pushLogEntry(label, baseline);
  }, 150);
}

export function clearRenderLog(): void {
  logEntries = [];
  emitChange();
}

// ── useSyncExternalStore plumbing ───────────────────────────────────────────

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): RenderLogEntry[] {
  return logEntries;
}

/** React hook – subscribes to the render log. */
export function useRenderLog(): RenderLogEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}
