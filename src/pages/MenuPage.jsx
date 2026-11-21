import { useSearchParams } from 'react-router-dom';
import { useMenu } from '../context/MenuContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import MenuFilters, { SORT_OPTIONS } from '../components/MenuFilters.jsx';
import MenuCard from '../components/MenuCard.jsx';
import FeeBanner from '../components/FeeBanner.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews.jsx';
import { DIETARY_LABELS } from '../data/business.js';
import { quantityInCart } from '../rules/availabilityRule.js';

const DEFAULT_FILTERS = { q: '', cat: '', diet: '', avail: '', sort: 'popular' };

function lowestPrice(item) {
  return item.sizes ? Math.min(...item.sizes.map((s) => s.price)) : item.price;
}

const SORTERS = {
  popular: (a, b) => b.popularity - a.popularity,
  'price-asc': (a, b) => lowestPrice(a) - lowestPrice(b),
  'price-desc': (a, b) => lowestPrice(b) - lowestPrice(a),
  name: (a, b) => a.name.localeCompare(b.name),
};

export function filterMenu(items, { q, cat, diet, avail, sort }) {
  const query = q.trim().toLowerCase();
  const results = items.filter((item) => {
    const haystack = [item.name, item.description, item.category, ...item.dietary.map((d) => DIETARY_LABELS[d])]
      .join(' ')
      .toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (cat && item.category !== cat) return false;
    if (diet === 'vegetarian' && !item.dietary.includes('vegetarian')) return false;
    if (diet === 'nut-free' && item.dietary.includes('nuts')) return false;
    if (avail === '1' && item.stock <= 0) return false;
    return true;
  });
  return [...results].sort(SORTERS[sort] ?? SORTERS.popular); // copy before sorting: never mutate state
}

export default function MenuPage() {
  usePageTitle('Menu');
  const { status, items, error, reload } = useMenu();
  const { lines, addItem } = useCart();
  // Problem 2 fix: filters live in the URL, so Back from a dish, refresh and shared links keep them.
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    ...DEFAULT_FILTERS,
    ...Object.fromEntries([...searchParams].filter(([key]) => key in DEFAULT_FILTERS)),
  };
  if (!SORT_OPTIONS.some((o) => o.value === filters.sort)) filters.sort = 'popular';

  const results = filterMenu(items, filters); // derived on each render; 15 records is cheap
  const hasActiveFilters = Boolean(filters.q || filters.cat || filters.diet || filters.avail);

  function updateFilter(name, value) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== DEFAULT_FILTERS[name]) next.set(name, value);
        else next.delete(name);
        return next;
      },
      { replace: true }, // typing should not create one history entry per keystroke
    );
  }

  function clearFilters() {
    setSearchParams(filters.sort !== 'popular' ? { sort: filters.sort } : {}, { replace: true });
  }

  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return (
    <div className="container section">
      <header className="page-header">
        <h1>Today’s menu</h1>
        <p className="lead">Prices in Pakistani rupees. Quantities left are updated by the kitchen through the day.</p>
      </header>

      <FeeBanner />

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState message={error} onRetry={reload} />}

      {status === 'success' && items.length === 0 && (
        <EmptyState
          title="Today’s menu hasn’t been published yet"
          actions={<button type="button" className="btn btn-primary" onClick={reload}>Check again</button>}
        >
          <p>The kitchen publishes the menu by 11:30 each day. Your saved order is kept until the menu is back.</p>
        </EmptyState>
      )}

      {status === 'success' && items.length > 0 && (
        <>
          <MenuFilters filters={filters} onChange={updateFilter} onClear={clearFilters} hasActiveFilters={hasActiveFilters} />
          <p className="result-count" role="status" aria-live="polite">
            Showing {results.length} of {items.length} dishes
          </p>

          {results.length === 0 ? (
            <EmptyState
              title="No dishes match your search"
              actions={
                <>
                  {filters.q && <button type="button" className="btn btn-secondary" onClick={() => updateFilter('q', '')}>Clear search “{filters.q}”</button>}
                  {filters.cat && <button type="button" className="btn btn-secondary" onClick={() => updateFilter('cat', '')}>Show all categories</button>}
                  {filters.diet && <button type="button" className="btn btn-secondary" onClick={() => updateFilter('diet', '')}>Any dietary option</button>}
                  {filters.avail && <button type="button" className="btn btn-secondary" onClick={() => updateFilter('avail', '')}>Include sold-out dishes</button>}
                  <button type="button" className="btn btn-primary" onClick={clearFilters}>Clear all filters</button>
                </>
              }
            >
              <p>
                Nothing on today’s menu matches
                {filters.q && <> “<strong>{filters.q}</strong>”</>}
                {filters.cat && <> in <strong>{filters.cat}</strong></>}
                {filters.diet && <> with the <strong>{filters.diet === 'vegetarian' ? 'vegetarian' : 'no nuts'}</strong> filter</>}.
                Remove one filter at a time to widen the results.
              </p>
            </EmptyState>
          ) : (
            <ul className="menu-grid">
              {results.map((item) => (
                <li key={item.id}>
                  <MenuCard
                    item={item}
                    inOrderQty={quantityInCart(lines, item.id)}
                    onQuickAdd={addItem}
                    fromSearch={search}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
