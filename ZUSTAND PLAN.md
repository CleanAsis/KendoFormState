# ZUSTAND PLAN

## Goal
The "Zustand" tab demonstrates the optimal usage of Zustand state manager as a
source of truth to control two separate Kendo forms. "Optimal" meaning the least
code utilized and is easiest to comprehend, while still achieving proper two-way
databinding.

Study the existing implementation in BasicExamplesTab.tsx. We want the same UI
forms, but brand-new components for the Zustand tab — **ZBillingForm** and
**ZShippingForm** (no shared code with the Basic tab forms). Instead of 3
different "Copy" strategies, we demonstrate **one** — the optimal one via
Zustand.

---

## Render Log
Extend the existing RE-RENDER LOG to the whole app (move `<RenderLogPanel />`
into App.tsx or a shared layout), so both tabs share it.

---

## Zustand Store Shape

```ts
interface FormStore {
  billing: FormData;   // pre-populated with demo defaults
  shipping: FormData;  // all blank by default

  setBillingField:  (field: keyof FormData, value: string) => void;
  setShippingField: (field: keyof FormData, value: string) => void;
  copyBillingAddressToShipping: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}
```

New simpler field names (`name`, `address`, etc.) — independent from
BasicExamplesTab's `AddressData` type.

### Copy Logic
`copyBillingAddressToShipping` copies **only** `address`, `city`, `state`,
`zip` from `billing` to `shipping`. Name/phone/email are excluded (personal
info stays separate).

---

## Instantiating Kendo Forms
Kendo Form uses an `initialValues` prop. If we bind it to live Zustand data,
every field change would force a full form re-render — we don't want that.

**Decision**: Don't use `initialValues` at all. On mount, push the Zustand
defaults into the form via the Update Mechanism (below), keeping the data flow
uniform for both initial population and subsequent changes.

---

## Updating Kendo Forms (Zustand → Kendo)
Since we use Kendo's `<Field>` component (required for validation, dirty state,
etc.), we can't bind inputs directly. Instead, we use
`formRenderProps.onChange(fieldName, { value })` for surgical per-field updates.

**Subscription approach**: `useStore(s => s.billing, shallow)` +
`useEffect`. When the store slice changes, compare each field with what Kendo
currently has (via `valueGetter`) and call `onChange` only for fields that
actually differ. The wrapper component re-renders (lightweight — no DOM work),
but the `<Form>` itself is not remounted.

---

## Two-Way Data Binding (Kendo → Zustand)
Use the `<Form>` component's **`onChange` prop** which fires with
`{ field, value }` on every field change. In that handler, call
`store.setBillingField(field, value)` (or `setShippingField`).

### Echo Prevention (no loop guard needed)
The natural question: does this create an infinite loop
(typing → Zustand → useEffect → Kendo onChange → Zustand → …)?

**No**, because the store actions include a value equality check:

```ts
setBillingField: (field, value) => {
  if (get().billing[field] === value) return;   // ← breaks the cycle
  set({ billing: { ...get().billing, [field]: value } });
}
```

When the echo round-trips back with the same value, `get().billing[field]`
already equals `value` → early return → no `set()` → no re-render. The cycle
breaks naturally with zero additional machinery.

As a secondary safety net, using `shallow` comparison in the `useStore` selector
also prevents re-renders when field values haven't changed (even if object
references differ).

---

## State Panel
Display a **ZStatePanel** component on the Zustand tab that shows the live
Zustand store contents for both `billing` and `shipping` as formatted text.
Direct binding to the store — updates in real-time as the user types or copies
address data. Useful for verifying the two-way binding is working correctly.

---

## Summary of Data Flow

```
┌──────────┐  onChange({ field, value })  ┌──────────────┐
│  Kendo   │ ──────────────────────────►  │   Zustand    │
│  Form    │                              │   Store      │
│          │  ◄──────────────────────────  │              │
└──────────┘  useEffect → onChange(field)  └──────────────┘
                (only if value differs)

Copy Address = store.copyBillingAddressToShipping()
             → shipping slice updates
             → ZShippingForm useEffect fires
             → surgical field updates via onChange
```