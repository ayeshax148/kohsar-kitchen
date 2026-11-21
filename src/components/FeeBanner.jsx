import { useCart } from '../context/CartContext.jsx';
import { DELIVERY_FEE, DELIVERY_MINIMUM, DELIVERY_SECTORS, FREE_DELIVERY_THRESHOLD } from '../data/business.js';
import { formatPKR } from '../rules/cartCalculations.js';

// Problem 1 fix: charges, minimum order and service area are shown before browsing,
// and progress towards them updates live as the order changes.
export default function FeeBanner() {
  const { subtotal, mode, itemCount, menuReady } = useCart();

  let progress = null;
  // Prices are only known once the menu has loaded.
  if (!menuReady) {
    progress = null;
  } else if (itemCount > 0 && mode === 'delivery') {
    if (subtotal < DELIVERY_MINIMUM) {
      progress = `Your food total is ${formatPKR(subtotal)}. Add ${formatPKR(DELIVERY_MINIMUM - subtotal)} more to reach the delivery minimum.`;
    } else if (subtotal < FREE_DELIVERY_THRESHOLD) {
      progress = `Delivery minimum reached. Add ${formatPKR(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.`;
    } else {
      progress = 'Free delivery unlocked.';
    }
  } else if (itemCount > 0) {
    progress = 'Pickup selected: no minimum order and no fee.';
  }

  return (
    <section className="fee-banner" aria-labelledby="fee-banner-title">
      <h2 id="fee-banner-title" className="visually-hidden">Delivery charges and conditions</h2>
      <dl className="fee-facts">
        <div><dt>Delivery fee</dt><dd>{formatPKR(DELIVERY_FEE)}, free from {formatPKR(FREE_DELIVERY_THRESHOLD)}</dd></div>
        <div><dt>Delivery minimum</dt><dd>{formatPKR(DELIVERY_MINIMUM)} food total</dd></div>
        <div><dt>We deliver to</dt><dd>{DELIVERY_SECTORS.join(', ')}</dd></div>
        <div><dt>Pickup</dt><dd>F-7 Markaz, no minimum</dd></div>
      </dl>
      {progress && <p className="fee-progress" role="status">{progress}</p>}
    </section>
  );
}
