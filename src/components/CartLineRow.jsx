import { Link } from 'react-router-dom';
import QuantityStepper from './QuantityStepper.jsx';
import { formatPKR, sizeLabel, unitPrice } from '../rules/cartCalculations.js';
import { maxAllowedQty } from '../rules/availabilityRule.js';

export default function CartLineRow({ line, item, lines, conflict, pickupBlocked, onQtyChange, onRemove }) {
  // Dish no longer exists in the menu: show what we know and allow removal only.
  if (!item) {
    return (
      <li className="cart-line has-conflict">
        <div className="cart-line-main">
          <h3>{line.name ?? 'A dish'} <span className="muted small">(unavailable)</span></h3>
          <p className="text-error">{conflict?.message ?? 'No longer on today’s menu.'}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => onRemove(line.lineId)}>Remove</button>
      </li>
    );
  }

  const options = [sizeLabel(item, line.sizeId), line.spice && `${line.spice} spice`].filter(Boolean).join(' · ');
  const max = Math.max(line.qty, maxAllowedQty(item, lines, line.lineId));
  const price = unitPrice(item, line.sizeId);

  return (
    <li className={`cart-line${conflict || pickupBlocked ? ' has-conflict' : ''}`}>
      <div className="cart-line-main">
        <h3><Link to={`/menu/${item.id}`}>{item.name}</Link></h3>
        {options && <p className="muted">{options}</p>}
        <p className="small">{formatPKR(price)} each · {item.stock} available today</p>
        {conflict && <p className="text-error">⚠ {conflict.message}</p>}
        {pickupBlocked && <p className="text-error">⚠ Pickup only. Not available for delivery.</p>}
      </div>
      <div className="cart-line-controls">
        <QuantityStepper
          id={`qty-${line.lineId}`}
          label={`quantity of ${item.name}`}
          value={line.qty}
          max={max}
          onChange={(qty) => onQtyChange(line.lineId, qty)}
          disabled={item.stock <= 0}
        />
        <p className="line-total">{formatPKR(price * line.qty)}</p>
        <button type="button" className="btn btn-link" onClick={() => onRemove(line.lineId)}>
          Remove<span className="visually-hidden"> {item.name}</span>
        </button>
      </div>
    </li>
  );
}
