import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPKR } from '../rules/cartCalculations.js';

// Mobile only (hidden by CSS above 760px): keeps the order total and the next step in reach.
export default function MobileCartBar() {
  const { itemCount, total, mode, delivery, menuReady } = useCart();
  const { pathname } = useLocation();
  const show = menuReady && itemCount > 0 && (pathname === '/menu' || pathname.startsWith('/menu/'));
  if (!show) return null;

  let hint = 'Pickup, no fee';
  if (mode === 'delivery') {
    hint = delivery.code === 'BELOW_MINIMUM'
      ? `Incl. ${formatPKR(delivery.fee)} delivery · add ${formatPKR(delivery.shortfall)} more food`
      : delivery.fee === 0 ? 'Free delivery' : `Incl. ${formatPKR(delivery.fee)} delivery`;
  }

  return (
    <div className="mobile-cart-bar" role="region" aria-label="Order summary">
      <p>
        <strong>{itemCount} {itemCount === 1 ? 'item' : 'items'} · {formatPKR(total)}</strong>
        <span>{hint}</span>
      </p>
      <Link to="/order" className="btn btn-primary">View order</Link>
    </div>
  );
}
