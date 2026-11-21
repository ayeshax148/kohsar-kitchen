import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useTimedMessage } from '../hooks/useTimedMessage.js';
import CartLineRow from '../components/CartLineRow.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import FulfilmentToggle from '../components/FulfilmentToggle.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews.jsx';

export default function CartPage() {
  usePageTitle('Your order');
  const navigate = useNavigate();
  const { status, itemsById, error, reload } = useMenu();
  const {
    lines, mode, setMode, setLineQty, removeLine, removeItems, fixConflicts,
    conflicts, compatibility, blockers, canCheckout, restoreNotice, dismissRestoreNotice,
  } = useCart();
  const [qtyMessage, setQtyMessage] = useTimedMessage(3500);

  const conflictByLine = Object.fromEntries(conflicts.map((c) => [c.lineId, c]));

  function handleQtyChange(lineId, qty) {
    const result = setLineQty(lineId, qty);
    if (!result.ok) setQtyMessage(result.message);
  }

  return (
    <div className="container section">
      <header className="page-header">
        <h1>Your order</h1>
      </header>

      {restoreNotice && (
        <div className="notice notice-info">
          <p>{restoreNotice}</p>
          <button type="button" className="btn btn-link" onClick={dismissRestoreNotice}>Dismiss</button>
        </div>
      )}

      {status === 'loading' && <LoadingState label="Checking your order against today’s menu…" />}
      {status === 'error' && <ErrorState message={error} onRetry={reload} />}

      {status === 'success' && lines.length === 0 && (
        <EmptyState title="Your order is empty" actions={<Link to="/menu" className="btn btn-primary">Browse today’s menu</Link>}>
          <p>Add dishes from the menu. Your selection is saved on this device until you place the order.</p>
        </EmptyState>
      )}

      {status === 'success' && lines.length > 0 && (
        <div className="two-col">
          <div className="stack">
            <FulfilmentToggle mode={mode} onChange={setMode} />

            {conflicts.length > 0 && (
              <div className="notice notice-error" role="alert">
                <h2>Some dishes changed since you added them</h2>
                <ul>
                  {conflicts.map((c) => {
                    const line = lines.find((l) => l.lineId === c.lineId);
                    const name = itemsById[line?.itemId]?.name ?? line?.name ?? 'A removed dish';
                    return <li key={c.lineId}><strong>{name}:</strong> {c.message}</li>;
                  })}
                </ul>
                <button type="button" className="btn btn-primary" onClick={fixConflicts}>Update my order to what’s available</button>
              </div>
            )}

            {!compatibility.ok && (
              <div className="notice notice-warning" role="alert">
                <p>{compatibility.message}</p>
                <div className="actions-row">
                  <button type="button" className="btn btn-primary" onClick={() => setMode('pickup')}>Switch to pickup</button>
                  <button type="button" className="btn btn-secondary" onClick={() => removeItems(compatibility.blockedIds)}>Remove pickup-only dishes</button>
                </div>
              </div>
            )}

            <p role="status" className="text-error">{qtyMessage}</p>
            <ul className="cart-lines">
              {lines.map((line) => (
                <CartLineRow
                  key={line.lineId}
                  line={line}
                  item={itemsById[line.itemId]}
                  lines={lines}
                  conflict={conflictByLine[line.lineId]}
                  pickupBlocked={compatibility.blockedIds.includes(line.itemId)}
                  onQtyChange={handleQtyChange}
                  onRemove={removeLine}
                />
              ))}
            </ul>
            <p><Link to="/menu" className="btn btn-secondary">Add more dishes</Link></p>
          </div>

          <OrderSummary>
            {!canCheckout && (
              <ul className="blockers" aria-label="Before you can continue">
                {blockers.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!canCheckout}
              onClick={() => navigate('/checkout')}
            >
              Continue to checkout
            </button>
          </OrderSummary>
        </div>
      )}
    </div>
  );
}
