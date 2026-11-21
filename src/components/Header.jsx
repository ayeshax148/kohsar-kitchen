import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Header() {
  const { itemCount } = useCart();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Kohsar Kitchen home">
          <span className="brand-mark" aria-hidden="true">KK</span>
          <span className="brand-text">
            Kohsar Kitchen
            <small>Islamabad</small>
          </span>
        </Link>
        <nav aria-label="Main">
          <ul className="nav-list">
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/menu">Menu</NavLink></li>
            <li>
              <NavLink to="/order" className="nav-order">
                Your order
                <span className="count-pill" aria-label={`${itemCount} items`}>{itemCount}</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
