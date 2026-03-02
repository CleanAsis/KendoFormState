import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Form, Field, FormElement } from '@progress/kendo-react-form';
import { Input } from '@progress/kendo-react-inputs';
import type { FormRenderProps } from '@progress/kendo-react-form';
import type { AddressData } from '../types';
import { ADDRESS_FIELDS, emptyAddress } from '../types';
import { trackRender } from '../renderTracker';

/**
 * Public API exposed to parent via ref.
 * Allows the parent to read current billing field values
 * without knowing about Kendo's internal form state.
 */
export interface BillingFormHandle {
  getValues: () => AddressData;
}

/**
 * BillingForm – wrapped in a Kendo Form.
 * Exposes `getValues()` via forwardRef + useImperativeHandle so that
 * parent components can read the current form values on demand
 * (e.g., when a "copy" button is clicked).
 */
export const BillingForm = forwardRef<BillingFormHandle>(
  function BillingForm(_, ref) {
    trackRender();

    const fRPRef = useRef<FormRenderProps | null>(null);

    useImperativeHandle(ref, () => ({
      getValues: () => {
        const fRP = fRPRef.current;
        if (!fRP) return { ...emptyAddress };
        const values = {} as AddressData;
        ADDRESS_FIELDS.forEach(({ name }) => {
          values[name] = (fRP.valueGetter(name) as string) ?? '';
        });
        return values;
      },
    }));

    return (
      <Form
        initialValues={emptyAddress}
        onSubmit={() => {
          /* no backend – POC only */
        }}
        render={(formRenderProps) => {
          // Store latest render props so getValues() always returns fresh data.
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
    );
  },
);
