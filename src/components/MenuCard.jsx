import { Link } from 'react-router-dom';
import ItemImage from './ItemImage.jsx';
import { AvailabilityBadge, DietaryTags, PickupOnlyBadge } from './ItemBadges.jsx';
import { formatPKR } from '../rules/cartCalculations.js';
import { useTimedMessage } from '../hooks/useTimedMessage.js';

function priceText(item) {
  if (!item.sizes) return formatPKR(item.price);
  const lowest = Math.min(...item.sizes.map((s) => s.price));
  return `from ${formatPKR(lowest)}`;
}

// Problem 3 fix: availability and pickup-only status are visible on the card itself,
// so customers do not discover them on the details page or at checkout.
export default function MenuCard({ item, inOrderQty, onQuickAdd, fromSearch }) {
  const [feedback, setFeedback] = useTimedMessage(2500);
  const soldOut = item.stock <= 0;
  const needsOptions = Boolean(item.sizes) || item.spice;
  const detailsPath = `/menu/${item.id}`;
  const linkState = { from: `/menu${fromSearch}` }; // lets the details page return to the same filters

  function handleAdd() {
    const result = onQuickAdd(item.id);
    setFeedback({ ok: result.ok, text: result.ok ? 'Added to your order' : result.message });
  }

  return (
    <article className={`menu-card${soldOut ? ' is-unavailable' : ''}`}>
      <ItemImage src={item.image} alt={item.imageAlt} name={item.name} />
      <div className="menu-card-body">
        <div className="badge-row">
          <AvailabilityBadge item={item} />
          <PickupOnlyBadge item={item} />
        </div>
        <h3 className="menu-card-title">
          <Link to={detailsPath} state={linkState}>{item.name}</Link>
        </h3>
        <p className="menu-card-category">{item.category}</p>
        <p className="menu-card-desc">{item.description}</p>
        <DietaryTags dietary={item.dietary} />
        <div className="menu-card-footer">
          <p className="price">{priceText(item)}</p>
          {soldOut ? (
            <button type="button" className="btn btn-secondary" disabled>Sold out</button>
          ) : needsOptions ? (
            <Link to={detailsPath} state={linkState} className="btn btn-secondary" aria-label={`Choose options for ${item.name}`}>
              Choose options
            </Link>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleAdd} aria-label={`Add ${item.name} to order`}>
              Add
            </button>
          )}
        </div>
        <p className="card-status" role="status">
          {feedback && <span className={feedback.ok ? 'text-success' : 'text-error'}>{feedback.text}</span>}
          {!feedback && inOrderQty > 0 && <span className="text-selected">In your order: {inOrderQty}</span>}
        </p>
      </div>
    </article>
  );
}
