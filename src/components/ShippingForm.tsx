import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Form, Field, FormElement } from '@progress/kendo-react-form';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import type { FormRenderProps } from '@progress/kendo-react-form';
import type { AddressData } from '../types';
import { ADDRESS_FIELDS, emptyAddress } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Public API exposed to the parent via forwardRef + useImperativeHandle.
 *
 * Approach #3 (Recommended): The parent holds a ref to ShippingForm and calls
 * `setValues(data)` without knowing how Kendo's state management works
 * internally. This is the recommended pattern because it:
 *  - Keeps implementation details inside the component (encapsulation).
 *  - Gives callers a clean, intent-revealing API (`setValues`).
 *  - Makes ShippingForm independently testable/replaceable.
 */
export interface ShippingFormHandle {
  setValues: (data: AddressData) => void;
}

interface ShippingFormProps {
  /** Callback that returns the current billing form values. */
  getBillingValues: () => AddressData;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const ShippingForm = forwardRef<ShippingFormHandle, ShippingFormProps>(
  function ShippingForm({ getBillingValues }, ref) {
    // ── Approach #1 state ───────────────────────────────────────────────────
    // Incrementing formKey forces React to unmount + remount the Kendo Form,
    // which re-applies `initialValues`. Simple but resets ALL form state.
    const [formKey, setFormKey] = useState(0);
    const [initialValues, setInitialValues] = useState<AddressData>({ ...emptyAddress });

    // ── Approach #2 & #3 shared ref ─────────────────────────────────────────
    // We capture the latest FormRenderProps inside the Form render prop.
    // Both approach #2 (direct call) and #3 (exposed API) use this ref to
    // surgically update individual fields via `formRenderProps.onChange`.
    const fRPRef = useRef<FormRenderProps | null>(null);

    // ── Approach #3 state ───────────────────────────────────────────────────
    // pendingCopy drives the *declarative / reactive* copy path:
    //  • The button sets state → React schedules a re-render.
    //  • A useEffect watches the state and applies the values.
    //  • This decouples the "trigger" from the "apply" step,
    //    which is useful when the trigger may be async or come from
    //    multiple sources (e.g., a router navigation, a global event bus, …).
    const [pendingCopy, setPendingCopy] = useState<AddressData | null>(null);

    // ── Helper: apply values via FormRenderProps.onChange ───────────────────
    const applyValues = useCallback((data: AddressData) => {
      const fRP = fRPRef.current;
      if (!fRP) return;
      ADDRESS_FIELDS.forEach(({ name }) => {
        fRP.onChange(name, { value: data[name] });
      });
    }, []);

    // ── Approach #3: effect-driven apply ────────────────────────────────────
    useEffect(() => {
      if (!pendingCopy) return;
      applyValues(pendingCopy);
      setPendingCopy(null);
    }, [pendingCopy, applyValues]);

    // ── Approach #3: expose clean API to parent ──────────────────────────────
    // The parent (App.tsx) can call `shippingRef.current.setValues(data)`
    // without knowing about Kendo internals or holding a formRenderProps ref.
    useImperativeHandle(ref, () => ({
      setValues: applyValues,
    }));

    // ── Button handlers ──────────────────────────────────────────────────────

    /**
     * Approach #1 – initialValues reset (remount).
     * Sets new initialValues and bumps formKey to force a full remount of the
     * Kendo Form. Easy to understand but resets ALL form state, including any
     * fields the user may have partially filled in outside the address block.
     */
    const handleCopy1 = () => {
      const data = getBillingValues();
      setInitialValues(data);
      setFormKey((k) => k + 1);
    };

    /**
     * Approach #2 – FormRenderProps.onChange (surgical, imperative).
     * Directly calls `formRenderProps.onChange` for each address field.
     * Only the targeted fields are updated; the rest of the form is untouched.
     * The downside is that App.tsx would need to expose Kendo's internal ref
     * if it wanted to trigger this from outside ShippingForm.
     */
    const handleCopy2 = () => {
      applyValues(getBillingValues());
    };

    /**
     * Approach #3 – Reactive state + useEffect (declarative).
     * Sets `pendingCopy` state, then a useEffect applies the values after the
     * next render cycle. The same `applyValues` helper is used under the hood,
     * but the trigger is driven by React state rather than an imperative call.
     * This pattern is useful when you need to decouple the trigger (e.g.,
     * async events, multiple sources) from the actual field update.
     *
     * Additionally, `setValues` is exposed via `useImperativeHandle` above,
     * so the parent can also call `shippingRef.current.setValues(data)`
     * directly — demonstrating that the same API works both reactively
     * (via state) and imperatively (via the ref handle).
     */
    const handleCopy3 = () => {
      setPendingCopy(getBillingValues());
    };

    return (
      <div className="form-section">
        <div className="copy-actions">
          <Button
            onClick={handleCopy1}
            themeColor="primary"
            title="Copies billing address by resetting the Kendo Form via a React key change + new initialValues. All form state is replaced."
          >
            Copy Billing Address #1
            <span className="approach-tag">initialValues reset</span>
          </Button>
          <Button
            onClick={handleCopy2}
            themeColor="info"
            title="Copies billing address by calling FormRenderProps.onChange for each field — a surgical, imperative update."
          >
            Copy Billing Address #2
            <span className="approach-tag">FormRenderProps.onChange</span>
          </Button>
          <Button
            onClick={handleCopy3}
            themeColor="success"
            title="Copies billing address via React state + useEffect (declarative). The exposed setValues() ref handle uses the same mechanism."
          >
            Copy Billing Address #3
            <span className="approach-tag">reactive state + ref API</span>
          </Button>
        </div>

        <Form
          key={formKey}
          initialValues={initialValues}
          onSubmit={() => {
            /* no backend – POC only */
          }}
          render={(formRenderProps) => {
            // Always keep fRPRef current so approaches #2 and #3 see fresh state.
            fRPRef.current = formRenderProps;
            return (
              <FormElement>
                {ADDRESS_FIELDS.map(({ name, label }) => (
                  <div key={name} className="form-field">
                    <Field name={name} component={Input} label={label} />
                  </div>
                ))}
              </FormElement>
            );
          }}
        />
      </div>
    );
  },
);
