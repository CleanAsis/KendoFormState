import { useFormStore } from '../store/useFormStore';
import { useShallow } from 'zustand/shallow';

/**
 * Live panel showing the current Zustand store contents for both
 * billing and shipping. Updates in real-time as the user types.
 */
export function ZStatePanel() {
  const billing = useFormStore(useShallow((s) => s.billing));
  const shipping = useFormStore(useShallow((s) => s.shipping));

  return (
    <div className="state-panel">
      <div className="state-panel-header">Zustand State</div>
      <div className="state-panel-body">
        <div className="state-panel-section">
          <h4>billing</h4>
          <pre>{JSON.stringify(billing, null, 2)}</pre>
        </div>
        <div className="state-panel-section">
          <h4>shipping</h4>
          <pre>{JSON.stringify(shipping, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
