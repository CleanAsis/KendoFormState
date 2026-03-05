import { useEffect, useRef } from 'react';
import { BillingForm } from './BillingForm';
import type { BillingFormHandle } from './BillingForm';
import { ShippingForm } from './ShippingForm';
import type { ShippingFormHandle } from './ShippingForm';
import { trackRender, pushLogEntry } from '../renderTracker';
import { emptyAddress } from '../types';

export function BasicExamplesTab() {
  trackRender();

  const billingRef = useRef<BillingFormHandle>(null);
  const shippingRef = useRef<ShippingFormHandle>(null);

  const getBillingValues = () =>
    billingRef.current?.getValues() ?? { ...emptyAddress };

  useEffect(() => {
    pushLogEntry('Initial render', 0);
  }, []);

  return (
    <>
      <main className="forms-container">
        <section className="form-card">
          <h2 className="form-title">Billing Information</h2>
          <BillingForm ref={billingRef} />
        </section>

        <section className="form-card">
          <h2 className="form-title">Shipping Information</h2>
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
    </>
  );
}
