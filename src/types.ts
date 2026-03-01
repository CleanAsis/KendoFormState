export interface AddressData {
  firstName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  zip: string;
}

export const emptyAddress: AddressData = {
  firstName: '',
  phone: '',
  email: '',
  addressLine: '',
  city: '',
  state: '',
  zip: '',
};

export interface AddressFieldConfig {
  name: keyof AddressData;
  label: string;
}

export const ADDRESS_FIELDS: AddressFieldConfig[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'phone', label: 'Phone Number' },
  { name: 'email', label: 'Email' },
  { name: 'addressLine', label: 'Address Line' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'zip', label: 'ZIP Code' },
];
