import { create } from 'zustand';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ZFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export type ZFormField = keyof ZFormData;

export const Z_FORM_FIELDS: { name: ZFormField; label: string }[] = [
  { name: 'name', label: 'Name' },
  { name: 'phone', label: 'Phone Number' },
  { name: 'email', label: 'Email' },
  { name: 'address', label: 'Address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'zip', label: 'ZIP Code' },
];

/** Fields eligible for copying (excludes personal info). */
export const COPYABLE_FIELDS: ZFormField[] = ['address', 'city', 'state', 'zip'];

// ─────────────────────────────────────────────────────────────────────────────
// Default values
// ─────────────────────────────────────────────────────────────────────────────

const defaultBilling: ZFormData = {
  name: 'John Doe',
  phone: '555-0123',
  email: 'john@example.com',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62704',
};

const emptyForm: ZFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export interface FormStore {
  billing: ZFormData;
  shipping: ZFormData;

  setBillingField: (field: ZFormField, value: string) => void;
  setShippingField: (field: ZFormField, value: string) => void;
  copyBillingAddressToShipping: () => void;
}

export const useFormStore = create<FormStore>((set, get) => ({
  billing: { ...defaultBilling },
  shipping: { ...emptyForm },

  setBillingField: (field, value) => {
    if (get().billing[field] === value) return;
    set({ billing: { ...get().billing, [field]: value } });
  },

  setShippingField: (field, value) => {
    if (get().shipping[field] === value) return;
    set({ shipping: { ...get().shipping, [field]: value } });
  },

  copyBillingAddressToShipping: () => {
    const { billing, shipping } = get();
    const updated = { ...shipping };
    COPYABLE_FIELDS.forEach((f) => {
      updated[f] = billing[f];
    });
    set({ shipping: updated });
  },
}));
