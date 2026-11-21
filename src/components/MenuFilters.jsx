import { CATEGORIES } from '../data/business.js';

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Most ordered' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

// Controlled filter bar. Values come from the URL; changes are sent up via onChange.
export default function MenuFilters({ filters, onChange, onClear, hasActiveFilters }) {
  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    onChange(name, type === 'checkbox' ? (checked ? '1' : '') : value);
  }

  return (
    <form className="filters" role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="field field-search">
        <label htmlFor="q">Search dishes</label>
        <input
          id="q"
          name="q"
          type="search"
          placeholder="Try karahi, naan, vegetarian…"
          value={filters.q}
          onChange={handleChange}
        />
      </div>
      <div className="field">
        <label htmlFor="cat">Category</label>
        <select id="cat" name="cat" value={filters.cat} onChange={handleChange}>
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="diet">Dietary</label>
        <select id="diet" name="diet" value={filters.diet} onChange={handleChange}>
          <option value="">Any</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="nut-free">No nuts</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="sort">Sort by</label>
        <select id="sort" name="sort" value={filters.sort} onChange={handleChange}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <label className="check field-check">
        <input type="checkbox" name="avail" checked={filters.avail === '1'} onChange={handleChange} />
        Hide sold-out dishes
      </label>
      {hasActiveFilters && (
        <button type="button" className="btn btn-link" onClick={onClear}>Clear all filters</button>
      )}
    </form>
  );
}
