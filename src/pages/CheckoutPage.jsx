import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import OrderSummary from '../components/OrderSummary.jsx';
import FulfilmentToggle from '../components/FulfilmentToggle.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews.jsx';
import { validateCheckout } from '../rules/validateCheckout.js';
import { evaluateDelivery } from '../rules/deliveryRule.js';
import { formatPKR, sizeLabel, unitPrice } from '../rules/cartCalculations.js';
import { submitOrder } from '../services/menuApi.js';
import { DELIVERY_SECTORS, PICKUP_SLOTS } from '../data/business.js';

const EMPTY_FORM = { fullName: '', phone: '', sector: '', address: '', pickupSlot: '', notes: '' };
const FIELD_ORDER = ['fullName', 'phone', 'sector', 'address', 'pickupSlot', 'notes'];
const NOT_LISTED = 'Other (not listed)';

export default function CheckoutPage() {
  usePageTitle('Checkout');
  const navigate = useNavigate();
  const { status, itemsById, error, reload } = useMenu();
  const cart = useCart();
  const { lines, mode, setMode, subtotal, total, etaMinutes, blockers, canCheckout, clearCart, delivery } = cart;

  // Form values are kept in one object; personal details are NOT saved to localStorage.
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitState, setSubmitState] = useState('idle'); // 'idle' | 'submitting' | 'failed'
  const summaryRef = useRef(null);

  const errors = validateCheckout(form, mode);
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([field]) => submitAttempted || touched[field]),
  );
  const areaCheck = mode === 'delivery' && form.sector ? evaluateDelivery({ subtotal, mode, sector: form.sector }) : null;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value })); // immutable object update
  }

  function handleBlur(event) {
    // If focus is moving to the submit button, let submit show all errors at once.
    // Showing one error here would shift the button down mid-click and swallow the click.
    if (event.relatedTarget?.type === 'submit') return;
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);

    const errorFields = FIELD_ORDER.filter((field) => errors[field]);
    if (errorFields.length > 0 || !canCheckout) {
      // Keep every value the customer typed; just move focus to the problem.
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }

    setSubmitState('submitting');
    try {
      const order = await submitOrder({
        mode,
        sector: mode === 'delivery' ? form.sector : '',
        pickupSlot: mode === 'pickup' ? form.pickupSlot : '',
        lines: lines.map((line) => {
          const item = itemsById[line.itemId];
          return {
            lineId: line.lineId,
            name: item.name,
            options: [sizeLabel(item, line.sizeId), line.spice && `${line.spice} spice`].filter(Boolean).join(' · '),
            qty: line.qty,
            lineTotal: unitPrice(item, line.sizeId) * line.qty,
          };
        }),
        subtotal,
        fee: mode === 'delivery' ? delivery.fee : 0,
        total,
        etaMinutes,
      });
      // Only non-personal order details are kept for the confirmation page refresh.
      sessionStorage.setItem('kk-last-order', JSON.stringify(order));
      clearCart();
      navigate('/confirmation', { replace: true, state: { order } });
    } catch {
      setSubmitState('failed');
    }
  }

  if (status === 'loading') return <div className="container section"><LoadingState /></div>;
  if (status === 'error') return <div className="container section"><ErrorState message={error} onRetry={reload} /></div>;
  if (lines.length === 0) {
    return (
      <div className="container section">
        <h1>Checkout</h1>
        <EmptyState title="There is nothing to check out" actions={<Link to="/menu" className="btn btn-primary">Browse today’s menu</Link>}>
          <p>Your order is empty. Add dishes first, then come back here.</p>
        </EmptyState>
      </div>
    );
  }

  const errorList = FIELD_ORDER.filter((f) => visibleErrors[f]);
  const showSummary = submitAttempted && (errorList.length > 0 || !canCheckout);

  return (
    <div className="container section">
      <header className="page-header">
        <p><Link to="/order" className="back-link">← Back to your order</Link></p>
        <h1>Checkout</h1>
        <p className="lead">Simulated order. No payment is taken and nothing is sent to the kitchen.</p>
      </header>

      <div className="two-col">
        <form className="checkout-form stack" onSubmit={handleSubmit} noValidate>
          {showSummary && (
            <div className="notice notice-error" role="alert" tabIndex={-1} ref={summaryRef}>
              <h2>Please fix the following before placing your order</h2>
              <ul>
                {errorList.map((f) => <li key={f}><a href={`#${f}`}>{visibleErrors[f]}</a></li>)}
                {!canCheckout && blockers.map((b) => <li key={b}>{b} <Link to="/order">Review order</Link></li>)}
              </ul>
            </div>
          )}

          <FulfilmentToggle mode={mode} onChange={setMode} name="checkout-fulfilment" />
          {!canCheckout && !showSummary && (
            <div className="notice notice-warning">
              <ul>{blockers.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          )}

          <fieldset className="form-section">
            <legend>Contact details</legend>
            <Field id="fullName" label="Full name" error={visibleErrors.fullName}>
              <input id="fullName" name="fullName" type="text" autoComplete="name" value={form.fullName}
                onChange={handleChange} onBlur={handleBlur}
                aria-invalid={Boolean(visibleErrors.fullName)} aria-describedby={visibleErrors.fullName ? 'fullName-error' : undefined} />
            </Field>
            <Field id="phone" label="Mobile number" hint="Format: 0312-3456789" error={visibleErrors.phone}>
              <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone}
                onChange={handleChange} onBlur={handleBlur}
                aria-invalid={Boolean(visibleErrors.phone)} aria-describedby={`phone-hint${visibleErrors.phone ? ' phone-error' : ''}`} />
            </Field>
          </fieldset>

          {mode === 'delivery' ? (
            <fieldset className="form-section">
              <legend>Delivery address</legend>
              <Field id="sector" label="Sector" hint={`We deliver to ${DELIVERY_SECTORS.join(', ')}.`} error={visibleErrors.sector}>
                <select id="sector" name="sector" value={form.sector} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={Boolean(visibleErrors.sector)} aria-describedby={`sector-hint${visibleErrors.sector ? ' sector-error' : ''}`}>
                  <option value="">Choose your sector</option>
                  {DELIVERY_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  <option value={NOT_LISTED}>{NOT_LISTED}</option>
                </select>
              </Field>
              {areaCheck && !areaCheck.allowed && areaCheck.code === 'OUT_OF_AREA' && (
                <div className="notice notice-warning">
                  <p>{areaCheck.message}</p>
                  <button type="button" className="btn btn-secondary" onClick={() => setMode('pickup')}>Switch to pickup</button>
                </div>
              )}
              <Field id="address" label="House, street and landmark" error={visibleErrors.address}>
                <textarea id="address" name="address" rows={3} autoComplete="street-address" value={form.address}
                  onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={Boolean(visibleErrors.address)} aria-describedby={visibleErrors.address ? 'address-error' : undefined} />
              </Field>
            </fieldset>
          ) : (
            <fieldset className="form-section">
              <legend>Pickup from F-7 Markaz</legend>
              <Field id="pickupSlot" label="Pickup time (today)" error={visibleErrors.pickupSlot}>
                <select id="pickupSlot" name="pickupSlot" value={form.pickupSlot} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={Boolean(visibleErrors.pickupSlot)} aria-describedby={visibleErrors.pickupSlot ? 'pickupSlot-error' : undefined}>
                  <option value="">Choose a time</option>
                  {PICKUP_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </Field>
            </fieldset>
          )}

          <Field id="notes" label="Notes for the kitchen (optional)" hint={`${form.notes.length}/200 characters`} error={visibleErrors.notes}>
            <textarea id="notes" name="notes" rows={2} value={form.notes} onChange={handleChange} onBlur={handleBlur}
              aria-invalid={Boolean(visibleErrors.notes)} aria-describedby={`notes-hint${visibleErrors.notes ? ' notes-error' : ''}`} />
          </Field>

          {submitState === 'failed' && (
            <p className="notice notice-error" role="alert">The simulated order could not be placed. Your details are still here; please try again.</p>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitState === 'submitting'}>
            {submitState === 'submitting' ? 'Placing order…' : `Place simulated order · ${formatPKR(total)}`}
          </button>
        </form>

        <OrderSummary title="You are ordering">
          <ul className="mini-lines">
            {lines.map((line) => {
              const item = itemsById[line.itemId];
              return (
                <li key={line.lineId}>
                  <span>{line.qty} × {item?.name ?? 'Unavailable dish'}</span>
                  <span>{item ? formatPKR(unitPrice(item, line.sizeId) * line.qty) : '—'}</span>
                </li>
              );
            })}
          </ul>
        </OrderSummary>
      </div>
    </div>
  );
}

function Field({ id, label, hint, error, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {hint && <p id={`${id}-hint`} className="hint">{hint}</p>}
      {children}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}
