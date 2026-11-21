import { useCart } from '../context/CartContext.jsx';
import { formatPKR } from '../rules/cartCalculations.js';
import { DELIVERY_MINIMUM, FREE_DELIVERY_THRESHOLD } from '../data/business.js';

// Calculated summary shared by the order and checkout pages. `children` holds the page's primary action.
export default function OrderSummary({ title = 'Order summary', children }) {
  const { itemCount, subtotal, mode, delivery, total, etaMinutes, lines } = useCart();
  const isDelivery = mode === 'delivery';
  const progressPct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <aside className="summary" aria-labelledby="summary-title">
      <h2 id="summary-title">{title}</h2>
      <dl className="summary-list">
        <div><dt>Items</dt><dd>{itemCount}</dd></div>
        <div><dt>Food subtotal</dt><dd>{formatPKR(subtotal)}</dd></div>
        <div>
          <dt>{isDelivery ? 'Delivery fee' : 'Pickup'}</dt>
          <dd>{isDelivery ? (delivery.fee === 0 && delivery.allowed ? 'Free' : formatPKR(delivery.fee)) : 'Free'}</dd>
        </div>
        <div className="summary-total"><dt>Total to pay</dt><dd>{formatPKR(total)}</dd></div>
        {lines.length > 0 && (
          <div><dt>Ready in about</dt><dd>{etaMinutes} min</dd></div>
        )}
      </dl>

      {isDelivery && lines.length > 0 && (
        <div className="progress-block">
          <div
            className="progress"
            role="progressbar"
            aria-label="Progress to free delivery"
            aria-valuemin={0}
            aria-valuemax={FREE_DELIVERY_THRESHOLD}
            aria-valuenow={Math.min(subtotal, FREE_DELIVERY_THRESHOLD)}
          >
            <span style={{ width: `${progressPct}%` }} />
            <i style={{ left: `${(DELIVERY_MINIMUM / FREE_DELIVERY_THRESHOLD) * 100}%` }} aria-hidden="true" />
          </div>
          <p className="small">
            {delivery.code === 'BELOW_MINIMUM'
              ? `${formatPKR(delivery.shortfall)} more to reach the ${formatPKR(DELIVERY_MINIMUM)} delivery minimum.`
              : delivery.fee === 0
                ? 'Free delivery unlocked.'
                : `${formatPKR(delivery.toFreeDelivery)} more for free delivery.`}
          </p>
        </div>
      )}
      <p className="small muted">Payment: cash on delivery or at the counter. This is a simulated order.</p>
      {children}
    </aside>
  );
}
