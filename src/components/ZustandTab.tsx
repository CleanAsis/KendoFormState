import { useEffect } from 'react';
import { ZBillingForm } from './ZBillingForm';
import { ZShippingForm } from './ZShippingForm';
import { ZStatePanel } from './ZStatePanel';
import { trackRender, pushLogEntry } from '../renderTracker';

export function ZustandTab() {
  trackRender();

  useEffect(() => {
    pushLogEntry('Zustand tab – initial render', 0);
  }, []);

  return (
    <>
      <main className="forms-container">
        <section className="form-card">
          <h2 className="form-title">Billing Information</h2>
          <ZBillingForm />
        </section>

        <section className="form-card">
          <h2 className="form-title">Shipping Information</h2>
          <ZShippingForm />
        </section>
      </main>

      <ZStatePanel />

      <footer className="app-footer">
        <p>
          <strong>Zustand approach</strong> – The store is the single source of
          truth. Each form syncs bidirectionally: Kendo field changes update the
          store, and store changes push into Kendo via surgical{' '}
          <code>formRenderProps.onChange()</code> calls. "Copy Address" is a
          one-liner in the store.
        </p>
      </footer>
    </>
  );
}
