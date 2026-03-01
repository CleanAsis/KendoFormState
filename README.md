# KendoFormState

POC exploring how to share [KendoReact Form](https://www.telerik.com/kendo-react-ui/components/form/) state across multiple independent forms in a React application.

## What it demonstrates

The app renders two Kendo Forms side by side:

| Form | Fields |
|---|---|
| **Billing Information** | First Name, Phone Number, Email, Address Line, City, State, ZIP |
| **Shipping Information** | Same fields + three "Copy Billing Address" buttons |

### Three copy approaches

| Button | Mechanism | Trade-offs |
|---|---|---|
| **#1 – initialValues reset** | Bumps the Kendo Form's React `key` and passes new `initialValues` | Simple; resets **all** form state |
| **#2 – FormRenderProps.onChange** | Captures `FormRenderProps` in a `useRef`; calls `fRP.onChange(field, { value })` per field | Surgical (only address fields change); imperative |
| **#3 – reactive state + ref API** *(recommended)* | Button sets `pendingCopy` state → `useEffect` applies values; same logic exposed via `useImperativeHandle` as `shippingRef.current.setValues(data)` | Decoupled trigger/apply; clean public component API; parent never touches Kendo internals |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

## Building & deploying to Cloudflare Pages

```bash
npm run build      # produces ./dist
npm run deploy     # builds then runs: wrangler pages deploy dist
```

The `wrangler.toml` at the repo root configures the Pages project name and points at `./dist`.

> **Note:** A [KendoReact license](https://www.telerik.com/kendo-react-ui/my-license/) is required to remove the development watermark from the forms.

