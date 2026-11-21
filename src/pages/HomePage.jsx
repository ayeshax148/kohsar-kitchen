import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { BUSINESS, DELIVERY_FEE, DELIVERY_MINIMUM, DELIVERY_SECTORS, FREE_DELIVERY_THRESHOLD } from '../data/business.js';
import { formatPKR } from '../rules/cartCalculations.js';

export default function HomePage() {
  usePageTitle('Home-style food in Islamabad');

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Lunch and dinner · {BUSINESS.hours}</p>
          <h1>Home-style karahi, BBQ and rice for offices and families in central Islamabad.</h1>
          <p className="lead">
            Order for delivery to {DELIVERY_SECTORS.length} sectors or pick up from F-7 Markaz.
            See prices, what is left today and delivery charges before you choose.
          </p>
          <div className="actions-row">
            <Link to="/menu" className="btn btn-primary btn-lg">Browse today’s menu</Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">How ordering works</a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container section" aria-labelledby="how-title">
        <h2 id="how-title">Know the conditions before you order</h2>
        <div className="info-grid">
          <article className="info-card">
            <h3>Delivery charges</h3>
            <p>
              Minimum food total {formatPKR(DELIVERY_MINIMUM)}. Delivery fee {formatPKR(DELIVERY_FEE)},
              free from {formatPKR(FREE_DELIVERY_THRESHOLD)}.
            </p>
            <p className="small muted">Sectors: {DELIVERY_SECTORS.join(', ')}.</p>
          </article>
          <article className="info-card">
            <h3>Live availability</h3>
            <p>Every dish shows how many the kitchen can still make today. Sold-out dishes cannot be added.</p>
          </article>
          <article className="info-card">
            <h3>Pickup-only platters</h3>
            <p>Sizzling platters are served on hot iron plates, so they are marked “Pickup only” and cannot be delivered.</p>
          </article>
        </div>
      </section>
    </>
  );
}
