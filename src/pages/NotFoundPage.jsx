import { Link, useLocation } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  const { pathname } = useLocation();
  return (
    <div className="container section narrow">
      <h1>Page not found</h1>
      <p>There is no page at <code>{pathname}</code>.</p>
      <div className="actions-row">
        <Link to="/menu" className="btn btn-primary">Go to the menu</Link>
        <Link to="/" className="btn btn-secondary">Home</Link>
      </div>
    </div>
  );
}
