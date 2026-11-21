import { Link, useLocation } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { EmptyState } from '../components/StatusViews.jsx';
import { formatPKR } from '../rules/cartCalculations.js';

function readLastOrder() {
  try {
    return JSON.parse(sessionStorage.getItem('kk-last-order'));
  } catch {
    return null;
  }
}

export default function ConfirmationPage() {
  usePageTitle('Order confirmed');
  const location = useLocation();
  // State from navigation first; sessionStorage keeps the page working after a refresh.
  const order = location.state?.order ?? readLastOrder();

  if (!order) {
    return (
      <div className="container section">
        <h1>No recent order</h1>
        <EmptyState title="There is no order to show yet" actions={<Link to="/menu" className="btn btn-primary">Start an order</Link>}>
          <p>Confirmations appear here after you place an order in this browser tab.</p>
        </EmptyState>
      </div>
    );
  }

  const isDelivery = order.mode === 'delivery';

  return (
    <div className="container section narrow">
      <div className="confirm-card">
        <p className="badge badge-ok">Simulated order placed</p>
        <h1>Thank you. Order {order.orderNumber} is confirmed.</h1>
        <p className="lead">
          {isDelivery
            ? `Delivery to ${order.sector} in about ${order.etaMinutes} minutes.`
            : `Pickup from F-7 Markaz, ${order.pickupSlot}.`}
        </p>
        <p className="small muted">This is a student project. No food will be prepared and no payment was taken.</p>

        <table className="order-table">
          <caption className="visually-hidden">Items in order {order.orderNumber}</caption>
          <thead><tr><th scope="col">Dish</th><th scope="col">Qty</th><th scope="col">Amount</th></tr></thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.lineId}>
                <td>{line.name}{line.options && <span className="muted small"><br />{line.options}</span>}</td>
                <td>{line.qty}</td>
                <td>{formatPKR(line.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th scope="row" colSpan={2}>Food subtotal</th><td>{formatPKR(order.subtotal)}</td></tr>
            <tr><th scope="row" colSpan={2}>{isDelivery ? 'Delivery fee' : 'Pickup'}</th><td>{order.fee === 0 ? 'Free' : formatPKR(order.fee)}</td></tr>
            <tr className="summary-total"><th scope="row" colSpan={2}>Total (cash)</th><td>{formatPKR(order.total)}</td></tr>
          </tfoot>
        </table>
        <div className="actions-row">
          <Link to="/menu" className="btn btn-primary">Start a new order</Link>
          <Link to="/" className="btn btn-secondary">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
