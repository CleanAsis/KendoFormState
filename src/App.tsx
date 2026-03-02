import { useEffect, useRef } from 'react';
import '@progress/kendo-theme-default/dist/all.css';
import './App.css';
import { BillingForm } from './components/BillingForm';
import type { BillingFormHandle } from './components/BillingForm';
import { ShippingForm } from './components/ShippingForm';
import type { ShippingFormHandle } from './components/ShippingForm';
import { RenderLogPanel } from './components/RenderLogPanel';
import { trackRender, pushLogEntry } from './renderTracker';
import { emptyAddress } from './types';

function App() {
  trackRender();

  /**
   * Ref to BillingForm – used to read current field values on demand via the
   * `getValues()` handle that BillingForm exposes through useImperativeHandle.
   */
  const billingRef = useRef<BillingFormHandle>(null);

  /**
   * Ref to ShippingForm – demonstrates Approach #3 (recommended):
   * the parent calls `shippingRef.current.setValues(data)` through the clean
   * public API that ShippingForm exposes via useImperativeHandle, without
   * knowing anything about Kendo's internal state management.
   *
   * Approaches #1 and #2 are triggered by buttons *inside* ShippingForm,
   * so no parent-level state is needed for those.
   */
  const shippingRef = useRef<ShippingFormHandle>(null);

  /**
   * Callback passed down to ShippingForm so its buttons can read billing
   * values at the moment they are clicked, without the parent needing to
   * continuously track billing state.
   */
  const getBillingValues = () =>
    billingRef.current?.getValues() ?? { ...emptyAddress };

  // Log the total number of renders that occurred during the initial mount.
  useEffect(() => {
    pushLogEntry('Initial render', 0);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kendo Form State POC</h1>
        <p className="subtitle">
          Demonstrating three approaches to copying Kendo form state across
          multiple forms.
        </p>
      </header>

      <main className="forms-container">
        {/* ── Billing Form ─────────────────────────────────────────────── */}
        <section className="form-card">
          <h2 className="form-title">Billing Information</h2>
          <BillingForm ref={billingRef} />
        </section>

        {/* ── Shipping Form ────────────────────────────────────────────── */}
        <section className="form-card">
          <h2 className="form-title">Shipping Information</h2>

          {/*
           * Approach #3 demo from parent:
           * Uncomment the line below (or wire it to a button here) to show
           * that the parent can imperatively update shipping values via the
           * exposed ref handle — without caring about Kendo internals.
           *
           *   shippingRef.current?.setValues(getBillingValues());
           */}

          <ShippingForm ref={shippingRef} getBillingValues={getBillingValues} />
        </section>
      </main>

      <footer className="app-footer">
        <p>
          <strong>Approach #1</strong> – <em>initialValues reset</em>: remounts
          the Kendo Form via a React <code>key</code> change; all form state is
          replaced.
        </p>
        <p>
          <strong>Approach #2</strong> –{' '}
          <em>FormRenderProps.onChange</em>: surgically updates each address
          field; other fields are untouched.
        </p>
        <p>
          <strong>Approach #3 (recommended)</strong> –{' '}
          <em>reactive state + exposed ref API</em>: the copy is triggered via
          React state → useEffect, and the same logic is exposed as a clean{' '}
          <code>setValues()</code> handle that any parent can call imperatively
          via <code>shippingRef.current.setValues(data)</code>.
        </p>
      </footer>

      <RenderLogPanel />
    </div>
  );
}

export default App;
