import { useEffect, useRef } from 'react';
import { Form, Field, FormElement } from '@progress/kendo-react-form';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import type { FormRenderProps } from '@progress/kendo-react-form';
import { useFormStore, Z_FORM_FIELDS } from '../store/useFormStore';
import type { ZFormField } from '../store/useFormStore';
import { trackRender, scheduleLogEntry } from '../renderTracker';
import { useShallow } from 'zustand/shallow';

export function ZShippingForm() {
  trackRender();

  const shipping = useFormStore(useShallow((s) => s.shipping));
  const setShippingField = useFormStore((s) => s.setShippingField);
  const copyBillingAddressToShipping = useFormStore(
    (s) => s.copyBillingAddressToShipping,
  );
  const fRPRef = useRef<FormRenderProps | null>(null);

  // Zustand → Kendo: push store changes into the form fields
  useEffect(() => {
    const fRP = fRPRef.current;
    if (!fRP) return;
    Z_FORM_FIELDS.forEach(({ name }) => {
      const current = fRP.valueGetter(name) as string;
      if (current !== shipping[name]) {
        fRP.onChange(name, { value: shipping[name] });
      }
    });
  }, [shipping]);

  // Kendo → Zustand: relay individual field changes to the store
  const handleFormChange = (
    fieldName: string,
    value: unknown,
    _valueGetter: (name: string) => unknown,
  ) => {
    setShippingField(fieldName as ZFormField, value as string);
  };

  const handleCopyAddress = () => {
    scheduleLogEntry('Zustand – Copy Address');
    copyBillingAddressToShipping();
  };

  return (
    <div className="form-section">
      <div className="copy-actions">
        <Button
          onClick={handleCopyAddress}
          themeColor="primary"
          title="Copies address fields from billing to shipping via Zustand store"
        >
          Copy Billing Address
        </Button>
      </div>

      <Form
        onChange={handleFormChange}
        onSubmit={() => {}}
        render={(formRenderProps) => {
          fRPRef.current = formRenderProps;
          return (
            <FormElement>
              {Z_FORM_FIELDS.map(({ name, label }) => (
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
}
