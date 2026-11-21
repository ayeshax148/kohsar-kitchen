import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useMenu } from '../context/MenuContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useTimedMessage } from '../hooks/useTimedMessage.js';
import ItemImage from '../components/ItemImage.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import { AvailabilityBadge, DietaryTags, PickupOnlyBadge } from '../components/ItemBadges.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews.jsx';
import { maxAllowedQty, quantityInCart } from '../rules/availabilityRule.js';
import { formatPKR, unitPrice } from '../rules/cartCalculations.js';
import { SPICE_LEVELS } from '../data/business.js';

export default function ItemDetailsPage() {
  const { itemId } = useParams();
  const location = useLocation();
  const backTo = location.state?.from ?? '/menu';
  const { status, itemsById, items, error, reload } = useMenu();
  const item = itemsById[itemId];
  usePageTitle(item ? item.name : 'Dish');

  if (status === 'loading') return <div className="container section"><LoadingState label="Loading dish details…" /></div>;
  if (status === 'error') return <div className="container section"><ErrorState message={error} onRetry={reload} /></div>;

  if (!item) {
    const suggestions = items.filter((i) => i.stock > 0).sort((a, b) => b.popularity - a.popularity).slice(0, 3);
    return (
      <div className="container section">
        <h1>Dish not found</h1>
        <EmptyState
          title={`We couldn’t find a dish with the code “${itemId}”`}
          actions={<Link to="/menu" className="btn btn-primary">Browse the full menu</Link>}
        >
          <p>It may have been removed from today’s menu, or the link may be mistyped.</p>
          {suggestions.length > 0 && (
            <>
              <p>Popular dishes still available today:</p>
              <ul className="link-list">
                {suggestions.map((s) => <li key={s.id}><Link to={`/menu/${s.id}`}>{s.name}</Link></li>)}
              </ul>
            </>
          )}
        </EmptyState>
      </div>
    );
  }

  // key resets the form state when navigating from one dish to another.
  return <DishDetails key={item.id} item={item} backTo={backTo} />;
}

function DishDetails({ item, backTo }) {
  const { lines, addItem, mode } = useCart();
  const [sizeId, setSizeId] = useState(item.sizes?.[0].id ?? '');
  const [spice, setSpice] = useState(item.spice ? 'Medium' : '');
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useTimedMessage(4000);

  const inOrder = quantityInCart(lines, item.id);
  const maxAddable = maxAllowedQty(item, lines);
  const shownQty = Math.max(1, Math.min(qty, Math.max(1, maxAddable)));
  const soldOut = item.stock <= 0;
  const price = unitPrice(item, sizeId);

  function handleSubmit(event) {
    event.preventDefault();
    const result = addItem(item.id, { sizeId, spice, qty: shownQty });
    setFeedback(result);
    if (result.ok) setQty(1);
  }

  let addNote = `You can add up to ${maxAddable} more today.`;
  if (soldOut) addNote = 'Sold out today. Check back tomorrow.';
  else if (maxAddable === 0) addNote = `All ${item.stock} remaining are already in your order.`;

  return (
    <div className="container section">
      <p><Link to={backTo} className="back-link">← Back to menu</Link></p>
      <div className="details-layout">
        <ItemImage src={item.image} alt={item.imageAlt} name={item.name} className="details-image" />

        <div className="details-body">
          <div className="badge-row">
            <AvailabilityBadge item={item} />
            <PickupOnlyBadge item={item} />
          </div>
          <h1 className="details-title">{item.name}</h1>
          <p className="muted">{item.category}</p>
          <p>{item.description}</p>
          <DietaryTags dietary={item.dietary} />

          <dl className="facts">
            <div><dt>Price</dt><dd>{item.sizes ? item.sizes.map((s) => `${s.label}: ${formatPKR(s.price)}`).join(' · ') : formatPKR(item.price)}</dd></div>
            <div><dt>Kitchen time</dt><dd>About {item.prepMinutes} min</dd></div>
            <div><dt>Available today</dt><dd>{item.stock}</dd></div>
            <div><dt>Fulfilment</dt><dd>{item.pickupOnly ? 'Pickup from F-7 Markaz only (served on a hot iron plate)' : 'Delivery or pickup'}</dd></div>
            {inOrder > 0 && <div><dt>In your order</dt><dd className="text-selected">{inOrder}</dd></div>}
          </dl>

          {item.pickupOnly && mode === 'delivery' && (
            <p className="notice notice-warning">
              Your order is set to <strong>delivery</strong>. You can add this platter, but you will need to switch to pickup before checkout.
            </p>
          )}

          <form className="add-form" onSubmit={handleSubmit}>
            {item.sizes && (
              <fieldset className="option-group">
                <legend>Size</legend>
                {item.sizes.map((size) => (
                  <label key={size.id} className={`option${sizeId === size.id ? ' is-selected' : ''}`}>
                    <input type="radio" name="size" value={size.id} checked={sizeId === size.id} onChange={(e) => setSizeId(e.target.value)} />
                    {size.label} · {formatPKR(size.price)}
                  </label>
                ))}
              </fieldset>
            )}
            {item.spice && (
              <fieldset className="option-group">
                <legend>Spice level</legend>
                {SPICE_LEVELS.map((level) => (
                  <label key={level} className={`option${spice === level ? ' is-selected' : ''}`}>
                    <input type="radio" name="spice" value={level} checked={spice === level} onChange={(e) => setSpice(e.target.value)} />
                    {level}
                  </label>
                ))}
              </fieldset>
            )}

            <div className="qty-row">
              <div>
                <p className="field-label" id="qty-label">Quantity</p>
                <QuantityStepper
                  id="details-qty"
                  label={`quantity of ${item.name}`}
                  value={shownQty}
                  max={Math.max(1, maxAddable)}
                  onChange={(next) => setQty(next)}
                  disabled={maxAddable === 0}
                />
                <p className="small muted" id="qty-limit">{addNote}</p>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={maxAddable === 0}>
                {soldOut ? 'Sold out' : `Add to order · ${formatPKR(price * shownQty)}`}
              </button>
            </div>
            <p role="status" className="form-status">
              {feedback && (
                <span className={feedback.ok ? 'text-success' : 'text-error'}>
                  {feedback.message} {feedback.ok && <Link to="/order">View your order</Link>}
                </span>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
