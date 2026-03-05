import { useEffect, useRef } from 'react';
import { Form, Field, FormElement } from '@progress/kendo-react-form';
import { Input } from '@progress/kendo-react-inputs';
import type { FormRenderProps } from '@progress/kendo-react-form';
import { useFormStore, Z_FORM_FIELDS } from '../store/useFormStore';
import type { ZFormField } from '../store/useFormStore';
import { trackRender } from '../renderTracker';
import { useShallow } from 'zustand/shallow';

export function ZBillingForm() {
  trackRender();

  const billing = useFormStore(useShallow((s) => s.billing));
  const setBillingField = useFormStore((s) => s.setBillingField);
  const fRPRef = useRef<FormRenderProps | null>(null);

  // Zustand → Kendo: push store changes into the form fields
  useEffect(() => {
    const fRP = fRPRef.current;
    if (!fRP) return;
    Z_FORM_FIELDS.forEach(({ name }) => {
      const current = fRP.valueGetter(name) as string;
      if (current !== billing[name]) {
        fRP.onChange(name, { value: billing[name] });
      }
    });
  }, [billing]);

  // Kendo → Zustand: relay individual field changes to the store
  const handleFormChange = (
    fieldName: string,
    value: unknown,
    _valueGetter: (name: string) => unknown,
  ) => {
    setBillingField(fieldName as ZFormField, value as string);
  };

  return (
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
  );
}
