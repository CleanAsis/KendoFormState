import { useRenderLog, clearRenderLog } from '../renderTracker';

/**
 * Floating panel that displays a log of re-render counts.
 *
 * NOTE: This component intentionally does NOT call `trackRender()`.
 * It's an observability tool — including its own re-renders in the
 * measurements would add noise when comparing approaches.
 */
export function RenderLogPanel() {
  const entries = useRenderLog();
  const total = entries.reduce((sum, e) => sum + e.renders, 0);

  return (
    <div className="render-log-panel">
      <div className="render-log-header">
        <span>Re-render Log</span>
        <button onClick={clearRenderLog} className="render-log-clear">
          Clear
        </button>
      </div>

      <div className="render-log-entries">
        {entries.length === 0 && (
          <div className="render-log-empty">No entries yet</div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="render-log-entry">
            <span className="render-log-label">{entry.label}</span>
            <span className="render-log-count">+{entry.renders}</span>
          </div>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="render-log-total">
          Total renders: <strong>{total}</strong>
        </div>
      )}
    </div>
  );
}
