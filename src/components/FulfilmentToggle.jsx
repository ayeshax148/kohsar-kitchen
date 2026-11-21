import { DELIVERY_MINIMUM } from '../data/business.js';
import { formatPKR } from '../rules/cartCalculations.js';

const OPTIONS = [
  { value: 'delivery', label: 'Delivery', hint: `Selected Islamabad sectors, minimum ${formatPKR(DELIVERY_MINIMUM)}` },
  { value: 'pickup', label: 'Pickup', hint: 'Collect from F-7 Markaz, no minimum' },
];

export default function FulfilmentToggle({ mode, onChange, name = 'fulfilment' }) {
  return (
    <fieldset className="segmented">
      <legend>How would you like to get your food?</legend>
      <div className="segmented-options">
        {OPTIONS.map((option) => (
          <label key={option.value} className={mode === option.value ? 'is-selected' : ''}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={mode === option.value}
              onChange={(event) => onChange(event.target.value)}
            />
            <span className="segmented-label">{option.label}</span>
            <span className="segmented-hint">{option.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
